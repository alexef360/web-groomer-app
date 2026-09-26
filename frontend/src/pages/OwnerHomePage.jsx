import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { api } from '../api/api'
import {
  IconCalendar,
  IconPaw,
  IconPlus,
  IconTag,
  IconUser,
  IconUsers,
} from '../components/AppIcons'

function getUser() {
  const raw = localStorage.getItem('user')
  return raw ? JSON.parse(raw) : null
}

function todayIso() {
  return toIsoDate(new Date())
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

function formatDayHeading(iso) {
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  })
}

function buildMonthCells(monthDate) {
  const first = startOfMonth(monthDate)
  const startWeekday = (first.getDay() + 6) % 7
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
  })
  return `${day}, ${formatSlot(timeSlot)}`
}

const STAFF_ROLES = ['ADMIN', 'RECEPTION', 'GROOMER']
const UPCOMING = new Set(['PLANNED', 'IN_PROGRESS'])
const ACTIVE = new Set(['PLANNED', 'IN_PROGRESS', 'READY', 'COMPLETED'])
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function OwnerHomePage() {
  const user = getUser()
  const role = user?.role
  const isOwner = role === 'PET_OWNER'
  const isStaff = STAFF_ROLES.includes(role)
  const isAdmin = role === 'ADMIN'
  const isReception = role === 'RECEPTION'
  const [visits, setVisits] = useState([])
  const [monthVisits, setMonthVisits] = useState([])
  const [selectedDate, setSelectedDate] = useState(todayIso)
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(isStaff || isOwner)
  const [loadingMonth, setLoadingMonth] = useState(false)

  useEffect(() => {
    if (!isOwner) return

    let cancelled = false

    async function load() {
      try {
        const data = await api('/api/me/visits')
        if (!cancelled) {
          setVisits(Array.isArray(data) ? data : [])
          setError('')
        }
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
  }, [isOwner])

  useEffect(() => {
    if (!isStaff) return

    let cancelled = false
    const from = toIsoDate(startOfMonth(monthCursor))
    const to = toIsoDate(
      new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0),
    )

    async function loadMonth() {
      setLoadingMonth(true)
      try {
        const data = await api(`/api/visits?from=${from}&to=${to}`)
        if (!cancelled) {
          setMonthVisits(Array.isArray(data) ? data : [])
          setError('')
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) {
          setLoadingMonth(false)
          setLoading(false)
        }
      }
    }

    void loadMonth()
    return () => {
      cancelled = true
    }
  }, [isStaff, monthCursor])

  const dayVisits = useMemo(() => {
    if (!isStaff) return []
    return monthVisits
      .filter((v) => v.date === selectedDate && v.status !== 'CANCELLED')
      .sort((a, b) => formatSlot(a.timeSlot).localeCompare(formatSlot(b.timeSlot)))
  }, [monthVisits, selectedDate, isStaff])

  const countsByDate = useMemo(() => {
    const map = new Map()
    for (const v of monthVisits) {
      if (!ACTIVE.has(v.status)) continue
      map.set(v.date, (map.get(v.date) || 0) + 1)
    }
    return map
  }, [monthVisits])

  const planned = dayVisits.filter((v) => v.status === 'PLANNED').length
  const inProgress = dayVisits.filter((v) => v.status === 'IN_PROGRESS').length
  const completed = dayVisits.filter((v) => v.status === 'COMPLETED').length

  const upcoming = useMemo(() => {
    if (!isOwner) return []
    return [...visits]
      .filter((v) => UPCOMING.has(v.status))
      .sort((a, b) => {
        const da = `${a.date} ${formatSlot(a.timeSlot)}`
        const db = `${b.date} ${formatSlot(b.timeSlot)}`
        return da.localeCompare(db)
      })
      .slice(0, 3)
  }, [visits, isOwner])

  const monthCells = useMemo(() => buildMonthCells(monthCursor), [monthCursor])
  const isSelectedToday = selectedDate === todayIso()

  if (isReception || isAdmin) {
    return <Navigate to="/reception" replace />
  }

  return (
    <div className="as-page">
      <header className="as-page-head">
        <p className="as-kicker">Overview</p>
        <h1>Salon dashboard</h1>
        <p className="as-lead">
          {isAdmin
            ? 'Manage schedule, staff and pricing from one place.'
            : isStaff
              ? 'Your day at a glance.'
              : 'Book visits and keep your pets’ profiles up to date.'}
        </p>
      </header>

      {isOwner && (
        <>
          <div className="as-cards">
            <Link className="as-card-link" to="/pets">
              <span className="as-card-icon" aria-hidden>
                <IconPaw />
              </span>
              <strong>My pets</strong>
              <p>Add and update pet profiles</p>
            </Link>

            <div className="as-card-link as-card-static">
              <span className="as-card-icon" aria-hidden>
                <IconCalendar />
              </span>
              <strong>My visits</strong>
              <p>Book and review appointments</p>
              <Link className="as-btn as-card-cta" to="/visits">
                <IconPlus />
                Book a new visit
              </Link>
            </div>

            <Link className="as-card-link" to="/account">
              <span className="as-card-icon" aria-hidden>
                <IconUser />
              </span>
              <strong>Account</strong>
              <p>Edit profile or password, or delete your account</p>
            </Link>
          </div>

          <section className="as-panel">
            <div className="as-panel-head">
              <h2>Upcoming appointments</h2>
              <Link className="as-text-link" to="/visits">
                View all →
              </Link>
            </div>

            {error && (
              <p className="as-flash as-flash-error" role="alert">
                {error}
              </p>
            )}

            {loading ? (
              <p className="as-muted">Loading appointments…</p>
            ) : upcoming.length === 0 ? (
              <p className="as-muted">
                No upcoming visits yet.{' '}
                <Link className="as-text-link" to="/visits">
                  Book your first appointment
                </Link>
              </p>
            ) : (
              <ul className="as-upcoming">
                {upcoming.map((v) => (
                  <li key={v.id} className="as-upcoming-item">
                    <span className="as-upcoming-icon" aria-hidden>
                      <IconPaw />
                    </span>
                    <div>
                      <strong>
                        {v.petName} — {formatService(v.serviceType)}
                      </strong>
                      <p>
                        {formatVisitDate(v.date, v.timeSlot)}
                        {v.groomerName ? ` · ${v.groomerName}` : ''}
                      </p>
                    </div>
                    <span
                      className={`as-badge as-badge-${String(v.status).toLowerCase()}`}
                    >
                      {statusLabel(v.status)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {isStaff && (
        <>
          <div className="as-stats as-stats--flat">
            <div className="as-stat">
              <p className="as-stat-label">
                {isSelectedToday ? 'Today' : 'Selected'}
              </p>
              <p className="as-stat-value">
                {loadingMonth ? '—' : dayVisits.length}
              </p>
              <p className="as-stat-meta">visits</p>
            </div>
            <div className="as-stat">
              <p className="as-stat-label">Planned</p>
              <p className="as-stat-value">{loadingMonth ? '—' : planned}</p>
              <p className="as-stat-meta">waiting</p>
            </div>
            <div className="as-stat">
              <p className="as-stat-label">In progress</p>
              <p className="as-stat-value">{loadingMonth ? '—' : inProgress}</p>
              <p className="as-stat-meta">now</p>
            </div>
            <div className="as-stat">
              <p className="as-stat-label">Done</p>
              <p className="as-stat-value">{loadingMonth ? '—' : completed}</p>
              <p className="as-stat-meta">completed</p>
            </div>
          </div>

          <div className="overview-schedule">
            <section className="overview-cal-block">
              <h2>Schedule calendar</h2>
              <div className="book-calendar overview-calendar">
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
                    const count = countsByDate.get(iso) || 0
                    const hasVisits = count > 0
                    const isSelected = selectedDate === iso
                    const isToday = iso === todayIso()
                    return (
                      <button
                        key={iso}
                        type="button"
                        className={[
                          'book-cal-day',
                          'overview-cal-day',
                          hasVisits ? 'has-visits' : '',
                          isSelected ? 'is-selected' : '',
                          isToday ? 'is-today' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => setSelectedDate(iso)}
                      >
                        <span>{cell.getDate()}</span>
                        {hasVisits && (
                          <span className="overview-cal-dot" aria-hidden />
                        )}
                      </button>
                    )
                  })}
                </div>

                {loadingMonth && (
                  <p className="as-muted book-cal-status">Loading calendar…</p>
                )}
                <p className="overview-cal-legend as-muted">
                  Sage days / dots mark booked visits. Click a day to preview.
                </p>
              </div>
            </section>

            <section className="as-panel as-panel--flat overview-day-list">
              <div className="as-panel-head">
                <h2>
                  {isSelectedToday
                    ? 'Today’s visits'
                    : `Visits · ${formatDayHeading(selectedDate)}`}
                </h2>
                <Link
                  className="as-text-link"
                  to={`/staff/visits?date=${selectedDate}`}
                >
                  Open day schedule →
                </Link>
              </div>

              {error && (
                <p className="as-flash as-flash-error" role="alert">
                  {error}
                </p>
              )}

              {loadingMonth ? (
                <p className="as-muted">Loading schedule…</p>
              ) : dayVisits.length === 0 ? (
                <p className="as-muted">No visits on this day.</p>
              ) : (
                <div className="as-table-wrap">
                  <table className="as-table as-table--flat">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Pet</th>
                        <th>Groomer</th>
                        <th>Service</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayVisits.map((v) => (
                        <tr key={v.id}>
                          <td>{formatSlot(v.timeSlot)}</td>
                          <td>{v.petName}</td>
                          <td>{v.groomerName}</td>
                          <td>{formatService(v.serviceType)}</td>
                          <td>
                            <span
                              className={`as-badge as-badge-${String(v.status).toLowerCase()}`}
                            >
                              {statusLabel(v.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          {isAdmin && (
            <div className="as-cards as-cards-admin">
              <Link className="as-card-link" to="/admin/staff">
                <span className="as-card-icon" aria-hidden>
                  <IconUsers />
                </span>
                <strong>Create staff</strong>
                <p>Add groomers and reception</p>
              </Link>
              <Link className="as-card-link" to="/admin/pricing">
                <span className="as-card-icon" aria-hidden>
                  <IconTag />
                </span>
                <strong>Manage pricing</strong>
                <p>Edit indicative price list</p>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
