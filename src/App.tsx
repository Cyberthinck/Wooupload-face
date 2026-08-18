import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/auth'
import AppLayout from './components/AppLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RecoverPage from './pages/RecoverPage'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import ProfilePage from './pages/ProfilePage'

function LoadingScreen() {
  return (
    <div className="auth-shell">
      <div className="flex items-center gap-3" style={{ color: 'var(--c-primary)', fontWeight: 700 }}>
        <span className="spinner spinner-dark" style={{ width: 24, height: 24 }} /> Cargando WooUpload...
      </div>
    </div>
  )
}

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  return <AppLayout>{children}</AppLayout>
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/registro" element={<PublicOnly><RegisterPage /></PublicOnly>} />
      <Route path="/recuperar" element={<PublicOnly><RecoverPage /></PublicOnly>} />
      <Route path="/" element={<Protected><DashboardPage /></Protected>} />
      <Route path="/productos" element={<Protected><ProductsPage /></Protected>} />
      <Route path="/perfil" element={<Protected><ProfilePage /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
