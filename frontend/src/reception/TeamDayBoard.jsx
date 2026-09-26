import { TIME_SLOTS, formatSlot, formatService, statusLabel } from './rxUtils'
import PetNoteHint from './PetNoteHint'

export default function TeamDayBoard({
  date,
  groomers,
  visits,
  onOpenVisit,
  onReschedule,
}) {
  function visitsAt(groomerId, slot) {
    return visits.filter(
      (v) =>
        Number(v.groomerId) === Number(groomerId) &&
        v.timeSlot === slot &&
        v.status !== 'CANCELLED',
    )
  }

  let dragMoved = false

  function onDragStart(e, visit) {
    dragMoved = false
    e.dataTransfer.setData('text/visit-id', String(visit.id))
    e.dataTransfer.effectAllowed = 'move'
  }

  function onDrag() {
    dragMoved = true
  }

  function onDrop(e, groomerId, timeSlot) {
    e.preventDefault()
    const id = Number(e.dataTransfer.getData('text/visit-id'))
    if (!id) return
    onReschedule?.(id, { date, timeSlot, groomerId })
  }

  return (
    <div className="rx-team">
      <div
        className="rx-team-grid"
        style={{
          gridTemplateColumns: `5.5rem repeat(${Math.max(groomers.length, 1)}, minmax(9rem, 1fr))`,
        }}
      >
        <div className="rx-team-corner">Time</div>
        {groomers.map((g) => (
          <div key={g.id} className="rx-team-colhead">
            {g.displayName}
          </div>
        ))}

        {TIME_SLOTS.map((slot) => (
          <div key={slot} className="rx-team-row" style={{ display: 'contents' }}>
            <div className="rx-team-time">{formatSlot(slot)}</div>
            {groomers.map((g) => {
              const cellVisits = visitsAt(g.id, slot)
              return (
                <div
                  key={`${g.id}-${slot}`}
                  className="rx-team-cell"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => onDrop(e, g.id, slot)}
                >
                  {cellVisits.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      className={`rx-team-card status-${String(v.status).toLowerCase()}`}
                      draggable
                      onDragStart={(e) => onDragStart(e, v)}
                      onDrag={onDrag}
                      onClick={() => {
                        if (dragMoved) return
                        onOpenVisit(v)
                      }}
                    >
                      <strong>{v.petName}</strong>
                      <span>{formatService(v.serviceType)}</span>
                      <em>{statusLabel(v.status)}</em>
                      <PetNoteHint notes={v.petNotes} className="rx-team-alert" />
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
