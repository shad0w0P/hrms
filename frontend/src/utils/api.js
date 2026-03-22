export const DEPT_COLORS = {
  Engineering:       '#3b82f6',
  Operations:        '#f97316',
  Sales:             '#22c55e',
  Product:           '#a855f7',
  Design:            '#ec4899',
  Marketing:         '#f59e0b',
  Finance:           '#06b6d4',
  'Human Resources': '#8b5cf6',
  'Customer Support':'#14b8a6',
  Legal:             '#ef4444',
}

export const DEPARTMENTS = Object.keys(DEPT_COLORS)

export const STATUS_COLORS = {
  Present:  { bg: 'var(--green-s)',  color: 'var(--green)'  },
  Absent:   { bg: 'var(--red-s)',    color: 'var(--red)'    },
  Late:     { bg: 'var(--yellow-s)', color: 'var(--yellow)' },
  Holiday:  { bg: 'var(--blue-s)',   color: 'var(--blue)'   },
  Unmarked: { bg: 'transparent',     color: 'var(--txt3)'   },
}

const API = import.meta.env.VITE_API_URL;

export async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || 'Request failed');
  }

  return res.json();
}

export function avatarColor(department) {
  return DEPT_COLORS[department] || '#6c63ff'
}

export function today() {
  return new Date().toISOString().split('T')[0]
}

export function daysAgo(n) {
  return new Date(Date.now() - n * 86400000).toISOString().split('T')[0]
}

export function formatDate(iso) {
  const d = new Date(iso)
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  return { day: d.getDate(), dow: days[d.getDay()] }
}
