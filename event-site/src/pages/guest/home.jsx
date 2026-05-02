import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllEvents } from '../../services/events'
import Navbar from '../../components/Navbar'
import './home.css'
import { getCurrentUser, onAuthChange } from '../../services/auth'
import { getFollowedHosts } from '../../services/follows'

const CATEGORIES = ['All', 'Music', 'Tech', 'Sports', 'Food', 'Arts', 'Networking']

function HomePage() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [filtered, setFiltered] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [followedHostIds, setFollowedHostIds] = useState([])
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getAllEvents()
        const publicEvents = data.filter(e => e.visibility !== 'Private')
        setEvents(publicEvents)
        setFiltered(publicEvents)
      } catch (err) {
        console.error('Failed to fetch events:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])
useEffect(() => {
  const unsubscribe = onAuthChange(async (u) => {
    setUser(u)
    if (u) {
      const followed = await getFollowedHosts(u.uid)
      setFollowedHostIds(followed)
    }
  })
  return () => unsubscribe()
}, [])
  const filterEvents = (category, searchTerm) => {
    let results = events
    if (category !== 'All') {
      results = results.filter(e =>
        e.category?.toLowerCase() === category.toLowerCase()
      )
    }
    if (searchTerm.trim()) {
      results = results.filter(e =>
        e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.venue?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    setFiltered(results)
  }

  const handleCategory = (category) => {
    setActiveCategory(category)
    filterEvents(category, search)
  }

  const handleSearch = (e) => {
    setSearch(e.target.value)
    filterEvents(activeCategory, e.target.value)
  }

  const handleSearchSubmit = () => {
    navigate(`/search?q=${search}`)
  }

  const isPast = (event) => {
    if (!event.startDate) return false
    return new Date(event.startDate) < new Date()
  }

  return (
    <div>
      <Navbar />

      <div className="hero">
        <h1 className="hero-title">Find your next experience</h1>
        <p className="hero-subtitle">
          Concerts, tech meetups, sports, food festivals — all in one place
        </p>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search events, artists, venues..."
            value={search}
            onChange={handleSearch}
          />
          <button className="btn-search" onClick={handleSearchSubmit}>Search</button>
        </div>
      </div>

      <div className="home-body">
  {followedHostIds.length > 0 && (
    <div className="following-section">
      <h2 className="following-title">From hosts you follow</h2>
      <div className="events-grid">
        {filtered
          .filter(e => followedHostIds.includes(e.hostId))
          .map(event => (
            <div
              key={event.id}
              className="event-card"
              onClick={() => navigate(`/events/${event.id}`)}
            >
              <div className={`event-img event-img-${event.category?.toLowerCase() || 'default'}`}>
                {event.flyerUrl && (
                  <img
                    src={event.flyerUrl}
                    alt={event.title}
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                )}
                <span className="event-tag">{event.category}</span>
              </div>
              <div className="event-body">
                <p className="event-name">{event.title}</p>
                <p className="event-meta">{event.startDate} · {event.venue}</p>
                <div className="event-footer">
                  <span className="event-price">
                    {!event.price || Number(event.price) === 0 ? 'Free' : `P${event.price}`}
                  </span>
                  <button
                    className={`event-reg-btn ${isPast(event) ? 'event-reg-btn-past' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/events/${event.id}`)
                    }}
                    disabled={isPast(event)}
                  >
                    {isPast(event) ? 'Past' : 'Register'}
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
      <div className="following-divider" />
    </div>
  )}
  <div className="category-row">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`chip ${activeCategory === cat ? 'chip-active' : ''}`}
              onClick={() => handleCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="home-loading">Loading events...</p>
        ) : filtered.length === 0 ? (
          <p className="home-empty">No events found</p>
        ) : (
          <div className="events-grid">
            {filtered.map(event => (
              <div
                key={event.id}
                className="event-card"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <div className={`event-img event-img-${event.category?.toLowerCase() || 'default'}`}>
                  {event.flyerUrl && (
                    <img
                      src={event.flyerUrl}
                      alt={event.title}
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  )}
                  <span className="event-tag">{event.category}</span>
                </div>
                <div className="event-body">
                  <p className="event-name">{event.title}</p>
                  <p className="event-meta">{event.startDate} · {event.venue}</p>
                  <div className="event-footer">
                    <span className="event-price">
                      {!event.price || Number(event.price) === 0 ? 'Free' : `P${event.price}`}
                    </span>
                    <button
                      className={`event-reg-btn ${isPast(event) ? 'event-reg-btn-past' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/events/${event.id}`)
                      }}
                      disabled={isPast(event)}
                    >
                      {isPast(event) ? 'Past' : 'Register'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage