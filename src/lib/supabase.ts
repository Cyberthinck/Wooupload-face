import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export type ProductStatus = 'activo' | 'pendiente' | 'error' | 'no_publicado'

export interface Product {
  id: string
  user_id: string
  name: string
  sku: string | null
  price: number
  stock: number
  status: ProductStatus
  woocommerce_id: number | null
  error_message: string | null
  updated_at: string
  created_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface UserSettings {
  user_id: string
  company_name: string
  company_code: string
  rest_base_url: string
  woo_store_url: string
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  user_id: string
  title: string
  detail: string | null
  kind: 'success' | 'warning' | 'error' | 'info'
  created_at: string
}

export interface WorkspaceInvitation {
  id: string
  inviter_id: string
  email: string
  role: string
  status: string
  created_at: string
}

export const STATUS_LABELS: Record<ProductStatus, string> = {
  activo: 'Activo',
  pendiente: 'Pendiente',
  error: 'Error',
  no_publicado: 'No publicado',
}
