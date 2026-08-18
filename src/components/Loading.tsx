export default function Loading({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-muted" style={{ padding: 40, justifyContent: 'center' }}>
      <span className="spinner spinner-dark" /> {label}
    </div>
  )
}
