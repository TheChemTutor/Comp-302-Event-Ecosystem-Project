import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllEvents } from '../../database/collections/events'
import Navbar from '../components/Navbar'
import './search.css'

const CATEGORIES = ['All', 'Music', 'Tech', 'Sports', 'Food', 'Arts']

function Search() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [maxPrice, setMaxPrice] = useState('')
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

  const applyFilters = (searchTerm, category, price) => {
    let results = events

    if (searchTerm.trim()) {
      results = results.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (category !== 'All') {
      results = results.filter(e => e.category === category)
    }

    if (price !== '' && !isNaN(price)) {
      results = results.filter(e => e.price <= Number(price))
    }

    setFiltered(results)
  }

  const handleSearch = (e) => {
    setSearch(e.target.value)
    applyFilters(e.target.value, activeCategory, maxPrice)
  }

  const handleCategory = (cat) => {
    setActiveCategory(cat)
    applyFilters(search, cat, maxPrice)
  }

  const handlePrice = (e) => {
    setMaxPrice(e.target.value)
    applyFilters(search, activeCategory, e.target.value)
  }

  const clearFilters = () => {
    setSearch('')
    setActiveCategory('All')
    setMaxPrice('')
    setFiltered(events)
  }

  return (
    <div>
      <Navbar />
      <div className="search-page">

        <div className="search-top">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search events, artists, venues..."
              value={search}
              onChange={handleSearch}
            />
            <button className="search-btn">Search</button>
          </div>
          <div className="search-chips">
            {activeCategory !== 'All' && (
              <span className="chip chip-active">{activeCategory}</span>
            )}
            {maxPrice && (
              <span className="chip chip-active">Under P{maxPrice}</span>
            )}
            {(activeCategory !== 'All' || maxPrice) && (
              <span className="chip chip-clear" onClick={clearFilters}>Clear all</span>
            )}
          </div>
        </div>

        <div className="search-body">
          <div className="search-sidebar">
            <div className="sidebar-section">
              <p className="sidebar-title">Category</p>
              {CATEGORIES.map(cat => (
                <div key={cat} className="cb-row" onClick={() => handleCategory(cat)}>
                  <div className={`cb ${activeCategory === cat ? 'cb-checked' : ''}`}></div>
                  <span className={`cb-label ${activeCategory === cat ? 'cb-label-active' : ''}`}>{cat}</span>
                </div>
              ))}
            </div>

            <div className="sidebar-section">
              <p className="sidebar-title">Max price (P)</p>
              <input
                type="number"
                className="price-input"
                placeholder="e.g. 200"
                value={maxPrice}
                onChange={handlePrice}
              />
            </div>
          </div>

          <div className="search-results">
            <p className="results-count">
              {loading ? 'Loading...' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
            </p>

            {!loading && filtered.length === 0 ? (
              <div className="search-empty">
                <p>No events found</p>
                <button className="clear-btn" onClick={clearFilters}>Clear filters</button>
              </div>
            ) : (
              <div className="results-grid">
                {filtered.map(event => (
                  <div
                    key={event.id}
                    className="result-card"
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    <div className={`result-img event-img-${event.category?.toLowerCase() || 'default'}`}>
                      {event.flyerUrl && <img src={event.flyerUrl} alt={event.title} />}
                      <span className="result-tag">{event.category}</span>
                    </div>
                    <div className="result-body">
                      <p className="result-name">{event.title}</p>
                      <p className="result-meta">{event.date} · {event.venue}</p>
                      <div className="result-footer">
                        <span className="result-price">
                          {event.price === 0 ? 'Free' : `P${event.price}`}
                        </span>
                        <span className="result-available">Available</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Search