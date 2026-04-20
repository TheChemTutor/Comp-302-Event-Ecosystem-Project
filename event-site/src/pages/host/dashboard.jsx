import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../../../database/firebaseConfig'
import { ref, get } from 'firebase/database'
import { onAuthStateChanged } from 'firebase/auth'
import Navbar from '../../components/Navbar'
import './dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [events, setEvents] = useState([])
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalTickets: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        navigate('/login')
        return
      }
      setUser(u)
      await fetchHostData(u.uid)
    })
    return () => unsubscribe()
  }, [])

  const fetchHostData = async (userId) => {
    try {
      const eventsSnap = await get(ref(db, 'events'))
      const ticketsSnap = await get(ref(db, 'tickets'))

      let hostEvents = []
      if (eventsSnap.exists()) {
        hostEvents = Object.entries(eventsSnap.val())
          .filter(([id, e]) => e.hostId === userId)
          .map(([id, e]) => ({ id, ...e }))
      }

      let totalTickets = 0
      let totalRevenue = 0
      if (ticketsSnap.exists()) {
        const allTickets = Object.values(ticketsSnap.val())
        hostEvents.forEach(event => {
          const eventTickets = allTickets.filter(t => t.eventId === event.id)
          totalTickets += eventTickets.length
          totalRevenue += eventTickets.reduce((sum, t) => sum + (Number(t.price) || 0), 0)
        })
      }

      setEvents(hostEvents)
      setStats({
        totalEvents: hostEvents.length,
        totalTickets,
        totalRevenue,
      })
    } catch (err) {
      console.error('Failed to fetch host data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatus = (event) => {
    if (event.status === 'draft') return 'Draft'
    if (new Date(event.startDate) > new Date()) return 'Live'
    return 'Past'
  }

  const getStatusClass = (status) => {
    if (status === 'Live') return 'db-status-live'
    if (status === 'Draft') return 'db-status-draft'
    return 'db-status-past'
  }

  return (
    <div>
      <Navbar />
      <div className="db-page">
        <div className="db-header">
          <h1 className="db-title">My Events</h1>
          <button className="db-new-btn" onClick={() => navigate('/host/create')}>
            + New event
          </button>
        </div>

        {loading ? (
          <p className="db-loading">Loading...</p>
        ) : (
          <>
            <div className="db-stats">
              <div className="db-stat-card">
                <p className="db-stat-label">Total events</p>
                <p className="db-stat-val">{stats.totalEvents}</p>
              </div>
              <div className="db-stat-card">
                <p className="db-stat-label">Tickets sold</p>
                <p className="db-stat-val">{stats.totalTickets}</p>
              </div>
              <div className="db-stat-card">
                <p className="db-stat-label">Total revenue</p>
                <p className="db-stat-val">P{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="db-stat-card">
                <p className="db-stat-label">Active events</p>
                <p className="db-stat-val">
                  {events.filter(e => getStatus(e) === 'Live').length}
                </p>
              </div>
            </div>

            {events.length === 0 ? (
              <div className="db-empty">
                <p>You haven't created any events yet</p>
                <button className="db-create-btn" onClick={() => navigate('/host/create')}>
                  Create your first event
                </button>
              </div>
            ) : (
              <div className="db-table">
                <div className="db-table-head">
                  <span>Event</span>
                  <span>Date</span>
                  <span>Category</span>
                  <span>Capacity</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>
                {events.map(event => {
                  const status = getStatus(event)
                  return (
                    <div key={event.id} className="db-table-row">
                      <span className="db-event-name">{event.title}</span>
                      <span className="db-muted">{event.startDate || '—'}</span>
                      <span className="db-muted">{event.category}</span>
                      <span className="db-muted">{event.capacity || '—'}</span>
                      <span className={`db-status ${getStatusClass(status)}`}>{status}</span>
                      <div className="db-actions">
                        <button onClick={() => navigate(`/host/analytics/${event.id}`)}>Analytics</button>
                        <button onClick={() => navigate(`/host/edit/${event.id}`)}>Edit</button>
                        <button onClick={() => navigate(`/host/attendees/${event.id}`)}>Attendees</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}