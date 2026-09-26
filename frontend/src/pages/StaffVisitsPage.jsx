import { useEffect, useMemo, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { api, getStoredUser } from '../api/api'
import PetNoteHint from '../reception/PetNoteHint'
import {
  TIME_SLOTS,
  formatDayHeading,
  formatService,
  formatSlot,
  statusLabel,
  todayIso,
} from '../reception/rxUtils'

const STAFF_ROLES = ['ADMIN', 'RECEPTION', 'GROOMER']
const ACTIVE = new Set(['PLANNED', 'IN_PROGRESS', 'READY', 'COMPLETED'])

function statusClass(status) {
  return `as-badge as-badge-${String(status || '')
    .toLowerCase()
    .replace(/ /g, '_')}`
}

function primaryAction(v, onStatus) {
  if (v.status === 'PLANNED') {
    return (
      <button type="button" className="ds-btn ds-btn-start" onClick={() => onStatus(v.id, 'IN_PROGRESS')}>
        Start
      </button>
    )
  }
  if (v.status === 'IN_PROGRESS') {
    return (
      <button type="button" className="ds-btn ds-btn-ready" onClick={() => onStatus(v.id, 'READY')}>
        Mark ready
      </button>
    )
  }
  if (v.status === 'READY') {
    return (
      <button type="button" className="ds-btn ds-btn-done" onClick={() => onStatus(v.id, 'COMPLETED')}>
        Done
      </button>
    )
  }
  return null
}

export default function StaffVisitsPage() {
  const user = getStoredUser()
  const role = user?.role
  const isGroomer = role === 'GROOMER'
  const [searchParams, setSearchParams] = useSearchParams()
  const [date, setDate] = useState(searchParams.get('date') || todayIso())
  const [visits, setVisits] = useState([])
  const [myProfile, setMyProfile] = useState(null)
  const [mineOnly, setMineOnly] = useState(isGroomer)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [flash, setFlash] = useState('')

  useEffect(() => {
    const q = searchParams.get('date')
    if (q && q !== date) setDate(q)
  }, [searchParams])

  useEffect(() => {
    if (!isGroomer) return
    let cancelled = false
    void api('/api/groomers/me')
      .then((p) => {
        if (!cancelled) setMyProfile(p)
      })
      .catch(() => {
        if (!cancelled) setMyProfile(null)
      })
    return () => {
      cancelled = true
    }
  }, [isGroomer])

  async function loadVisits() {
    setLoading(true)
    try {
      const data = await api(`/api/visits?date=${date}`)
      setVisits(Array.isArray(data) ? data : [])
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!role || !STAFF_ROLES.includes(role)) return
    let cancelled = false
    ;(async () => {
      try {
        const data = await api(`/api/visits?date=${date}`)
        if (!cancelled) {
          setVisits(Array.isArray(data) ? data : [])
          setError('')
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [date, role])

  const visible = useMemo(() => {
    let list = visits.filter((v) => ACTIVE.has(v.status) || v.status === 'CANCELLED')
    if (mineOnly) {
      if (myProfile?.id == null) return []
      list = list.filter((v) => Number(v.groomerId) === Number(myProfile.id))
    }
    return [...list].sort((a, b) => String(a.timeSlot).localeCompare(String(b.timeSlot)))
  }, [visits, mineOnly, myProfile])

  const floorVisits = visible.filter((v) => ACTIVE.has(v.status))
  const planned = floorVisits.filter((v) => v.status === 'PLANNED').length
  const inProgress = floorVisits.filter((v) => v.status === 'IN_PROGRESS').length
  const ready = floorVisits.filter((v) => v.status === 'READY').length
  const completed = floorVisits.filter((v) => v.status === 'COMPLETED').length

  const bySlot = useMemo(() => {
    const map = Object.fromEntries(TIME_SLOTS.map((s) => [s, []]))
    for (const v of floorVisits) {
      if (!map[v.timeSlot]) map[v.timeSlot] = []
      map[v.timeSlot].push(v)
    }
    return map
  }, [floorVisits])

  if (!user || !STAFF_ROLES.includes(user.role)) {
    return <Navigate to="/app" replace />
  }

  function onDateChange(value) {
    setDate(value)
    setSearchParams(value ? { date: value } : {})
    setLoading(true)
  }

  async function changeStatus(id, status) {
    setError('')
    setFlash('')
    try {
      await api(`/api/visits/${id}/status`, {
        method: 'PATCH',
        body: { status },
      })
      const messages = {
        IN_PROGRESS: 'Started — dog on the table.',
        READY: 'Marked ready for pick-up.',
        COMPLETED: 'Visit completed.',
      }
      setFlash(messages[status] || 'Status updated.')
      await loadVisits()
    } catch (err) {
      setError(err.message)
    }
  }

  const titleName = myProfile?.displayName || user.displayName || 'your table'

  return (
    <div className="as-page ds-page">
      <header className="as-page-head">
        <p className="as-kicker">Floor</p>
        <h1>Day schedule</h1>
        <p className="as-lead">
          {isGroomer
            ? `Your table for ${formatDayHeading(date)} — start, finish, and hand off for pick-up.`
            : `Salon visits for ${formatDayHeading(date)}.`}
        </p>
      </header>

      <div className="as-stats as-stats--flat rx-stats">
        <div className="as-stat">
          <p className="as-stat-label">{mineOnly ? 'My day' : 'Day'}</p>
          <p className="as-stat-value rx-kpi">{loading ? '—' : floorVisits.length}</p>
          <p className="as-stat-meta">visits</p>
        </div>
        <div className="as-stat">
          <p className="as-stat-label">Queued</p>
          <p className="as-stat-value rx-kpi">{loading ? '—' : planned}</p>
          <p className="as-stat-meta">planned</p>
        </div>
        <div className="as-stat">
          <p className="as-stat-label">On table</p>
          <p className="as-stat-value rx-kpi">{loading ? '—' : inProgress}</p>
          <p className="as-stat-meta">in progress</p>
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

      <div className="ds-toolbar">
        <label className="as-field-inline">
          Date
          <input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} />
        </label>
        {isGroomer && myProfile && (
          <div className="ds-scope" role="group" aria-label="Visit filter">
            <button
              type="button"
              className={mineOnly ? 'is-active' : ''}
              onClick={() => setMineOnly(true)}
            >
              My table
            </button>
            <button
              type="button"
              className={!mineOnly ? 'is-active' : ''}
              onClick={() => setMineOnly(false)}
            >
              Whole salon
            </button>
          </div>
        )}
        {isGroomer && myProfile && mineOnly && (
          <p className="ds-scope-hint">Showing {titleName}</p>
        )}
      </div>

      {flash && (
        <p className="as-flash as-flash-ok" role="status">
          {flash}
          <button type="button" className="as-text-link" onClick={() => setFlash('')}>
            Dismiss
          </button>
        </p>
      )}
      {error && (
        <p className="as-flash as-flash-error" role="alert">
          {error}
        </p>
      )}

      <section className="ds-board" aria-label="Day board">
        {loading ? (
          <p className="as-muted">Loading schedule…</p>
        ) : floorVisits.length === 0 ? (
          <div className="ds-empty">
            <p className="as-muted">
              {mineOnly
                ? 'No visits on your table for this day.'
                : 'No visits scheduled for this day.'}
            </p>
            <p className="ds-empty-hint">Pick another date, or ask reception to book a slot.</p>
          </div>
        ) : (
          <ol className="ds-timeline">
            {TIME_SLOTS.map((slot) => {
              const items = bySlot[slot] || []
              if (!items.length) return null
              return (
                <li key={slot} className="ds-slot">
                  <div className="ds-slot-time">
                    <span>{formatSlot(slot)}</span>
                  </div>
                  <ul className="ds-cards">
                    {items.map((v) => (
                      <li key={v.id} className={`ds-card is-${String(v.status).toLowerCase()}`}>
                        <div className="ds-card-top">
                          <div className="ds-card-title">
                            <strong>
                              {v.petName}
                              {v.petBreed ? ` · ${v.petBreed}` : ''}
                            </strong>
                            <PetNoteHint notes={v.petNotes} />
                          </div>
                          <span className={statusClass(v.status)}>{statusLabel(v.status)}</span>
                        </div>
                        <p className="ds-card-meta">
                          {v.customerName || '—'}
                          {v.customerPhone ? ` · ${v.customerPhone}` : ''}
                        </p>
                        <p className="ds-card-meta">
                          {formatService(v.serviceType)}
                          {!mineOnly && v.groomerName ? ` · ${v.groomerName}` : ''}
                        </p>
                        {v.ownerExpectations && (
                          <p className="ds-card-notes">Owner: “{v.ownerExpectations}”</p>
                        )}
                        {v.groomerNotes && (
                          <p className="ds-card-notes">Notes: {v.groomerNotes}</p>
                        )}
                        <div className="ds-card-actions">{primaryAction(v, changeStatus)}</div>
                      </li>
                    ))}
                  </ul>
                </li>
              )
            })}
          </ol>
        )}
      </section>

      {visible.some((v) => v.status === 'CANCELLED') && (
        <details className="ds-cancelled">
          <summary>Cancelled ({visible.filter((v) => v.status === 'CANCELLED').length})</summary>
          <ul>
            {visible
              .filter((v) => v.status === 'CANCELLED')
              .map((v) => (
                <li key={v.id}>
                  {formatSlot(v.timeSlot)} · {v.petName} · {v.customerName || '—'}
                </li>
              ))}
          </ul>
        </details>
      )}
    </div>
  )
}
