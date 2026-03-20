import { Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Attendance from './pages/Attendance'
import { Payroll, Reports } from './pages/Static'

export default function App() {
  return (
    <AppProvider>
      <Layout>
        <Routes>
          <Route path="/"           element={<Dashboard />} />
          <Route path="/employees"  element={<Employees />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/payroll"    element={<Payroll />} />
          <Route path="/reports"    element={<Reports />} />
        </Routes>
      </Layout>
    </AppProvider>
  )
}
