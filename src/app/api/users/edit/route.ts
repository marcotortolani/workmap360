// app/api/users/edit/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { getSupabaseAuthWithRole } from '@/lib/getSupabaseAuthWithRole'
import { checkPermissionOrFail } from '@/lib/auth/permissions'
import { validateCSRFForRequest } from '@/lib/security/csrf'

export async function PUT(req: NextRequest) {
  // CSRF Protection
  const csrfValidation = await validateCSRFForRequest(req)
  if (csrfValidation) return csrfValidation

  const body = await req.json()
  const {
    id: targetId,
    first_name,
    last_name,
    email,
    role: newRole,
    status,
    avatar,
  } = body

  const { supabase, user, role, error } = await getSupabaseAuthWithRole(req)

  if (error || !user) {
    return NextResponse.json(
      { error: error ?? 'No authorized' },
      { status: 401 }
    )
  }

  // Si el usuario no es admin y está editando a otro, denegar
  if (user.id !== targetId) {
    const deny = checkPermissionOrFail(role, 'users', 'update')
    if (deny) return deny
  }

  if (role !== 'admin' && role !== 'manager') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (role !== 'admin' && newRole === 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!first_name && !last_name && !email && !newRole && !status && !avatar) {
    return NextResponse.json(
      { error: 'At least one field must be updated' },
      { status: 400 }
    )
  }

  const updateData: Record<string, string> = {}
  if (first_name) updateData.first_name = first_name
  if (last_name) updateData.last_name = last_name
  if (email) updateData.email = email
  if (newRole) updateData.role = newRole
  if (status) updateData.status = status
  if (avatar) updateData.avatar = avatar

  const { data, error: updateError } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', targetId)
    .select()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json(
    { user: data?.[0], message: 'User updated successfully' },
    { status: 200 }
  )
}
