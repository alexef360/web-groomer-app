export const TIME_SLOTS = [
  'SLOT_08_00',
  'SLOT_10_00',
  'SLOT_12_00',
  'SLOT_14_00',
  'SLOT_16_00',
]

export const SERVICE_TYPES = ['BATH', 'CUT', 'FULL_GROOMING']

export function toIsoDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayIso() {
  return toIsoDate(new Date())
}

export function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function addMonths(d, n) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1)
}

export function monthLabel(d) {
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export function formatDayHeading(iso) {
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  })
}

export function buildMonthCells(monthDate) {
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

export function formatSlot(slot) {
  return String(slot || '')
    .replace('SLOT_', '')
    .replace('_', ':')
}

export function formatService(type) {
  return String(type || '')
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function statusLabel(status) {
  return String(status || '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function petAlerts(notes) {
  if (!notes || !String(notes).trim()) return []
  return String(notes)
    .split(/[;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}
