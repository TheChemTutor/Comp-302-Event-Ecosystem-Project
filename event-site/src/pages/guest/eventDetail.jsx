import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEventById } from '../../services/events'
import { registerForEvent, getTicketsByEvent } from '../../services/tickets'
import { getCurrentUser } from '../../services/auth'
import { joinWaitlist, leaveWaitlist, getWaitlistPosition } from '../../services/waitlist'
import { followHost, unfollowHost, isFollowing } from '../../services/follows'
import { createNotification } from '../../services/notifications'
import { useCart } from '../../context/CartContext'
import Navbar from '../../components/Navbar'
import './eventDetail.css'

function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ticketSelections, setTicketSelections] = useState([])
  const [registering, setRegistering] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [isFull, setIsFull] = useState(false)
  const [onWaitlist, setOnWaitlist] = useState(false)
  const [waitlistPosition, setWaitlistPosition] = useState(null)
  const [waitlistLoading, setWaitlistLoading] = useState(false)
  const [soldCount, setSoldCount] = useState(0)
  const [isGroup, setIsGroup] = useState(false)
  const [groupSize, setGroupSize] = useState(1)
  const [following, setFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

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

          const user = getCurrentUser()

          if (user && data.hostId && user.uid !== data.hostId) {
            const followStatus = await isFollowing(user.uid, data.hostId)
            setFollowing(followStatus)
          }

          if (data.capacity) {
            const tickets = await getTicketsByEvent(id)
            setSoldCount(tickets.length)
            if (tickets.length >= Number(data.capacity)) {
              setIsFull(true)
              if (user) {
                const pos = await getWaitlistPosition(id, user.uid)
                if (pos.position > 0) {
                  setOnWaitlist(true)
                  setWaitlistPosition(pos)
                }
              }
            }
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
    new Date(event.endDate || event.startDate)
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
    const currentSelected = updated.reduce((sum, qty) => sum + qty, 0)
    const remaining = event.capacity
      ? Number(event.capacity) - soldCount - currentSelected
      : Infinity

    if (delta > 0 && remaining <= 0) return

    updated[index] = Math.max(0, (updated[index] || 0) + delta)
    setTicketSelections(updated)
  }

  const handleRegister = async () => {
    const user = getCurrentUser()
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
                Number(event.ticketTypes[i].price) || 0,
                isGroup ? groupSize : 1
              )
            }
          }
        }
      } else {
        const qty = ticketSelections[0] || 0
        for (let j = 0; j < qty; j++) {
          await registerForEvent(id, user.uid, 'General', Number(event.price) || 0, isGroup ? groupSize : 1)
        }
      }
      setSuccess(true)
      setTimeout(() => navigate('/my-tickets'), 2000)
    } catch (err) {
      if (err.message === 'CAPACITY_REACHED') {
        setError('This event is fully booked')
      } else if (err.message === 'MAX_TICKETS_REACHED') {
        setError('You have reached the maximum of 10 tickets for this event')
      } else {
        setError('Registration failed. Please try again')
      }
      setRegistering(false)
    }
  }

  const handleJoinWaitlist = async () => {
    const user = getCurrentUser()
    if (!user) {
      navigate('/login')
      return
    }
    setWaitlistLoading(true)
    try {
      await joinWaitlist(id, user.uid)
      const pos = await getWaitlistPosition(id, user.uid)
      setOnWaitlist(true)
      setWaitlistPosition(pos)
    } catch (err) {
      console.error('Failed to join waitlist:', err)
    } finally {
      setWaitlistLoading(false)
    }
  }

  const handleLeaveWaitlist = async () => {
    const user = getCurrentUser()
    if (!user) return
    setWaitlistLoading(true)
    try {
      await leaveWaitlist(id, user.uid)
      setOnWaitlist(false)
      setWaitlistPosition(null)
    } catch (err) {
      console.error('Failed to leave waitlist:', err)
    } finally {
      setWaitlistLoading(false)
    }
  }

  const handleAddToCart = () => {
    const totalSelected = ticketSelections.reduce((sum, qty) => sum + qty, 0)
    if (totalSelected === 0) {
      setError('Please select at least one ticket')
      return
    }

    if (event?.ticketTypes && event.ticketTypes.length > 0) {
      event.ticketTypes.forEach((type, index) => {
        const qty = ticketSelections[index] || 0
        if (qty > 0) {
          addToCart(event, type.name, type.price, qty, isGroup, groupSize)
        }
      })
    } else {
      const qty = ticketSelections[0] || 0
      if (qty > 0) {
        addToCart(event, 'General', event.price || 0, qty, isGroup, groupSize)
      }
    }

    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleFollowToggle = async () => {
    const user = getCurrentUser()
    if (!user) {
      navigate('/login')
      return
    }
    setFollowLoading(true)
    try {
      if (following) {
        await unfollowHost(user.uid, event.hostId)
        setFollowing(false)
      } else {
        await followHost(user.uid, event.hostId)
        setFollowing(true)
        await createNotification(user.uid, {
          type: 'reminder',
          title: `You followed ${event.hostName || 'a host'}`,
          body: `You'll be notified when they post new events.`,
          eventId: id,
        })
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err)
    } finally {
      setFollowLoading(false)
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
            <div className="ed-host-info">
              <div className="ed-host-name">{event.hostName || 'Event Horizon'}</div>
              <div className="ed-host-sub">Official host</div>
            </div>
            {getCurrentUser() && getCurrentUser().uid !== event.hostId && (
              <button
                className={`ed-follow-btn ${following ? 'ed-follow-btn-active' : ''}`}
                onClick={handleFollowToggle}
                disabled={followLoading}
              >
                {followLoading ? '...' : following ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        <div className="ed-right" id="tickets">
          <div className="ed-ticket-box">
            <h3>Choose tickets</h3>

            {isFull ? (
              <div className="ed-full">
                {onWaitlist ? (
                  <>
                    <div className="ed-waitlist-status">
                      <p className="ed-waitlist-pos">You're #{waitlistPosition?.position} in line</p>
                      <p className="ed-waitlist-total">of {waitlistPosition?.total} waiting</p>
                    </div>
                    <p className="ed-waitlist-note">
                      We'll notify you the moment a spot opens up.
                    </p>
                    <button
                      className="ed-leave-waitlist-btn"
                      onClick={handleLeaveWaitlist}
                      disabled={waitlistLoading}
                    >
                      {waitlistLoading ? 'Leaving...' : 'Leave waitlist'}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="ed-sold-out">
                      <p className="ed-sold-out-title">This event is sold out</p>
                      <p className="ed-sold-out-sub">
                        Join the waitlist and we'll notify you if a spot opens up.
                      </p>
                    </div>
                    <button
                      className="ed-join-waitlist-btn"
                      onClick={handleJoinWaitlist}
                      disabled={waitlistLoading}
                    >
                      {waitlistLoading ? 'Joining...' : 'Join waitlist'}
                    </button>
                  </>
                )}
              </div>
            ) : success ? (
              <div className="ed-success">
                Registered! Redirecting to your tickets...
              </div>
            ) : (
              <>
                {error && <div className="ed-error">{error}</div>}

                <div className="ed-ticket-type-selector">
                  <button
                    className={`ed-type-btn ${!isGroup ? 'ed-type-btn-active' : ''}`}
                    onClick={() => { setIsGroup(false); setGroupSize(1) }}
                  >
                    Individual
                  </button>
                  <button
                    className={`ed-type-btn ${isGroup ? 'ed-type-btn-active' : ''}`}
                    onClick={() => setIsGroup(true)}
                  >
                    Group
                  </button>
                </div>

                {isGroup && (
                  <div className="ed-group-size">
                    <label>Number of people</label>
                    <div className="ed-qty">
                      <button onClick={() => setGroupSize(s => Math.max(2, s - 1))}>−</button>
                      <span>{groupSize}</span>
                      <button onClick={() => setGroupSize(s => Math.min(20, event.capacity ? Number(event.capacity) - soldCount : 20, s + 1))}>+</button>
                    </div>
                  </div>
                )}

                {ticketList.map((type, index) => (
  <div key={index} className="ed-ticket-type">
    <div className="ed-ticket-top">
      <span className="ed-ticket-name">{type.name}</span>
      <span className="ed-ticket-price">
        {!type.price || Number(type.price) === 0 ? 'Free' : `P${type.price}`}
      </span>
    </div>
    {isGroup ? (
      <div className="ed-qty">
        <button onClick={() => updateQty(index, -1)}>−</button>
        <span>{ticketSelections[index] || 0}</span>
        <button onClick={() => updateQty(index, 1)}>+</button>
      </div>
    ) : (
      <div className="ed-individual-select">
        <label className="ed-individual-toggle">
          <input
            type="checkbox"
            checked={(ticketSelections[index] || 0) > 0}
            onChange={(e) => {
              const updated = [...ticketSelections]
              updated[index] = e.target.checked ? 1 : 0
              setTicketSelections(updated)
            }}
          />
          <span>{(ticketSelections[index] || 0) > 0 ? 'Selected' : 'Select'}</span>
        </label>
      </div>
    )}
  </div>
))}

                <div className="ed-total">
                  Total: <strong>{total === 0 ? 'Free' : `P${total}`}</strong>
                </div>

                {past ? (
                  <div className="ed-past-notice">
                    This event has already taken place
                  </div>
                ) : addedToCart ? (
                  <div className="ed-added-to-cart">
                    ✓ Added to cart
                  </div>
                ) : (
                  <div className="ed-checkout-actions">
                    <button
                      className="ed-checkout-btn"
                      onClick={handleAddToCart}
                      disabled={registering}
                    >
                      Add to cart
                    </button>
                    <button
                      className="ed-buy-now-btn"
                      onClick={handleRegister}
                      disabled={registering}
                    >
                      {registering ? 'Processing...' : `Buy now · ${total === 0 ? 'Free' : `P${total}`}`}
                    </button>
                  </div>
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