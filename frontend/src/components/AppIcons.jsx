const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

function Icon({ children, className = '', label }) {
  return (
    <svg
      className={`as-icon ${className}`.trim()}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      {children}
    </svg>
  )
}

export function IconPaw({ className } = {}) {
  return (
    <Icon className={className}>
      <circle cx="12" cy="16.2" r="3.2" {...stroke} />
      <circle cx="6.2" cy="10.2" r="1.7" {...stroke} />
      <circle cx="10" cy="7.4" r="1.7" {...stroke} />
      <circle cx="14.2" cy="7.4" r="1.7" {...stroke} />
      <circle cx="17.8" cy="10.2" r="1.7" {...stroke} />
    </Icon>
  )
}

export function IconCalendar({ className } = {}) {
  return (
    <Icon className={className}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" {...stroke} />
      <path d="M3.5 10h17" {...stroke} />
      <path d="M8 3.5v3.5M16 3.5v3.5" {...stroke} />
    </Icon>
  )
}

export function IconTag({ className } = {}) {
  return (
    <Icon className={className}>
      <path
        d="M3.8 12.4V5.8A2 2 0 0 1 5.8 3.8h6.6l7.8 7.8a2 2 0 0 1 0 2.8l-4.8 4.8a2 2 0 0 1-2.8 0L3.8 12.4Z"
        {...stroke}
      />
      <circle cx="8.2" cy="8.2" r="1.2" fill="currentColor" stroke="none" />
    </Icon>
  )
}

export function IconHome({ className } = {}) {
  return (
    <Icon className={className}>
      <path d="M4 10.5 12 4l8 6.5V20a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 20V10.5Z" {...stroke} />
      <path d="M9.5 21.5V13h5v8.5" {...stroke} />
    </Icon>
  )
}

export function IconUsers({ className } = {}) {
  return (
    <Icon className={className}>
      <circle cx="9" cy="8.5" r="3" {...stroke} />
      <path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" {...stroke} />
      <circle cx="16.5" cy="9" r="2.4" {...stroke} />
      <path d="M15 14.5c2.2.3 4 2 4 4.5" {...stroke} />
    </Icon>
  )
}

export function IconLogout({ className } = {}) {
  return (
    <Icon className={className}>
      <path d="M10 4.5H6.5A2 2 0 0 0 4.5 6.5v11A2 2 0 0 0 6.5 19.5H10" {...stroke} />
      <path d="M14 8l4 4-4 4M18 12H9.5" {...stroke} />
    </Icon>
  )
}

export function IconPlus({ className } = {}) {
  return (
    <Icon className={className}>
      <path d="M12 5.5v13M5.5 12h13" {...stroke} />
    </Icon>
  )
}

export function IconEdit({ className } = {}) {
  return (
    <Icon className={className}>
      <path d="M4.5 16.5 5 20l3.5-.5L19.5 8.5a2.1 2.1 0 0 0-3-3L4.5 16.5Z" {...stroke} />
      <path d="M14.5 6.5 17.5 9.5" {...stroke} />
    </Icon>
  )
}

export function IconTrash({ className } = {}) {
  return (
    <Icon className={className}>
      <path d="M5 7.5h14" {...stroke} />
      <path d="M9.5 7.5V5.8A1.3 1.3 0 0 1 10.8 4.5h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7" {...stroke} />
      <path d="M8 7.5l.6 11.2A1.5 1.5 0 0 0 10.1 20h3.8a1.5 1.5 0 0 0 1.5-1.3L16 7.5" {...stroke} />
    </Icon>
  )
}

export function IconSearch({ className } = {}) {
  return (
    <Icon className={className}>
      <circle cx="10.5" cy="10.5" r="5.5" {...stroke} />
      <path d="M15.2 15.2 19 19" {...stroke} />
    </Icon>
  )
}

export function IconUser({ className } = {}) {
  return (
    <Icon className={className}>
      <circle cx="12" cy="8.5" r="3.2" {...stroke} />
      <path d="M5 19.5c0-3.4 3.1-5.7 7-5.7s7 2.3 7 5.7" {...stroke} />
    </Icon>
  )
}
