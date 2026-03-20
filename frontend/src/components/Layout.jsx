import { NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Users, CalendarDays, CreditCard,
  BarChart2, Sun, Moon, Search, X, Menu, ChevronRight
} from 'lucide-react'
import { useTheme } from '../context/AppContext'
import { api, DEPT_COLORS } from '../utils/api'
import { Avatar } from './UI'

const NAV = [
  { to: '/',           label: 'Dashboard', icon: LayoutDashboard },
  { to: '/employees',  label: 'Employees', icon: Users           },
  { to: '/attendance', label: 'Attendance', icon: CalendarDays   },
  { to: '/payroll',    label: 'Payroll',    icon: CreditCard      },
  { to: '/reports',    label: 'Reports',    icon: BarChart2       },
]

/* ── SEARCH MODAL ─────────────────────────────────────────────────────── */
function SearchModal({ onClose }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (q.length < 2) { setResults([]); return }
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const d = await api(`/employees?search=${encodeURIComponent(q)}&limit=8`)
        setResults(d.employees || [])
      } catch {}
      finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(t)
  }, [q])

  useEffect(() => {
    document.querySelector('.search-modal-input')?.focus()
  }, [])

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-start',
      justifyContent: 'center', zIndex: 999, padding: '80px 20px',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 16, width: '100%', maxWidth: 580, overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
          <Search size={16} color="var(--txt3)" />
          <input
            className="search-modal-input"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search employees by name, department..."
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontSize: 15, color: 'var(--txt)',
            }}
          />
          {q && <button onClick={() => setQ('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--txt3)' }}><X size={14} /></button>}
          <span style={{
            background: 'var(--border)', borderRadius: 5, padding: '2px 7px',
            fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--txt3)',
          }}>ESC</span>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 400, overflowY: 'auto', padding: 8 }}>
          {q.length < 2 && (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--txt3)', fontSize: 13 }}>
              Type to search employees...
            </div>
          )}
          {q.length >= 2 && !loading && results.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--txt3)', fontSize: 13 }}>
              No employees found for "{q}"
            </div>
          )}
          {results.map(emp => (
            <div key={emp.id} onClick={onClose} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
              transition: 'background 0.1s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--card-h)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Avatar initials={emp.avatar_initials} department={emp.department} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{emp.name}</div>
                <div style={{ fontSize: 12, color: 'var(--txt2)' }}>{emp.designation} · {emp.department}</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--txt3)', fontFamily: 'JetBrains Mono' }}>{emp.emp_id}</div>
              <ChevronRight size={14} color="var(--txt3)" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── TOPBAR ───────────────────────────────────────────────────────────── */
function Topbar({ onSearch, onMenuToggle }) {
  const loc = useLocation()
  const titles = { '/': 'Dashboard', '/employees': 'Employees', '/attendance': 'Attendance', '/payroll': 'Payroll', '/reports': 'Reports' }
  const title = titles[loc.pathname] || 'HRMS Lite'

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', height: 60, borderBottom: '1px solid var(--border)',
      background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 50,
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={onMenuToggle} className="mobile-menu-btn" style={{
          display: 'none', background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--txt2)', padding: 4,
        }}>
          <Menu size={20} />
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.4px' }}>{title}</h1>
      </div>
      <button onClick={onSearch} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 14px', background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 9, color: 'var(--txt2)', cursor: 'pointer', fontSize: 13,
        transition: 'all 0.15s', minWidth: 200, justifyContent: 'space-between',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--txt)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--txt2)' }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Search size={14} />
          Search anything...
        </span>
        <span style={{
          background: 'var(--border)', borderRadius: 5, padding: '1px 7px',
          fontSize: 11, fontFamily: 'JetBrains Mono',
        }}>Ctrl+K</span>
      </button>
    </header>
  )
}

/* ── SIDEBAR ──────────────────────────────────────────────────────────── */
function Sidebar({ open, onClose }) {
  const { dark, setDark } = useTheme()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div onClick={onClose} style={{
          display: 'none', position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 98,
        }} className="sidebar-overlay" />
      )}

      <aside style={{
        width: 220, background: 'var(--bg2)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', position: 'fixed',
        top: 0, left: 0, height: '100vh', zIndex: 99, padding: '20px 12px',
        transition: 'transform 0.25s ease',
      }} className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 10px', marginBottom: 28 }}>
          <div style={{
            width: 34, height: 34, background: 'var(--accent)', borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-1px',
          }}>H</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--txt)', lineHeight: 1 }}>HRMS</div>
            <div style={{ fontSize: 10, color: 'var(--txt3)', fontWeight: 500 }}>Lite</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 9,
                color: isActive ? '#fff' : 'var(--txt2)',
                background: isActive ? 'var(--accent-s)' : 'transparent',
                fontSize: 13.5, fontWeight: isActive ? 600 : 500,
                transition: 'all 0.15s', border: 'none',
                borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              })}
              onMouseEnter={e => { if (!e.currentTarget.className.includes('active')) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--txt)' } }}
              onMouseLeave={e => { if (!e.currentTarget.className.includes('active')) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--txt2)' } }}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ paddingTop: 12, borderTop: '1px solid var(--border2)' }}>
          <button onClick={() => setDark(d => !d)} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 9, width: '100%',
            background: 'none', border: 'none', color: 'var(--txt2)',
            fontSize: 13.5, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--txt)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--txt2)' }}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
            {dark ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </aside>
    </>
  )
}

/* ── LAYOUT ───────────────────────────────────────────────────────────── */
export default function Layout({ children }) {
  const [showSearch, setShowSearch] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const h = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setShowSearch(true) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }} className="main-content">
        <Topbar onSearch={() => setShowSearch(true)} onMenuToggle={() => setSidebarOpen(o => !o)} />
        <main style={{ flex: 1, padding: '24px 28px', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}

      <style>{`
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.sidebar-open { transform: translateX(0); }
          .sidebar-overlay { display: block !important; }
          .mobile-menu-btn { display: flex !important; }
          .main-content { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  )
}
