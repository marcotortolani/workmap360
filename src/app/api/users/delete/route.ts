// app/api/users/delete/route.ts
import { NextResponse } from 'next/server'
import { getSupabaseAuthWithRole } from '@/lib/getSupabaseAuthWithRole'
import { checkPermissionOrFail } from '@/lib/auth/permissions'
import { getServiceSupabase } from '@/lib/supabaseAuth'
import { validateCSRFForRequest } from '@/lib/security/csrf'

export async function DELETE(req: Request) {
  // CSRF Protection
  const csrfValidation = await validateCSRFForRequest(req)
  if (csrfValidation) return csrfValidation

  const { supabase, user, role, error } = await getSupabaseAuthWithRole(req)
  const body = await req.json()
  const { id: targetId } = body

  if (error || !user) {
    return NextResponse.json(
      { error: error ?? 'No autorizado' },
      { status: 401 }
    )
  }

  const deny = checkPermissionOrFail(role, 'users', 'delete')
  if (deny) return deny

  // 1. Buscar el usuario por ID en tu tabla `users` y obtener su UID (auth ID)
  const { data: targetUser, error: fetchError } = await supabase
    .from('users')
    .select('id, uid, role')
    .eq('id', targetId)
    .single()

  if (fetchError || !targetUser) {
    return NextResponse.json(
      { error: 'Usuario no encontrado' },
      { status: 404 }
    )
  }
  if (targetUser.role === 'admin') {
    return NextResponse.json(
      { error: 'No puedes eliminar a un administrador' },
      { status: 403 }
    )
  }

  // 2. Eliminar de `auth.users` usando el cliente con Service Role
  const serviceClient = getServiceSupabase()

  const { error: authDeleteError } = await serviceClient.auth.admin.deleteUser(
    targetUser.uid
  )

  if (authDeleteError) {
    return NextResponse.json(
      { error: 'Error eliminando usuario de autenticación' },
      { status: 500 }
    )
  }

  // 3. Eliminar de la tabla `users`
  const { error: deleteError } = await supabase
    .from('users')
    .delete()
    .eq('id', targetId)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json(
    { message: 'Usuario eliminado exitosamente' },
    { status: 200 }
  )
}
