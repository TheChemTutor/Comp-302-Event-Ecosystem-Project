import { Link } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  return (
    <nav className="navbar">
      <span className="navbar-logo">LogoHere</span>

      <div className="navbar-links">
        <Link to="/">Explore</Link>
        <Link to="/my-tickets">My Tickets</Link>
        <Link to="/host/dashboard">Host an Event</Link>
      </div>

      <div className="navbar-right">
        <Link to="/login" className="navbar-signin">Sign in</Link>
        <div className="navbar-avatar">
          <svg viewBox="0 0 22 22" fill="none" width="20" height="20">
            <circle cx="11" cy="8" r="4" fill="#C4A882"/>
            <path d="M3 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#C4A882" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </nav>
  )
}

export default Navbar