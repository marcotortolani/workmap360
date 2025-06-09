// lib/getSupabaseAuthWithRole.ts
import { createClient } from '@supabase/supabase-js'
import { Role } from '@/types/database-types'

export async function getSupabaseAuthWithRole(req: Request) {
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

  const { data: dbUser, error: dbError } = await supabase
    .from('users')
    .select('role')
    .eq('uid', user.id)
    .single()

  if (dbError || !dbUser)
    return { error: 'No se pudo obtener el rol del usuario' }

  return { supabase, user, role: dbUser.role as Role }
}
