// lib/supabaseAuth.ts
import { createClient } from '@supabase/supabase-js'

export async function getSupabaseAuth(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return { error: 'No autorizado' }

  const token = authHeader.replace('Bearer ', '')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
    }
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)
  if (error || !user)
    return { error: 'Token inválido o usuario no autenticado' }

  return { supabase, user }
}

// Cliente con privilegios administrativos
export function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export const getSessionToken = async (): Promise<string> => {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) throw new Error('No hay sesión activa')
  return session.access_token
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
