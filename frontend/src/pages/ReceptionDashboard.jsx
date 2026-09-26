import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { api, getStoredUser } from '../api/api'
import QuickBookingModal from '../reception/QuickBookingModal'
import VisitDetailDrawer from '../reception/VisitDetailDrawer'
import TeamDayBoard from '../reception/TeamDayBoard'
import WaitlistPanel from '../reception/WaitlistPanel'
import PetNoteHint from '../reception/PetNoteHint'
import { IconSearch } from '../components/AppIcons'
import {
  addMonths,
  buildMonthCells,
  formatDayHeading,
  formatService,
  formatSlot,
  monthLabel,
  startOfMonth,
  statusLabel,
  todayIso,
  toIsoDate,
} from '../reception/rxUtils'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const RX_ROLES = ['RECEPTION', 'ADMIN']

// re-export helper used below
const ACTIVE = new Set(['PLANNED', 'IN_PROGRESS', 'READY', 'COMPLETED'])

export default function ReceptionDashboard() {
  const user = getStoredUser()
  const role = user?.role
  const allowed = Boolean(user && RX_ROLES.includes(role))

  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState(todayIso())
  const [monthVisits, setMonthVisits] = useState([])
  const [groomers, setGroomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [flash, setFlash] = useState('')
  const [view, setView] = useState('month')
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [bookOpen, setBookOpen] = useState(false)
  const [bookPrefill, setBookPrefill] = useState(null)
  const [detail, setDetail] = useState(null)

  async function loadMonth() {
    const from = toIsoDate(startOfMonth(monthCursor))
    const to = toIsoDate(
      new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0),
    )
    setLoading(true)
    try {
      const data = await api(`/api/visits?from=${from}&to=${to}`)
      setMonthVisits(Array.isArray(data) ? data : [])
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!allowed) return
    void loadMonth()
  }, [monthCursor, allowed])

  useEffect(() => {
    if (!allowed) return
    void api('/api/groomers')
      .then((d) => setGroomers(Array.isArray(d) ? d : []))
      .catch(() => setGroomers([]))
  }, [allowed])

  const dayVisits = useMemo(() => {
    const q = search.trim().toLowerCase()
    return monthVisits
      .filter((v) => v.date === selectedDate && v.status !== 'CANCELLED')
      .filter((v) => {
        if (!q) return true
        const hay = [
          v.petName,
          v.customerName,
          v.customerPhone,
          v.groomerName,
          v.serviceType,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return hay.includes(q)
      })
      .sort((a, b) => formatSlot(a.timeSlot).localeCompare(formatSlot(b.timeSlot)))
  }, [monthVisits, selectedDate, search])

  const searchSuggestions = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (q.length < 2) return []
    const seen = new Set()
    const out = []
    for (const v of monthVisits) {
      if (v.status === 'CANCELLED') continue
      const hay = [v.petName, v.customerName, v.customerPhone, v.petBreed, v.groomerName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!hay.includes(q)) continue
      const key = `${v.petId}-${v.customerId}-${v.date}-${v.timeSlot}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push(v)
      if (out.length >= 8) break
    }
    return out
  }, [monthVisits, search])

  const countsByDate = useMemo(() => {
    const map = new Map()
    for (const v of monthVisits) {
      if (!ACTIVE.has(v.status)) continue
      map.set(v.date, (map.get(v.date) || 0) + 1)
    }
    return map
  }, [monthVisits])

  if (!allowed) {
    return <Navigate to="/app" replace />
  }

  const planned = dayVisits.filter((v) => v.status === 'PLANNED').length
  const inProgress = dayVisits.filter((v) => v.status === 'IN_PROGRESS').length
  const ready = dayVisits.filter((v) => v.status === 'READY').length
  const completed = dayVisits.filter((v) => v.status === 'COMPLETED').length
  const isSelectedToday = selectedDate === todayIso()
  const monthCells = buildMonthCells(monthCursor)

  async function changeStatus(id, status) {
    setError('')
    try {
      await api(`/api/visits/${id}/status`, {
        method: 'PATCH',
        body: { status },
      })
      await loadMonth()
      setDetail((d) => (d?.id === id ? { ...d, status } : d))
      const flashes = {
        IN_PROGRESS: 'Checked in — dog on the table.',
        READY: 'Marked ready for pick-up.',
        COMPLETED: 'Checked out — visit completed.',
        CANCELLED: 'Visit cancelled.',
      }
      if (flashes[status]) setFlash(flashes[status])
      if (status === 'CANCELLED') {
        try {
          const suggestions = await api('/api/waitlist/suggestions')
          if (Array.isArray(suggestions) && suggestions.length) {
            setFlash(
              `Slot freed — call the waitlist: ${suggestions
                .slice(0, 3)
                .map((s) => s.customerName)
                .join(', ')}`,
            )
          }
        } catch {
          /* ignore */
        }
      }
    } catch (err) {
      const raw = String(err.message || '')
      if (raw.includes('visits_status_check') || raw.includes('constraint')) {
        setError('Could not update status. Please try again. If it keeps failing, contact support.')
      } else {
        setError(raw)
      }
    }
  }

  async function reschedule(id, payload) {
    setError('')
    try {
      await api(`/api/visits/${id}/reschedule`, {
        method: 'PATCH',
        body: payload,
      })
      setFlash('Visit rescheduled.')
      await loadMonth()
    } catch (err) {
      setError(err.message)
    }
  }

  function primaryAction(v) {
    if (v.status === 'PLANNED') {
      return (
        <button type="button" className="rx-row-btn" onClick={() => changeStatus(v.id, 'IN_PROGRESS')}>
          Check-in
        </button>
      )
    }
    if (v.status === 'IN_PROGRESS') {
      return (
        <button type="button" className="rx-row-btn" onClick={() => changeStatus(v.id, 'READY')}>
          Ready
        </button>
      )
    }
    if (v.status === 'READY') {
      return (
        <button type="button" className="rx-row-btn" onClick={() => changeStatus(v.id, 'COMPLETED')}>
          Check-out
        </button>
      )
    }
    return null
  }

  return (
    <div className="as-page rx-page">
      <header className="as-page-head">
        <p className="as-kicker">Reception</p>
        <h1>Salon overview & daily operations</h1>
        <p className="as-lead">Manage walk-ins, check-ins, and the floor schedule.</p>
      </header>

      <div className="as-stats as-stats--flat rx-stats">
        <div className="as-stat">
          <p className="as-stat-label">{isSelectedToday ? 'Today' : 'Selected'}</p>
          <p className="as-stat-value rx-kpi">{loading ? '—' : dayVisits.length}</p>
          <p className="as-stat-meta">visits</p>
        </div>
        <div className="as-stat">
          <p className="as-stat-label">Planned</p>
          <p className="as-stat-value rx-kpi">{loading ? '—' : planned}</p>
          <p className="as-stat-meta">waiting</p>
        </div>
        <div className="as-stat">
          <p className="as-stat-label">In progress</p>
          <p className="as-stat-value rx-kpi">{loading ? '—' : inProgress}</p>
          <p className="as-stat-meta">on the table</p>
        </div>
        <div className="as-stat">
          <p className="as-stat-label">Ready</p>
          <p className="as-stat-value rx-kpi">{loading ? '—' : ready}</p>
          <p className="as-stat-meta">pick-up</p>
        </div>
        <div className="as-stat">
          <p className="as-stat-label">Done</p>
          <p className="as-stat-value rx-kpi">{loading ? '—' : completed}</p>
          <p className="as-stat-meta">completed</p>
        </div>
      </div>

      <div className="rx-toolbar">
        <button
          type="button"
          className="as-btn"
          onClick={() => {
            setBookPrefill(null)
            setBookOpen(true)
          }}
        >
          + New booking
        </button>
        <div className="rx-search-wrap">
          <label className="rx-search">
            <span className="visually-hidden">Search client / pet</span>
            <IconSearch className="rx-search-icon" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setSearchOpen(true)
              }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
              placeholder="Search client / pet…"
              autoComplete="off"
            />
          </label>
          {searchOpen && search.trim().length >= 2 && (
            <ul className="rx-suggest" role="listbox">
              {searchSuggestions.length === 0 ? (
                <li className="rx-suggest-empty">No matches this month</li>
              ) : (
                searchSuggestions.map((v) => (
                  <li key={v.id}>
                    <button
                      type="button"
                      className="rx-suggest-item"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSelectedDate(v.date)
                        setSearch(`${v.petName || ''} ${v.customerName || ''}`.trim())
                        setSearchOpen(false)
                        setView('month')
                        setDetail(v)
                      }}
                    >
                      <strong>
                        Pet · {v.petName || '—'}
                        {v.petBreed ? ` (${v.petBreed})` : ''}
                      </strong>
                      <span>Owner · {v.customerName || '—'}</span>
                      <em>
                        {v.date} · {formatSlot(v.timeSlot)}
                      </em>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
        <div className="rx-view-toggle" role="group" aria-label="View mode">
          <button
            type="button"
            className={view === 'month' ? 'is-active' : ''}
            onClick={() => setView('month')}
          >
            Month
          </button>
          <button
            type="button"
            className={view === 'team' ? 'is-active' : ''}
            onClick={() => setView('team')}
          >
            Team day
          </button>
          <button
            type="button"
            className={view === 'waitlist' ? 'is-active' : ''}
            onClick={() => setView('waitlist')}
          >
            Waitlist
          </button>
        </div>
      </div>

      {error && (
        <p className="as-flash as-flash-error" role="alert">
          {error}
        </p>
      )}
      {flash && (
        <p className="as-flash as-flash-ok" role="status">
          {flash}
          <button type="button" className="as-text-link" onClick={() => setFlash('')}>
            Dismiss
          </button>
        </p>
      )}

      {view === 'waitlist' && (
        <WaitlistPanel
          openBookingForCustomer={(entry) => {
            setBookPrefill({
              id: entry.customerId,
              firstName: (entry.customerName || '').split(' ')[0] || '',
              lastName: (entry.customerName || '').split(' ').slice(1).join(' '),
              phoneNumber: entry.customerPhone || '',
            })
            setBookOpen(true)
          }}
        />
      )}

      {view === 'team' && (
        <section className="rx-team-wrap">
          <div className="as-panel-head">
            <h2>Team schedule · {formatDayHeading(selectedDate)}</h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <TeamDayBoard
            date={selectedDate}
            groomers={groomers}
            visits={dayVisits}
            onOpenVisit={setDetail}
            onReschedule={reschedule}
          />
          <p className="as-muted rx-team-hint">
            Drag a visit card onto another groomer or time slot to reschedule.
          </p>
        </section>
      )}

      {view === 'month' && (
        <div className="rx-schedule">
          <section className="rx-cal-block">
            <h2>Schedule calendar</h2>
            <div className="book-calendar rx-calendar">
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
                  if (!cell) return <span key={`e-${idx}`} className="book-cal-empty" />
                  const iso = toIsoDate(cell)
                  const count = countsByDate.get(iso) || 0
                  const hasVisits = count > 0
                  const isSelected = selectedDate === iso
                  const isToday = iso === todayIso()
                  const isPast = iso < todayIso()
                  return (
                    <button
                      key={iso}
                      type="button"
                      className={[
                        'book-cal-day',
                        'rx-cal-day',
                        hasVisits ? 'has-visits' : '',
                        isSelected ? 'is-selected' : '',
                        isToday ? 'is-today' : '',
                        isPast ? 'is-past' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => setSelectedDate(iso)}
                    >
                      <span className="rx-cal-num">{cell.getDate()}</span>
                      {hasVisits && <span className="rx-cal-dot" aria-hidden />}
                    </button>
                  )
                })}
              </div>
              <p className="rx-cal-legend as-muted">Dots mark booked days. Click a day to manage.</p>
            </div>
          </section>

          <section className="rx-day-list">
            <div className="as-panel-head">
              <h2>
                {isSelectedToday
                  ? 'Today’s visits'
                  : `Visits · ${formatDayHeading(selectedDate)}`}
              </h2>
            </div>

            {loading ? (
              <p className="as-muted">Loading schedule…</p>
            ) : dayVisits.length === 0 ? (
              <div className="rx-empty">
                <p className="as-muted">No visits on this day.</p>
                <button
                  type="button"
                  className="as-btn"
                  onClick={() => {
                    setBookPrefill(null)
                    setBookOpen(true)
                  }}
                >
                  + Add walk-in / phone visit
                </button>
              </div>
            ) : (
              <div className="as-table-wrap">
                <table className="as-table as-table--flat rx-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Pet & owner</th>
                      <th>Groomer</th>
                      <th>Service</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayVisits.map((v) => {
                      return (
                        <tr key={v.id}>
                          <td>{formatSlot(v.timeSlot)}</td>
                          <td>
                            <button
                              type="button"
                              className="rx-linkish"
                              onClick={() => setDetail(v)}
                            >
                              <strong>
                                {v.petName}
                                <PetNoteHint notes={v.petNotes} />
                              </strong>
                              <span>{v.customerName || '—'}</span>
                            </button>
                          </td>
                          <td>{v.groomerName}</td>
                          <td>{formatService(v.serviceType)}</td>
                          <td>
                            <span
                              className={`as-badge as-badge-${String(v.status).toLowerCase()}`}
                            >
                              {statusLabel(v.status)}
                            </span>
                          </td>
                          <td>{primaryAction(v)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      <QuickBookingModal
        open={bookOpen}
        onClose={() => {
          setBookOpen(false)
          setBookPrefill(null)
        }}
        onBooked={loadMonth}
        defaultDate={selectedDate}
        prefillCustomer={bookPrefill}
      />

      <VisitDetailDrawer
        open={Boolean(detail)}
        visit={detail}
        onClose={() => setDetail(null)}
        onStatus={async (id, status) => {
          await changeStatus(id, status)
          if (status === 'COMPLETED' || status === 'CANCELLED') setDetail(null)
        }}
      />
    </div>
  )
}
