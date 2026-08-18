import { NavLink, Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, LogOut, Menu, X, User as UserIcon, Cloud } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useAuth } from '../lib/auth'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/productos', label: 'Productos', icon: Package, end: false },
  { to: '/perfil', label: 'Perfil', icon: UserIcon, end: false },
]

function Brand() {
  return (
    <Link to="/" className="brand" style={{ textDecoration: 'none' }}>
      <img src="/logo.svg" alt="WooUpload" className="brand-logo" />
      <span className="brand-name">Woo<span>Upload</span></span>
    </Link>
  )
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Icon />
          {label}
        </NavLink>
      ))}
    </>
  )
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar hidden-mobile">
        <Brand />
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <NavLinks />
        </nav>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, var(--c-primary), var(--c-violet))',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 14,
            }}>
              {(profile?.full_name || 'U').charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.full_name || 'Usuario'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--c-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.id ? '' : ''}
              </div>
            </div>
          </div>
          <button className="nav-item" onClick={handleSignOut} style={{ width: '100%', textAlign: 'left' }}>
            <LogOut />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className={`drawer-backdrop ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />
      {drawerOpen && (
        <div className="drawer">
          <div className="flex items-center justify-between mb-4">
            <Brand />
            <button className="btn-icon btn-secondary" onClick={() => setDrawerOpen(false)}>
              <X size={18} />
            </button>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <NavLinks onNavigate={() => setDrawerOpen(false)} />
          </nav>
          <button className="nav-item mt-4" onClick={() => { setDrawerOpen(false); handleSignOut() }}>
            <LogOut />
            Cerrar sesión
          </button>
        </div>
      )}

      <div className="main-area">
        <header className="topbar">
          <button
            className="btn-icon btn-secondary menu-toggle"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2" style={{ color: 'var(--c-text-muted)' }}>
            <Cloud size={18} style={{ color: 'var(--c-primary)' }} />
            <span className="text-sm font-bold hidden-mobile">Panel de productos</span>
          </div>
          <div className="flex-1" />
          <Link to="/perfil" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--c-primary), var(--c-violet))',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 13,
            }}>
              {(profile?.full_name || 'U').charAt(0).toUpperCase()}
            </div>
          </Link>
        </header>

        <main className="page">{children}</main>

        <nav className="bottom-nav">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
