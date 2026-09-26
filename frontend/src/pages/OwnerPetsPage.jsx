import { useEffect, useState } from 'react'
import { api } from '../api/api'
import { IconEdit, IconPaw, IconPlus, IconTrash } from '../components/AppIcons'

const emptyForm = {
  name: '',
  breedText: '',
  weight: '',
  notes: '',
}

export default function OwnerPetsPage() {
  const [pets, setPets] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadPets() {
      try {
        const data = await api('/api/me/pets')
        if (!cancelled) {
          setPets(data)
          setError('')
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
        }
      }
    }

    void loadPets()

    return () => {
      cancelled = true
    }
  }, [])

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value })
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
  }

  function startEdit(pet) {
    setEditingId(pet.id)
    setForm({
      name: pet.name || '',
      breedText: pet.breedText || '',
      weight: pet.weight == null ? '' : String(pet.weight),
      notes: pet.notes || '',
    })
    setMessage('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function refresh() {
    const data = await api('/api/me/pets')
    setPets(data)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    const body = {
      name: form.name,
      breedText: form.breedText,
      weight: form.weight === '' ? null : Number(form.weight),
      notes: form.notes || null,
    }

    try {
      if (editingId) {
        await api(`/api/me/pets/${editingId}`, { method: 'PUT', body })
        setMessage('Pet updated')
      } else {
        await api('/api/me/pets', { method: 'POST', body })
        setMessage('Pet added')
      }
      resetForm()
      await refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(pet) {
    if (!window.confirm(`Remove ${pet.name} from your pets?`)) return
    setError('')
    setMessage('')
    try {
      await api(`/api/me/pets/${pet.id}`, { method: 'DELETE' })
      if (editingId === pet.id) resetForm()
      setMessage(`${pet.name} removed`)
      await refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="as-page">
      <header className="as-page-head">
        <p className="as-kicker">Pets</p>
        <h1>My pets</h1>
        <p className="as-lead">Keep profiles ready for booking.</p>
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

      <div className="pets-layout">
        <section className="pets-form-block">
          <h2>{editingId ? 'Edit pet' : 'Add a new pet'}</h2>
          <form className="as-form pets-form" onSubmit={handleSubmit}>
            <div className="as-form-row">
              <label>
                Name
                <input
                  value={form.name}
                  onChange={update('name')}
                  required
                  placeholder="Milo"
                />
              </label>
              <label>
                Breed
                <input
                  value={form.breedText}
                  onChange={update('breedText')}
                  required
                  placeholder="Poodle"
                />
              </label>
            </div>
            <label>
              Weight (kg)
              <input
                type="number"
                step="0.1"
                value={form.weight}
                onChange={update('weight')}
                placeholder="7.5"
              />
            </label>
            <label>
              Notes &amp; preferences
              <textarea
                rows={4}
                value={form.notes}
                onChange={update('notes')}
                placeholder="Calm, prefers soft music and gentle handling."
              />
            </label>
            <div className="pets-form-actions">
              {editingId && (
                <button
                  type="button"
                  className="as-btn as-btn-ghost"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
              <button className="as-btn" type="submit">
                <IconPlus />
                {editingId ? 'Save changes' : 'Add pet'}
              </button>
            </div>
          </form>
        </section>

        <section className="pets-list-block">
          <h2>Your registered pets</h2>
          {pets.length === 0 ? (
            <p className="as-muted">No pets yet — add your first profile.</p>
          ) : (
            <ul className="pets-cards">
              {pets.map((pet) => (
                <li key={pet.id} className="pet-card">
                  <span className="pet-card-avatar" aria-hidden>
                    <IconPaw />
                  </span>
                  <div className="pet-card-body">
                    <strong>{pet.name}</strong>
                    <p className="pet-card-meta">
                      {pet.breedText}
                      {pet.weight != null ? ` · ${pet.weight} kg` : ''}
                    </p>
                    {pet.notes && <p className="pet-card-notes">“{pet.notes}”</p>}
                    <div className="pet-card-actions">
                      <button
                        type="button"
                        className="pet-action"
                        onClick={() => startEdit(pet)}
                      >
                        <IconEdit />
                        Edit
                      </button>
                      <button
                        type="button"
                        className="pet-action pet-action-danger"
                        onClick={() => handleDelete(pet)}
                      >
                        <IconTrash />
                        Delete
                      </button>
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
