import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { api, clearAuth, getStoredUser, patchStoredUser } from '../api/api'
import BrandLogo from './BrandLogo'
import {
  IconCalendar,
  IconHome,
  IconLogout,
  IconPaw,
  IconTag,
  IconUser,
  IconUsers,
} from './AppIcons'

const STAFF_ROLES = ['ADMIN', 'RECEPTION', 'GROOMER']

function navClass({ isActive }) {
  return `as-nav-link${isActive ? ' is-active' : ''}`
}

function greetingName(user) {
  if (user?.displayName?.trim()) return user.displayName.trim()
  const login = user?.login || ''
  if (login.includes('@')) return login.split('@')[0]
  return login || 'Guest'
}

export default function AppShell() {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => getStoredUser())
  const role = user?.role
  const isOwner = role === 'PET_OWNER'
  const isStaff = STAFF_ROLES.includes(role)
  const isAdmin = role === 'ADMIN'
  const isReceptionDesk = role === 'RECEPTION' || isAdmin
  const isGroomer = role === 'GROOMER'
  const homeTo = isReceptionDesk ? '/reception' : '/app'
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (user?.displayName) return

    let cancelled = false

    async function loadName() {
      try {
        if (isOwner) {
          const account = await api('/api/me/account')
          if (cancelled || !account?.firstName) return
          patchStoredUser({ displayName: account.firstName })
          setUser(getStoredUser())
          return
        }
        if (isGroomer) {
          const profile = await api('/api/groomers/me')
          if (cancelled || !profile?.displayName) return
          patchStoredUser({ displayName: profile.displayName })
          setUser(getStoredUser())
        }
      } catch {
        /* ignore — keep login fallback */
      }
    }

    void loadName()
    return () => {
      cancelled = true
    }
  }, [isOwner, isGroomer, user?.displayName])

  function logout() {
    clearAuth()
    navigate('/login')
  }

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <div className={`as bg-paw-pattern${menuOpen ? ' is-menu-open' : ''}`}>
      <button
        type="button"
        className="as-backdrop"
        aria-label="Close menu"
        onClick={closeMenu}
      />

      <aside className="as-sidebar" aria-label="App navigation">
        <div className="as-sidebar-top">
          <BrandLogo variant="mini" to={homeTo} className="as-brand" onClick={closeMenu} />

          <div className="as-profile">
            <p className="as-hello">Hello, {greetingName(user)}</p>
            {role && (
              <span className="as-role">
                {role
                  .replace(/_/g, ' ')
                  .toLowerCase()
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
            )}
          </div>

          <nav className="as-nav">
            <p className="as-nav-label">Menu</p>

            {isGroomer && (
              <NavLink to="/app" end className={navClass} onClick={closeMenu}>
                <IconHome className="as-nav-icon" />
                Overview
              </NavLink>
            )}

            {isReceptionDesk && (
              <NavLink to="/reception" className={navClass} onClick={closeMenu}>
                <IconUsers className="as-nav-icon" />
                Reception
              </NavLink>
            )}

            {isOwner && (
              <>
                <NavLink to="/app" end className={navClass} onClick={closeMenu}>
                  <IconHome className="as-nav-icon" />
                  Overview
                </NavLink>
                <NavLink to="/pets" className={navClass} onClick={closeMenu}>
                  <IconPaw className="as-nav-icon" />
                  My pets
                </NavLink>
                <NavLink to="/visits" className={navClass} onClick={closeMenu}>
                  <IconCalendar className="as-nav-icon" />
                  My visits
                </NavLink>
                <NavLink to="/account" className={navClass} onClick={closeMenu}>
                  <IconUser className="as-nav-icon" />
                  Account
                </NavLink>
              </>
            )}

            {isStaff && (
              <NavLink to="/staff/visits" className={navClass} onClick={closeMenu}>
                <IconCalendar className="as-nav-icon" />
                Day schedule
              </NavLink>
            )}

            {isAdmin && (
              <>
                <NavLink to="/admin/staff" className={navClass} onClick={closeMenu}>
                  <IconUsers className="as-nav-icon" />
                  Create staff
                </NavLink>
                <NavLink to="/admin/pricing" className={navClass} onClick={closeMenu}>
                  <IconTag className="as-nav-icon" />
                  Manage pricing
                </NavLink>
                <a href="/pricing" className="as-nav-link" onClick={closeMenu}>
                  <IconTag className="as-nav-icon" />
                  View pricing
                </a>
              </>
            )}
          </nav>
        </div>

        <button type="button" className="as-logout" onClick={logout}>
          <IconLogout className="as-nav-icon" />
          Sign out
        </button>
      </aside>

      <div className="as-main">
        <header className="as-topbar">
          <button
            type="button"
            className="as-menu-btn"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
          <BrandLogo variant="mini" to={homeTo} className="as-topbar-brand" />
        </header>

        <div className="as-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
