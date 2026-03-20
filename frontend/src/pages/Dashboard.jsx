import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Trophy, Users, BarChart2, TrendingUp, TrendingDown } from 'lucide-react'
import { api, DEPT_COLORS } from '../utils/api'
import { Card, SectionHeader, Spinner, Empty } from '../components/UI'

const DC = Object.values(DEPT_COLORS)

function StatCard({ label, value, sub, color, icon }) {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color, fontSize: 18 }}>{icon}</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--txt2)', fontWeight: 500 }}>{sub}</span>
      </div>
      <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--txt2)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </Card>
  )
}

function EmpActivityBars({ total, active }) {
  const inactive = total - active
  return (
    <div>
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', margin: '16px 0 10px' }}>
        {Array(active).fill(0).map((_, i) => (
          <div key={'a' + i} style={{ width: 18, height: 36, borderRadius: 4, background: 'var(--green)' }} />
        ))}
        {Array(inactive).fill(0).map((_, i) => (
          <div key={'i' + i} style={{ width: 18, height: 36, borderRadius: 4, background: 'var(--red)' }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--txt2)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
          Active {active} ({Math.round(active / total * 100)}%)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />
          Inactive {inactive} ({Math.round(inactive / total * 100)}%)
        </span>
      </div>
    </div>
  )
}

function DeptDonut({ data }) {
  const [active, setActive] = useState(null)
  if (!data?.length) return <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><Spinner /></div>
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
      <ResponsiveContainer width={190} height={190}>
        <PieChart>
          <Pie data={data.map(d => ({ name: d.department, value: d.count }))}
            cx="50%" cy="50%" innerRadius={58} outerRadius={88} paddingAngle={2} dataKey="value"
            onMouseEnter={(_, i) => setActive(i)} onMouseLeave={() => setActive(null)}>
            {data.map((d, i) => (
              <Cell key={i} fill={DEPT_COLORS[d.department] || DC[i % DC.length]}
                opacity={active === null || active === i ? 1 : 0.4} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ flex: 1, minWidth: 150 }}>
        {data.map((d, i) => (
          <div key={d.department} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', fontSize: 12.5 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: DEPT_COLORS[d.department] || DC[i], display: 'inline-block', flexShrink: 0 }} />
              {d.department}
            </span>
            <span style={{ color: 'var(--txt2)', minWidth: 34, textAlign: 'right', fontFamily: 'JetBrains Mono', fontSize: 12 }}>{d.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PerfList({ items, type }) {
  if (!items?.length) return <Empty icon={type === 'top' ? '🏆' : '📋'} text={type === 'top' ? 'No performance data' : 'No absence data'} />
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {items.map((p, i) => (
        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border2)' }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
            background: type === 'top' ? 'var(--accent-s)' : 'var(--red-s)',
            color: type === 'top' ? 'var(--accent)' : 'var(--red)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
          }}>{i + 1}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
            <div style={{ fontSize: 11, color: 'var(--txt2)' }}>{p.department}</div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: type === 'top' ? 'var(--green)' : 'var(--red)', fontFamily: 'JetBrains Mono', flexShrink: 0 }}>
            {type === 'top' ? `${p.present_days}d ✓` : `${p.absent_days}d ✗`}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [perf, setPerf] = useState(null)
  const [att, setAtt] = useState(null)
  const [period, setPeriod] = useState('month')

  useEffect(() => {
    api('/dashboard/stats').then(setStats).catch(() => {})
    api('/attendance').then(d => setAtt(d.summary)).catch(() => {})
  }, [])

  useEffect(() => {
    api(`/dashboard/performance?period=${period}`).then(setPerf).catch(() => {})
  }, [period])

  const rate = att?.attendance_rate ?? 0
  const rateColor = rate >= 75 ? 'var(--green)' : rate >= 40 ? 'var(--yellow)' : 'var(--red)'
  const rateLabel = rate >= 75 ? 'High' : rate >= 40 ? 'Mid' : 'Low'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Top stat chips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <StatCard label="Total Employees" value={stats?.total_employees ?? '—'} sub={`${stats?.active_percentage ?? 0}% active`} color="var(--accent)" icon="👥" />
        <StatCard label="Active" value={stats?.active_employees ?? '—'} sub="Currently working" color="var(--green)" icon="✓" />
        <StatCard label="Inactive" value={stats?.inactive_employees ?? '—'} sub="Not working" color="var(--red)" icon="✗" />
        <StatCard label="Attendance Rate" value={`${rate}%`} sub={rateLabel} color={rateColor} icon="📅" />
      </div>

      {/* Overview section */}
      <SectionHeader>Overview</SectionHeader>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 16 }}>
        <Card style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: 18, right: 18, fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>
            {stats?.active_percentage ?? 0}% active
          </div>
          <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1 }}>{stats?.total_employees ?? '—'}</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>Total Employees</div>
          {stats && <EmpActivityBars total={stats.total_employees} active={stats.active_employees} />}
        </Card>
        <Card>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--txt3)', marginBottom: 14 }}>By Department</div>
          <DeptDonut data={stats?.department_stats} />
        </Card>
      </div>

      {/* Performance */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <SectionHeader>Performance Report</SectionHeader>
        <div style={{ display: 'flex', gap: 4, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 9, padding: 3 }}>
          {[['month', 'This Month'], ['year', 'Year'], ['all', 'All Time']].map(([p, label]) => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: '5px 12px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.15s',
              background: period === p ? 'var(--bg)' : 'transparent',
              color: period === p ? 'var(--txt)' : 'var(--txt2)',
              boxShadow: period === p ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
            <Trophy size={14} color="var(--yellow)" />
            <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--txt3)' }}>Top Performers</span>
          </div>
          {!perf ? <Spinner /> : <PerfList items={perf.top_performers} type="top" />}
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
            <TrendingDown size={14} color="var(--red)" />
            <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--txt3)' }}>Top Absentees</span>
          </div>
          {!perf ? <Spinner /> : <PerfList items={perf.top_absentees} type="absent" />}
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
            <BarChart2 size={14} color="var(--accent)" />
            <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--txt3)' }}>By Department</span>
          </div>
          {!perf ? <Spinner /> : perf.by_department.filter(d => d.rate > 0).length === 0
            ? <Empty icon="📊" text="No data" />
            : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={perf.by_department.filter(d => d.rate > 0)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border2)" />
                  <XAxis dataKey="department" tick={{ fontSize: 9, fill: 'var(--txt3)' }} tickFormatter={v => v.slice(0, 4)} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--txt3)' }} />
                  <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={v => [v + '%', 'Rate']} />
                  <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                    {perf.by_department.filter(d => d.rate > 0).map((d, i) => (
                      <Cell key={i} fill={DEPT_COLORS[d.department] || 'var(--accent)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
        </Card>
      </div>

      {/* Attendance Summary */}
      <SectionHeader>Attendance Summary</SectionHeader>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
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
              <span style={{ fontWeight: 600, color, fontFamily: 'JetBrains Mono' }}>{att?.[key] ?? 0}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 13 }}>
            <span>Total</span><span style={{ fontFamily: 'JetBrains Mono' }}>{att?.total ?? 0}</span>
          </div>
        </Card>
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1, color: rateColor }}>
              {rate}%
              <span style={{
                display: 'inline-block', marginLeft: 10, fontSize: 12, fontWeight: 700,
                background: rateColor, color: '#fff', borderRadius: 5, padding: '2px 8px', verticalAlign: 'middle',
              }}>{rateLabel}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Attendance Rate</div>
          </div>
          {!att ? <div style={{ fontSize: 13, color: 'var(--txt2)' }}>No data for this period</div> : (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                ['On Time', att.on_time, 'var(--green)'],
                ['Late', att.late, 'var(--yellow)'],
                ['Absent', att.absent, 'var(--red)'],
                ['Unmarked', att.unmarked, 'var(--txt3)'],
              ].map(([label, val, color]) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
                  borderRadius: 99, background: color + '18', color, fontSize: 12, fontWeight: 500,
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block' }} />
                  {label}: {val}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
