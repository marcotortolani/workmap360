// src/app/api/repairs/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabaseAuth'
import { getSupabaseAuthWithRole } from '@/lib/getSupabaseAuthWithRole'
import { getUserDataFromAuthId } from '@/lib/api/utils'
import { TechnicianAssignment } from "@/types/project-types"
import { RepairData } from "@/types/repair-type"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, role, error } = await getSupabaseAuthWithRole(req)

    if (error || !user || !role) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    const repairId = parseInt(params.id)
    if (!repairId || isNaN(repairId)) {
      return NextResponse.json({ error: 'Invalid repair ID' }, { status: 400 })
    }

    const serviceClient = getServiceSupabase()

    // Usar la función auxiliar para obtener reparación completa
    const { data: repairData, error: rpcError } = await serviceClient.rpc(
      'get_repair_with_phases',
      { repair_id_param: repairId }
    )

    if (rpcError || !repairData) {
      return NextResponse.json({ error: 'Repair not found' }, { status: 404 })
    }

    return NextResponse.json({ repair: repairData })
  } catch (error) {
    console.error('Unexpected error fetching repair:', error)
    return NextResponse.json(
      { error: 'Unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, role, error } = await getSupabaseAuthWithRole(req)

    if (error || !user || !role) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    const repairId = parseInt(params.id)
    if (!repairId || isNaN(repairId)) {
      return NextResponse.json({ error: 'Invalid repair ID' }, { status: 400 })
    }

    const { phases, status } = await req.json()

    const serviceClient = getServiceSupabase()
    const userData = await getUserDataFromAuthId(user.id, serviceClient)

    if (!userData) {
      return NextResponse.json(
        { error: 'User data not found' },
        { status: 400 }
      )
    }

    // Verificar permisos según el rol
    const { data: repair } = await serviceClient
      .from('repairs')
      .select('id, project_id')
      .eq('id', repairId)
      .single()

    if (!repair) {
      return NextResponse.json({ error: 'Repair not found' }, { status: 404 })
    }

    // Verificar permisos específicos por rol
    if (role === 'technician') {
      const { data: project } = await serviceClient
        .from('projects')
        .select('technicians')
        .eq('id', repair.project_id)
        .single()

      const isAssigned = project?.technicians?.some(
        (tech: TechnicianAssignment) => tech.technician_id === userData.id
      )

      if (!isAssigned) {
        return NextResponse.json(
          { error: 'You are not assigned to this project' },
          { status: 403 }
        )
      }
    } else if (role === 'client') {
      return NextResponse.json(
        { error: 'Use /status endpoint to update repair status' },
        { status: 403 }
      )
    }

    // Actualizar la reparación
    const updateData: Partial<RepairData>  = { updated_at: new Date().toISOString() }
    if (phases !== undefined) updateData.phases = phases
    if (status !== undefined) updateData.status = status

    const { data: updatedRepair, error: updateError } = await serviceClient
      .from('repairs')
      .update(updateData)
      .eq('id', repairId)
      .select('*')
      .single()

    if (updateError) {
      console.error('Error updating repair:', updateError)
      return NextResponse.json(
        { error: 'Failed to update repair' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      repair: updatedRepair,
      message: 'Repair updated successfully',
    })
  } catch (error) {
    console.error('Unexpected error updating repair:', error)
    return NextResponse.json(
      { error: 'Unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const repairId = parseInt(params.id)
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
