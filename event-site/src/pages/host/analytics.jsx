import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { onAuthChange } from '../../services/auth'
import { getEventById } from '../../services/events'
import { getTicketsByEvent } from '../../services/tickets'
import { getUserById } from '../../services/users'
import Navbar from '../../components/Navbar'
import './analytics.css'
import { getEventRatings } from '../../services/ratings'

const calculateAge = (dob) => {
  if (!dob) return null
  const today = new Date()
  const birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

const getAgeGroup = (age) => {
  if (!age) return 'Unknown'
  if (age < 18) return 'Under 18'
  if (age < 25) return '18–24'
  if (age < 35) return '25–34'
  if (age < 45) return '35–44'
  return '45+'
}

export default function Analytics() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [tickets, setTickets] = useState([])
  const [attendees, setAttendees] = useState([])
  const [loading, setLoading] = useState(true)
  const [ratings, setRatings] = useState({ average: 0, count: 0 })

  useEffect(() => {
    const unsubscribe = onAuthChange(async (u) => {
      if (!u) {
        navigate('/login')
        return
      }
      await fetchData()
    })
    return () => unsubscribe()
  }, [])

  const fetchData = async () => {
    try {
      const [eventData, ticketData] = await Promise.all([
        getEventById(id),
        getTicketsByEvent(id)
      ])

      setEvent(eventData)
      setTickets(ticketData)

      const enriched = await Promise.all(
        ticketData.map(async (ticket) => {
          const user = await getUserById(ticket.userId)
          return {
            ...ticket,
            gender: user?.gender || 'unknown',
            age: calculateAge(user?.dob),
          }
        })
      )

      setAttendees(enriched)
      const ratingData = await getEventRatings(id)
setRatings(ratingData)
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalRevenue = tickets.reduce((sum, t) => sum + (Number(t.price) || 0), 0)
  const checkedIn = tickets.filter(t => t.checkedIn).length
  const capacity = Number(event?.capacity) || 0
  const fillRate = capacity > 0 ? Math.round((tickets.length / capacity) * 100) : 0
  const checkInRate = tickets.length > 0 ? Math.round((checkedIn / tickets.length) * 100) : 0

  const revenueByType = tickets.reduce((acc, t) => {
    const key = t.ticketType || 'General'
    if (!acc[key]) acc[key] = { count: 0, revenue: 0 }
    acc[key].count++
    acc[key].revenue += Number(t.price) || 0
    return acc
  }, {})

  const genderBreakdown = attendees.reduce((acc, a) => {
    const key = a.gender || 'unknown'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const ageBreakdown = attendees.reduce((acc, a) => {
    const group = getAgeGroup(a.age)
    acc[group] = (acc[group] || 0) + 1
    return acc
  }, {})

  const AGE_ORDER = ['Under 18', '18–24', '25–34', '35–44', '45+', 'Unknown']

  const getBar = (value, max) => {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0
    return pct
  }

  return (
    <div>
      <Navbar />
      <div className="an-page">
        <div className="an-header">
          <button className="an-back" onClick={() => navigate('/host/dashboard')}>← Back</button>
          <div>
            <h1 className="an-title">{event?.title || 'Analytics'}</h1>
            <p className="an-sub">{event?.startDate} · {event?.venue}</p>
          </div>
        </div>

        {loading ? (
          <p className="an-loading">Loading analytics...</p>
        ) : (
          <>
            {/* Summary stats */}
            <div className="an-stats">
              <div className="an-stat-card">
                <p className="an-stat-label">Tickets sold</p>
                <p className="an-stat-val">{tickets.length}</p>
                {capacity > 0 && (
                  <p className="an-stat-sub">of {capacity} capacity</p>
                )}
              </div>
              <div className="an-stat-card">
                <p className="an-stat-label">Total revenue</p>
                <p className="an-stat-val">P{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="an-stat-card">
                <p className="an-stat-label">Fill rate</p>
                <p className="an-stat-val">{fillRate}%</p>
                <div className="an-progress-bar">
                  <div className="an-progress-fill" style={{ width: `${fillRate}%` }} />
                </div>
              </div>
              <div className="an-stat-card">
                <p className="an-stat-label">Check-in rate</p>
                <p className="an-stat-val">{checkInRate}%</p>
                <p className="an-stat-sub">{checkedIn} of {tickets.length} showed up</p>
              </div>
              <div className="an-stat-card">
  <p className="an-stat-label">Event rating</p>
  <p className="an-stat-val">
    {ratings.count === 0 ? '—' : `${ratings.average} ★`}
  </p>
  <p className="an-stat-sub">{ratings.count} ratings</p>
</div>
            </div>

            <div className="an-grid">
              {/* Revenue by ticket type */}
              <div className="an-card">
                <h2 className="an-card-title">Revenue by ticket type</h2>
                {Object.keys(revenueByType).length === 0 ? (
                  <p className="an-empty">No ticket data</p>
                ) : (
                  <div className="an-breakdown">
                    {Object.entries(revenueByType).map(([type, data]) => (
                      <div key={type} className="an-breakdown-row">
                        <div className="an-breakdown-info">
                          <span className="an-breakdown-label">{type}</span>
                          <span className="an-breakdown-sub">{data.count} tickets</span>
                        </div>
                        <div className="an-breakdown-bar-wrap">
                          <div
                            className="an-breakdown-bar"
                            style={{
                              width: `${getBar(data.revenue, totalRevenue)}%`
                            }}
                          />
                        </div>
                        <span className="an-breakdown-val">P{data.revenue.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Gender breakdown */}
              <div className="an-card">
                <h2 className="an-card-title">Gender breakdown</h2>
                {Object.keys(genderBreakdown).length === 0 ? (
                  <p className="an-empty">No data</p>
                ) : (
                  <div className="an-breakdown">
                    {Object.entries(genderBreakdown).map(([gender, count]) => (
                      <div key={gender} className="an-breakdown-row">
                        <div className="an-breakdown-info">
                          <span className="an-breakdown-label">
                            {gender.charAt(0).toUpperCase() + gender.slice(1)}
                          </span>
                          <span className="an-breakdown-sub">{count} attendees</span>
                        </div>
                        <div className="an-breakdown-bar-wrap">
                          <div
                            className="an-breakdown-bar an-bar-gender"
                            style={{
                              width: `${getBar(count, attendees.length)}%`
                            }}
                          />
                        </div>
                        <span className="an-breakdown-val">
                          {Math.round((count / attendees.length) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Age breakdown */}
              <div className="an-card">
                <h2 className="an-card-title">Age breakdown</h2>
                {Object.keys(ageBreakdown).length === 0 ? (
                  <p className="an-empty">No data</p>
                ) : (
                  <div className="an-breakdown">
                    {AGE_ORDER.filter(g => ageBreakdown[g]).map((group) => (
                      <div key={group} className="an-breakdown-row">
                        <div className="an-breakdown-info">
                          <span className="an-breakdown-label">{group}</span>
                          <span className="an-breakdown-sub">{ageBreakdown[group]} attendees</span>
                        </div>
                        <div className="an-breakdown-bar-wrap">
                          <div
                            className="an-breakdown-bar an-bar-age"
                            style={{
                              width: `${getBar(ageBreakdown[group], attendees.length)}%`
                            }}
                          />
                        </div>
                        <span className="an-breakdown-val">
                          {Math.round((ageBreakdown[group] / attendees.length) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}