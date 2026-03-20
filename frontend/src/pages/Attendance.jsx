import { useState, useEffect, useRef } from 'react'
import { Search, RefreshCw, Info } from 'lucide-react'
import { api, DEPT_COLORS, today, daysAgo, formatDate } from '../utils/api'
import { useToast } from '../context/AppContext'
import { Card, DeptTag, Avatar, Btn, Input, Spinner } from '../components/UI'

const STATUS_OPTS = ['Unmarked', 'Present', 'Absent', 'Late', 'Holiday']
const STATUS_STYLE = {
  Present:  { bg: 'var(--green-s)',  color: 'var(--green)'  },
  Absent:   { bg: 'var(--red-s)',    color: 'var(--red)'    },
  Late:     { bg: 'var(--yellow-s)', color: 'var(--yellow)' },
  Holiday:  { bg: 'var(--blue-s)',   color: 'var(--blue)'   },
  Unmarked: { bg: 'transparent',     color: 'var(--txt3)'   },
}

function AttCell({ status, empId, date, onUpdate }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()
  const s = STATUS_STYLE[status] || STATUS_STYLE.Unmarked

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <td style={{ textAlign: 'center', padding: '10px 8px', position: 'relative' }}>
      <div ref={ref} style={{ display: 'inline-block' }}>
        <span onClick={() => setOpen(o => !o)} style={{
          display: 'inline-block', padding: '3px 9px', borderRadius: 6,
          background: s.bg, color: s.color, fontSize: 11.5, fontWeight: 500,
          cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none',
          transition: 'opacity 0.1s',
        }}>{status}</span>
        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% - 4px)', left: '50%', transform: 'translateX(-50%)',
            background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10,
            padding: 5, zIndex: 50, minWidth: 120, boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}>
            {STATUS_OPTS.map(s => (
              <div key={s} onClick={() => { onUpdate(empId, date, s); setOpen(false) }} style={{
                padding: '7px 12px', borderRadius: 7, fontSize: 12, cursor: 'pointer',
                background: s === status ? 'var(--accent-s)' : 'transparent',
                color: s === status ? 'var(--accent)' : 'var(--txt)',
                fontWeight: s === status ? 600 : 400,
              }}
                onMouseEnter={e => { if (s !== status) e.currentTarget.style.background = 'var(--card-h)' }}
                onMouseLeave={e => { if (s !== status) e.currentTarget.style.background = 'transparent' }}
              >{s}</div>
            ))}
          </div>
        )}
      </div>
    </td>
  )
}

