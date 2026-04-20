import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEventById, registerForEvent } from '../../database/collections/events'
import { auth } from '../../database/firebaseConfig'
import Navbar from '../components/Navbar'
import './eventDetail.css'

function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ticketSelections, setTicketSelections] = useState([])
  const [registering, setRegistering] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await getEventById(id)
        if (data) {
          setEvent(data)
          if (data.ticketTypes && data.ticketTypes.length > 0) {
            setTicketSelections(new Array(data.ticketTypes.length).fill(0))
          } else {
            setTicketSelections([0])
          }
        } else {
          navigate('/404')
        }
      } catch (err) {
        console.error('Failed to fetch event:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchEvent()
  }, [id])

  const isPastEvent = () => {
    if (!event?.startDate) return false
    return new Date(event.startDate) < new Date()
  }

  const calculateTotal = () => {
    if (event?.ticketTypes && event.ticketTypes.length > 0) {
      return event.ticketTypes.reduce((sum, type, index) => {
        return sum + (Number(type.price) || 0) * (ticketSelections[index] || 0)
      }, 0)
    }
    return (Number(event?.price) || 0) * (ticketSelections[0] || 0)
  }

  const updateQty = (index, delta) => {
    const updated = [...ticketSelections]
    updated[index] = Math.max(0, (updated[index] || 0) + delta)
    setTicketSelections(updated)
  }

  const handleRegister = async () => {
    const user = auth.currentUser
    if (!user) {
      navigate('/login')
      return
    }

    const totalSelected = ticketSelections.reduce((sum, qty) => sum + qty, 0)
    if (totalSelected === 0) {
      setError('Please select at least one ticket')
      return
    }

    setRegistering(true)
    setError('')

    try {
      if (event?.ticketTypes && event.ticketTypes.length > 0) {
        for (let i = 0; i < event.ticketTypes.length; i++) {
          const qty = ticketSelections[i] || 0
          if (qty > 0) {
            for (let j = 0; j < qty; j++) {
              await registerForEvent(
                id,
                user.uid,
                event.ticketTypes[i].name,
                Number(event.ticketTypes[i].price) || 0
              )
            }
          }
        }
      } else {
        const qty = ticketSelections[0] || 0
        for (let j = 0; j < qty; j++) {
          await registerForEvent(id, user.uid, 'General', Number(event.price) || 0)
        }
      }
      setSuccess(true)
      setTimeout(() => navigate('/my-tickets'), 2000)
    } catch (err) {
      setError('Registration failed. Please try again')
      setRegistering(false)
    }
  }

  if (loading) return (
    <div>
      <Navbar />
      <div className="ed-loading">Loading event...</div>
    </div>
  )

  if (!event) return null

  const total = calculateTotal()
  const past = isPastEvent()

  const ticketList = event.ticketTypes && event.ticketTypes.length > 0
    ? event.ticketTypes
    : [{ name: 'General Admission', price: event.price || 0 }]

  return (
    <div>
      <Navbar />

      <div className="ed-hero">
        <span className="ed-tag">{event.category}</span>
        <h1 className="ed-title">{event.title}</h1>
        <p className="ed-meta">
          {event.startDate} · {event.startTime} · {event.venue}
        </p>
        <div className="ed-actions">
          <button
            className="ed-btn-primary"
            onClick={() => document.getElementById('tickets').scrollIntoView({ behavior: 'smooth' })}
          >
            Get tickets
          </button>
          <button className="ed-btn-outline">Share</button>
        </div>
      </div>

      <div className="ed-body">
        <div className="ed-left">
          <h2>About this event</h2>
          <p className="ed-description">{event.description}</p>

          <h2>Location</h2>
          <div className="ed-map-placeholder">
            <span>{event.venue}</span>
          </div>

          {event.flyerUrl && (
            <div style={{ marginTop: '16px' }}>
              <h2>Event flyer</h2>
              <img
                src={event.flyerUrl}
                alt={event.title}
                className="ed-flyer"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            </div>
          )}

          <h2>Hosted by</h2>
          <div className="ed-host">
            <div className="ed-host-avatar">HE</div>
            <div>
              <div className="ed-host-name">{event.hostName || 'Event Horizon'}</div>
              <div className="ed-host-sub">Official host</div>
            </div>
          </div>
        </div>

        <div className="ed-right" id="tickets">
          <div className="ed-ticket-box">
            <h3>Choose tickets</h3>

            {success ? (
              <div className="ed-success">
                Registered! Redirecting to your tickets...
              </div>
            ) : (
              <>
                {error && <div className="ed-error">{error}</div>}

                {ticketList.map((type, index) => (
                  <div key={index} className="ed-ticket-type">
                    <div className="ed-ticket-top">
                      <span className="ed-ticket-name">{type.name}</span>
                      <span className="ed-ticket-price">
                        {!type.price || Number(type.price) === 0 ? 'Free' : `P${type.price}`}
                      </span>
                    </div>
                    <div className="ed-qty">
                      <button onClick={() => updateQty(index, -1)}>−</button>
                      <span>{ticketSelections[index] || 0}</span>
                      <button onClick={() => updateQty(index, 1)}>+</button>
                    </div>
                  </div>
                ))}

                <div className="ed-total">
                  Total: <strong>{total === 0 ? 'Free' : `P${total}`}</strong>
                </div>

                {past ? (
                  <div className="ed-past-notice">
                    This event has already taken place
                  </div>
                ) : (
                  <button
                    className="ed-checkout-btn"
                    onClick={handleRegister}
                    disabled={registering}
                  >
                    {registering
                      ? 'Processing...'
                      : `Continue · ${total === 0 ? 'Free' : `P${total}`}`}
                  </button>
                )}

                <p className="ed-secure">Secure checkout · Instant QR delivery</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetail