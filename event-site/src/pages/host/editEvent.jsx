import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { onAuthChange } from '../../services/auth'
import { getEventById, updateEvent, deleteEvent } from '../../services/events'
import Navbar from '../../components/Navbar'
import './editEvent.css'

const CATEGORIES = ['Music', 'Tech', 'Sports', 'Food', 'Arts', 'Networking']
const TABS = ['Details', 'Tickets', 'Danger zone']

export default function EditEvent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Details')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelInput, setCancelInput] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    venue: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    category: '',
    visibility: 'Public',
    description: '',
    capacity: '',
    flyerUrl: '',
  })

  const [ticketTypes, setTicketTypes] = useState([])

  useEffect(() => {
    const unsubscribe = onAuthChange(async (u) => {
      if (!u) {
        navigate('/login')
        return
      }
      await fetchEvent()
    })
    return () => unsubscribe()
  }, [])

  const fetchEvent = async () => {
    try {
      const data = await getEventById(id)
      if (data) {
        setFormData({
          title: data.title || '',
          venue: data.venue || '',
          startDate: data.startDate || '',
          startTime: data.startTime || '',
          endDate: data.endDate || '',
          endTime: data.endTime || '',
          category: data.category || '',
          visibility: data.visibility || 'Public',
          description: data.description || '',
          capacity: data.capacity || '',
          flyerUrl: data.flyerUrl || '',
        })
        setTicketTypes(data.ticketTypes || [{ name: 'General', price: '' }])
      } else {
        navigate('/host/dashboard')
      }
    } catch (err) {
      console.error('Failed to fetch event:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleTicketChange = (index, field, value) => {
    const updated = [...ticketTypes]
    updated[index][field] = value
    setTicketTypes(updated)
  }

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { name: '', price: '' }])
  }

  const removeTicketType = (index) => {
    setTicketTypes(ticketTypes.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await updateEvent(id, {
        ...formData,
        ticketTypes,
        price: ticketTypes[0]?.price ? Number(ticketTypes[0].price) : 0,
      })
      setSuccess('Changes saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteEvent = async () => {
    if (cancelInput !== formData.title) {
      setError('Event name does not match. Please type the exact event name to confirm.')
      return
    }
    try {
      await deleteEvent(id)
      navigate('/host/dashboard')
    } catch (err) {
      setError('Failed to delete event. Please try again.')
    }
  }

  if (loading) return (
    <div>
      <Navbar />
      <div className="ee-loading">Loading event...</div>
    </div>
  )

  return (
    <div>
      <Navbar />
      <div className="ee-page">
        <div className="ee-header">
          <button className="ee-back" onClick={() => navigate('/host/dashboard')}>← Back</button>
          <h1 className="ee-title">Edit event</h1>
        </div>

        <div className="ee-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`ee-tab ${activeTab === tab ? 'ee-tab-active' : ''} ${tab === 'Danger zone' ? 'ee-tab-danger' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {error && <div className="ee-error">{error}</div>}
        {success && <div className="ee-success">{success}</div>}

        {activeTab === 'Details' && (
          <div className="ee-grid">
            <div className="ee-left">
              <div className="ee-field">
                <label>Event name</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} />
              </div>
              <div className="ee-field">
                <label>Venue / Location</label>
                <input type="text" name="venue" value={formData.venue} onChange={handleChange} />
              </div>
              <div className="ee-row">
                <div className="ee-field">
                  <label>Start date</label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
                  {formData.startDate && (
                    <p className="ee-warn">Changing the date will affect registered attendees</p>
                  )}
                </div>
                <div className="ee-field">
                  <label>Start time</label>
                  <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} />
                </div>
              </div>
              <div className="ee-row">
                <div className="ee-field">
                  <label>End date</label>
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
                </div>
                <div className="ee-field">
                  <label>End time</label>
                  <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} />
                </div>
              </div>
              <div className="ee-row">
                <div className="ee-field">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleChange}>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="ee-field">
                  <label>Visibility</label>
                  <select name="visibility" value={formData.visibility} onChange={handleChange}>
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                  </select>
                </div>
              </div>
              <div className="ee-field">
                <label>Capacity</label>
                <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} />
              </div>
              <div className="ee-field">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} />
              </div>
            </div>
            <div className="ee-right">
              <div className="ee-field">
                <label>Event flyer URL</label>
                <input
                  type="text"
                  name="flyerUrl"
                  value={formData.flyerUrl}
                  onChange={handleChange}
                  placeholder="Paste image URL"
                />
                {formData.flyerUrl && (
                  <img src={formData.flyerUrl} alt="Flyer preview" className="ee-flyer-preview" />
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Tickets' && (
          <div className="ee-tickets">
            <p className="ee-section-title">Ticket types</p>
            {ticketTypes.map((ticket, index) => (
              <div key={index} className="ee-ticket-row">
                <input
                  type="text"
                  placeholder="Ticket name"
                  value={ticket.name}
                  onChange={(e) => handleTicketChange(index, 'name', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Price (0 = Free)"
                  value={ticket.price}
                  onChange={(e) => handleTicketChange(index, 'price', e.target.value)}
                />
                {ticketTypes.length > 1 && (
                  <button
                    className="ee-remove-ticket"
                    onClick={() => removeTicketType(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button className="ee-add-ticket" onClick={addTicketType}>
              + Add ticket type
            </button>
          </div>
        )}

        {activeTab === 'Danger zone' && (
          <div className="ee-danger">
            <h3>Cancel this event</h3>
            <p>This will permanently delete the event. This cannot be undone.</p>
            {!showCancelConfirm ? (
              <button className="ee-cancel-btn" onClick={() => setShowCancelConfirm(true)}>
                Cancel event
              </button>
            ) : (
              <div className="ee-confirm">
                <p>Type the event name <strong>{formData.title}</strong> to confirm:</p>
                <input
                  type="text"
                  value={cancelInput}
                  onChange={(e) => setCancelInput(e.target.value)}
                  placeholder="Type event name here"
                />
                <div className="ee-confirm-actions">
                  <button className="ee-cancel-btn" onClick={handleDeleteEvent}>
                    Confirm cancel
                  </button>
                  <button
                    className="ee-back-btn"
                    onClick={() => setShowCancelConfirm(false)}
                  >
                    Go back
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab !== 'Danger zone' && (
  <div className="ee-footer">
    <button
      className="ee-save-btn"
      onClick={handleSave}
      disabled={saving}
    >
      {saving ? 'Saving...' : 'Save changes'}
    </button>
  </div>
)}
      </div>
    </div>
  )
}