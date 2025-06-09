// app/api/users/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { getSupabaseAuthWithRole } from '@/lib/getSupabaseAuthWithRole'
import { checkPermissionOrFail } from '@/lib/auth/permissions'
import { getServiceSupabase } from '@/lib/supabaseAuth'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { supabase, user, role, error } = await getSupabaseAuthWithRole(req)

  if (error || !user) {
    return NextResponse.json(
      { error: error ?? 'No autorizado' },
      { status: 401 }
    )
  }

  const deny = checkPermissionOrFail(role, 'users', 'delete')
  if (deny) return deny

  const { id } = await params

  // 1. Buscar el usuario por ID en tu tabla `users` y obtener su UID (auth ID)
  const { data: targetUser, error: fetchError } = await supabase
    .from('users')
    .select('id, uid, role')
    .eq('id', id)
    .single()

  if (fetchError || !targetUser) {
    return NextResponse.json(
      { error: 'Usuario no encontrado' },
      { status: 404 }
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
    .eq('id', id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json(
    { message: 'Usuario eliminado exitosamente' },
    { status: 200 }
  )
}

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { supabase, user, role, error } = await getSupabaseAuthWithRole(req)

  if (error || !user) {
    return NextResponse.json(
      { error: error ?? 'No autorizado' },
      { status: 401 }
    )
  }

  const { id: targetId } = context.params

  // Si el usuario no es admin y está editando a otro, denegar
  if (user.id !== targetId) {
    const deny = checkPermissionOrFail(role, 'users', 'update')
    if (deny) return deny
  }

  const body = await req.json()
  const { firstName, lastName, email, role: newRole, status, avatar } = body

  if (!firstName && !lastName && !email && !newRole && !status && !avatar) {
    return NextResponse.json(
      { error: 'Al menos un campo debe ser proporcionado para actualizar' },
      { status: 400 }
    )
  }

  const updateData: Record<string, string> = {}
  if (firstName) updateData.first_name = firstName
  if (lastName) updateData.last_name = lastName
  if (email) updateData.email = email
  if (newRole) updateData.role = newRole
  if (status) updateData.status = status
  if (avatar) updateData.avatar = avatar

  const { error: updateError } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', targetId)
    .select()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({
    message: 'Usuario actualizado exitosamente',
  })
}
