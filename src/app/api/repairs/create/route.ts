// app/api/repairs/create/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAuthWithRole } from '@/lib/getSupabaseAuthWithRole'
import { getServiceSupabase } from '@/lib/supabaseAuth'
import { getUserDataFromAuthId } from '@/lib/api/utils'
import { validateCSRFForRequest } from '@/lib/security/csrf'

import { TechnicianAssignment } from "@/types/project-types"

export async function POST(req: NextRequest) {
  // CSRF Protection
  const csrfValidation = await validateCSRFForRequest(req)
  if (csrfValidation) return csrfValidation

  try {
    const { user, role, error } = await getSupabaseAuthWithRole(req)

    if (error || !user || !role) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    // Solo Admin, Manager y Technician pueden crear reparaciones
    if (!['admin', 'manager', 'technician'].includes(role)) {
      return NextResponse.json(
        { error: 'You dont have permission to create repairs' },
        { status: 403 }
      )
    }

    const {
      project_id,
      project_name,
      elevation_name,
      drop,
      level,
      repair_index,
      phases,
    } = await req.json()

    if (
      !project_id ||
      !project_name ||
      !elevation_name ||
      !drop ||
      !level ||
      !repair_index
    ) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      )
    }

    const serviceClient = getServiceSupabase()
    const userData = await getUserDataFromAuthId(user.id, serviceClient)

    if (!userData) {
      return NextResponse.json(
        { error: 'User data not found' },
        { status: 400 }
      )
    }

    // Si es técnico, verificar que está asignado al proyecto
    if (role === 'technician') {
      const { data: project } = await serviceClient
        .from('projects')
        .select('technicians')
        .eq('id', project_id)
        .single()

      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }

      const isAssigned = project.technicians?.some(
        (tech: TechnicianAssignment) => tech.technician_id === userData.id
      )

      if (!isAssigned) {
        return NextResponse.json(
          { error: 'You are not assigned to this project' },
          { status: 403 }
        )
      }
    }

    // Extract repair_type_code and primary_technician_id from phases for indexing
    const phasesData = phases || {}
    const repairTypeCode = phasesData.survey?.repair_type || null
    const primaryTechnicianId = phasesData.survey?.created_by_user_id || null

    // Lookup repair_type_id from repair_types table if code exists
    let repairTypeId = null
    if (repairTypeCode) {
      const { data: repairTypeData } = await serviceClient
        .from('repair_types')
        .select('id')
        .eq('type', repairTypeCode)
        .single()
      repairTypeId = repairTypeData?.id || null
    }

    // Crear la reparación
    const { data: repair, error: repairError } = await serviceClient
      .from('repairs')
      .insert({
        project_id,
        project_name,
        elevation_name,
        drop,
        level,
        repair_index,
        phases: phasesData,
        status: 'pending',
        created_by_user_name: `${userData.first_name || ''} ${
          userData.last_name || ''
        }`.trim(),
        created_by_user_id: userData.id,
        // Indexed columns for efficient filtering
        repair_type_id: repairTypeId,
        repair_type_code: repairTypeCode,
        primary_technician_id: primaryTechnicianId,
      })
      .select('id')
      .single()

    if (repairError || !repair) {
      console.error('Error creating repair:', repairError)
      return NextResponse.json(
        { error: 'Failed to create repair' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        repairId: repair.id,
        message: 'Repair created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error creating repair:', error)
    return NextResponse.json(
      { error: 'Unexpected error occurred' },
      { status: 500 }
    )
  }
}
