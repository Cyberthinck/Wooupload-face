import type { ReactNode } from 'react'

interface Props {
  label: string
  children: ReactNode
  action?: ReactNode
}

export default function SectionCard({ label, children, action }: Props) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="flex items-center justify-between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--c-border)' }}>
        <h2 style={{ fontSize: 17 }}>{label}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}
