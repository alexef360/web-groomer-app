import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { getToken } from '../api/api'
import BrandLogo from '../components/BrandLogo'
import BeforeAfterPair from '../components/BeforeAfterPair'
import heroPhoto from '../assets/photos/hero2.jpg'
import interiorPhoto from '../assets/photos/interior.jpg'
import beforeAfter1 from '../assets/photos/before-after-1.jpg'
import beforeAfter2 from '../assets/photos/before-after-2.jpg'
import beforeAfter3 from '../assets/photos/before-after-3.jpg'

const transforms = [
  {
    src: beforeAfter1,
    alt: 'Before and after: fluffy coat transformed into a neat teddy cut',
    beforeCaption: 'Before: Everyday coat',
    afterCaption: 'After: Healthy & styled finish',
  },
  {
    src: beforeAfter2,
    alt: 'Before and after grooming transformation',
    beforeCaption: 'Before: Everyday coat',
    afterCaption: 'After: Healthy & styled finish',
  },
  {
    src: beforeAfter3,
    alt: 'Before and after grooming transformation',
    beforeCaption: 'Before: Everyday coat',
    afterCaption: 'After: Healthy & styled finish',
  },
]

export default function LandingPage() {
  const loggedIn = Boolean(getToken())
  const bookTo = loggedIn ? '/app' : '/register'
  const [menuOpen, setMenuOpen] = useState(false)
  const [slide, setSlide] = useState(0)
  const menuId = useId()
  const sliderId = useId()

  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia('(min-width: 860px)').matches) {
        setMenuOpen(false)
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    const id = window.setInterval(() => {
      setSlide((i) => (i === transforms.length - 1 ? 0 : i + 1))
    }, 7500)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="lp bg-paw-pattern">
      <a className="lp-skip" href="#main">
        Skip to content
      </a>

      <section className="lp-hero" aria-label="Hero">
        <img
          className="lp-hero-bg"
          src={heroPhoto}
          alt=""
          width={1600}
          height={1067}
          fetchPriority="high"
        />
        <div className="lp-hero-shade" aria-hidden />

        <header className="lp-nav">
          <div className="lp-nav-inner">
            <BrandLogo variant="mini" className="lp-logo" onClick={closeMenu} />

            <button
              type="button"
              className="lp-burger"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>

            <nav
              id={menuId}
              className={`lp-menu${menuOpen ? ' is-open' : ''}`}
              aria-label="Main"
            >
              <a href="#about" onClick={closeMenu}>
                About
              </a>
              <a href="#services" onClick={closeMenu}>
                Services
              </a>
              <a href="#transforms" onClick={closeMenu}>
                Transformations
              </a>
              <Link to="/pricing" onClick={closeMenu}>
                Pricing
              </Link>
              <a href="#contact" onClick={closeMenu}>
                Contact
              </a>
              {!loggedIn && (
                <Link to="/login" onClick={closeMenu}>
                  Sign in
                </Link>
              )}
              <Link
                className="lp-btn lp-btn-menu"
                to={bookTo}
                onClick={closeMenu}
              >
                Book a visit
              </Link>
            </nav>

            <Link className="lp-btn lp-btn-header" to={bookTo}>
              Book a visit
            </Link>
          </div>
        </header>

        <div className="lp-hero-inner">
          <div className="lp-hero-intro">
            <h1>Luxury care your dog deserves.</h1>
            <p className="lp-hero-sub">
              An intimate boutique spa where calm, low-stress care always
              comes first for your dog.
            </p>
            <div className="lp-hero-actions">
              <Link className="lp-btn lp-hero-cta" to={bookTo}>
                Book a visit
              </Link>
              <a className="lp-btn-outline" href="#services">
                See our services ↓
              </a>
            </div>
          </div>
        </div>
      </section>

      <main id="main">
        <section className="lp-about" id="about">
          <div className="lp-about-wrap">
            <div className="lp-about-split">
              <div className="lp-about-media">
                <img
                  className="lp-about-photo"
                  src={interiorPhoto}
                  alt="Calm interior of the Paw Care grooming salon"
                  width={1200}
                  height={900}
                  loading="lazy"
                />
              </div>

              <div className="lp-about-copy">
                <p className="lp-about-kicker">See our interior</p>
                <h2>Stress-free grooming in a calm space</h2>
                <p className="lp-about-lead">
                  A quiet salon designed for calm, one-on-one grooming.
                </p>
                <p className="lp-about-body">
                  Paw Care Groomer is more than a dog haircut. It’s a quiet
                  haven — no rush, no noise. We work at your dog’s pace, with
                  positive, gentle methods.
                </p>

                <ul className="lp-points">
                  <li>
                    <span className="lp-point-icon" aria-hidden>
                      <svg viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 3.2c.4 2.2-.2 3.8-1.4 5.2-1.3 1.5-2 3-1.6 4.8.5 2.2 2.4 3.8 4.6 3.8s4.1-1.6 4.6-3.8c.4-1.8-.3-3.3-1.6-4.8C15.4 7 14.8 5.4 15.2 3.2"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M8.2 14.2c-1.6.4-2.8 1.6-3.1 3.2-.4 2 1 3.8 3 4.1 1.5.2 2.8-.4 3.6-1.5"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M15.8 14.2c1.6.4 2.8 1.6 3.1 3.2.4 2-1 3.8-3 4.1-1.5.2-2.8-.4-3.6-1.5"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <span>Natural, hypoallergenic products</span>
                  </li>
                  <li>
                    <span className="lp-point-icon" aria-hidden>
                      <svg viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 20.4s-6.2-3.8-7.8-7.2C2.8 10.2 4.2 7 7.1 7c1.6 0 2.9.9 3.6 2.1C11.4 7.9 12.7 7 14.3 7c2.9 0 4.3 3.2 2.9 6.2-1.6 3.4-7.8 7.2-7.8 7.2Z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span>Dedicated one-on-one time for every dog</span>
                  </li>
                  <li>
                    <span className="lp-point-icon" aria-hidden>
                      <svg viewBox="0 0 24 24" fill="none">
                        <path
                          d="M8.5 4.5 14 10l-3.2 3.2L5.3 7.7 8.5 4.5Z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M14 10.2c1.8 1.8 4.7 1.5 6.2-.2"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M5.2 14.2 9.8 18.8"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <path
                          d="M4.2 19.2c1.4-1.4 3.3-1.5 4.6-.4"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <span>Professional tools and certified groomers</span>
                  </li>
                </ul>

                <Link className="lp-btn lp-about-cta" to={bookTo}>
                  Book a visit at our salon
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-transforms" id="transforms">
          <div className="lp-section-head">
            <p className="lp-kicker">Before &amp; after</p>
            <h2>Results of our work</h2>
            <p className="lp-sub">
              See everyday coats transformed into healthy, beautiful finishes.
            </p>
          </div>

          <div
            className="lp-slider"
            role="region"
            aria-roledescription="carousel"
            aria-label="Before and after transformations"
            id={sliderId}
          >
            <div className="lp-slider-stage">
              <div
                className="lp-slider-rail"
                style={{ transform: `translate3d(-${slide * 100}%, 0, 0)` }}
              >
                {transforms.map((item, index) => (
                  <div
                    key={item.src}
                    className="lp-slider-pane"
                    aria-hidden={index !== slide}
                  >
                    <BeforeAfterPair
                      src={item.src}
                      alt={item.alt}
                      beforeCaption={item.beforeCaption}
                      afterCaption={item.afterCaption}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="lp-slider-controls">
              <div
                className="lp-slider-progress"
                role="tablist"
                aria-label="Transformations"
              >
                <div className="lp-slider-track" aria-hidden>
                  <div
                    className="lp-slider-thumb"
                    style={{
                      left: `${(slide / Math.max(transforms.length - 1, 1)) * 100}%`,
                    }}
                  />
                </div>
                {transforms.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    role="tab"
                    aria-selected={index === slide}
                    aria-label={`Show transformation ${index + 1}`}
                    className={`lp-slider-mark${index === slide ? ' is-active' : ''}`}
                    onClick={() => setSlide(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="lp-services" id="services">
          <div className="lp-services-inner">
            <div className="lp-section-head lp-services-head">
              <p className="lp-kicker">Our services</p>
              <h2>Care tailored to your dog</h2>
              <p className="lp-section-lead">
                Choose the visit that fits your dog’s coat and temperament.
              </p>
            </div>

            <div className="lp-cards">
              <article className="lp-card">
                <span className="lp-card-icon" aria-hidden>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M8.5 4.5 14 10l-3.2 3.2L5.3 7.7 8.5 4.5Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 10.2c1.8 1.8 4.7 1.5 6.2-.2"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                    <path
                      d="M5.2 14.2 9.8 18.8"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                    <path
                      d="M4.2 19.2c1.4-1.4 3.3-1.5 4.6-.4"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <h3>Full grooming</h3>
                <p>Bath, breed-style or custom cut, ears &amp; nails.</p>
              </article>

              <article className="lp-card">
                <span className="lp-card-icon" aria-hidden>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 3.2c.4 2.2-.2 3.8-1.4 5.2-1.3 1.5-2 3-1.6 4.8.5 2.2 2.4 3.8 4.6 3.8s4.1-1.6 4.6-3.8c.4-1.8-.3-3.3-1.6-4.8C15.4 7 14.8 5.4 15.2 3.2"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                    <path
                      d="M8.2 14.2c-1.6.4-2.8 1.6-3.1 3.2-.4 2 1 3.8 3 4.1 1.5.2 2.8-.4 3.6-1.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                    <path
                      d="M15.8 14.2c1.6.4 2.8 1.6 3.1 3.2.4 2-1 3.8-3 4.1-1.5.2-2.8-.4-3.6-1.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <h3>Spa &amp; recovery</h3>
                <p>Nourishing mask, coat care, and gentle conditioning bath.</p>
              </article>

              <article className="lp-card">
                <span className="lp-card-icon" aria-hidden>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 20.4s-6.2-3.8-7.8-7.2C2.8 10.2 4.2 7 7.1 7c1.6 0 2.9.9 3.6 2.1C11.4 7.9 12.7 7 14.3 7c2.9 0 4.3 3.2 2.9 6.2-1.6 3.4-7.8 7.2-7.8 7.2Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <h3>First visit (puppies)</h3>
                <p>Low-stress intro to tools, scents, and touch.</p>
              </article>
            </div>

            <div className="lp-services-cta">
              <Link className="lp-btn-outline lp-btn-outline-sage" to="/pricing">
                View full pricing →
              </Link>
            </div>
          </div>
        </section>

        <section className="lp-testimonials" id="testimonials">
          <div className="lp-testimonials-inner">
            <div className="lp-section-head lp-testimonials-head">
              <p className="lp-kicker">Testimonials</p>
              <h2>What owners say</h2>
              <p className="lp-section-lead">
                Real experiences from pet owners who trust our salon.
              </p>
            </div>

            <div className="lp-quotes">
              <blockquote className="lp-quote">
                <div className="lp-quote-stars" aria-label="5 out of 5 stars">
                  ★★★★★
                </div>
                <p>
                  “The best groomer in town. My poodle always leaves calm, fresh,
                  and perfectly trimmed.”
                </p>
                <footer>
                  <span className="lp-quote-name">— Anna K.</span>
                  <span className="lp-quote-pet">Milo, Poodle</span>
                </footer>
              </blockquote>

              <blockquote className="lp-quote">
                <div className="lp-quote-stars" aria-label="5 out of 5 stars">
                  ★★★★★
                </div>
                <p>
                  “The salon atmosphere is wonderful. No noise, no stress for our
                  dog.”
                </p>
                <footer>
                  <span className="lp-quote-name">— Piotr M.</span>
                  <span className="lp-quote-pet">Luna, Golden</span>
                </footer>
              </blockquote>

              <blockquote className="lp-quote">
                <div className="lp-quote-stars" aria-label="5 out of 5 stars">
                  ★★★★★
                </div>
                <p>
                  “Gentle care and absolute calm. My rescue dog felt completely
                  safe.”
                </p>
                <footer>
                  <span className="lp-quote-name">— Marta S.</span>
                  <span className="lp-quote-pet">Rocco, Mix</span>
                </footer>
              </blockquote>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer" id="contact">
        <div className="lp-footer-cta">
          <h2>Ready for a visit?</h2>
          <p>
            Take care of your dog’s coat today — book a calm, one-on-one
            appointment.
          </p>
          <Link className="lp-btn lp-footer-book" to={bookTo}>
            Book a visit now
          </Link>
        </div>

        <div className="lp-footer-panel">
          <div className="lp-footer-inner">
            <div className="lp-footer-grid">
              <div className="lp-footer-brand-col">
                <BrandLogo variant="mini" className="lp-footer-logo" />
                <p className="lp-footer-tagline">
                  A luxury spa experience designed for your dog’s calm &amp;
                  well-being.
                </p>
              </div>

              <div>
                <h3 className="lp-footer-label">Contact</h3>
                <a href="tel:+48123456789">+48 123 456 789</a>
                <a href="mailto:hello@pawcare.pl">hello@pawcare.pl</a>
                <p>Warsaw, Poland</p>
              </div>

              <div>
                <h3 className="lp-footer-label">Hours</h3>
                <p>Mon–Fri 9:00–18:00</p>
                <p>Sat 10:00–15:00</p>
              </div>

              <div>
                <h3 className="lp-footer-label">Navigate</h3>
                <div className="lp-footer-links">
                  <a href="#about">About us</a>
                  <a href="#services">Services</a>
                  <Link to="/pricing">Pricing</Link>
                  {loggedIn ? (
                    <Link to="/app">Go to app</Link>
                  ) : (
                    <>
                      <Link to="/login">Sign in</Link>
                      <Link to="/register">Register</Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lp-footer-copy-bar">
            <p className="lp-footer-copy">
              © 2026 Paw Care Groomer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
