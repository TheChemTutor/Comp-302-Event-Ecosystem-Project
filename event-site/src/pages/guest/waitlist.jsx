import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthChange, getCurrentUser } from '../../services/auth'
import { getUserWaitlist, leaveWaitlist, getWaitlistPosition } from '../../services/waitlist'
import { getEventById } from '../../services/events'
import Navbar from '../../components/Navbar'
import './waitlist.css'

function Waitlist() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [leaving, setLeaving] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthChange(async (u) => {
      if (!u) {
        navigate('/login')
        return
      }
      await fetchWaitlist(u.uid)
    })
    return () => unsubscribe()
  }, [])

  const fetchWaitlist = async (userId) => {
    try {
      const waitlistEntries = await getUserWaitlist(userId)

      const enriched = await Promise.all(
        waitlistEntries.map(async (entry) => {
          const [event, positionData] = await Promise.all([
            getEventById(entry.eventId),
            getWaitlistPosition(entry.eventId, userId)
          ])
          return {
            ...entry,
            event,
            position: positionData.position,
            total: positionData.total
          }
        })
      )

      setEntries(enriched)
    } catch (err) {
      console.error('Failed to fetch waitlist:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLeave = async (eventId) => {
    if (!window.confirm('Are you sure you want to leave this waitlist?')) return
    const user = getCurrentUser()
    if (!user) return

    setLeaving(eventId)
    try {
      await leaveWaitlist(eventId, user.uid)
      setEntries(prev => prev.filter(e => e.eventId !== eventId))
    } catch (err) {
      console.error('Failed to leave waitlist:', err)
      alert('Something went wrong. Please try again.')
    } finally {
      setLeaving(null)
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      Music: 'linear-gradient(135deg, #ff6b00, #ffb347)',
      Tech: 'linear-gradient(135deg, #ffd600, #ff6b00)',
      Sports: 'linear-gradient(135deg, #1a1200, #4a3800)',
      Food: 'linear-gradient(135deg, #854f0b, #ba7517)',
      Arts: 'linear-gradient(135deg, #3a1a00, #7a3a00)',
      Networking: 'linear-gradient(135deg, #0f4c75, #1b6ca8)',
    }
    return colors[category] || 'linear-gradient(135deg, #6b5200, #c4a882)'
  }

  return (
    <div>
      <Navbar />
      <div className="wl-page">
        <div className="wl-header">
          <h1 className="wl-title">My Waitlist</h1>
          <p className="wl-sub">You'll be notified the moment a spot opens up</p>
        </div>

        {loading ? (
          <p className="wl-loading">Loading your waitlist...</p>
        ) : entries.length === 0 ? (
          <div className="wl-empty">
            <p>You're not on any waitlists</p>
            <button className="wl-browse-btn" onClick={() => navigate('/')}>
              Browse events
            </button>
          </div>
        ) : (
          <div className="wl-list">
            {entries.map((entry) => (
              <div key={entry.eventId} className="wl-card">
                <div
                  className="wl-thumb"
                  style={{ background: getCategoryColor(entry.event?.category) }}
                />
                <div className="wl-info">
                  <p className="wl-event-name">{entry.event?.title || 'Unknown Event'}</p>
                  <p className="wl-event-meta">
                    {entry.event?.startDate} · {entry.event?.venue}
                  </p>
                  <p className="wl-event-price">
                    {!entry.event?.price || Number(entry.event?.price) === 0
                      ? 'Free if confirmed'
                      : `P${entry.event?.price} if confirmed`}
                  </p>
                </div>
                <div className="wl-right">
                  <div className="wl-position">
                    <span className="wl-position-num">#{entry.position}</span>
                    <span className="wl-position-label">of {entry.total} waiting</span>
                  </div>
                  <span className="wl-badge">Waitlisted</span>
                  <button
                    className="wl-leave-btn"
                    onClick={() => handleLeave(entry.eventId)}
                    disabled={leaving === entry.eventId}
                  >
                    {leaving === entry.eventId ? 'Leaving...' : 'Leave waitlist'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Waitlist