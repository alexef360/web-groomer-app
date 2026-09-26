import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getToken } from '../api/api'
import BrandLogo from '../components/BrandLogo'

function formatPrice(value) {
  if (value == null || value === '') return null
  const num = Number(value)
  if (Number.isNaN(num)) return String(value)
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 0,
  }).format(num)
}

function priceLabel(from, to) {
  const a = formatPrice(from)
  const b = formatPrice(to)
  if (a && b && a !== b) return `${a} – ${b} PLN`
  if (a) return `from ${a} PLN`
  return 'On request'
}

export default function PricingPage() {
  const loggedIn = Boolean(getToken())
  const bookTo = loggedIn ? '/app' : '/register'
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await api('/api/pricing', { auth: false })
        if (!cancelled) setItems(Array.isArray(data) ? data : [])
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
  }, [])

  return (
    <div className="pp bg-paw-pattern">
      <header className="pp-nav">
        <div className="pp-nav-inner">
          <BrandLogo variant="mini" className="pp-logo" />
          <nav className="pp-nav-links" aria-label="Pricing navigation">
            <Link to="/">Home</Link>
            <Link to={bookTo}>{loggedIn ? 'Go to app' : 'Book a visit'}</Link>
          </nav>
        </div>
      </header>

      <main className="pp-main">
        <header className="pp-hero">
          <p className="pp-kicker">Pricing</p>
          <h1>Care, priced with clarity</h1>
          <p className="pp-lead">
            Prices are indicative. The final amount is confirmed in the visit
            summary. Hover over a category for breed examples.
          </p>
        </header>

        {error && (
          <p className="pp-error" role="alert">
            {error}
          </p>
        )}

        {loading && !error && (
          <p className="pp-status">Loading price list…</p>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="pp-status">
            The price list is being updated. Please contact the salon for a quote.
          </p>
        )}

        {!loading && items.length > 0 && (
          <ul className="pp-grid">
            {items.map((item) => {
              const breeds = Array.isArray(item.breedPrices) ? item.breedPrices : []
              const open = activeId === item.id
              return (
                <li
                  key={item.id}
                  className={`pp-card${open ? ' is-open' : ''}`}
                  onMouseEnter={() => setActiveId(item.id)}
                  onMouseLeave={() => setActiveId(null)}
                  onFocus={() => setActiveId(item.id)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setActiveId(null)
                    }
                  }}
                  tabIndex={0}
                >
                  <p className="pp-card-hint">Hover over to see breed prices</p>
                  <h2>{item.name}</h2>
                  {item.description && <p>{item.description}</p>}
                  <p className="pp-price">
                    {priceLabel(item.indicativePriceFrom, item.indicativePriceTo)}
                  </p>

                  {breeds.length > 0 && (
                    <div
                      className="pp-breed-panel"
                      aria-hidden={!open}
                    >
                      <p className="pp-breed-title">By breed / coat type</p>
                      <ul className="pp-breed-list">
                        {breeds.map((b) => (
                          <li key={b.breed}>
                            <span>{b.breed}</span>
                            <strong>{priceLabel(b.priceFrom, b.priceTo)}</strong>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        <section className="pp-cta">
          <h2>Ready to book?</h2>
          <p>Reserve a calm, one-on-one visit for your dog.</p>
          <Link className="pp-btn" to={bookTo}>
            {loggedIn ? 'Go to app' : 'Book a visit now'}
          </Link>
        </section>
      </main>

      <footer className="pp-footer">
        <p>© 2026 Paw Care Groomer. All rights reserved.</p>
        <p className="pp-footer-links">
          <Link to="/">Home</Link>
          <span aria-hidden>·</span>
          <Link to="/login">Sign in</Link>
        </p>
      </footer>
    </div>
  )
}
