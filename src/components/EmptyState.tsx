import type { ReactNode } from 'react'
import { Video as LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  title: string
  children: ReactNode
  action?: ReactNode
}

export default function EmptyState({ icon: Icon, title, children, action }: Props) {
  return (
    <div className="empty-state">
      <Icon />
      <p className="font-bold">{title}</p>
      {children && <div className="text-sm mt-4">{children}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
