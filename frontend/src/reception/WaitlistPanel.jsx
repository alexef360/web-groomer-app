import { useEffect, useState } from 'react'
import { api } from '../api/api'
import { SERVICE_TYPES, formatService } from './rxUtils'

export default function WaitlistPanel({ openBookingForCustomer }) {
  const [entries, setEntries] = useState([])
  const [error, setError] = useState('')
  const [customers, setCustomers] = useState([])
  const [groomers, setGroomers] = useState([])
  const [form, setForm] = useState({
    customerId: '',
    preferredGroomerId: '',
    preferredService: 'FULL_GROOMING',
    notes: '',
    priority: 0,
  })

  async function load() {
    try {
      const data = await api('/api/waitlist')
      setEntries(Array.isArray(data) ? data : [])
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    void load()
    void api('/api/customers')
      .then((d) => setCustomers(Array.isArray(d) ? d : []))
      .catch(() => setCustomers([]))
    void api('/api/groomers')
      .then((d) => setGroomers(Array.isArray(d) ? d : []))
      .catch(() => setGroomers([]))
  }, [])

  async function addEntry(e) {
    e.preventDefault()
    setError('')
    try {
      await api('/api/waitlist', {
        method: 'POST',
        body: {
          customerId: Number(form.customerId),
          preferredGroomerId: form.preferredGroomerId
            ? Number(form.preferredGroomerId)
            : null,
          preferredService: form.preferredService || null,
          notes: form.notes || null,
          priority: Number(form.priority) || 0,
          status: 'WAITING',
        },
      })
      setForm({
        customerId: '',
        preferredGroomerId: '',
        preferredService: 'FULL_GROOMING',
        notes: '',
        priority: 0,
      })
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function markContacted(id) {
    try {
      await api(`/api/waitlist/${id}`, {
        method: 'PATCH',
        body: { status: 'CONTACTED' },
      })
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function removeEntry(id) {
    try {
      await api(`/api/waitlist/${id}`, { method: 'DELETE' })
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  const active = entries.filter((e) => e.status === 'WAITING' || e.status === 'CONTACTED')

  return (
    <section className="rx-waitlist">
      <div className="as-panel-head">
        <h2>Waitlist</h2>
      </div>

      {error && (
        <p className="as-flash as-flash-error" role="alert">
          {error}
        </p>
      )}

      <form className="rx-waitlist-form" onSubmit={addEntry}>
        <label className="as-field">
          Client
          <select
            required
            value={form.customerId}
            onChange={(e) => setForm((f) => ({ ...f, customerId: e.target.value }))}
          >
            <option value="">Choose…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </select>
        </label>
        <label className="as-field">
          Preferred groomer
          <select
            value={form.preferredGroomerId}
            onChange={(e) =>
              setForm((f) => ({ ...f, preferredGroomerId: e.target.value }))
            }
          >
            <option value="">Any</option>
            {groomers.map((g) => (
              <option key={g.id} value={g.id}>
                {g.displayName}
              </option>
            ))}
          </select>
        </label>
        <label className="as-field">
          Service
          <select
            value={form.preferredService}
            onChange={(e) =>
              setForm((f) => ({ ...f, preferredService: e.target.value }))
            }
          >
            {SERVICE_TYPES.map((s) => (
              <option key={s} value={s}>
                {formatService(s)}
              </option>
            ))}
          </select>
        </label>
        <label className="as-field">
          Priority
          <input
            type="number"
            min={0}
            max={10}
            value={form.priority}
            onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
          />
        </label>
        <label className="as-field rx-span-2">
          Notes
          <input
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Wants ASAP on weekdays…"
          />
        </label>
        <button type="submit" className="as-btn">
          Add to waitlist
        </button>
      </form>

      {active.length === 0 ? (
        <p className="as-muted">No one waiting right now.</p>
      ) : (
        <ul className="rx-waitlist-list">
          {active.map((e) => (
            <li key={e.id} className="rx-waitlist-item">
              <div>
                <strong>{e.customerName}</strong>
                <p className="as-muted">
                  {e.customerPhone || 'No phone'}
                  {e.preferredGroomerName ? ` · ${e.preferredGroomerName}` : ''}
                  {e.preferredService ? ` · ${formatService(e.preferredService)}` : ''}
                  {e.notes ? ` · ${e.notes}` : ''}
                </p>
                <span className="rx-priority">Priority {e.priority}</span>
              </div>
              <div className="rx-waitlist-actions">
                <button
                  type="button"
                  className="as-btn as-btn-ghost"
                  onClick={() => openBookingForCustomer?.(e)}
                >
                  Book
                </button>
                {e.status === 'WAITING' && (
                  <button
                    type="button"
                    className="as-btn as-btn-ghost"
                    onClick={() => markContacted(e.id)}
                  >
                    Mark as contacted
                  </button>
                )}
                <button
                  type="button"
                  className="as-btn as-btn-ghost"
                  onClick={() => removeEntry(e.id)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
