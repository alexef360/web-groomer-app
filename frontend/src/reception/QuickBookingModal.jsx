import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/api'
import {
  SERVICE_TYPES,
  TIME_SLOTS,
  formatService,
  formatSlot,
  todayIso,
} from './rxUtils'

export default function QuickBookingModal({ open, onClose, onBooked, defaultDate, prefillCustomer }) {
  const [step, setStep] = useState(1)
  const [query, setQuery] = useState('')
  const [customers, setCustomers] = useState([])
  const [customer, setCustomer] = useState(null)
  const [pets, setPets] = useState([])
  const [petId, setPetId] = useState('')
  const [petQuery, setPetQuery] = useState('')
  const [clientSuggestOpen, setClientSuggestOpen] = useState(false)
  const [groomers, setGroomers] = useState([])
  const [availability, setAvailability] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [createCustomer, setCreateCustomer] = useState(false)
  const [createPet, setCreatePet] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
  })
  const [newPet, setNewPet] = useState({
    name: '',
    breedText: '',
    notes: '',
  })
  const [form, setForm] = useState({
    groomerId: '',
    serviceType: 'FULL_GROOMING',
    date: defaultDate || todayIso(),
    timeSlot: '',
    ownerExpectations: '',
  })

  useEffect(() => {
    if (!open) return
    setError('')
    setPetId('')
    setPetQuery('')
    setClientSuggestOpen(false)
    setCreateCustomer(false)
    setCreatePet(false)
    setForm((f) => ({ ...f, date: defaultDate || todayIso(), timeSlot: '' }))
    if (prefillCustomer?.id) {
      setCustomer(prefillCustomer)
      setQuery(`${prefillCustomer.firstName || ''} ${prefillCustomer.lastName || ''}`.trim())
      setStep(2)
    } else {
      setCustomer(null)
      setQuery('')
      setStep(1)
    }
    void api('/api/groomers')
      .then((data) => setGroomers(Array.isArray(data) ? data : []))
      .catch(() => setGroomers([]))
  }, [open, defaultDate, prefillCustomer])

  useEffect(() => {
    if (!open) return
    const q = query.trim()
    const t = setTimeout(() => {
      void api(`/api/customers${q ? `?q=${encodeURIComponent(q)}` : ''}`)
        .then((data) => setCustomers(Array.isArray(data) ? data : []))
        .catch(() => setCustomers([]))
    }, 250)
    return () => clearTimeout(t)
  }, [query, open])

  useEffect(() => {
    if (!customer?.id) {
      setPets([])
      return
    }
    void api(`/api/pets?customerId=${customer.id}`)
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        setPets(list)
        if (list.length === 1) setPetId(String(list[0].id))
      })
      .catch(() => setPets([]))
  }, [customer])

  useEffect(() => {
    if (!form.groomerId || !form.date) {
      setAvailability([])
      return
    }
    void api(
      `/api/groomers/${form.groomerId}/availability?from=${form.date}&to=${form.date}`,
    )
      .then((data) => setAvailability(Array.isArray(data) ? data : []))
      .catch(() => setAvailability([]))
  }, [form.groomerId, form.date])

  const daySlots = useMemo(() => {
    const day = availability.find((d) => d.date === form.date)
    return day?.slots || []
  }, [availability, form.date])

  if (!open) return null

  async function ensureCustomer() {
    if (customer?.id) return customer
    if (!createCustomer) throw new Error('Select or create a client')
    const created = await api('/api/customers', {
      method: 'POST',
      body: newCustomer,
    })
    setCustomer(created)
    return created
  }

  async function ensurePet(cust) {
    if (petId) return Number(petId)
    if (!createPet) throw new Error('Select or create a pet')
    const created = await api('/api/pets', {
      method: 'POST',
      body: {
        customerId: cust.id,
        name: newPet.name,
        breedText: newPet.breedText || 'Mixed',
        notes: newPet.notes || null,
        weight: null,
      },
    })
    setPetId(String(created.id))
    return created.id
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const cust = await ensureCustomer()
      const pid = await ensurePet(cust)
      if (!form.groomerId || !form.timeSlot) {
        throw new Error('Choose a groomer and a time slot')
      }
      await api('/api/visits', {
        method: 'POST',
        body: {
          date: form.date,
          timeSlot: form.timeSlot,
          groomerId: Number(form.groomerId),
          petId: Number(pid),
          serviceType: form.serviceType,
          ownerExpectations: form.ownerExpectations || null,
        },
      })
      onBooked?.()
      onClose()
    } catch (err) {
      setError(err.message || 'Booking failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rx-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="rx-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rx-book-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="rx-modal-head">
          <h2 id="rx-book-title">Quick booking</h2>
          <button type="button" className="rx-icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="rx-steps">
          <button type="button" className={step === 1 ? 'is-active' : ''} onClick={() => setStep(1)}>
            1. Client
          </button>
          <button type="button" className={step === 2 ? 'is-active' : ''} onClick={() => setStep(2)}>
            2. Visit
          </button>
        </div>

        {error && (
          <p className="as-flash as-flash-error" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={submit} className="rx-modal-body">
          {step === 1 && (
            <>
              {!createCustomer && (
                <>
                  <div className="rx-search-wrap">
                    <label className="as-field">
                      Search client
                      <input
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value)
                          setClientSuggestOpen(true)
                        }}
                        onFocus={() => setClientSuggestOpen(true)}
                        onBlur={() => setTimeout(() => setClientSuggestOpen(false), 150)}
                        placeholder="Name, phone, email…"
                        autoComplete="off"
                      />
                    </label>
                    {clientSuggestOpen && (
                      <ul className="rx-suggest rx-suggest--modal" role="listbox">
                        {customers.length === 0 ? (
                          <li className="rx-suggest-empty">
                            {query.trim() ? 'No clients found' : 'Type to search clients'}
                          </li>
                        ) : (
                          customers.slice(0, 8).map((c) => (
                            <li key={c.id}>
                              <button
                                type="button"
                                className={`rx-suggest-item${customer?.id === c.id ? ' is-active' : ''}`}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  setCustomer(c)
                                  setQuery(`${c.firstName} ${c.lastName}`.trim())
                                  setCreateCustomer(false)
                                  setClientSuggestOpen(false)
                                }}
                              >
                                <strong>
                                  {c.firstName} {c.lastName}
                                </strong>
                                <span>
                                  {c.phoneNumber || '—'} · {c.email || 'No email'}
                                </span>
                              </button>
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </div>
                  {customer && (
                    <p className="rx-selected-chip">
                      Selected: <strong>{customer.firstName} {customer.lastName}</strong>
                      <button
                        type="button"
                        className="as-text-link"
                        onClick={() => {
                          setCustomer(null)
                          setQuery('')
                          setPetId('')
                        }}
                      >
                        Change
                      </button>
                    </p>
                  )}
                  <button
                    type="button"
                    className="as-text-link"
                    onClick={() => {
                      setCreateCustomer(true)
                      setCustomer(null)
                    }}
                  >
                    + Create new client
                  </button>
                </>
              )}

              {createCustomer && (
                <div className="rx-grid-2">
                  <label className="as-field">
                    First name
                    <input
                      required
                      value={newCustomer.firstName}
                      onChange={(e) =>
                        setNewCustomer((s) => ({ ...s, firstName: e.target.value }))
                      }
                    />
                  </label>
                  <label className="as-field">
                    Last name
                    <input
                      required
                      value={newCustomer.lastName}
                      onChange={(e) =>
                        setNewCustomer((s) => ({ ...s, lastName: e.target.value }))
                      }
                    />
                  </label>
                  <label className="as-field">
                    Phone
                    <input
                      value={newCustomer.phoneNumber}
                      onChange={(e) =>
                        setNewCustomer((s) => ({ ...s, phoneNumber: e.target.value }))
                      }
                    />
                  </label>
                  <label className="as-field">
                    Email
                    <input
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) =>
                        setNewCustomer((s) => ({ ...s, email: e.target.value }))
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className="as-text-link"
                    onClick={() => setCreateCustomer(false)}
                  >
                    ← Back to search
                  </button>
                </div>
              )}

              {(customer || createCustomer) && (
                <>
                  <h3 className="rx-subhead">Pet</h3>
                  {!createPet && pets.length > 0 && (
                    <>
                      <label className="as-field">
                        Search pet
                        <input
                          value={petQuery}
                          onChange={(e) => setPetQuery(e.target.value)}
                          placeholder="Pet name or breed…"
                          autoComplete="off"
                        />
                      </label>
                      <ul className="rx-pick-list">
                        {pets
                          .filter((p) => {
                            const q = petQuery.trim().toLowerCase()
                            if (!q) return true
                            return `${p.name} ${p.breedText || ''}`.toLowerCase().includes(q)
                          })
                          .map((p) => (
                            <li key={p.id}>
                              <button
                                type="button"
                                className={`rx-pick${String(petId) === String(p.id) ? ' is-active' : ''}`}
                                onClick={() => setPetId(String(p.id))}
                              >
                                <strong>{p.name}</strong>
                                <span>{p.breedText || '—'}</span>
                              </button>
                            </li>
                          ))}
                      </ul>
                    </>
                  )}
                  {!createPet && (
                    <button type="button" className="as-text-link" onClick={() => setCreatePet(true)}>
                      + Add pet
                    </button>
                  )}
                  {createPet && (
                    <div className="rx-grid-2">
                      <label className="as-field">
                        Pet name
                        <input
                          required
                          value={newPet.name}
                          onChange={(e) => setNewPet((s) => ({ ...s, name: e.target.value }))}
                        />
                      </label>
                      <label className="as-field">
                        Breed
                        <input
                          value={newPet.breedText}
                          onChange={(e) =>
                            setNewPet((s) => ({ ...s, breedText: e.target.value }))
                          }
                        />
                      </label>
                      <label className="as-field rx-span-2">
                        Alerts / notes
                        <input
                          value={newPet.notes}
                          onChange={(e) => setNewPet((s) => ({ ...s, notes: e.target.value }))}
                          placeholder="Allergy, behaviour…"
                        />
                      </label>
                    </div>
                  )}
                </>
              )}

              <div className="rx-modal-actions">
                <button type="button" className="as-btn as-btn-ghost" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="as-btn"
                  onClick={() => setStep(2)}
                  disabled={!customer && !createCustomer}
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="rx-grid-2">
                <label className="as-field">
                  Groomer
                  <select
                    required
                    value={form.groomerId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, groomerId: e.target.value, timeSlot: '' }))
                    }
                  >
                    <option value="">Choose…</option>
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
                    value={form.serviceType}
                    onChange={(e) => setForm((f) => ({ ...f, serviceType: e.target.value }))}
                  >
                    {SERVICE_TYPES.map((s) => (
                      <option key={s} value={s}>
                        {formatService(s)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="as-field">
                  Date
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, date: e.target.value, timeSlot: '' }))
                    }
                  />
                </label>
                <label className="as-field">
                  Slot
                  <select
                    required
                    value={form.timeSlot}
                    onChange={(e) => setForm((f) => ({ ...f, timeSlot: e.target.value }))}
                  >
                    <option value="">Choose…</option>
                    {(daySlots.length ? daySlots : TIME_SLOTS.map((s) => ({ timeSlot: s, available: true }))).map(
                      (s) => (
                        <option
                          key={s.timeSlot}
                          value={s.timeSlot}
                          disabled={s.available === false}
                        >
                          {formatSlot(s.timeSlot)}
                          {s.available === false ? ' (taken)' : ''}
                        </option>
                      ),
                    )}
                  </select>
                </label>
                <label className="as-field rx-span-2">
                  Notes
                  <textarea
                    rows={2}
                    value={form.ownerExpectations}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, ownerExpectations: e.target.value }))
                    }
                  />
                </label>
              </div>
              <div className="rx-modal-actions">
                <button type="button" className="as-btn as-btn-ghost" onClick={() => setStep(1)}>
                  Back
                </button>
                <button type="submit" className="as-btn" disabled={saving}>
                  {saving ? 'Saving…' : 'Book visit'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
