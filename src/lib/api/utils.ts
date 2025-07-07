// src/lib/api/utils.ts

import { getServiceSupabase } from '@/lib/supabaseAuth'

// Función auxiliar para obtener datos del usuario desde la tabla users
async function getUserDataFromAuthId(
  authId: string,
  serviceClient: ReturnType<typeof getServiceSupabase>
): Promise<{
  id: number
  first_name: string
  last_name: string
  role: string
} | null> {
  const { data: user, error } = await serviceClient
    .from('users')
    .select('id, first_name, last_name, role')
    .eq('uid', authId)
    .single()

  if (error) {
    console.error('Error fetching user data:', error)
    return null
  }

  return user
}

export { getUserDataFromAuthId }
