import { supabase } from './supabase'

export type ActivityKind = 'success' | 'warning' | 'error' | 'info'

export async function logActivity(title: string, detail: string, kind: ActivityKind = 'info') {
  const { error } = await supabase.from('activity_logs').insert({ title, detail, kind })
  if (error) console.error('activity log failed', error)
}

export function getErrorMessage() {
  return 'No se pudo completar la acción. Revisa los datos e inténtalo de nuevo.'
}

export function formatRelativeDate(value: string) {
  const date = new Date(value)
  const diff = Math.max(0, Date.now() - date.getTime())
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours} h`
  const days = Math.floor(hours / 24)
  return `Hace ${days} d`
}
