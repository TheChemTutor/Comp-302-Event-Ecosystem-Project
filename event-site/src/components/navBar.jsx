import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { onAuthChange, logout } from '../services/auth'
import { useCart } from '../context/CartContext'
import logo from '../assets/event_horizon_logo.png'
import './Navbar.css'

function Navbar() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const { cartCount } = useCart()

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    await logout()
    setShowDropdown(false)
    setShowMobileMenu(false)
    navigate('/')
  }

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="Event Horizon" className="navbar-logo-img" />
        </Link>

        <div className="navbar-links">
          <Link to="/">Explore</Link>
          <Link to="/search">Search</Link>
          <Link to="/my-tickets">My Tickets</Link>
          <Link to="/cart">Cart {cartCount > 0 && `(${cartCount})`}</Link>
          <Link to="/host/dashboard">Host an Event</Link>
        </div>

        <div className="navbar-right">
          <div className="navbar-cart" onClick={() => navigate('/cart')}>
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && (
              <span className="navbar-cart-count">{cartCount}</span>
            )}
          </div>

          {user ? (
            <div className="navbar-user">
              <span className="navbar-username">
                {user.displayName?.split(' ')[0] || 'Account'}
              </span>
              <div
                className="navbar-avatar"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <svg viewBox="0 0 22 22" fill="none" width="20" height="20">
                  <circle cx="11" cy="8" r="4" fill="#C4A882"/>
                  <path d="M3 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#C4A882" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              {showDropdown && (
                <div className="navbar-dropdown">
                  <Link to="/my-tickets" onClick={() => setShowDropdown(false)}>My Tickets</Link>
                  <Link to="/notifications" onClick={() => setShowDropdown(false)}>Notifications</Link>
                  <Link to="/host/dashboard" onClick={() => setShowDropdown(false)}>Host Dashboard</Link>
                  <button onClick={handleLogout}>Sign out</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="navbar-signin">Sign in</Link>
          )}

          <button
            className="navbar-hamburger"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {showMobileMenu && (
        <div className="navbar-mobile-menu">
          <Link to="/" onClick={() => setShowMobileMenu(false)}>Explore</Link>
          <Link to="/search" onClick={() => setShowMobileMenu(false)}>Search</Link>
          <Link to="/my-tickets" onClick={() => setShowMobileMenu(false)}>My Tickets</Link>
          <Link to="/cart" onClick={() => setShowMobileMenu(false)}>
            Cart {cartCount > 0 && `(${cartCount})`}
          </Link>
          <Link to="/host/dashboard" onClick={() => setShowMobileMenu(false)}>Host an Event</Link>
          <Link to="/notifications" onClick={() => setShowMobileMenu(false)}>Notifications</Link>
          {user ? (
            <button onClick={handleLogout}>Sign out</button>
          ) : (
            <Link to="/login" onClick={() => setShowMobileMenu(false)}>Sign in</Link>
          )}
        </div>
      )}
    </>
  )
}

export default Navbar