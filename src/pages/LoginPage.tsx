import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import AuthShell from '../components/AuthShell'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'Correo o contraseña incorrectos.' : error.message)
      return
    }
    navigate('/')
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  return (
    <AuthShell
      title="Inicia sesión"
      subtitle="Accede a tu panel de WooUpload"
      error={error}
      footer={<>¿No tienes cuenta? <Link to="/registro" style={{ color: 'var(--c-primary)', fontWeight: 700 }}>Regístrate</Link></>}
    >
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

        <div className="field">
          <label className="field-label">Contraseña</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-text-subtle)' }} />
            <input className="input" type={showPass ? 'text' : 'password'} required value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
              style={{ paddingLeft: 42, paddingRight: 42 }} />
            <button type="button" onClick={() => setShowPass(!showPass)}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-text-subtle)', padding: 6 }}>
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <label className="flex items-center gap-2 text-sm text-muted" style={{ cursor: 'pointer' }}>
            <input type="checkbox" style={{ accentColor: 'var(--c-primary)' }} /> Recordarme
          </label>
          <Link to="/recuperar" className="text-sm" style={{ color: 'var(--c-primary)', fontWeight: 600 }}>¿Olvidaste tu contraseña?</Link>
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Iniciar sesión'}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--c-border)' }} />
        <span className="text-xs text-muted">o</span>
        <div style={{ flex: 1, height: 1, background: 'var(--c-border)' }} />
      </div>

      <button className="btn btn-secondary w-full" onClick={handleGoogle}>
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Continuar con Google
      </button>
    </AuthShell>
  )
}
