// app/api/repairs/list/route.ts

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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit
    const projectIdFilter = searchParams.get('project_id')
    const statusFilter = searchParams.get('status')
    const elevationFilter = searchParams.get('elevation_name')
    const dropFilter = searchParams.get('drop')
    const levelFilter = searchParams.get('level')
    const repairTypesFilter = searchParams.get('repair_types') // Comma-separated list
    const technicianIdFilter = searchParams.get('technician_id')
    const sortBy = searchParams.get('sortBy') || 'updated_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'    

    const serviceClient = getServiceSupabase()

    let query = serviceClient.from('repairs').select('*', { count: 'exact' })
    let allowedProjectIds: number[] = []

    // Aplicar filtros de rol para obtener proyectos permitidos
    if (role === 'client') {
      // Cliente solo ve reparaciones de sus proyectos
      const userIdInUsersTable = await getUserIdFromAuthId(
        user.id,
        serviceClient
      )

      if (!userIdInUsersTable) {
        return NextResponse.json({
          repairs: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
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
          repairs: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
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
          repairs: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
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
          repairs: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
        })
      }
    }
    // Admin y Manager ven todas las reparaciones (allowedProjectIds queda vacío, no se aplica filtro)

    // Aplicar filtro de proyectos permitidos si es necesario
    if (
      (role === 'client' || role === 'technician') &&
      allowedProjectIds.length > 0
    ) {
      query = query.in('project_id', allowedProjectIds)
    }

    // Aplicar filtros adicionales
    if (projectIdFilter) {
      const requestedProjectId = parseInt(projectIdFilter)

      // Verificar si el usuario tiene acceso al proyecto solicitado
      if (
        (role === 'client' || role === 'technician') &&
        !allowedProjectIds.includes(requestedProjectId)
      ) {
        return NextResponse.json({
          repairs: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
        })
      }

      query = query.eq('project_id', requestedProjectId)
    }

    if (statusFilter) {
      query = query.eq('status', statusFilter)
    }

    if (elevationFilter) {
      query = query.ilike('elevation_name', `%${elevationFilter}%`)
    }

    if (dropFilter) {
      query = query.eq('drop', dropFilter)
    }

    if (levelFilter) {
      query = query.eq('level', levelFilter)
    }

    // Aplicar ordenamiento
    let orderByColumn = 'updated_at'
    switch (sortBy) {
      case 'created_at':
        orderByColumn = 'created_at'
        break
      case 'updated_at':
        orderByColumn = 'updated_at'
        break
      case 'id':
        orderByColumn = 'id'
        break
      case 'status':
        orderByColumn = 'status'
        break
      case 'project':
        orderByColumn = 'project_name'
        break
      default:
        orderByColumn = 'updated_at'
    }

    // Si hay filtros de repair_types o technician, necesitamos obtener todos los registros
    // y filtrar en memoria porque estos campos están dentro de JSONB
    const needsInMemoryFilter = repairTypesFilter || technicianIdFilter

    let queryResult
    if (needsInMemoryFilter) {
      // Obtener todos los registros (sin paginación) para filtrar en memoria
      queryResult = await query
        .order(orderByColumn, { ascending: sortOrder === 'asc' })
        .limit(10000) // Límite razonable de seguridad
    } else {
      // Aplicar paginación normal
      queryResult = await query
        .order(orderByColumn, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1)
    }

    const {
      data: repairsData,
      error: queryError,
      count: dbCount,
    } = queryResult

    if (queryError) {
      console.error('Error fetching repairs:', queryError)
      return NextResponse.json(
        { error: 'Failed to fetch repairs' },
        { status: 500 }
      )
    }

    let repairs = repairsData || []

    // Aplicar filtros en memoria para campos dentro de JSONB
    if (needsInMemoryFilter && repairs.length > 0) {
      // Filtrar por repair_types
      if (repairTypesFilter) {
        const repairTypes = repairTypesFilter.split(',').map((t) => t.trim())
        repairs = repairs.filter((repair: RepairData) => {
          const phases = repair.phases || {}
          // Buscar repair_type en survey
          const surveyType = phases.survey?.repair_type
          if (surveyType && repairTypes.includes(surveyType)) return true

          // Buscar repair_type en progress
          if (phases.progress && Array.isArray(phases.progress)) {
            const progressType = phases.progress[0]?.repair_type
            if (progressType && repairTypes.includes(progressType)) return true
          }

          return false
        })
      }

      // Filtrar por technician
      if (technicianIdFilter) {
        const technicianId = parseInt(technicianIdFilter)
        repairs = repairs.filter((repair: RepairData) => {
          const phases = repair.phases || {}

          // Buscar en survey
          if (phases.survey?.created_by_user_id === technicianId) return true

          // Buscar en progress
          if (phases.progress && Array.isArray(phases.progress)) {
            if (
              phases.progress.some((p) => p.created_by_user_id === technicianId)
            )
              return true
          }

          // Buscar en finish
          if (phases.finish?.created_by_user_id === technicianId) return true

          return false
        })
      }

      // Aplicar paginación manual después del filtrado
      const total = repairs.length
      const paginatedRepairs = repairs.slice(offset, offset + limit)

      return NextResponse.json({
        repairs: paginatedRepairs.map((repair: RepairData) => ({
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
        pagination: {
          total: total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      })
    }

    // Sin filtros en memoria, usar el count de la DB
    const total = dbCount || 0

    return NextResponse.json({
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
      pagination: {
        total: Number(total),
        page,
        limit,
        totalPages: Math.ceil(Number(total) / limit),
      },
    })
  } catch (error) {
    console.error('Unexpected error fetching repairs:', error)
    return NextResponse.json(
      { error: 'Unexpected error occurred' },
      { status: 500 }
    )
  }
}

// // app/api/repairs/list/route.ts

// import { NextResponse, NextRequest } from 'next/server'
// import { getSupabaseAuthWithRole } from '@/lib/getSupabaseAuthWithRole'
// import { getServiceSupabase } from '@/lib/supabaseAuth'
// import { RepairData } from '@/types/repair-type'

// async function getUserDataFromAuthId(
//   authId: string,
//   serviceClient: ReturnType<typeof getServiceSupabase>
// ): Promise<{ id: number; role: string } | null> {
//   const { data: user } = await serviceClient
//     .from('users')
//     .select('id, role')
//     .eq('uid', authId)
//     .single()

//   return user || null
// }

// export async function GET(req: NextRequest) {
//   try {
//     const { user, role, error } = await getSupabaseAuthWithRole(req)

//     if (error || !user || !role) {
//       return NextResponse.json(
//         { error: error || 'Unauthorized' },
//         { status: 401 }
//       )
//     }

//     const { searchParams } = new URL(req.url)
//     const page = parseInt(searchParams.get('page') || '1')
//     const limit = parseInt(searchParams.get('limit') || '20')
//     const offset = (page - 1) * limit
//     const projectIdFilter = searchParams.get('project_id')
//     const statusFilter = searchParams.get('status')
//     const elevationFilter = searchParams.get('elevation_name')

//     const serviceClient = getServiceSupabase()
//     const userData = await getUserDataFromAuthId(user.id, serviceClient)

//     if (!userData) {
//       return NextResponse.json(
//         { error: 'User data not found' },
//         { status: 400 }
//       )
//     }

//     let query = serviceClient.from('repairs').select('*', { count: 'exact' })

//     // Aplicar filtros de rol
//     if (role === 'technician') {
//       // Technicians solo ven reparaciones de proyectos asignados
//       const { data: assignedProjects } = await serviceClient
//         .from('projects')
//         .select('id')
//         .contains('technicians', [{ technician_id: userData.id }])

//       if (assignedProjects && assignedProjects.length > 0) {
//         const projectIds = assignedProjects.map((p) => p.id)
//         query = query.in('project_id', projectIds)
//       } else {
//         // Si no tiene proyectos asignados, devolver lista vacía
//         return NextResponse.json({
//           repairs: [],
//           pagination: {
//             total: 0,
//             page,
//             limit,
//             totalPages: 0,
//           },
//         })
//       }
//     }
//     // Admin y Manager ven todas las reparaciones (sin filtro adicional)

//     // Aplicar filtros adicionales
//     if (projectIdFilter) {
//       query = query.eq('project_id', parseInt(projectIdFilter))
//     }

//     if (statusFilter) {
//       query = query.eq('status', statusFilter)
//     }

//     if (elevationFilter) {
//       query = query.ilike('elevation_name', `%${elevationFilter}%`)
//     }

//     // Aplicar paginación y ordenamiento
//     query = query
//       .order('created_at', { ascending: false })
//       .range(offset, offset + limit - 1)

//     const { data: repairsData, error: queryError, count } = await query

//     if (queryError) {
//       console.error('Error fetching repairs:', queryError)
//       return NextResponse.json(
//         { error: 'Failed to fetch repairs' },
//         { status: 500 }
//       )
//     }

//     const repairs = repairsData || []
//     const total = count || 0

//     return NextResponse.json({
//       repairs: repairs.map((repair: RepairData) => ({
//         id: repair.id,
//         project_id: repair.project_id,
//         project_name: repair.project_name,
//         elevation_name: repair.elevation_name,
//         drop: repair.drop,
//         level: repair.level,
//         repair_index: repair.repair_index,
//         status: repair.status,
//         phases: repair.phases || {},
//         created_by_user_name: repair.created_by_user_name,
//         created_by_user_id: repair.created_by_user_id,
//         created_at: repair.created_at,
//         updated_at: repair.updated_at,
//       })),
//       pagination: {
//         total: Number(total),
//         page,
//         limit,
//         totalPages: Math.ceil(Number(total) / limit),
//       },
//     })
//   } catch (error) {
//     console.error('Unexpected error fetching repairs:', error)
//     return NextResponse.json(
//       { error: 'Unexpected error occurred' },
//       { status: 500 }
//     )
//   }
// }
