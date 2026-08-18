import { useEffect, useState } from 'react'
import { Plus, Search, Trash2, Upload, FileSpreadsheet, Package, RefreshCw, ShoppingCart } from 'lucide-react'
import { supabase, type Product, type ProductStatus, STATUS_LABELS } from '../lib/supabase'
import { useAuth } from '../lib/auth'

const STATUS_MAP: Record<ProductStatus, string> = {
  activo: 'badge-activo',
  pendiente: 'badge-pendiente',
  error: 'badge-error',
  no_publicado: 'badge-no_publicado',
}

const STATUSES: ProductStatus[] = ['activo', 'pendiente', 'error', 'no_publicado']

export default function ProductsPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<ProductStatus | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', sku: '', price: '', stock: '0', status: 'pendiente' as ProductStatus })
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts((data ?? []) as Product[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('products').insert({
      name: form.name,
      sku: form.sku || null,
      price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock) || 0,
      status: form.status,
    })
    setSaving(false)
    if (error) return
    setForm({ name: '', sku: '', price: '', stock: '0', status: 'pendiente' })
    setShowForm(false)
    load()
  }

  async function handleDelete(id: string) {
    await supabase.from('products').delete().eq('id', id)
    load()
  }

  async function handleSync(p: Product) {
    setSyncing(p.id)
    // Simulated WooCommerce upload: mark as activo or error based on presence of sku
    const ok = !!p.sku && p.price > 0
    const { error } = await supabase.from('products').update({
      status: ok ? 'activo' : 'error',
      woocommerce_id: ok ? Math.floor(Math.random() * 90000) + 1000 : null,
      error_message: ok ? null : 'Falta SKU o precio para publicar en WooCommerce',
    }).eq('id', p.id)
    setSyncing(null)
    if (!error) load()
  }

  function handleExcelUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Lightweight CSV import: parse name,sku,price,stock,status
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const text = String(ev.target?.result || '')
      const lines = text.split(/\r?\n/).filter(Boolean)
      const rows = lines.slice(1).map((line) => {
        const [name, sku, price, stock, status] = line.split(',').map((s) => s.trim())
        return { name, sku: sku || null, price: parseFloat(price) || 0, stock: parseInt(stock) || 0, status: (status as ProductStatus) || 'pendiente' }
      }).filter((r) => r.name)
      if (rows.length) {
        await supabase.from('products').insert(rows)
        load()
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const filtered = products.filter((p) => {
    const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase()) || (p.sku || '').toLowerCase().includes(query.toLowerCase())
    const matchesFilter = filter === 'all' || p.status === filter
    return matchesQuery && matchesFilter
  })

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize: 26 }}>Productos</h1>
          <p className="text-muted text-sm mt-4">Gestiona y publica tus productos en WooCommerce</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', gap: 8 }}>
            <FileSpreadsheet size={16} /> Excel
            <input type="file" accept=".csv,.xlsx" onChange={handleExcelUpload} style={{ display: 'none' }} />
          </label>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> Nuevo
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card scale-in mb-6" style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          <div className="field">
            <label className="field-label">Nombre*</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre del producto" />
          </div>
          <div className="field">
            <label className="field-label">SKU</label>
            <input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="SKU" />
          </div>
          <div className="field">
            <label className="field-label">Precio (€)</label>
            <input className="input" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
          </div>
          <div className="field">
            <label className="field-label">Stock</label>
            <input className="input" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" />
          </div>
          <div className="field">
            <label className="field-label">Estado</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProductStatus })}>
              {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" /> : 'Guardar'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="flex gap-3 mb-4 flex-wrap">
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-text-subtle)' }} />
          <input className="input" placeholder="Buscar por nombre o SKU..." value={query}
            onChange={(e) => setQuery(e.target.value)} style={{ paddingLeft: 42 }} />
        </div>
        <select className="input" style={{ width: 'auto', minWidth: 150 }} value={filter} onChange={(e) => setFilter(e.target.value as ProductStatus | 'all')}>
          <option value="all">Todos los estados</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="flex items-center gap-3 text-muted" style={{ padding: 40, justifyContent: 'center' }}>
            <span className="spinner spinner-dark" /> Cargando productos...
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Package />
            <p className="font-bold">{products.length === 0 ? 'No hay productos aún' : 'Sin resultados'}</p>
            <p className="text-sm mt-4">{products.length === 0 ? 'Crea tu primer producto o importa desde Excel.' : 'Prueba con otra búsqueda o filtro.'}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Producto</th><th>SKU</th><th>Precio</th><th>Stock</th><th>Estado</th><th style={{ textAlign: 'right' }}>Acciones</th></tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td className="text-muted">{p.sku || '—'}</td>
                    <td style={{ fontWeight: 600 }}>€{Number(p.price).toFixed(2)}</td>
                    <td className="text-muted">{p.stock}</td>
                    <td><span className={`badge ${STATUS_MAP[p.status]}`}>{STATUS_LABELS[p.status]}</span></td>
                    <td>
                      <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn-icon btn-secondary" onClick={() => handleSync(p)} disabled={syncing === p.id} title="Subir a WooCommerce" style={{ width: 34, height: 34 }}>
                          {syncing === p.id ? <RefreshCw size={15} className="spinner-dark" style={{ animation: 'spin 0.7s linear infinite' }} /> : <ShoppingCart size={15} />}
                        </button>
                        <button className="btn-icon btn-secondary" onClick={() => handleDelete(p.id)} title="Eliminar" style={{ width: 34, height: 34, color: 'var(--c-error)' }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {!user && <p className="text-xs text-muted mt-4">Inicia sesión para guardar cambios en tus productos.</p>}
    </div>
  )
}
