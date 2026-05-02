import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { onAuthChange } from '../../services/auth'
import { getEventById } from '../../services/events'
import { getTicketsByEvent, checkInTicket } from '../../services/tickets'
import { getUserById } from '../../services/users'
import Navbar from '../../components/Navbar'
import './attendeeList.css'

const calculateAge = (dob) => {
  if (!dob) return '—'
  const today = new Date()
  const birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export default function AttendeeList() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [attendees, setAttendees] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(null)

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
      const [eventData, tickets] = await Promise.all([
        getEventById(id),
        getTicketsByEvent(id)
      ])

      setEvent(eventData)

      const enriched = await Promise.all(
        tickets.map(async (ticket) => {
          const user = await getUserById(ticket.userId)
          return {
            ...ticket,
            fullName: user?.fullName || 'Unknown',
            email: user?.email || '—',
            gender: user?.gender || '—',
            age: calculateAge(user?.dob),
          }
        })
      )

      setAttendees(enriched)
      setFiltered(enriched)
    } catch (err) {
      console.error('Failed to fetch attendees:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase()
    setSearch(e.target.value)
    setFiltered(
      attendees.filter(a =>
        a.fullName.toLowerCase().includes(term) ||
        a.ticketType.toLowerCase().includes(term)
      )
    )
  }

  const handleCheckIn = async (ticketId) => {
    setCheckingIn(ticketId)
    try {
      await checkInTicket(ticketId)
      const updated = attendees.map(a =>
        a.id === ticketId ? { ...a, checkedIn: true } : a
      )
      setAttendees(updated)
      setFiltered(updated.filter(a =>
        a.fullName.toLowerCase().includes(search.toLowerCase()) ||
        a.ticketType.toLowerCase().includes(search.toLowerCase())
      ))
    } catch (err) {
      console.error('Failed to check in:', err)
      alert('Check in failed. Please try again.')
    } finally {
      setCheckingIn(null)
    }
  }

  const checkedInCount = attendees.filter(a => a.checkedIn).length

  return (
    <div>
      <Navbar />
      <div className="al-page">
        <div className="al-header">
          <button className="al-back" onClick={() => navigate('/host/dashboard')}>← Back</button>
          <div>
            <h1 className="al-title">{event?.title || 'Attendees'}</h1>
            <p className="al-sub">
              {attendees.length} tickets sold · {checkedInCount} checked in
            </p>
          </div>
        </div>

        <div className="al-toolbar">
          <input
            type="text"
            className="al-search"
            placeholder="Search by name or ticket type..."
            value={search}
            onChange={handleSearch}
          />
          <span className="al-count">{filtered.length} attendees</span>
        </div>

        {loading ? (
          <p className="al-loading">Loading attendees...</p>
        ) : filtered.length === 0 ? (
          <p className="al-empty">No attendees found</p>
        ) : (
          <div className="al-table">
            <div className="al-table-head">
              <span>Name</span>
              <span>Gender</span>
              <span>Age</span>
              <span>Ticket type</span>
              <span>Price paid</span>
              <span>Purchased</span>
              <span>Status</span>
            </div>
            {filtered.map(attendee => (
              <div key={attendee.id} className="al-table-row">
                <div className="al-name-cell">
                  <div className="al-avatar">
                    {attendee.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="al-name">{attendee.fullName}</p>
                    <p className="al-email">{attendee.email}</p>
                  </div>
                </div>
                <span className="al-muted">
                  {attendee.gender.charAt(0).toUpperCase() + attendee.gender.slice(1)}
                </span>
                <span className="al-muted">{attendee.age}</span>
                <span className="al-muted">{attendee.ticketType}</span>
                <span className="al-muted">
                  {!attendee.price || attendee.price === 0 ? 'Free' : `P${attendee.price}`}
                </span>
                <span className="al-muted">
                  {attendee.purchasedAt
                    ? new Date(attendee.purchasedAt).toLocaleDateString()
                    : '—'}
                </span>
                <div>
                  {attendee.checkedIn ? (
                    <span className="al-badge-checkedin">Checked in</span>
                  ) : (
                    <button
                      className="al-checkin-btn"
                      onClick={() => handleCheckIn(attendee.id)}
                      disabled={checkingIn === attendee.id}
                    >
                      {checkingIn === attendee.id ? 'Checking in...' : 'Check in'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}