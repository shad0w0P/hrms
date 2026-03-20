import { useState, useEffect } from 'react'
import { RefreshCw, Plus, MoreHorizontal, Search } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { api, DEPT_COLORS, DEPARTMENTS } from '../utils/api'
import { useToast } from '../context/AppContext'
import { Card, Avatar, DeptTag, StatusBadge, Btn, Input, Select, Modal, Field, Spinner, Dropdown, DropItem, SectionHeader, Empty } from '../components/UI'

const DC = Object.values(DEPT_COLORS)

function DeptDonut({ data }) {
  if (!data?.length) return <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
      <ResponsiveContainer width={180} height={180}>
        <PieChart>
          <Pie data={data.map(d => ({ name: d.department, value: d.count }))}
            cx="50%" cy="50%" innerRadius={54} outerRadius={80} paddingAngle={2} dataKey="value">
            {data.map((d, i) => <Cell key={i} fill={DEPT_COLORS[d.department] || DC[i % DC.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ flex: 1, minWidth: 140 }}>
        {data.map((d, i) => (
          <div key={d.department} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3.5px 0', fontSize: 12.5 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: DEPT_COLORS[d.department] || DC[i], display: 'inline-block' }} />
              {d.department}
            </span>
            <span style={{ color: 'var(--txt2)', fontFamily: 'JetBrains Mono', fontSize: 12 }}>{d.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmpForm({ initial, onSubmit, onClose, loading }) {
  const [f, setF] = useState(initial || { name: '', email: '', department: 'Engineering', designation: '', status: 'Active', phone: '' })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  return (
    <>
      <Field label="Full Name *">
        <Input placeholder="e.g. Priya Sharma" value={f.name} onChange={e => set('name', e.target.value)} />
      </Field>
      <Field label="Email *">
        <Input type="email" placeholder="email@company.com" value={f.email} onChange={e => set('email', e.target.value)} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Department">
          <Select value={f.department} onChange={e => set('department', e.target.value)}>
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </Select>
        </Field>
        <Field label="Status">
          <Select value={f.status} onChange={e => set('status', e.target.value)}>
            <option>Active</option>
            <option>Inactive</option>
          </Select>
        </Field>
      </div>
      <Field label="Designation *">
        <Input placeholder="e.g. Software Engineer" value={f.designation} onChange={e => set('designation', e.target.value)} />
      </Field>
      <Field label="Phone">
        <Input placeholder="+91 98765 43210" value={f.phone} onChange={e => set('phone', e.target.value)} />
      </Field>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn onClick={() => onSubmit(f)} disabled={loading}>
          {loading ? <Spinner size={14} /> : (initial ? 'Save Changes' : 'Add Employee')}
        </Btn>
      </div>
    </>
  )
}

export default function Employees() {
  const toast = useToast()
  const [data, setData] = useState(null)
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('All Departments')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [editEmp, setEditEmp] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ page, limit: 20 })
      if (search) p.set('search', search)
      if (dept !== 'All Departments') p.set('department', dept)
      const [d, s] = await Promise.all([api(`/employees?${p}`), api('/dashboard/stats')])
      setData(d); setStats(s)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { setPage(1) }, [search, dept])
  useEffect(() => { load() }, [page, search, dept])

  const addEmp = async (f) => {
    if (!f.name || !f.email || !f.designation) { toast('Please fill required fields', 'error'); return }
    setSaving(true)
    try { await api('/employees', { method: 'POST', body: f }); toast('Employee added successfully'); setShowAdd(false); load() }
    catch (e) { toast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const updateEmp = async (f) => {
    setSaving(true)
    try { await api(`/employees/${editEmp.id}`, { method: 'PUT', body: { name: f.name, email: f.email, department: f.department, designation: f.designation, status: f.status, phone: f.phone } }); toast('Employee updated'); setEditEmp(null); load() }
    catch (e) { toast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const deleteEmp = async (id) => {
    if (!confirm('Delete this employee?')) return
    try { await api(`/employees/${id}`, { method: 'DELETE' }); toast('Employee deleted'); load() }
    catch (e) { toast(e.message, 'error') }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Overview cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 16 }}>
        <Card style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: 18, right: 18, fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>
            {stats?.active_percentage ?? 0}% active
          </div>
          <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1 }}>{stats?.total_employees ?? '—'}</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>Total Employees</div>
          {stats && (
            <>
              <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', margin: '14px 0 10px' }}>
                {Array(stats.active_employees).fill(0).map((_, i) => <div key={'a' + i} style={{ width: 18, height: 36, borderRadius: 4, background: 'var(--green)' }} />)}
                {Array(stats.inactive_employees).fill(0).map((_, i) => <div key={'i' + i} style={{ width: 18, height: 36, borderRadius: 4, background: 'var(--red)' }} />)}
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--txt2)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />Active {stats.active_employees}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />Inactive {stats.inactive_employees}</span>
              </div>
            </>
          )}
        </Card>
        <Card>
          <SectionHeader>By Department</SectionHeader>
          <DeptDonut data={stats?.department_stats} />
        </Card>
      </div>

      {/* Table section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17 }}>Overview</div>
            <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 2 }}>{data?.total ?? 0} employees</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="ghost" size="icon" onClick={load}><RefreshCw size={15} /></Btn>
            <Btn onClick={() => setShowAdd(true)}><Plus size={15} /> Add Employee</Btn>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <Input icon={<Search size={14} />} placeholder="Search by name, department, designation..."
            value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
          <Select value={dept} onChange={e => setDept(e.target.value)} style={{ minWidth: 180 }}>
            <option>All Departments</option>
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </Select>
          <Btn variant="secondary" onClick={load}>Search</Btn>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', borderRadius: 14, border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['', 'EMP ID', 'EMPLOYEE', 'DEPARTMENT', 'DESIGNATION', 'STATUS', 'ACTION'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--txt3)',
                    background: 'var(--card)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48 }}><Spinner /></td></tr>
                : !data?.employees?.length
                  ? <tr><td colSpan={7}><Empty icon="👥" text="No employees found" /></td></tr>
                  : data.employees.map(emp => (
                    <tr key={emp.id} style={{ borderBottom: '1px solid var(--border2)', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--card-h)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 16px' }}><input type="checkbox" style={{ accentColor: 'var(--accent)', cursor: 'pointer' }} /></td>
                      <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--txt2)' }}>{emp.emp_id}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar initials={emp.avatar_initials} department={emp.department} />
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 13 }}>{emp.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--txt2)' }}>{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}><DeptTag department={emp.department} /></td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{emp.designation}</td>
                      <td style={{ padding: '12px 16px' }}><StatusBadge status={emp.status} /></td>
                      <td style={{ padding: '12px 16px' }}>
                        <Dropdown trigger={
                          <Btn variant="ghost" size="icon"><MoreHorizontal size={15} /></Btn>
                        }>
                          {(setOpen) => (
                            <>
                              <DropItem onClick={() => { setEditEmp(emp); setOpen(false) }}>Edit</DropItem>
                              <DropItem danger onClick={() => { deleteEmp(emp.id); setOpen(false) }}>Delete</DropItem>
                            </>
                          )}
                        </Dropdown>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.pages > 1 && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
            {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
              <Btn key={p} variant={p === page ? 'primary' : 'secondary'} size="sm" onClick={() => setPage(p)}>{p}</Btn>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <Modal title="Add Employee" onClose={() => setShowAdd(false)}>
          <EmpForm onSubmit={addEmp} onClose={() => setShowAdd(false)} loading={saving} />
        </Modal>
      )}
      {editEmp && (
        <Modal title="Edit Employee" onClose={() => setEditEmp(null)}>
          <EmpForm initial={editEmp} onSubmit={updateEmp} onClose={() => setEditEmp(null)} loading={saving} />
        </Modal>
      )}
    </div>
  )
}
