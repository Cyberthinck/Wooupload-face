import type { LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: number | string
  icon: LucideIcon
  color: string
  bg: string
  hint?: string
}

export default function StatCard({ label, value, icon: Icon, color, bg, hint }: Props) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {hint && <div className="text-xs text-muted mt-4">{hint}</div>}
    </div>
  )
}
