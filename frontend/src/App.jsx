import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import OwnerHomePage from './pages/OwnerHomePage'
import OwnerPetsPage from './pages/OwnerPetsPage'
import OwnerVisitsPage from './pages/OwnerVisitsPage'
import OwnerAccountPage from './pages/OwnerAccountPage'
import AdminStaffPage from './pages/AdminStaffPage'
import StaffVisitsPage from './pages/StaffVisitsPage'
import ReceptionDashboard from './pages/ReceptionDashboard'
import PricingPage from './pages/PricingPage'
import AdminPricingPage from './pages/AdminPricingPage'
import LandingPage from './pages/LandingPage'
import AppShell from './components/AppShell'
import { getToken } from './api/api'

function RequireAuth({ children }) {
  if (!getToken()) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/pricing" element={<PricingPage />} />

        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route path="/app" element={<OwnerHomePage />} />
          <Route path="/pets" element={<OwnerPetsPage />} />
          <Route path="/visits" element={<OwnerVisitsPage />} />
          <Route path="/account" element={<OwnerAccountPage />} />
          <Route path="/admin/staff" element={<AdminStaffPage />} />
          <Route path="/admin/pricing" element={<AdminPricingPage />} />
          <Route path="/staff/visits" element={<StaffVisitsPage />} />
          <Route path="/reception" element={<ReceptionDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
