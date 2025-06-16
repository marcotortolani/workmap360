// /app/api/users/by-role/[role]/route.ts
import { NextResponse } from 'next/server'
import { getSupabaseAuthWithRole } from '@/lib/getSupabaseAuthWithRole'
import { checkPermissionOrFail } from '@/lib/auth/permissions'
import { validRoles } from '@/data/roles'

export async function GET(req: Request) {
  // Obtener query params de paginación
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const targetRole = searchParams.get('role') || 'guest'

  if (!validRoles.includes(targetRole)) {
    return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
  }

  const { supabase, user, role, error } = await getSupabaseAuthWithRole(req)

  if (error || !user || !role) {
    return NextResponse.json(
      { error: error ?? 'No autorizado' },
      { status: 401 }
    )
  }

  const deny = checkPermissionOrFail(role, 'users', 'read')
  if (deny) return deny

  if (role === 'technician' && targetRole === 'admin') {
    return NextResponse.json(
      { error: 'No tenés permisos para ver estos usuarios' },
      { status: 403 }
    )
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const {
    data,
    count,
    error: queryError,
  } = await supabase
    .from('users')
    .select(
      'id, first_name, last_name, email, role, created_at, status, avatar',
      { count: 'exact' }
    )
    .eq('role', targetRole)
    .range(from, to)

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 })
  }

  return NextResponse.json(
    {
      users: data,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    },
    { status: 200 }
  )
}
