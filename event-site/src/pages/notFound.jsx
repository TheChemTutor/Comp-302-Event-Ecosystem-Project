import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import './notFound.css'

function NotFound() {
  return (
    <div>
      <Navbar />
      <div className="nf-container">
        <h1 className="nf-code">404</h1>
        <h2 className="nf-title">This page doesn't exist</h2>
        <p className="nf-sub">
          The event may have been removed, the link might be broken,
          or it was never here in the first place.
        </p>
        <div className="nf-buttons">
          <Link to="/" className="btn-dark">Back to home</Link>
          <Link to="/search" className="btn-outline">Browse events</Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound