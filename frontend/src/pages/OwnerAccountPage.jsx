import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { api, clearAuth, setAuth, patchStoredUser } from '../api/api'

function getUser() {
  const raw = localStorage.getItem('user')
  return raw ? JSON.parse(raw) : null
}

export default function OwnerAccountPage() {
  const navigate = useNavigate()
  const user = getUser()
  const [account, setAccount] = useState(null)
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
  })
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [deletePassword, setDeletePassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== 'PET_OWNER') return

    let cancelled = false

    async function load() {
      try {
        const data = await api('/api/me/account')
        if (cancelled) return
        setAccount(data)
        setProfile({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phoneNumber: data.phoneNumber || '',
          email: data.email || data.login || '',
        })
        setError('')
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [user?.role])

  if (!user || user.role !== 'PET_OWNER') {
    return <Navigate to="/app" replace />
  }

  function updateProfile(field) {
    return (e) => setProfile({ ...profile, [field]: e.target.value })
  }

  function updatePassword(field) {
    return (e) => setPasswords({ ...passwords, [field]: e.target.value })
  }

  async function saveProfile(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    const email = profile.email.trim().toLowerCase()
    try {
      const data = await api('/api/me/account', {
        method: 'PUT',
        body: {
          login: email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          phoneNumber: profile.phoneNumber || null,
          email,
        },
      })
      setAccount(data.account)
      setProfile({
        firstName: data.account.firstName || '',
        lastName: data.account.lastName || '',
        phoneNumber: data.account.phoneNumber || '',
        email: data.account.email || data.account.login || '',
      })
      if (data.token) {
        setAuth({
          id: data.account.userId,
          login: data.account.login,
          role: data.account.role,
          displayName: data.account.firstName,
          token: data.token,
        })
      } else {
        patchStoredUser({
          login: data.account.login,
          displayName: data.account.firstName,
        })
      }
      setMessage('Profile saved')
    } catch (err) {
      setError(err.message)
    }
  }

  async function savePassword(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match')
      return
    }
    try {
      await api('/api/me/account/password', {
        method: 'PUT',
        body: {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        },
      })
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setMessage('Password updated')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(e) {
    e.preventDefault()
    if (
      !window.confirm(
        'Delete your account permanently? Pets and visits will be removed.',
      )
    ) {
      return
    }
    setError('')
    setMessage('')
    try {
      await api('/api/me/account', {
        method: 'DELETE',
        body: { password: deletePassword },
      })
      clearAuth()
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="as-page">
      <header className="as-page-head">
        <p className="as-kicker">Account</p>
        <h1>Account settings</h1>
        <p className="as-lead">
          Update your profile, change password, or close your account.
        </p>
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

      {loading ? (
        <p className="as-muted">Loading account…</p>
      ) : (
        <div className="account-layout">
          <section className="account-block">
            <div className="account-block-head">
              <h2>Profile</h2>
              {account?.role && (
                <span className="as-role account-role-badge">
                  {account.role.replace('_', ' ')}
                </span>
              )}
            </div>
            <form className="as-form pets-form" onSubmit={saveProfile}>
              <div className="as-form-row">
                <label>
                  First name
                  <input
                    value={profile.firstName}
                    onChange={updateProfile('firstName')}
                    required
                  />
                </label>
                <label>
                  Last name
                  <input
                    value={profile.lastName}
                    onChange={updateProfile('lastName')}
                    required
                  />
                </label>
              </div>
              <label>
                Email
                <input
                  type="email"
                  value={profile.email}
                  onChange={updateProfile('email')}
                  required
                />
              </label>
              <label>
                Phone
                <input
                  value={profile.phoneNumber}
                  onChange={updateProfile('phoneNumber')}
                  placeholder="+48 …"
                />
              </label>
              <div className="pets-form-actions">
                <button className="as-btn account-cta" type="submit">
                  Save profile
                </button>
              </div>
            </form>
          </section>

          <section className="account-block">
            <h2>Password</h2>
            <form className="as-form pets-form" onSubmit={savePassword}>
              <label>
                Current password
                <input
                  type="password"
                  value={passwords.currentPassword}
                  onChange={updatePassword('currentPassword')}
                  required
                  autoComplete="current-password"
                />
              </label>
              <label>
                New password
                <input
                  type="password"
                  value={passwords.newPassword}
                  onChange={updatePassword('newPassword')}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </label>
              <label>
                Confirm new password
                <input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={updatePassword('confirmPassword')}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </label>
              <div className="pets-form-actions">
                <button className="as-btn account-cta" type="submit">
                  Update password
                </button>
              </div>
            </form>
          </section>

          <section className="account-block account-danger">
            <p className="account-danger-kicker">Danger zone</p>
            <h2>Delete account</h2>
            <p className="as-muted">
              This permanently removes your profile, pets and visit history.
              This action cannot be undone.
            </p>
            <form className="as-form pets-form" onSubmit={handleDelete}>
              <label>
                Confirm with password
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </label>
              <div className="pets-form-actions">
                <button className="as-btn as-btn-danger account-cta-danger" type="submit">
                  Delete my account
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