export default function Attendance() {
  const toast = useToast()
  const [from, setFrom] = useState(daysAgo(6))
  const [to, setTo] = useState(today())
  const [search, setSearch] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ date_from: from, date_to: to })
      if (search) p.set('search', search)
      setData(await api(`/attendance?${p}`))
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [from, to, search])

  const update = async (empId, date, status) => {
    try {
      await api(`/attendance/${empId}/${date}`, { method: 'PUT', body: { status } })
      toast(`Marked ${status}`)
      load()
    } catch (e) { toast(e.message, 'error') }
  }

  const s = data?.summary
  const rate = s?.attendance_rate ?? 0
  const rateColor = rate >= 75 ? 'var(--green)' : rate >= 40 ? 'var(--yellow)' : 'var(--red)'
  const rateLabel = rate >= 75 ? 'High' : rate >= 40 ? 'Mid' : 'Low'
  const dr = data?.date_range || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* Date controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>From</span>
        <input type="date" value={from} max={to}
          onChange={e => setFrom(e.target.value)}
          style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 9, padding: '8px 12px', color: 'var(--txt)', fontSize: 13, outline: 'none', cursor: 'pointer', colorScheme: 'dark' }}
        />
        <span style={{ fontSize: 11, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>To</span>
        <input type="date" value={to} min={from} max={today()}
          onChange={e => setTo(e.target.value)}
          style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 9, padding: '8px 12px', color: 'var(--txt)', fontSize: 13, outline: 'none', cursor: 'pointer', colorScheme: 'dark' }}
        />
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--txt3)' }}>
          <Info size={12} /> Max 7 days
        </span>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr', gap: 16 }}>
        <Card>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--txt3)', marginBottom: 14 }}>Summary</div>
          {[
            ['Present', 'present', 'var(--green)'],
            ['On Time', 'on_time', 'var(--green)'],
            ['Late', 'late', 'var(--yellow)'],
            ['Absent', 'absent', 'var(--red)'],
            ['Holiday', 'holiday', 'var(--blue)'],
            ['Unmarked', 'unmarked', 'var(--txt3)'],
          ].map(([label, key, color]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', fontSize: 13 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
                {label}
              </span>
              <span style={{ fontWeight: 600, color, fontFamily: 'JetBrains Mono' }}>{s?.[key] ?? 0}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 13 }}>
            <span>Total</span><span style={{ fontFamily: 'JetBrains Mono' }}>{s?.total ?? 0}</span>
          </div>
        </Card>

        <Card style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: 16, right: 18, fontSize: 12, color: 'var(--txt3)' }}>
            {data?.employees?.length ?? 0} records
          </div>
          <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1, color: rateColor }}>
            {rate}%
            <span style={{
              display: 'inline-block', marginLeft: 10, fontSize: 12, fontWeight: 700,
              background: rateColor, color: '#fff', borderRadius: 5, padding: '2px 8px', verticalAlign: 'middle',
            }}>{rateLabel}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Attendance Rate</div>
          {s && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
              {[['On Time', s.on_time, 'var(--green)'], ['Late', s.late, 'var(--yellow)'], ['Absent', s.absent, 'var(--red)'], ['Unmarked', s.unmarked, 'var(--txt3)']].map(([label, val, color]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 11px', borderRadius: 99, background: color + '18', color, fontSize: 12, fontWeight: 500 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />
                  {label}: {val}
                </div>
              ))}
            </div>
          )}
          {!s && <div style={{ fontSize: 13, color: 'var(--txt2)', marginTop: 12 }}>No data for this period</div>}
        </Card>
      </div>

      {/* Attendance grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17 }}>Attendance</div>
            <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 2 }}>{data?.employees?.length ?? 0} employees · {dr.length} days</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Input icon={<Search size={13} />} placeholder="Search by employee name..."
              value={search} onChange={e => setSearch(e.target.value)} style={{ width: 240 }} />
            <Btn variant="ghost" size="icon" onClick={load}><RefreshCw size={15} /></Btn>
          </div>
        </div>

        <div style={{ overflowX: 'auto', borderRadius: 14, border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--txt3)', background: 'var(--card)', borderBottom: '1px solid var(--border)', minWidth: 190 }}>Employee</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--txt3)', background: 'var(--card)', borderBottom: '1px solid var(--border)', minWidth: 150 }}>Department</th>
                {dr.map(d => {
                  const { day, dow } = formatDate(d)
                  return (
                    <th key={d} style={{ padding: '10px 8px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--txt3)', background: 'var(--card)', borderBottom: '1px solid var(--border)', minWidth: 90 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--txt)' }}>{day}</div>
                      <div style={{ fontSize: 10, color: 'var(--txt3)' }}>{dow}</div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={dr.length + 2} style={{ textAlign: 'center', padding: 48 }}><Spinner /></td></tr>
                : (data?.employees || []).map(emp => (
                  <tr key={emp.id} style={{ borderBottom: '1px solid var(--border2)', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--card-h)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar initials={emp.avatar_initials} department={emp.department} size={30} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{emp.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--txt2)', fontFamily: 'JetBrains Mono' }}>{emp.emp_id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 16px' }}><DeptTag department={emp.department} /></td>
                    {dr.map(d => (
                      <AttCell key={d} status={emp.attendance?.[d]?.status || 'Unmarked'} empId={emp.id} date={d} onUpdate={update} />
                    ))}
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
