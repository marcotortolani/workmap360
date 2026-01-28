// src/app/api/repairs/update/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabaseAuth'
import { getSupabaseAuthWithRole } from '@/lib/getSupabaseAuthWithRole'
import { getUserDataFromAuthId } from '@/lib/api/utils'
import { TechnicianAssignment } from '@/types/project-types'
import { RepairData } from '@/types/repair-type'
import { validateCSRFForRequest } from '@/lib/security/csrf'

export async function PUT(req: NextRequest) {
  // CSRF Protection
  const csrfValidation = await validateCSRFForRequest(req)
  if (csrfValidation) return csrfValidation

  const { id, repairData } = await req.json()
  try {
    const { user, role, error } = await getSupabaseAuthWithRole(req)

    if (error || !user || !role) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    const repairId = parseInt(id)
    if (!repairId || isNaN(repairId)) {
      return NextResponse.json({ error: 'Invalid repair ID' }, { status: 400 })
    }

    const { phases, status } = repairData

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
    const updateData: Partial<RepairData> = {
      updated_at: new Date().toISOString(),
    }
    if (phases !== undefined) {
      updateData.phases = phases

      // Update denormalized columns if repair_type changed
      const newRepairTypeCode =
        phases.survey?.repair_type ||
        phases.progress?.[0]?.repair_type ||
        null

      // Lookup repair_type_id if code changed
      let newRepairTypeId = null
      if (newRepairTypeCode) {
        const { data: repairTypeData } = await serviceClient
          .from('repair_types')
          .select('id')
          .eq('type', newRepairTypeCode)
          .single()
        newRepairTypeId = repairTypeData?.id || null
      }

      updateData.repair_type_id = newRepairTypeId
      updateData.repair_type_code = newRepairTypeCode
      // Note: primary_technician_id typically doesn't change (it's who created survey)
    }
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
