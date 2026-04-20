import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllEvents } from '../../database/collections/events'
import Navbar from '../components/Navbar'
import "./homepagedesktop.css"

const CATEGORIES = ['All', 'Music', 'Tech', 'Sports', 'Food', 'Arts']

export const HomePage = () => {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [filtered, setFiltered] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getAllEvents()
        setEvents(data)
        setFiltered(data)
      } catch (err) {
        console.error('Failed to fetch events:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

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

  const filterEvents = (category, searchTerm) => {
    let results = events
    if (category !== 'All') {
      results = results.filter(e => e.category === category)
    }
    if (searchTerm.trim()) {
      results = results.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.venue.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    setFiltered(results)
  }

  return (
    <div className="frame">
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
                  {event.flyerUrl ? (
                    <img src={event.flyerUrl} alt={event.title} />
                  ) : null}
                  <span className="event-tag">{event.category}</span>
                </div>
                <div className="event-body">
                  <p className="event-name">{event.title}</p>
                  <p className="event-meta">{event.date} · {event.venue}</p>
                  <div className="event-footer">
                    <span className="event-price">
                      {event.price === 0 ? 'Free' : `P${event.price}`}
                    </span>
                    <button
                      className="event-reg-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/events/${event.id}`)
                      }}
                    >
                      Register
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