import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { api, setAuth } from '../api/api'
import BrandLogo from '../components/BrandLogo'
import authVisual from '../assets/photos/hero2.jpg'

export default function RegisterPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const email = form.email.trim().toLowerCase()
    try {
      const data = await api('/api/auth/register', {
        method: 'POST',
        body: {
          ...form,
          email,
          login: email,
        },
        auth: false,
      })
      setAuth(data)
      navigate('/app')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth bg-paw-pattern">
      <div className="auth-visual" aria-hidden="true">
        <img src={authVisual} alt="" />
        <div className="auth-visual-shade" />
      </div>

      <div className="auth-side">
        <div className="auth-panel">
          <BrandLogo variant="mini" className="auth-brand" />

          <header className="auth-header">
            <h1>Create account</h1>
            <p>Book visits in a few steps.</p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-row">
              <label className="auth-field">
                <span>First name</span>
                <input
                  value={form.firstName}
                  onChange={update('firstName')}
                  autoComplete="given-name"
                  placeholder="Anna"
                  required
                />
              </label>
              <label className="auth-field">
                <span>Last name</span>
                <input
                  value={form.lastName}
                  onChange={update('lastName')}
                  autoComplete="family-name"
                  placeholder="Kowalska"
                  required
                />
              </label>
            </div>

            <div className="auth-row">
              <label className="auth-field">
                <span>Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  autoComplete="email"
                  placeholder="anna@example.com"
                  required
                />
              </label>
              <label className="auth-field">
                <span>Phone</span>
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={update('phoneNumber')}
                  autoComplete="tel"
                  placeholder="+48 123 456 789"
                />
              </label>
            </div>

            <label className="auth-field">
              <span>Password</span>
              <div className="auth-password">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={update('password')}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M3 3l18 18M10.6 10.7a2.5 2.5 0 0 0 3.5 3.5M9.2 5.4A9.8 9.8 0 0 1 12 5c5.2 0 9.2 3.6 10.5 7-.5 1.4-1.5 2.9-2.9 4.1M6.1 6.3C4.4 7.5 3.2 9.1 2.5 12c1.3 3.4 5.3 7 10.5 7 1.3 0 2.5-.2 3.6-.6"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M2.5 12C3.8 8.6 7.8 5 13 5s9.2 3.6 10.5 7c-1.3 3.4-5.3 7-10.5 7S3.8 15.4 2.5 12Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="13"
                        cy="12"
                        r="2.6"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
              style={{ color: '#2A2A28', backgroundColor: '#8FAD9C', fontWeight: 600 }}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <footer className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
            <p className="auth-links">
              <Link to="/">Home</Link>
              <span aria-hidden>•</span>
              <Link to="/pricing">Pricing</Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}
