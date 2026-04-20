import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../../database/firebaseConfig'
import './Navbar.css'

function Navbar() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
    setShowDropdown(false)
    navigate('/')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">LogoHere</Link>

      <div className="navbar-links">
        <Link to="/">Explore</Link>
        <Link to="/search">Search</Link>
        <Link to="/my-tickets">My Tickets</Link>
        <Link to="/host/dashboard">Host an Event</Link>
      </div>

      <div className="navbar-right">
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
      </div>
    </nav>
  )
}

export default Navbar