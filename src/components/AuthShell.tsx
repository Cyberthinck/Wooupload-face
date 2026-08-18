import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

interface Props {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
  error?: string | null
}

export default function AuthShell({ title, subtitle, children, footer, error }: Props) {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="flex items-center gap-3 mb-6" style={{ justifyContent: 'center' }}>
          <img src="/logo.svg" alt="WooUpload" style={{ width: 44, height: 44 }} />
          <div className="brand-name" style={{ fontSize: 22 }}>Woo<span>Upload</span></div>
        </div>
        <h1 style={{ fontSize: 22, textAlign: 'center' }}>{title}</h1>
        <p className="text-muted text-sm" style={{ textAlign: 'center', marginTop: 6, marginBottom: 24 }}>{subtitle}</p>

        {error && (
          <div className="scale-in" style={{
            background: 'var(--c-error-50)', color: 'var(--c-error-600)',
            padding: '12px 14px', borderRadius: 'var(--radius)', fontSize: 13,
            fontWeight: 600, marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        {children}

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--c-text-muted)' }}>
          {footer}
        </div>
      </div>
    </div>
  )
}
