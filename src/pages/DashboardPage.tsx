import { useEffect, useState } from 'react'
import { Package, Clock, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase, type Product } from '../lib/supabase'
import { useAuth } from '../lib/auth'

interface Stats {
  total: number
  pendientes: number
  subidos: number
  errores: number
}

const STATUS_MAP: Record<Product['status'], string> = {
  activo: 'badge-activo',
  pendiente: 'badge-pendiente',
  error: 'badge-error',
  no_publicado: 'badge-no_publicado',
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<Stats>({ total: 0, pendientes: 0, subidos: 0, errores: 0 })
  const [recent, setRecent] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      const products = (data ?? []) as Product[]
      setStats({
        total: products.length,
        pendientes: products.filter((p) => p.status === 'pendiente' || p.status === 'no_publicado').length,
        subidos: products.filter((p) => p.status === 'activo').length,
        errores: products.filter((p) => p.status === 'error').length,
      })
      setRecent(products.slice(0, 5))
      setLoading(false)
    })()
  }, [])

  const cards = [
    { label: 'Productos', value: stats.total, icon: Package, color: 'var(--c-primary)', bg: 'var(--c-primary-50)' },
    { label: 'Pendientes', value: stats.pendientes, icon: Clock, color: '#b45309', bg: 'var(--c-warning-50)' },
    { label: 'Subidos', value: stats.subidos, icon: CheckCircle, color: 'var(--c-success-600)', bg: 'var(--c-success-50)' },
    { label: 'Errores', value: stats.errores, icon: AlertTriangle, color: 'var(--c-error-600)', bg: 'var(--c-error-50)' },
  ]

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize: 26 }}>Hola, {profile?.full_name?.split(' ')[0] || ''} 👋</h1>
          <p className="text-muted text-sm mt-4">Aquí tienes el resumen de tus productos</p>
        </div>
        <Link to="/productos" className="btn btn-primary btn-sm">Ver productos</Link>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-muted" style={{ padding: 40, justifyContent: 'center' }}>
          <span className="spinner spinner-dark" /> Cargando estadísticas...
        </div>
      ) : (
        <div className="stat-grid">
          {cards.map((c) => (
            <div key={c.label} className="stat-card">
              <div className="stat-icon" style={{ background: c.bg }}>
                <c.icon size={22} style={{ color: c.color }} />
              </div>
              <div className="stat-value">{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card mt-6" style={{ overflow: 'hidden' }}>
        <div className="flex items-center justify-between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--c-border)' }}>
          <div className="flex items-center gap-2">
            <TrendingUp size={18} style={{ color: 'var(--c-primary)' }} />
            <h2 style={{ fontSize: 17 }}>Productos recientes</h2>
          </div>
          <Link to="/productos" className="text-sm" style={{ color: 'var(--c-primary)', fontWeight: 600 }}>Ver todos</Link>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state">
            <Package />
            <p className="font-bold">Aún no hay productos</p>
            <p className="text-sm mt-4">Añade tu primer producto desde la sección Productos.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Producto</th><th>SKU</th><th>Estado</th><th>Precio</th></tr>
              </thead>
              <tbody>
                {recent.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td className="text-muted">{p.sku || '—'}</td>
                    <td><span className={`badge ${STATUS_MAP[p.status]}`}>{p.status.replace('_', ' ')}</span></td>
                    <td style={{ fontWeight: 600 }}>€{Number(p.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
