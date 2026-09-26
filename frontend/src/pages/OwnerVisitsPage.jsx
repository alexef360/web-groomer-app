import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/api'
import { IconCalendar, IconPaw } from '../components/AppIcons'

const SERVICE_TYPES = ['BATH', 'CUT', 'FULL_GROOMING']
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function formatSlot(slot) {
  return String(slot || '')
    .replace('SLOT_', '')
    .replace('_', ':')
}

function formatService(type) {
  return String(type || '')
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function statusLabel(status) {
  return String(status || '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatVisitDate(dateStr, timeSlot) {
  if (!dateStr) return '—'
  const d = new Date(`${dateStr}T12:00:00`)
  const day = d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return `${day}, ${formatSlot(timeSlot)}`
}

function toIsoDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function addMonths(d, n) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1)
}

function monthLabel(d) {
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function buildMonthCells(monthDate) {
  const first = startOfMonth(monthDate)
  const startWeekday = (first.getDay() + 6) % 7 // Monday=0
  const daysInMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0,
  ).getDate()
  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day))
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export default function OwnerVisitsPage() {
  const [visits, setVisits] = useState([])
  const [pets, setPets] = useState([])
  const [groomers, setGroomers] = useState([])
  const [availability, setAvailability] = useState([])
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()))
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [form, setForm] = useState({
    date: '',
    timeSlot: '',
    groomerId: '',
    petId: '',
    serviceType: 'BATH',
    ownerExpectations: '',
  })

  useEffect(() => {
    let cancelled = false

    async function loadAll() {
      try {
        const [v, p, g] = await Promise.all([
          api('/api/me/visits'),
          api('/api/me/pets'),
          api('/api/groomers'),
        ])
        if (cancelled) return
        setVisits(v)
        setPets(p)
        setGroomers(g)
        setForm((prev) => ({
          ...prev,
          petId: prev.petId || (p[0] ? String(p[0].id) : ''),
        }))
        setError('')
      } catch (err) {
        if (!cancelled) setError(err.message)
      }
    }

    void loadAll()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!form.groomerId) {
      setAvailability([])
      return
    }

    let cancelled = false
    const from = toIsoDate(startOfMonth(monthCursor))
    const toDate = new Date(
      monthCursor.getFullYear(),
      monthCursor.getMonth() + 1,
      0,
    )
    const to = toIsoDate(toDate)

    async function loadAvailability() {
      setLoadingSlots(true)
      try {
        const data = await api(
          `/api/me/visits/availability?groomerId=${form.groomerId}&from=${from}&to=${to}`,
        )
        if (!cancelled) {
          setAvailability(Array.isArray(data) ? data : [])
          setError('')
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoadingSlots(false)
      }
    }

    void loadAvailability()
    return () => {
      cancelled = true
    }
  }, [form.groomerId, monthCursor])

  const availabilityByDate = useMemo(() => {
    const map = new Map()
    for (const day of availability) {
      map.set(day.date, day)
    }
    return map
  }, [availability])

  const selectedDay = form.date ? availabilityByDate.get(form.date) : null
  const monthCells = useMemo(() => buildMonthCells(monthCursor), [monthCursor])

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value })
  }

  function selectGroomer(id) {
    setForm((prev) => ({
      ...prev,
      groomerId: String(id),
      date: '',
      timeSlot: '',
    }))
    setMessage('')
  }

  function selectDay(iso) {
    const day = availabilityByDate.get(iso)
    if (!day || !day.open || day.availableCount === 0) return
    setForm((prev) => ({
      ...prev,
      date: iso,
      timeSlot: '',
    }))
  }

  function selectSlot(slot) {
    setForm((prev) => ({ ...prev, timeSlot: slot }))
  }

  async function refresh() {
    const [v, p, g] = await Promise.all([
      api('/api/me/visits'),
      api('/api/me/pets'),
      api('/api/groomers'),
    ])
    setVisits(v)
    setPets(p)
    setGroomers(g)
    setForm((prev) => ({
      ...prev,
      petId: prev.petId || (p[0] ? String(p[0].id) : ''),
    }))
    if (form.groomerId) {
      const from = toIsoDate(startOfMonth(monthCursor))
      const toDate = new Date(
        monthCursor.getFullYear(),
        monthCursor.getMonth() + 1,
        0,
      )
      const data = await api(
        `/api/me/visits/availability?groomerId=${form.groomerId}&from=${from}&to=${toIsoDate(toDate)}`,
      )
      setAvailability(Array.isArray(data) ? data : [])
    }
  }

  async function handleBook(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!form.groomerId || !form.date || !form.timeSlot) {
      setError('Choose a groomer, a date, and an available time.')
      return
    }
    try {
      await api('/api/me/visits', {
        method: 'POST',
        body: {
          date: form.date,
          timeSlot: form.timeSlot,
          groomerId: Number(form.groomerId),
          petId: Number(form.petId),
          serviceType: form.serviceType,
          ownerExpectations: form.ownerExpectations || null,
        },
      })
      setForm((prev) => ({
        ...prev,
        date: '',
        timeSlot: '',
        ownerExpectations: '',
      }))
      setMessage('Visit booked')
      await refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleCancel(id) {
    if (!window.confirm('Cancel this visit?')) return
    setError('')
    setMessage('')
    try {
      await api(`/api/me/visits/${id}/cancel`, { method: 'POST' })
      setMessage('Visit cancelled')
      await refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  function startReschedule(visit) {
    setForm({
      date: '',
      timeSlot: '',
      groomerId: visit.groomerId ? String(visit.groomerId) : '',
      petId: visit.petId ? String(visit.petId) : form.petId,
      serviceType: visit.serviceType || 'BATH',
      ownerExpectations: visit.ownerExpectations || '',
    })
    if (visit.date) {
      setMonthCursor(startOfMonth(new Date(`${visit.date}T12:00:00`)))
    }
    setMessage('Pick a new date and time for this groomer, then book.')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const sortedVisits = [...visits].sort((a, b) => {
    const da = `${a.date} ${formatSlot(a.timeSlot)}`
    const db = `${b.date} ${formatSlot(b.timeSlot)}`
    return db.localeCompare(da)
  })

  const selectedGroomer = groomers.find((g) => String(g.id) === form.groomerId)
  const canBook =
    pets.length > 0 &&
    groomers.length > 0 &&
    form.petId &&
    form.groomerId &&
    form.date &&
    form.timeSlot

  return (
    <div className="as-page">
      <header className="as-page-head">
        <p className="as-kicker">Visits</p>
        <h1>My visits</h1>
        <p className="as-lead">Book a calm appointment for your dog.</p>
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

      <div className="visits-layout">
        <h2 className="visits-col-title">Book a visit</h2>
        <h2 className="visits-col-title">Your appointments</h2>

        <section className="visits-form-block" aria-labelledby="visits-book-heading">
          <h2 id="visits-book-heading" className="visually-hidden">
            Book a visit
          </h2>

          {pets.length === 0 && (
            <p className="as-muted">
              <Link className="as-text-link" to="/pets">
                Add a pet
              </Link>{' '}
              first.
            </p>
          )}
          {groomers.length === 0 && (
            <p className="as-muted">No groomers yet — ask the salon to create one.</p>
          )}

          <form className="as-form pets-form visits-form" onSubmit={handleBook}>
            <div className="as-form-row">
              <label>
                Select pet
                <select value={form.petId} onChange={update('petId')} required>
                  <option value="">Select pet</option>
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Service
                <select value={form.serviceType} onChange={update('serviceType')}>
                  {SERVICE_TYPES.map((s) => (
                    <option key={s} value={s}>
                      {formatService(s)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="book-step">
              <p className="book-step-label">1. Choose a groomer</p>
              <div className="groomer-picks" role="listbox" aria-label="Groomers">
                {groomers.map((g) => {
                  const active = String(g.id) === form.groomerId
                  return (
                    <button
                      key={g.id}
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={`groomer-pick${active ? ' is-active' : ''}`}
                      onClick={() => selectGroomer(g.id)}
                    >
                      <span className="groomer-pick-avatar" aria-hidden>
                        {String(g.displayName || '?')
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                      <span>{g.displayName}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {form.groomerId && (
              <div className="book-step">
                <p className="book-step-label">
                  2. Pick a day
                  {selectedGroomer ? ` · ${selectedGroomer.displayName}` : ''}
                </p>

                <div className="book-calendar">
                  <div className="book-cal-nav">
                    <button
                      type="button"
                      className="pet-action"
                      onClick={() => setMonthCursor((m) => addMonths(m, -1))}
                      aria-label="Previous month"
                    >
                      ←
                    </button>
                    <strong>{monthLabel(monthCursor)}</strong>
                    <button
                      type="button"
                      className="pet-action"
                      onClick={() => setMonthCursor((m) => addMonths(m, 1))}
                      aria-label="Next month"
                    >
                      →
                    </button>
                  </div>

                  <div className="book-cal-weekdays">
                    {WEEKDAYS.map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </div>

                  <div className="book-cal-grid">
                    {monthCells.map((cell, idx) => {
                      if (!cell) {
                        return <span key={`e-${idx}`} className="book-cal-empty" />
                      }
                      const iso = toIsoDate(cell)
                      const day = availabilityByDate.get(iso)
                      const hasSlots = Boolean(day?.open && day.availableCount > 0)
                      const isSelected = form.date === iso
                      const isToday = iso === toIsoDate(new Date())
                      return (
                        <button
                          key={iso}
                          type="button"
                          className={[
                            'book-cal-day',
                            hasSlots ? 'is-available' : 'is-blocked',
                            isSelected ? 'is-selected' : '',
                            isToday ? 'is-today' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          disabled={!hasSlots || loadingSlots}
                          onClick={() => selectDay(iso)}
                        >
                          {cell.getDate()}
                        </button>
                      )
                    })}
                  </div>

                  {loadingSlots && (
                    <p className="as-muted book-cal-status">Loading availability…</p>
                  )}
                </div>
              </div>
            )}

            {form.groomerId && form.date && (
              <div className="book-step">
                <p className="book-step-label">3. Available times</p>
                <div className="book-slots">
                  {(selectedDay?.slots || []).map((slot) => (
                    <button
                      key={slot.timeSlot}
                      type="button"
                      className={`book-slot${form.timeSlot === slot.timeSlot ? ' is-selected' : ''}`}
                      disabled={!slot.available}
                      onClick={() => selectSlot(slot.timeSlot)}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
                {selectedDay && selectedDay.availableCount === 0 && (
                  <p className="as-muted">No free times on this day.</p>
                )}
              </div>
            )}

            <label>
              Expectations / special notes
              <textarea
                rows={3}
                value={form.ownerExpectations}
                onChange={update('ownerExpectations')}
                placeholder="Sensitive to loud dryers…"
              />
            </label>

            <div className="pets-form-actions">
              <button
                className="as-btn visits-book-btn"
                type="submit"
                disabled={!canBook}
              >
                Book visit now
              </button>
            </div>
            {!form.timeSlot && form.groomerId && (
              <p className="as-muted book-cta-hint">
                Select an available time to enable booking.
              </p>
            )}
          </form>
        </section>

        <section className="visits-list-block" aria-labelledby="visits-list-heading">
          <h2 id="visits-list-heading" className="visually-hidden">
            Your appointments
          </h2>
          {sortedVisits.length === 0 ? (
            <div className="visits-empty">
              <span className="visits-empty-icon" aria-hidden>
                <IconCalendar />
              </span>
              <p>No appointments yet.</p>
              <p className="visits-empty-hint">
                Your booked appointments will appear here.
              </p>
            </div>
          ) : (
            <ul className="visit-cards">
              {sortedVisits.map((v) => (
                <li key={v.id} className="visit-card">
                  <span className="visit-card-avatar" aria-hidden>
                    <IconPaw />
                  </span>
                  <div className="visit-card-body">
                    <strong>
                      {v.petName} — {formatService(v.serviceType)}
                    </strong>
                    <p className="visit-card-meta">Groomer: {v.groomerName}</p>
                    <p className="visit-card-meta">
                      <IconCalendar className="visit-meta-icon" />
                      {formatVisitDate(v.date, v.timeSlot)}
                    </p>
                    {v.ownerExpectations && (
                      <p className="visit-card-notes">“{v.ownerExpectations}”</p>
                    )}
                    <div className="visit-card-footer">
                      <span
                        className={`as-badge as-badge-${String(v.status).toLowerCase()}`}
                      >
                        {statusLabel(v.status)}
                      </span>
                      {v.status === 'PLANNED' && (
                        <div className="visit-card-actions">
                          <button
                            type="button"
                            className="pet-action"
                            onClick={() => startReschedule(v)}
                          >
                            Reschedule
                          </button>
                          <button
                            type="button"
                            className="pet-action pet-action-danger"
                            onClick={() => handleCancel(v.id)}
                          >
                            Cancel visit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
