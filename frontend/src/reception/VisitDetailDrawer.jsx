import { formatService, formatSlot, petAlerts, statusLabel } from './rxUtils'

export default function VisitDetailDrawer({ visit, open, onClose, onStatus }) {
  if (!open || !visit) return null

  const alerts = petAlerts(visit.petNotes)
  const status = visit.status

  return (
    <div className="rx-drawer-backdrop" role="presentation" onClick={onClose}>
      <aside
        className="rx-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rx-visit-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="rx-drawer-head">
          <div>
            <p className="as-kicker">Visit</p>
            <h2 id="rx-visit-title">
              {formatSlot(visit.timeSlot)} · {visit.petName}
            </h2>
          </div>
          <button type="button" className="rx-icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="rx-drawer-body">
          <p className={`as-badge as-badge-${String(status).toLowerCase()}`}>
            {statusLabel(status)}
          </p>

          <dl className="rx-meta">
            <div>
              <dt>Owner</dt>
              <dd>{visit.customerName || '—'}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>
                {visit.customerPhone ? (
                  <a href={`tel:${visit.customerPhone}`}>{visit.customerPhone}</a>
                ) : (
                  '—'
                )}
              </dd>
            </div>
            <div>
              <dt>Pet</dt>
              <dd>
                {visit.petName}
                {visit.petBreed ? ` · ${visit.petBreed}` : ''}
              </dd>
            </div>
            <div>
              <dt>Groomer</dt>
              <dd>{visit.groomerName || '—'}</dd>
            </div>
            <div>
              <dt>Service</dt>
              <dd>{formatService(visit.serviceType)}</dd>
            </div>
          </dl>

          {alerts.length > 0 && (
            <div className="rx-alerts rx-alerts--soft">
              <h3>Pet notes</h3>
              <ul>
                {alerts.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {visit.ownerExpectations && (
            <div className="rx-notes-block">
              <h3>Owner notes</h3>
              <p>{visit.ownerExpectations}</p>
            </div>
          )}

          <div className="rx-drawer-actions">
            {status === 'PLANNED' && (
              <button type="button" className="as-btn" onClick={() => onStatus(visit.id, 'IN_PROGRESS')}>
                Check-in
              </button>
            )}
            {status === 'IN_PROGRESS' && (
              <button type="button" className="as-btn" onClick={() => onStatus(visit.id, 'READY')}>
                Ready for pick-up
              </button>
            )}
            {status === 'READY' && (
              <button type="button" className="as-btn" onClick={() => onStatus(visit.id, 'COMPLETED')}>
                Check-out
              </button>
            )}
            {status === 'PLANNED' && (
              <button
                type="button"
                className="as-btn as-btn-ghost"
                onClick={() => onStatus(visit.id, 'CANCELLED')}
              >
                Cancel visit
              </button>
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}
