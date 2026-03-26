import Navbar from '../components/Navbar'
import { Link } from 'react-router-dom'
import './Register.css'

function Register() {
  return (
    <div>
      <Navbar />
      <div className="register-container">
        <div className="register-card">
          <h1 className="register-title">Create your account</h1>
          <p className="register-sub">Join to discover and host events</p>

          <div className="form-row">
            <div className="field">
              <label>Full name</label>
              <input type="text" placeholder="Mary Abygail Santos" />
            </div>
            <div className="field">
              <label>Email address</label>
              <input type="email" placeholder="you@email.com" />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Date of birth</label>
              <input type="date" />
            </div>
            <div className="field">
              <label>Gender</label>
              <select>
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
              <input type="tel" placeholder="+267 71 234 567" />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" placeholder="••••••••" />
            </div>
          </div>

          <button className="register-btn">Create account</button>

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