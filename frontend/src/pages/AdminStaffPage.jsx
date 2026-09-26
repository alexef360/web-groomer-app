import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { api } from '../api/api'

function getUser() {
  const raw = localStorage.getItem('user')
  return raw ? JSON.parse(raw) : null
}

export default function AdminStaffPage() {
  const user = getUser()
  const [form, setForm] = useState({
    login: '',
    password: '',
    role: 'GROOMER',
    displayName: '',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/app" replace />
  }

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      const data = await api('/api/admin/users', {
        method: 'POST',
        body: {
          login: form.login,
          password: form.password,
          role: form.role,
          displayName: form.role === 'GROOMER' ? form.displayName : null,
        },
      })
      setMessage(`Created: ${data.login} (${data.role})`)
      setForm({ login: '', password: '', role: 'GROOMER', displayName: '' })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="as-page">
      <header className="as-page-head">
        <p className="as-kicker">Team</p>
        <h1>Create staff</h1>
        <p className="as-lead">Add a groomer or reception account for the salon.</p>
      </header>

      {error && (
        <p className="as-flash as-flash-error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="as-flash as-flash-ok" role="status">
          {message}
        </p>
      )}

      <section className="as-panel as-panel-form">
        <form className="as-form" onSubmit={handleSubmit}>
          <label>
            Login
            <input value={form.login} onChange={update('login')} required />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={update('password')}
              required
            />
          </label>
          <label>
            Role
            <select value={form.role} onChange={update('role')}>
              <option value="GROOMER">Groomer</option>
              <option value="RECEPTION">Reception</option>
            </select>
          </label>
          {form.role === 'GROOMER' && (
            <label>
              Display name
              <input
                value={form.displayName}
                onChange={update('displayName')}
                required
              />
            </label>
          )}
          <button className="as-btn" type="submit">
            Create account
          </button>
        </form>
      </section>
    </div>
  )
}
