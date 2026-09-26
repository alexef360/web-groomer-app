from pathlib import Path

p = Path(r"A:\JAva\web-groomer-app\frontend\src\index.css")
text = p.read_text(encoding="utf-8")
start = text.index(".lp-hero {")
end = text.index(".lp-section-head {")
new = r"""
.lp-hero {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100vw;
  max-width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  min-height: min(100svh, 860px);
  padding: 0;
  overflow: hidden;
}

.lp-hero-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  z-index: 0;
}

.lp-hero-shade {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    to top,
    rgba(20, 20, 18, 0.35) 0%,
    transparent 40%
  );
  pointer-events: none;
}

.lp-hero-inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  flex: 1;
  width: min(1100px, 100%);
  margin: 0 auto;
  padding: 0.75rem clamp(1rem, 4vw, 2rem) 2.5rem;
}

.lp-hero .lp-nav {
  width: 100%;
  margin: 0;
  padding: 0.55rem 0.85rem;
  justify-content: space-between;
  gap: 1rem;
  border-radius: 12px;
  background: rgba(20, 20, 18, 0.42);
  backdrop-filter: blur(8px);
  box-shadow:
    0 8px 28px rgba(0, 0, 0, 0.35),
    0 1px 0 rgba(243, 238, 230, 0.08) inset;
}

.lp-hero .lp-logo.brand-logo--mini .brand-logo-mini {
  width: min(160px, 42vw);
}

.lp-hero .lp-btn-header {
  display: none;
}

/* Under the baked-in “Paw Care Groomer” on the left of the photo */
.lp-hero-intro {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  align-self: flex-start;
  gap: 0.95rem;
  max-width: 22rem;
  margin-top: clamp(10.5rem, 34vh, 18rem);
  margin-left: clamp(0.25rem, 1.5vw, 1rem);
}

.lp-hero-intro h1 {
  margin: 0;
  font-family: "Cormorant Garamond", var(--font-display), Georgia, serif;
  font-size: clamp(1.35rem, 3.4vw, 1.85rem);
  font-weight: 600;
  line-height: 1.2;
  color: #f3eee6;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.55);
}

.lp-hero .lp-nav,
.lp-hero .lp-burger,
.lp-hero .lp-menu.is-open {
  position: relative;
  z-index: 3;
}

.lp-hero .lp-menu.is-open {
  position: fixed;
  background: rgba(20, 20, 18, 0.96);
}

.lp-hero .lp-menu a {
  color: #e8e2d8;
}

.lp-hero .lp-burger {
  border-color: rgba(243, 238, 230, 0.35);
  background: rgba(20, 20, 18, 0.35);
  margin-left: auto;
}

"""
p.write_text(text[:start] + new + text[end:], encoding="utf-8")
print("ok")
