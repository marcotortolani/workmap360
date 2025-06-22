import { NextResponse } from 'next/server'
import { getSupabaseAuthWithRole } from '@/lib/getSupabaseAuthWithRole'
import { getServiceSupabase } from '@/lib/supabaseAuth'

// GET /api/images
export async function GET(req: Request) {
  try {
    const { user, role, error } = await getSupabaseAuthWithRole(req)

    if (error || !user || !role) {
      return NextResponse.json(
        { error: error || 'No autorizado' },
        { status: 401 }
      )
    }

    const serviceClient = getServiceSupabase()
    let query = serviceClient.from('images').select('*')

    if (!['admin', 'manager'].includes(role)) {
      query = query.eq('user_id', user.id)
    }

    const { data, error: fetchError } = await query

    if (fetchError) {
      console.error('Error obteniendo imágenes:', fetchError.message)
      return NextResponse.json(
        { error: 'Error obteniendo imágenes' },
        { status: 500 }
      )
    }

    return NextResponse.json({ images: data || [] }, { status: 200 })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('Error obteniendo imágenes:', err)
    return NextResponse.json(
      { error: err.message || 'Error obteniendo imágenes' },
      { status: 500 }
    )
  }
}
