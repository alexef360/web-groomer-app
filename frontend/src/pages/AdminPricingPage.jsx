import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { api } from '../api/api'

function getUser() {
  const raw = localStorage.getItem('user')
  return raw ? JSON.parse(raw) : null
}

const emptyForm = {
  name: '',
  description: '',
  indicativePriceFrom: '',
  indicativePriceTo: '',
  active: true,
}

export default function AdminPricingPage() {
  const user = getUser()
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return

    let cancelled = false

    async function load() {
      try {
        const data = await api('/api/admin/pricing')
        if (!cancelled) {
          setItems(data)
          setError('')
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [user?.role])

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/app" replace />
  }

  function update(field) {
    return (e) => {
      const value =
        e.target.type === 'checkbox' ? e.target.checked : e.target.value
      setForm({ ...form, [field]: value })
    }
  }

  async function refresh() {
    const data = await api('/api/admin/pricing')
    setItems(data)
  }

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      await api('/api/admin/pricing', {
        method: 'POST',
        body: {
          name: form.name,
          description: form.description || null,
          indicativePriceFrom: Number(form.indicativePriceFrom),
          indicativePriceTo:
            form.indicativePriceTo === ''
              ? null
              : Number(form.indicativePriceTo),
          active: form.active,
        },
      })
      setForm(emptyForm)
      setMessage('Item created')
      await refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  async function toggleActive(item) {
    setError('')
    setMessage('')
    try {
      await api(`/api/admin/pricing/${item.id}`, {
        method: 'PUT',
        body: {
          name: item.name,
          description: item.description,
          indicativePriceFrom: item.indicativePriceFrom,
          indicativePriceTo: item.indicativePriceTo,
          active: !item.active,
        },
      })
      setMessage(item.active ? 'Deactivated' : 'Activated')
      await refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="as-page">
      <header className="as-page-head">
        <p className="as-kicker">Pricing</p>
        <h1>Manage pricing</h1>
        <p className="as-lead">
          Edit indicative ranges shown on the public price list.
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

      <section className="as-panel as-panel-form">
        <h2>Add item</h2>
        <form className="as-form" onSubmit={handleCreate}>
          <label>
            Name
            <input value={form.name} onChange={update('name')} required />
          </label>
          <label>
            Description
            <input value={form.description} onChange={update('description')} />
          </label>
          <div className="as-form-row">
            <label>
              Price from (PLN)
              <input
                type="number"
                step="0.01"
                value={form.indicativePriceFrom}
                onChange={update('indicativePriceFrom')}
                required
              />
            </label>
            <label>
              Price to (PLN)
              <input
                type="number"
                step="0.01"
                value={form.indicativePriceTo}
                onChange={update('indicativePriceTo')}
              />
            </label>
          </div>
          <label className="as-check">
            <input
              type="checkbox"
              checked={form.active}
              onChange={update('active')}
            />
            Active on public list
          </label>
          <button className="as-btn" type="submit">
            Add item
          </button>
        </form>
      </section>

      <section className="as-panel">
        <div className="as-panel-head">
          <h2>All items</h2>
        </div>
        {items.length === 0 ? (
          <p className="as-muted">No items yet.</p>
        ) : (
          <ul className="as-list">
            {items.map((item) => (
              <li key={item.id} className="as-list-item">
                <div>
                  <strong>{item.name}</strong>
                  {item.description && <p>{item.description}</p>}
                  <p className="as-muted">
                    {item.indicativePriceFrom}
                    {item.indicativePriceTo != null
                      ? ` – ${item.indicativePriceTo}`
                      : ''}{' '}
                    PLN · {item.active ? 'active' : 'inactive'}
                  </p>
                </div>
                <button
                  type="button"
                  className="as-btn as-btn-ghost"
                  onClick={() => toggleActive(item)}
                >
                  {item.active ? 'Deactivate' : 'Activate'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
