// src/app/api/repairs/by-location/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { getSupabaseAuthWithRole } from '@/lib/getSupabaseAuthWithRole'
import { getServiceSupabase } from '@/lib/supabaseAuth'
import { RepairData } from '@/types/repair-type'

async function getUserIdFromAuthId(
  authId: string,
  serviceClient: ReturnType<typeof getServiceSupabase>
): Promise<number | null> {
  const { data: user } = await serviceClient
    .from('users')
    .select('id')
    .eq('uid', authId)
    .single()

  return user?.id || null
}

export async function GET(req: NextRequest) {
  try {
    const { user, role, error } = await getSupabaseAuthWithRole(req)

    if (error || !user || !role) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    
    // Obtener parámetros requeridos
    const project_id = searchParams.get('project_id')
    const drop = searchParams.get('drop')
    const level = searchParams.get('level')
    const repair_type = searchParams.get('repair_type') // Opcional

    // Validar parámetros requeridos
    if (!project_id || !drop || !level) {
      return NextResponse.json(
        { error: 'Missing required parameters: project_id, drop, level' },
        { status: 400 }
      )
    }

    const projectIdNum = parseInt(project_id)
    const dropNum = parseInt(drop)
    const levelNum = parseInt(level)

    // Validar que sean números válidos
    if (isNaN(projectIdNum) || isNaN(dropNum) || isNaN(levelNum)) {
      return NextResponse.json(
        { error: 'Invalid numeric parameters' },
        { status: 400 }
      )
    }

    const serviceClient = getServiceSupabase()

    let allowedProjectIds: number[] = []

    // ✅ Aplicar filtros de rol para obtener proyectos permitidos (igual que list)
    if (role === 'client') {
      // Cliente solo ve reparaciones de sus proyectos
      const userIdInUsersTable = await getUserIdFromAuthId(
        user.id,
        serviceClient
      )

      if (!userIdInUsersTable) {
        return NextResponse.json({
          success: true,
          repairs: [],
          location: { project_id: projectIdNum, drop: dropNum, level: levelNum, repair_type },
          total: 0
        })
      }

      const { data: clientProjects } = await serviceClient
        .from('projects')
        .select('id')
        .eq('client_id', userIdInUsersTable)

      if (clientProjects && clientProjects.length > 0) {
        allowedProjectIds = clientProjects.map((p) => p.id)
      } else {
        // Cliente no tiene proyectos asignados
        return NextResponse.json({
          success: true,
          repairs: [],
          location: { project_id: projectIdNum, drop: dropNum, level: levelNum, repair_type },
          total: 0
        })
      }
    } else if (role === 'technician') {
      // Técnico solo ve reparaciones de proyectos donde está asignado
      const userIdInUsersTable = await getUserIdFromAuthId(
        user.id,
        serviceClient
      )

      if (!userIdInUsersTable) {
        return NextResponse.json({
          success: true,
          repairs: [],
          location: { project_id: projectIdNum, drop: dropNum, level: levelNum, repair_type },
          total: 0
        })
      }

      const { data: assignedProjects } = await serviceClient
        .from('projects')
        .select('id')
        .filter(
          'technicians',
          'cs',
          JSON.stringify([{ technician_id: userIdInUsersTable }])
        )

      if (assignedProjects && assignedProjects.length > 0) {
        allowedProjectIds = assignedProjects.map((p) => p.id)
      } else {
        // Técnico no tiene proyectos asignados
        return NextResponse.json({
          success: true,
          repairs: [],
          location: { project_id: projectIdNum, drop: dropNum, level: levelNum, repair_type },
          total: 0
        })
      }
    }
    // Admin y Manager ven todas las reparaciones (allowedProjectIds queda vacío, no se aplica filtro)

    // ✅ Verificar si el usuario tiene acceso al proyecto solicitado
    if (
      (role === 'client' || role === 'technician') &&
      allowedProjectIds.length > 0 &&
      !allowedProjectIds.includes(projectIdNum)
    ) {
      return NextResponse.json({
        success: true,
        repairs: [],
        location: { project_id: projectIdNum, drop: dropNum, level: levelNum, repair_type },
        total: 0
      })
    }

    // ✅ Construir query base con filtros de ubicación
    let query = serviceClient
      .from('repairs')
      .select('*')
      .eq('project_id', projectIdNum)
      .eq('drop', dropNum)
      .eq('level', levelNum)

    // ✅ Aplicar filtro de repair_type si se proporciona
    if (repair_type) {
      query = query.eq('phases->survey->>repair_type', repair_type)
    }

    // ✅ Aplicar filtro de proyectos permitidos si es necesario
    if (
      (role === 'client' || role === 'technician') &&
      allowedProjectIds.length > 0
    ) {
      query = query.in('project_id', allowedProjectIds)
    }

    // ✅ Ejecutar query con ordenamiento
    const { data: repairsData, error: queryError } = await query
      .order('repair_index', { ascending: true })

    if (queryError) {
      console.error('Error fetching repairs by location:', queryError)
      return NextResponse.json(
        { error: 'Failed to fetch repairs by location' },
        { status: 500 }
      )
    }

    const repairs = repairsData || []

    // ✅ Formatear respuesta igual que en list
    return NextResponse.json({
      success: true,
      repairs: repairs.map((repair: RepairData) => ({
        id: repair.id,
        project_id: repair.project_id,
        project_name: repair.project_name,
        elevation_name: repair.elevation_name,
        drop: repair.drop,
        level: repair.level,
        repair_index: repair.repair_index,
        status: repair.status,
        phases: repair.phases || {},
        created_by_user_name: repair.created_by_user_name,
        created_by_user_id: repair.created_by_user_id,
        created_at: repair.created_at,
        updated_at: repair.updated_at,
      })),
      location: {
        project_id: projectIdNum,
        drop: dropNum,
        level: levelNum,
        repair_type
      },
      total: repairs.length
    })

  } catch (error) {
    console.error('Unexpected error in repairs by location endpoint:', error)
    return NextResponse.json(
      { error: 'Unexpected error occurred' },
      { status: 500 }
    )
  }
}