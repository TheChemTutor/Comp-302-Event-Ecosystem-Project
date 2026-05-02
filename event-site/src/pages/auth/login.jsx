import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginWithEmail, loginWithGoogle } from '../../services/auth'
import Navbar from '../../components/Navbar'
import './login.css'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError('')
    setLoading(true)

    if (!email || !password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    try {
      await loginWithEmail(email, password)
      navigate('/')
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Incorrect email or password')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later')
      } else {
        setError('Something went wrong. Please try again')
      }
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    try {
      await loginWithGoogle()
      navigate('/')
    } catch (err) {
      setError('Google sign in failed. Please try again')
    }
  }

  return (
    <div>
      <Navbar />
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">Welcome back</h1>
          <p className="login-sub">Sign in to your account</p>

          {error && <div className="login-error">{error}</div>}

          <div className="field">
            <label>Email address</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="login-forgot">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button
            className="login-btn"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="login-divider">or</div>

          <button className="google-btn" onClick={handleGoogleLogin}>
            Continue with Google
          </button>

          <p className="login-register">
            No account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login