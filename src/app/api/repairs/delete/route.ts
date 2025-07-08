// src/app/api/repairs/delete/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabaseAuth'
import { getSupabaseAuthWithRole } from '@/lib/getSupabaseAuthWithRole'

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  try {
    const { user, role, error } = await getSupabaseAuthWithRole(req)

    if (error || !user || !role) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    // Solo Admin y Manager pueden eliminar reparaciones
    if (!['admin', 'manager'].includes(role)) {
      return NextResponse.json(
        { error: 'You dont have permission to delete repairs' },
        { status: 403 }
      )
    }

    const repairId = parseInt(id)
    if (!repairId || isNaN(repairId)) {
      return NextResponse.json({ error: 'Invalid repair ID' }, { status: 400 })
    }

    const serviceClient = getServiceSupabase()

    // Verificar que la reparación existe
    const { data: repairExists } = await serviceClient
      .from('repairs')
      .select('id, project_name, elevation_name')
      .eq('id', repairId)
      .single()

    if (!repairExists) {
      return NextResponse.json({ error: 'Repair not found' }, { status: 404 })
    }

    // Eliminar la reparación
    const { error: deleteError } = await serviceClient
      .from('repairs')
      .delete()
      .eq('id', repairId)

    if (deleteError) {
      console.error('Error deleting repair:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete repair' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Repair deleted successfully',
    })
  } catch (error) {
    console.error('Unexpected error deleting repair:', error)
    return NextResponse.json(
      { error: 'Unexpected error occurred' },
      { status: 500 }
    )
  }
}
