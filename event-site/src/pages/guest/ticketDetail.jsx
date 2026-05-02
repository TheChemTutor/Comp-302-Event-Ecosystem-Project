import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { onAuthChange } from '../../services/auth'
import { getUserTickets } from '../../services/tickets'
import { getEventById } from '../../services/events'
import { QRCodeSVG } from 'qrcode.react'
import Navbar from '../../components/Navbar'
import './ticketDetail.css'
import { submitRating, getUserRating } from '../../services/ratings'

export default function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(null)
  const [hoveredRating, setHoveredRating] = useState(null)
  const [submittingRating, setSubmittingRating] = useState(false)
  const [ratingSubmitted, setRatingSubmitted] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthChange(async (u) => {
      if (!u) {
        navigate('/login')
        return
      }
      await fetchTicket(u.uid)
    })
    return () => unsubscribe()
  }, [])

  const fetchTicket = async (userId) => {
    try {
      const tickets = await getUserTickets(userId)
      const found = tickets.find(t => t.id === id)
      if (!found) {
        navigate('/my-tickets')
        return
      }
      const eventData = await getEventById(found.eventId)
      setTicket(found)
setEvent(eventData)
const handleRating = async (stars) => {
  if (ratingSubmitted) return
  setSubmittingRating(true)
  try {
    await submitRating(ticket.eventId, ticket.userId, stars)
    setRating(stars)
    setRatingSubmitted(true)
  } catch (err) {
    console.error('Failed to submit rating:', err)
  } finally {
    setSubmittingRating(false)
  }
}
const existingRating = await getUserRating(found.eventId, u.uid)
if (existingRating) {
  setRating(existingRating)
  setRatingSubmitted(true)
}
    } catch (err) {
      console.error('Failed to fetch ticket:', err)
    } finally {
      setLoading(false)
    }
  }

  const isPast = () => {
    if (!event?.startDate) return false
    return new Date(event.startDate) < new Date()
  }

  if (loading) return (
    <div>
      <Navbar />
      <div className="td-loading">Loading ticket...</div>
    </div>
  )

  if (!ticket || !event) return null

  return (
    <div>
      <Navbar />
      <div className="td-page">
        <button className="td-back" onClick={() => navigate('/my-tickets')}>
          ← Back to my tickets
        </button>

        <div className="td-card">
          <div className="td-top">
            <div className={`td-banner event-img-${event.category?.toLowerCase() || 'default'}`}>
              {event.flyerUrl && (
                <img
                  src={event.flyerUrl}
                  alt={event.title}
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              )}
            </div>
            <div className="td-event-info">
              <span className="td-category">{event.category}</span>
              <h1 className="td-event-name">{event.title}</h1>
              <p className="td-event-meta">{event.startDate} · {event.startTime}</p>
              <p className="td-event-meta">{event.venue}</p>
            </div>
          </div>

          <div className="td-divider">
            <div className="td-notch td-notch-left" />
            <div className="td-dashes" />
            <div className="td-notch td-notch-right" />
          </div>

          <div className="td-bottom">
            <div className="td-details">
              <div className="td-detail-row">
                <span className="td-detail-label">Ticket type</span>
                <span className="td-detail-val">{ticket.ticketType}</span>
              </div>
              <div className="td-detail-row">
                <span className="td-detail-label">Price paid</span>
                <span className="td-detail-val">
                  {!ticket.price || ticket.price === 0 ? 'Free' : `P${ticket.price}`}
                </span>
              </div>
              <div className="td-detail-row">
                <span className="td-detail-label">Reference</span>
                <span className="td-detail-val td-ref">{ticket.id?.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="td-detail-row">
                <span className="td-detail-label">Purchased</span>
                <span className="td-detail-val">
                  {ticket.purchasedAt
                    ? new Date(ticket.purchasedAt).toLocaleDateString()
                    : '—'}
                </span>
              </div>
              <div className="td-detail-row">
                <span className="td-detail-label">Status</span>
                <span className={`td-badge ${ticket.checkedIn ? 'td-badge-used' : isPast() ? 'td-badge-past' : 'td-badge-upcoming'}`}>
                  {ticket.checkedIn ? 'Checked in' : isPast() ? 'Past' : 'Upcoming'}
                </span>
              </div>
            </div>

            <div className="td-qr">
              {ticket.checkedIn ? (
                <div className="td-qr-used">
                  <p>✅ Already used</p>
                </div>
              ) : (
                <>
                  <QRCodeSVG
                    value={ticket.id}
                    size={160}
                    bgColor="#ffffff"
                    fgColor="#1A1200"
                    level="H"
                  />
                  <p className="td-qr-label">Show this at the entrance</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {ticket.checkedIn && isPast() && (
            <div className="td-rating">
              <p className="td-rating-title">
                {ratingSubmitted ? 'Your rating' : 'Rate this event'}
              </p>
              <div className="td-stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    className={`td-star ${star <= (hoveredRating || rating || 0) ? 'td-star-active' : ''}`}
                    onClick={() => handleRating(star)}
                    onMouseEnter={() => !ratingSubmitted && setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(null)}
                    disabled={ratingSubmitted || submittingRating}
                  >
                    ★
                  </button>
                ))}
              </div>
              {ratingSubmitted && (
                <p className="td-rating-sub">Thanks for your feedback!</p>
              )}
            </div>
          )}
    </div>
  )
}