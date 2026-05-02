import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerWithEmail } from '../../services/auth'
import Navbar from '../../components/Navbar'
import './register.css'

function Register() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    dob: '',
    gender: '',
    phone: '',
    password: ''
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)

    if (!formData.fullName || !formData.email || !formData.dob || !formData.gender || !formData.phone || !formData.password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    try {
      await registerWithEmail(formData)
      navigate('/')
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists')
      } else if (err.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters')
      } else {
        setError('Something went wrong. Please try again')
      }
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar />
      <div className="register-container">
        <div className="register-card">
          <h1 className="register-title">Create your account</h1>
          <p className="register-sub">Join to discover and host events</p>

          {error && <div className="register-error">{error}</div>}

          <div className="form-row">
            <div className="field">
              <label>Full name</label>
              <input
                type="text"
                name="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <label>Email address</label>
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Date of birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <label>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
                <option value="prefer-not">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Phone number</label>
              <input
                type="tel"
                name="phone"
                placeholder="+267 71 234 567"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            className="register-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <div className="register-divider">or continue with</div>

          <button className="google-btn">Google</button>

          <p className="register-login">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register