import { useEffect, useState } from 'react'
import { Camera, KeyRound, Mail, User as UserIcon, Check, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

export default function ProfilePage() {
  const { user, profile, signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [savingName, setSavingName] = useState(false)
  const [savedName, setSavedName] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [newPass, setNewPass] = useState('')
  const [savingPass, setSavingPass] = useState(false)
  const [passMsg, setPassMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    setFullName(profile?.full_name || '')
    setAvatarUrl(profile?.avatar_url || '')
  }, [profile])

  async function saveName() {
    setSavingName(true)
    await supabase.from('profiles').upsert({ id: user!.id, full_name: fullName })
    await refreshProfile()
    setSavingName(false)
    setSavedName(true)
    setTimeout(() => setSavedName(false), 2000)
  }

  async function saveAvatar() {
    if (!avatarUrl.trim()) return
    setSavingAvatar(true)
    await supabase.from('profiles').upsert({ id: user!.id, avatar_url: avatarUrl })
    await refreshProfile()
    setSavingAvatar(false)
  }

  async function changePassword() {
    setSavingPass(true)
    setPassMsg(null)
    const { error } = await supabase.auth.updateUser({ password: newPass })
    setSavingPass(false)
    if (error) {
      setPassMsg({ ok: false, text: error.message })
    } else {
      setPassMsg({ ok: true, text: 'Contraseña actualizada correctamente.' })
      setNewPass('')
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const initial = (profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()

  return (
    <div className="fade-in" style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 26 }} className="mb-6">Mi perfil</h1>

      <div className="card mb-6" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" style={{ width: 80, height: 80, borderRadius: 20, objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: 80, height: 80, borderRadius: 20,
              background: 'linear-gradient(135deg, var(--c-primary), var(--c-violet))',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 32,
            }}>{initial}</div>
          )}
          <label style={{
            position: 'absolute', bottom: -4, right: -4,
            width: 30, height: 30, borderRadius: 10, background: 'var(--c-surface)',
            border: '2px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--c-primary)',
          }}>
            <Camera size={15} />
            <input type="text" style={{ display: 'none' }} />
          </label>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ fontSize: 20 }}>{profile?.full_name || 'Usuario'}</h2>
          <p className="text-muted text-sm flex items-center gap-2 mt-4"><Mail size={14} /> {user?.email}</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleSignOut}>
          <LogOut size={16} /> Cerrar sesión
        </button>
      </div>

      <div className="card mb-6" style={{ padding: 24 }}>
        <h3 className="flex items-center gap-2 mb-4" style={{ fontSize: 17 }}><UserIcon size={18} style={{ color: 'var(--c-primary)' }} /> Datos personales</h3>
        <div className="flex gap-3 flex-wrap" style={{ marginBottom: 16 }}>
          <div className="field flex-1" style={{ minWidth: 240 }}>
            <label className="field-label">Nombre completo</label>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Tu nombre" />
          </div>
          <div className="field" style={{ minWidth: 240, flex: 1 }}>
            <label className="field-label">Correo electrónico</label>
            <input className="input" value={user?.email || ''} disabled style={{ background: 'var(--c-surface-2)' }} />
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={saveName} disabled={savingName}>
          {savedName ? <><Check size={16} /> Guardado</> : savingName ? <span className="spinner" /> : 'Guardar cambios'}
        </button>
      </div>

      <div className="card mb-6" style={{ padding: 24 }}>
        <h3 className="flex items-center gap-2 mb-4" style={{ fontSize: 17 }}><Camera size={18} style={{ color: 'var(--c-primary)' }} /> Imagen de perfil</h3>
        <div className="flex gap-3 flex-wrap">
          <div className="field flex-1" style={{ minWidth: 240 }}>
            <label className="field-label">URL de la imagen</label>
            <input className="input" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
          </div>
          <button className="btn btn-secondary btn-sm" onClick={saveAvatar} disabled={savingAvatar} style={{ alignSelf: 'flex-end' }}>
            {savingAvatar ? <span className="spinner spinner-dark" /> : 'Actualizar'}
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h3 className="flex items-center gap-2 mb-4" style={{ fontSize: 17 }}><KeyRound size={18} style={{ color: 'var(--c-primary)' }} /> Cambiar contraseña</h3>
        <div className="flex gap-3 flex-wrap">
          <div className="field flex-1" style={{ minWidth: 240 }}>
            <label className="field-label">Nueva contraseña</label>
            <input className="input" type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Mínimo 6 caracteres" minLength={6} />
          </div>
          <button className="btn btn-primary btn-sm" onClick={changePassword} disabled={savingPass || !newPass} style={{ alignSelf: 'flex-end' }}>
            {savingPass ? <span className="spinner" /> : 'Actualizar contraseña'}
          </button>
        </div>
        {passMsg && (
          <div className="scale-in mt-4" style={{
            padding: '10px 14px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600,
            background: passMsg.ok ? 'var(--c-success-50)' : 'var(--c-error-50)',
            color: passMsg.ok ? 'var(--c-success-600)' : 'var(--c-error-600)',
          }}>{passMsg.text}</div>
        )}
      </div>
    </div>
  )
}
