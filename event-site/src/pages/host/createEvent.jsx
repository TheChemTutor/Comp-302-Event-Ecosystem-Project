import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../../services/auth'
import { createEvent } from '../../services/events'
import Navbar from '../../components/Navbar'
import './createEvent.css'

const CATEGORIES = ['Music', 'Tech', 'Sports', 'Food', 'Arts', 'Networking']

export default function CreateEvent() {
  const navigate = useNavigate()

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

  const [ticketTypes, setTicketTypes] = useState([
    { name: 'General', price: '' }
  ])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  const handleSubmit = async (isDraft = false) => {
    const user = getCurrentUser()
    if (!user) {
      navigate('/login')
      return
    }

    if (!formData.title || !formData.venue || !formData.startDate || !formData.category) {
      setError('Please fill in event name, venue, date and category')
      return
    }

    setLoading(true)
    setError('')

    try {
      await createEvent({
        ...formData,
        ticketTypes,
        status: isDraft ? 'draft' : 'live',
        price: ticketTypes[0]?.price ? Number(ticketTypes[0].price) : 0,
      }, user)
      navigate('/host/dashboard')
    } catch (err) {
      setError('Failed to create event. Please try again')
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar />
      <div className="create-event-page">
        <div className="ce-header">
          <button className="ce-back" onClick={() => navigate('/host/dashboard')}>← Back</button>
          <h1 className="ce-title">Create a new event</h1>
        </div>

        {error && <div className="ce-error">{error}</div>}

        <div className="ce-grid">
          <div className="ce-left">
            <div className="ce-field">
              <label>Event name</label>
              <input
                type="text"
                name="title"
                placeholder="Name of event"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="ce-field">
              <label>Venue / Location</label>
              <input
                type="text"
                name="venue"
                placeholder="Where is the event?"
                value={formData.venue}
                onChange={handleChange}
              />
            </div>

            <div className="ce-row">
              <div className="ce-field">
                <label>Start date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>
              <div className="ce-field">
                <label>Start time</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="ce-row">
              <div className="ce-field">
                <label>End date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>
              <div className="ce-field">
                <label>End time</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="ce-row">
              <div className="ce-field">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="ce-field">
                <label>Visibility</label>
                <select name="visibility" value={formData.visibility} onChange={handleChange}>
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
              </div>
            </div>

            <div className="ce-field">
              <label>Capacity</label>
              <input
                type="number"
                name="capacity"
                placeholder="200"
                value={formData.capacity}
                onChange={handleChange}
              />
            </div>

            <div className="ce-field">
              <label>Description</label>
              <textarea
                name="description"
                placeholder="Describe your event..."
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>
          </div>

          <div className="ce-right">
            <div className="ce-field">
              <label>Event flyer URL</label>
              <input
                type="text"
                name="flyerUrl"
                placeholder="Paste image URL here"
                value={formData.flyerUrl}
                onChange={handleChange}
              />
              {formData.flyerUrl && (
                <img
                  src={formData.flyerUrl}
                  alt="Flyer preview"
                  className="ce-flyer-preview"
                />
              )}
            </div>

            <div className="ce-field">
              <label>Ticket types</label>
              {ticketTypes.map((ticket, index) => (
                <div key={index} className="ce-ticket-row">
                  <input
                    type="text"
                    placeholder="Ticket name (e.g. General)"
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
                      className="ce-remove-ticket"
                      onClick={() => removeTicketType(index)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button className="ce-add-ticket" onClick={addTicketType}>
                + Add ticket type
              </button>
            </div>

            <div className="ce-actions">
              <button
                className="ce-publish-btn"
                onClick={() => handleSubmit(false)}
                disabled={loading}
              >
                {loading ? 'Publishing...' : 'Publish event'}
              </button>
              <button
                className="ce-draft-btn"
                onClick={() => handleSubmit(true)}
                disabled={loading}
              >
                Save as draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}