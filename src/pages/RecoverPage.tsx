import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CircleCheck as CheckCircle } from 'lucide-react'
import AuthShell from '../components/AuthShell'
import { supabase } from '../lib/supabase'

export default function RecoverPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setSent(true)
  }

  return (
    <AuthShell
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace para restablecerla"
      error={error}
      footer={<Link to="/login" style={{ color: 'var(--c-primary)', fontWeight: 700 }}>Volver a iniciar sesión</Link>}
    >
      {sent ? (
        <div className="scale-in" style={{ textAlign: 'center', padding: '16px 0' }}>
          <CheckCircle size={48} style={{ color: 'var(--c-success)', margin: '0 auto 12px' }} />
          <p className="font-bold" style={{ fontSize: 16 }}>Revisa tu correo</p>
          <p className="text-muted text-sm mt-4">Te enviamos un enlace a <strong>{email}</strong> para restablecer tu contraseña.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field">
            <label className="field-label">Correo electrónico</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-text-subtle)' }} />
              <input className="input" type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com"
                style={{ paddingLeft: 42 }} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Enviar enlace'}
          </button>
          <Link to="/login" className="btn btn-ghost w-full" style={{ gap: 6 }}>
            <ArrowLeft size={16} /> Volver
          </Link>
        </form>
      )}
    </AuthShell>
  )
}
