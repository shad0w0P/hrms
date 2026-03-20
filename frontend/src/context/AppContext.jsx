import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const ToastCtx = createContext(null)
const ThemeCtx = createContext(null)

export const useToast = () => useContext(ToastCtx)
export const useTheme = () => useContext(ThemeCtx)

export function AppProvider({ children }) {
  const [dark, setDark] = useState(true)
  const [toasts, setToasts] = useState([])

  const toast = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500)
  }, [])

  useEffect(() => {
    document.body.className = dark ? '' : 'light'
  }, [dark])

  return (
    <ThemeCtx.Provider value={{ dark, setDark }}>
      <ToastCtx.Provider value={toast}>
        {children}
        <ToastStack toasts={toasts} />
      </ToastCtx.Provider>
    </ThemeCtx.Provider>
  )
}

function ToastStack({ toasts }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--card)', border: '1px solid var(--border)',
          borderLeft: `3px solid ${t.type === 'success' ? 'var(--green)' : 'var(--red)'}`,
          borderRadius: 10, padding: '11px 16px', fontSize: 13,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          animation: 'toastIn 0.2s ease', minWidth: 220,
        }}>
          <span style={{ fontSize: 16 }}>{t.type === 'success' ? '✓' : '✕'}</span>
          {t.msg}
        </div>
      ))}
      <style>{`@keyframes toastIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
    </div>
  )
}
