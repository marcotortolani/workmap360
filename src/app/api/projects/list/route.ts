// app/api/projects/list/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { getSupabaseAuthWithRole } from '@/lib/getSupabaseAuthWithRole'
import { getServiceSupabase } from '@/lib/supabaseAuth'
import { filterProjectsByRole } from '@/lib/utils/projectFilters'

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

    const serviceClient = getServiceSupabase()

    let query = serviceClient.from('projects').select('*', { count: 'exact' })

    // Filtrar según el rol
    if (role === 'client') {
      // Cliente solo ve sus proyectos
      const userIdInUsersTable = await getUserIdFromAuthId(
        user.id,
        serviceClient
      )
      if (userIdInUsersTable) {
        query = query.eq('client_id', userIdInUsersTable)
      } else {
        // Si no se encuentra el usuario, no devolver proyectos
        return NextResponse.json({
          projects: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
        })
      }
    } else if (role === 'technician') {
      // Técnico solo ve proyectos donde está asignado
      const userIdInUsersTable = await getUserIdFromAuthId(
        user.id,
        serviceClient
      )

      if (!userIdInUsersTable) {
        return NextResponse.json({
          projects: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
        })
      }

      // Usar el operador @> (contains) con sintaxis correcta para JSONB
      query = query.filter(
        'technicians',
        'cs',
        JSON.stringify([{ technician_id: userIdInUsersTable }])
      )

      // Alternativa usando operador directo de PostgreSQL
      // query = query.filter('technicians', '@>', `[{"technician_id": ${userIdInUsersTable}}]`)
    }
    // Admin y Manager ven todos los proyectos (sin filtro adicional)

    const {
      data: projects,
      error: queryError,
      count,
    } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (queryError) {
      console.error('Error fetching projects:', queryError)
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      )
    }

    const filteredProjects = filterProjectsByRole(projects || [], role)
    
    return NextResponse.json({
      projects: filteredProjects,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Unexpected error fetching projects:', error)
    return NextResponse.json(
      { error: 'Unexpected error occurred' },
      { status: 500 }
    )
  }
}

// Función auxiliar para obtener ID de la tabla users desde auth ID
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
// // app/api/projects/list/route.ts
// import { NextResponse, NextRequest } from 'next/server'
// import { getSupabaseAuthWithRole } from '@/lib/getSupabaseAuthWithRole'
// import { getServiceSupabase } from '@/lib/supabaseAuth'

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

//     const serviceClient = getServiceSupabase()

//     let query = serviceClient.from('projects').select('*', { count: 'exact' })

//     // Filtrar según el rol
//     if (role === 'client') {
//       // Cliente solo ve sus proyectos
//       const userIdInUsersTable = await getUserIdFromAuthId(
//         user.id,
//         serviceClient
//       )
//       query = query.eq('client_id', userIdInUsersTable)
//     } else if (role === 'technician') {
//       // Técnico solo ve proyectos donde está asignado
//       const userIdInUsersTable = await getUserIdFromAuthId(
//         user.id,
//         serviceClient
//       )
//       const { data: assignedProjects } = await serviceClient
//         .from('projects')
//         .select('project_id')
//         .eq('technician_id', userIdInUsersTable)

//       if (assignedProjects && assignedProjects.length > 0) {
//         const projectIds = assignedProjects.map((p) => p.project_id)
//         query = query.in('id', projectIds)
//       } else {
//         // No hay proyectos asignados
//         return NextResponse.json({
//           projects: [],
//           pagination: { total: 0, page, limit },
//         })
//       }
//     }
//     // Admin y Manager ven todos los proyectos (sin filtro adicional)

//     const {
//       data: projects,
//       error: queryError,
//       count,
//     } = await query
//       .range(offset, offset + limit - 1)
//       .order('created_at', { ascending: false })

//     if (queryError) {
//       console.error('Error fetching projects:', queryError)
//       return NextResponse.json(
//         { error: 'Failed to fetch projects' },
//         { status: 500 }
//       )
//     }

//     return NextResponse.json({
//       projects: projects || [],
//       pagination: {
//         total: count || 0,
//         page,
//         limit,
//         totalPages: Math.ceil((count || 0) / limit),
//       },
//     })
//   } catch (error) {
//     console.error('Unexpected error fetching projects:', error)
//     return NextResponse.json(
//       { error: 'Unexpected error occurred' },
//       { status: 500 }
//     )
//   }
// }

// // Función auxiliar para obtener ID de la tabla users desde auth ID
// async function getUserIdFromAuthId(
//   authId: string,
//   serviceClient: ReturnType<typeof getServiceSupabase>
// ): Promise<number | null> {
//   const { data: user } = await serviceClient
//     .from('users')
//     .select('id')
//     .eq('uid', authId)
//     .single()

//   return user?.id || null
// }
