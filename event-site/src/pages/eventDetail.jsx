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
  const [generalQty, setGeneralQty] = useState(1)
  const [vipQty, setVipQty] = useState(0)
  const [registering, setRegistering] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await getEventById(id)
        if (data) {
          setEvent(data)
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

  const total = (generalQty * (event?.price || 0)) + (vipQty * (event?.vipPrice || 0))

  const handleRegister = async () => {
    const user = auth.currentUser
    if (!user) {
      navigate('/login')
      return
    }

    if (generalQty === 0 && vipQty === 0) {
      setError('Please select at least one ticket')
      return
    }

    setRegistering(true)
    setError('')

    try {
      if (generalQty > 0) {
        await registerForEvent(id, user.uid, 'General', event.price * generalQty)
      }
      if (vipQty > 0) {
        await registerForEvent(id, user.uid, 'VIP', (event.vipPrice || 0) * vipQty)
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

  return (
    <div>
      <Navbar />

      <div className="ed-hero">
        <span className="ed-tag">{event.category}</span>
        <h1 className="ed-title">{event.title}</h1>
        <p className="ed-meta">{event.date} · {event.time} · {event.venue}</p>
        <div className="ed-actions">
          <button className="ed-btn-primary" onClick={() => document.getElementById('tickets').scrollIntoView({ behavior: 'smooth' })}>
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

          <h2>Hosted by</h2>
          <div className="ed-host">
            <div className="ed-host-avatar">HE</div>
            <div>
              <div className="ed-host-name">Event Horizon</div>
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

                <div className="ed-ticket-type">
                  <div className="ed-ticket-top">
                    <span className="ed-ticket-name">General Admission</span>
                    <span className="ed-ticket-price">
                      {event.price === 0 ? 'Free' : `P${event.price}`}
                    </span>
                  </div>
                  <div className="ed-qty">
                    <button onClick={() => setGeneralQty(Math.max(0, generalQty - 1))}>−</button>
                    <span>{generalQty}</span>
                    <button onClick={() => setGeneralQty(generalQty + 1)}>+</button>
                  </div>
                </div>

                {event.vipPrice && (
                  <div className="ed-ticket-type">
                    <div className="ed-ticket-top">
                      <span className="ed-ticket-name">VIP</span>
                      <span className="ed-ticket-price">P{event.vipPrice}</span>
                    </div>
                    <div className="ed-qty">
                      <button onClick={() => setVipQty(Math.max(0, vipQty - 1))}>−</button>
                      <span>{vipQty}</span>
                      <button onClick={() => setVipQty(vipQty + 1)}>+</button>
                    </div>
                  </div>
                )}

                <button
                  className="ed-checkout-btn"
                  onClick={handleRegister}
                  disabled={registering}
                >
                  {registering ? 'Processing...' : `Continue · ${total === 0 ? 'Free' : `P${total}`}`}
                </button>

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