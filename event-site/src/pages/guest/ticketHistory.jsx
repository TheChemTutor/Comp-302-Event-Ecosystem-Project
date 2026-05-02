import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthChange } from '../../services/auth'
import { getUserTickets, cancelTicket } from '../../services/tickets'
import { getAllEvents } from '../../services/events'
import { getUserWaitlist } from '../../services/waitlist'
import Navbar from '../../components/Navbar'
import './ticketHistory.css'

const TABS = ['Upcoming', 'Past', 'Waitlisted']

export default function TicketHistory() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [events, setEvents] = useState({})
  const [activeTab, setActiveTab] = useState('Upcoming')
  const [loading, setLoading] = useState(true)
  const [waitlistEntries, setWaitlistEntries] = useState([])

  useEffect(() => {
    const unsubscribe = onAuthChange(async (u) => {
      if (!u) {
        navigate('/login')
        return
      }
      await fetchTickets(u.uid)
    })
    return () => unsubscribe()
  }, [])

  const fetchTickets = async (userId) => {
    try {
      const [userTickets, allEvents] = await Promise.all([
        getUserTickets(userId),
        getAllEvents()
      ])

      const eventsMap = allEvents.reduce((map, event) => {
        map[event.id] = event
        return map
      }, {})

      setTickets(userTickets)
      setEvents(eventsMap)

      const waitlist = await getUserWaitlist(userId)
      const enrichedWaitlist = await Promise.all(
        waitlist.map(async entry => {
          const event = allEvents.find(e => e.id === entry.eventId)
          return { ...entry, event }
        })
      )
      setWaitlistEntries(enrichedWaitlist)
    } catch (err) {
      console.error('Failed to fetch tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  const getEventForTicket = (ticket) => {
    return events[ticket.eventId] || null
  }

  const isUpcoming = (ticket) => {
    const event = getEventForTicket(ticket)
    if (!event) return false
    const dateStr = event.startDate || event.date
    return new Date(dateStr) >= new Date()
  }

  const handleCancelTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to cancel this ticket? This cannot be undone.')) return
    try {
      await cancelTicket(ticketId)
      setTickets(prev => prev.filter(t => t.id !== ticketId))
    } catch (err) {
      console.error('Failed to cancel ticket:', err)
      alert('Failed to cancel ticket. Please try again.')
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    if (activeTab === 'Upcoming') return isUpcoming(ticket)
    if (activeTab === 'Past') return !isUpcoming(ticket)
    return false
  })

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
      <div className="th-page">
        <h1 className="th-title">My Tickets</h1>

        <div className="th-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`th-tab ${activeTab === tab ? 'th-tab-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {tab !== 'Waitlisted' && (
                <span className="th-tab-count">
                  {tab === 'Upcoming'
                    ? tickets.filter(t => isUpcoming(t)).length
                    : tickets.filter(t => !isUpcoming(t)).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="th-loading">Loading your tickets...</p>
        ) : activeTab === 'Waitlisted' ? (
          waitlistEntries.length === 0 ? (
            <div className="th-empty">
              <p>You're not on any waitlists</p>
              <button className="th-browse-btn" onClick={() => navigate('/')}>
                Browse events
              </button>
            </div>
          ) : (
            <div className="th-list">
              {waitlistEntries.map((entry, index) => (
                <div key={index} className="th-item">
                  <div
                    className="th-thumb"
                    style={{ background: getCategoryColor(entry.event?.category) }}
                  />
                  <div className="th-info">
                    <p className="th-event-name">{entry.event?.title || 'Unknown Event'}</p>
                    <p className="th-event-meta">
                      {entry.event?.startDate} · {entry.event?.venue}
                    </p>
                  </div>
                  <div className="th-right">
                    <p className="th-price">
                      {!entry.event?.price || entry.event?.price === 0
                        ? 'Free if confirmed'
                        : `P${entry.event?.price} if confirmed`}
                    </p>
                    <span className="th-badge th-badge-upcoming">Waitlisted</span>
                  </div>
                  <div className="th-actions">
                    <button
                      className="th-view-btn"
                      onClick={() => navigate(`/events/${entry.eventId}`)}
                    >
                      View event
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : filteredTickets.length === 0 ? (
          <div className="th-empty">
            <p>No {activeTab.toLowerCase()} tickets</p>
            {activeTab === 'Upcoming' && (
              <button className="th-browse-btn" onClick={() => navigate('/')}>
                Browse events
              </button>
            )}
          </div>
        ) : (
          <div className="th-list">
            {filteredTickets.map(ticket => {
              const event = getEventForTicket(ticket)
              return (
                <div key={ticket.id} className="th-item">
                  <div
                    className="th-thumb"
                    style={{ background: getCategoryColor(event?.category) }}
                  />
                  <div className="th-info">
                    <p className="th-event-name">{event?.title || 'Unknown Event'}</p>
                    <p className="th-event-meta">
                      {event?.startDate || event?.date} · {event?.venue} · {ticket.ticketType}
                    </p>
                  </div>
                  <div className="th-right">
                    <p className="th-price">
                      {!ticket.price || ticket.price === 0 ? 'Free' : `P${ticket.price}`}
                    </p>
                    <p className="th-ref">{ticket.id?.slice(0, 8).toUpperCase()}</p>
                    <span className={`th-badge ${activeTab === 'Upcoming' ? 'th-badge-upcoming' : 'th-badge-past'}`}>
                      {activeTab === 'Upcoming' ? 'Upcoming' : 'Attended'}
                    </span>
                  </div>
                  <div className="th-actions">
                    <button
                      className="th-view-btn"
                      onClick={() => navigate(`/ticket/${ticket.id}`)}
                    >
                      View ticket
                    </button>
                    {activeTab === 'Upcoming' && (
                      <button
                        className="th-cancel-btn"
                        onClick={() => handleCancelTicket(ticket.id)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}