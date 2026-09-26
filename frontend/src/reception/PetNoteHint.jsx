import { useState } from 'react'
import { petAlerts } from './rxUtils'

export default function PetNoteHint({ notes, className = '' }) {
  const alerts = petAlerts(notes)
  const [open, setOpen] = useState(false)
  if (!alerts.length) return null

  const text = alerts.join(' · ')

  return (
    <span
      className={`rx-note-hint${open ? ' is-open' : ''} ${className}`.trim()}
      tabIndex={0}
      aria-label={`Pet notes: ${text}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onClick={(e) => {
        e.stopPropagation()
        setOpen((v) => !v)
      }}
    >
      <span className="rx-note-hint-mark" aria-hidden>
        i
      </span>
      <span className="rx-note-hint-tip" role="tooltip">
        {alerts.map((a) => (
          <span key={a} className="rx-note-hint-line">
            {a}
          </span>
        ))}
      </span>
    </span>
  )
}
