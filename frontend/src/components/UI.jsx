import { useState, useRef, useEffect } from 'react'
import { avatarColor } from '../utils/api'

/* ── AVATAR ─────────────────────────────────────────────────────────── */
export function Avatar({ initials, department, size = 34 }) {
  const bg = avatarColor(department)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg + '28', color: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, flexShrink: 0,
      letterSpacing: '-0.5px',
    }}>
      {initials}
    </div>
  )
}

/* ── DEPT TAG ────────────────────────────────────────────────────────── */
export function DeptTag({ department }) {
  const c = avatarColor(department)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 99,
      background: c + '18', color: c,
      fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
      {department}
    </span>
  )
}

/* ── STATUS BADGE ────────────────────────────────────────────────────── */
export function StatusBadge({ status }) {
  const isActive = status === 'Active'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 12, fontWeight: 500,
      color: isActive ? 'var(--green)' : 'var(--txt3)',
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: isActive ? 'var(--green)' : 'var(--txt3)',
      }} />
      {status}
    </span>
  )
}

/* ── CARD ────────────────────────────────────────────────────────────── */
export function Card({ children, style, className }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 16, padding: 22, ...style,
    }} className={className}>
      {children}
    </div>
  )
}

/* ── BTN ─────────────────────────────────────────────────────────────── */
export function Btn({ children, variant = 'primary', size = 'md', onClick, disabled, style }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    borderRadius: 9, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 500, transition: 'all 0.15s', opacity: disabled ? 0.6 : 1,
    fontFamily: 'inherit',
  }
  const sizes = { sm: { padding: '6px 12px', fontSize: 12 }, md: { padding: '8px 16px', fontSize: 13 }, icon: { padding: 8, fontSize: 13 } }
  const variants = {
    primary:  { background: 'var(--accent)',  color: '#fff' },
    secondary:{ background: 'var(--card)',    color: 'var(--txt)', border: '1px solid var(--border)' },
    ghost:    { background: 'transparent',    color: 'var(--txt2)' },
    danger:   { background: 'var(--red-s)',   color: 'var(--red)' },
  }
  return (
    <button style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

/* ── INPUT ───────────────────────────────────────────────────────────── */
export function Input({ icon, style, ...props }) {
  return (
    <div style={{ position: 'relative', ...style }}>
      {icon && (
        <span style={{
          position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--txt3)', display: 'flex', pointerEvents: 'none',
        }}>{icon}</span>
      )}
      <input style={{
        width: '100%', background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 9, padding: icon ? '9px 14px 9px 34px' : '9px 14px',
        color: 'var(--txt)', outline: 'none', transition: 'border-color 0.15s',
      }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
        {...props}
      />
    </div>
  )
}

/* ── SELECT ──────────────────────────────────────────────────────────── */
export function Select({ children, style, ...props }) {
  return (
    <select style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 9, padding: '9px 14px', color: 'var(--txt)',
      outline: 'none', cursor: 'pointer', ...style,
    }}
      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
      onBlur={e => e.target.style.borderColor = 'var(--border)'}
      {...props}>
      {children}
    </select>
  )
}

/* ── MODAL ───────────────────────────────────────────────────────────── */
export function Modal({ title, onClose, children, width = 480 }) {
  useEffect(() => {
    const h = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 500, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 18, padding: 28, width: '100%', maxWidth: width,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--txt2)', fontSize: 20, lineHeight: 1, padding: 4,
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ── FORM FIELD ──────────────────────────────────────────────────────── */
export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 600,
        color: 'var(--txt2)', marginBottom: 6,
        textTransform: 'uppercase', letterSpacing: '0.5px',
      }}>{label}</label>
      {children}
    </div>
  )
}

/* ── SPINNER ─────────────────────────────────────────────────────────── */
export function Spinner({ size = 20 }) {
  return (
    <div style={{
      width: size, height: size,
      border: '2px solid var(--border)',
      borderTopColor: 'var(--accent)',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
      margin: '0 auto',
    }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

/* ── DROPDOWN MENU ───────────────────────────────────────────────────── */
export function Dropdown({ trigger, children }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 6, minWidth: 150, zIndex: 100,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          {children(setOpen)}
        </div>
      )}
    </div>
  )
}

export function DropItem({ children, onClick, danger }) {
  return (
    <div onClick={onClick} style={{
      padding: '8px 12px', borderRadius: 7, fontSize: 13,
      cursor: 'pointer', color: danger ? 'var(--red)' : 'var(--txt)',
      transition: 'background 0.1s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--card-h)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {children}
    </div>
  )
}

/* ── SECTION HEADER ──────────────────────────────────────────────────── */
export function SectionHeader({ children }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 600, letterSpacing: '0.8px',
      textTransform: 'uppercase', color: 'var(--txt3)', marginBottom: 14,
    }}>{children}</p>
  )
}

/* ── EMPTY STATE ─────────────────────────────────────────────────────── */
export function Empty({ icon, text }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 10, padding: '32px 20px',
      color: 'var(--txt3)',
    }}>
      <span style={{ fontSize: 28 }}>{icon}</span>
      <span style={{ fontSize: 12 }}>{text}</span>
    </div>
  )
}
