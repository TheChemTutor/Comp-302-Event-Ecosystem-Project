import Navbar from '../components/Navbar'
import { Link } from 'react-router-dom'
import './Login.css'

function Login() {
  return (
    <div>
      <Navbar />
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">Welcome back</h1>
          <p className="login-sub">Sign in to your account</p>

          <div className="field">
            <label>Email address</label>
            <input type="email" placeholder="you@email.com" />
          </div>

          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="••••••••" />
          </div>

          <div className="login-forgot">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button className="login-btn">Sign in</button>

          <div className="login-divider">or</div>

          <button className="google-btn">Continue with Google</button>

          <p className="login-register">
            No account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login