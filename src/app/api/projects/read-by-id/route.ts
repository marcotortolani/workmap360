// app/api/projects/read-by-id/route.ts - CORREGIDO
import { NextResponse, NextRequest } from 'next/server'
import { getSupabaseAuthWithRole } from '@/lib/getSupabaseAuthWithRole'
import { getServiceSupabase } from '@/lib/supabaseAuth'

// Función auxiliar simplificada usando uid
async function getUserDataFromAuthId(
  authId: string,
  serviceClient: ReturnType<typeof getServiceSupabase>
): Promise<{ id: number; role: string } | null> {
  const { data: user } = await serviceClient
    .from('users')
    .select('id, role')
    .eq('uid', authId)
    .single()

  return user || null
}

export async function GET(req: NextRequest) {
  const { id } = await req.json()
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

    const projectId = parseInt(id)
    if (!projectId || isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
    }

    const serviceClient = getServiceSupabase()

    // 🔧 CONSULTA SIMPLIFICADA - Solo tabla projects
    let query = serviceClient
      .from('projects')
      .select('id', { count: 'exact' })
      .eq('id', projectId)

    // Filtrar según el rol (si es necesario)
    if (role === 'client') {
      const userIdInUsersTable = await getUserDataFromAuthId(
        user.id,
        serviceClient
      )
      if (!userIdInUsersTable) {
        return NextResponse.json({
          projects: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
        })
      }
      query = query.eq('client_id', userIdInUsersTable)
    } else if (role === 'technician') {
      // Para técnicos, necesitarías filtrar por technicians JSON
      // Esta lógica podría ser más compleja si necesitas buscar dentro del JSON
      const userIdInUsersTable = await getUserDataFromAuthId(
        user.id,
        serviceClient
      )
      if (!userIdInUsersTable) {
        return NextResponse.json({
          projects: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
        })
      }
      // Filtrar proyectos donde el técnico esté asignado (búsqueda en JSON)
      query = query.contains('technicians', [
        { technician_id: userIdInUsersTable },
      ])
    }
    // Admin y Manager ven todos los proyectos

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

    // 🔧 NO NECESITA TRANSFORMACIÓN - Los datos ya vienen en el formato correcto
    return NextResponse.json({
      projects: projects || [],
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

// export async function GET(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { user, role, error } = await getSupabaseAuthWithRole(req)

//     if (error || !user || !role) {
//       return NextResponse.json(
//         { error: error || 'Unauthorized' },
//         { status: 401 }
//       )
//     }

//     const projectId = parseInt(params.id)
//     if (!projectId) {
//       return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
//     }

//     const serviceClient = getServiceSupabase()

//     // Usar la función RPC que creamos antes
//     const { data: projectData, error: rpcError } = await serviceClient.rpc(
//       'get_project_complete',
//       { p_id: projectId }
//     )

//     if (rpcError) {
//       console.error('Error fetching project:', rpcError)
//       return NextResponse.json(
//         { error: 'Failed to fetch project' },
//         { status: 500 }
//       )
//     }

//     if (!projectData) {
//       return NextResponse.json({ error: 'Project not found' }, { status: 404 })
//     }

//     // Verificar permisos de acceso según el rol
//     if (role === 'client') {
//       const userData = await getUserDataFromAuthId(user.id, serviceClient)
//       if (!userData || projectData.clientId !== userData.id) {
//         return NextResponse.json({ error: 'Access denied' }, { status: 403 })
//       }
//     } else if (role === 'technician') {
//       const userData = await getUserDataFromAuthId(user.id, serviceClient)
//       if (!userData) {
//         return NextResponse.json({ error: 'User not found' }, { status: 403 })
//       }

//       const isAssigned = projectData.technicians?.some(
//         (tech: ProjectData['technicians'][0]) =>
//           tech.technician_id === userData.id
//       )
//       if (!isAssigned) {
//         return NextResponse.json({ error: 'Access denied' }, { status: 403 })
//       }
//     }
//     // Admin y Manager tienen acceso a todos los proyectos

//     return NextResponse.json({ project: projectData })
//   } catch (error) {
//     console.error('Unexpected error fetching project:', error)
//     return NextResponse.json(
//       { error: 'Unexpected error occurred' },
//       { status: 500 }
//     )
//   }
// }

// // PUT para actualizar proyecto
// export async function PUT(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { user, role, error } = await getSupabaseAuthWithRole(req)

//     if (error || !user || !role) {
//       return NextResponse.json(
//         { error: error || 'Unauthorized' },
//         { status: 401 }
//       )
//     }

//     // Solo Admin y Manager pueden actualizar proyectos
//     if (!['admin', 'manager'].includes(role)) {
//       return NextResponse.json(
//         { error: 'You dont have permission to update projects' },
//         { status: 403 }
//       )
//     }

//     const projectId = parseInt(params.id)
//     if (!projectId) {
//       return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
//     }

//     const updateData = await req.json()
//     const serviceClient = getServiceSupabase()

//     // Actualizar proyecto principal
//     const { data: updatedProject, error: updateError } = await serviceClient
//       .from('projects')
//       .update({
//         ...updateData,
//         updated_at: new Date().toISOString(),
//       })
//       .eq('id', projectId)
//       .select()
//       .single()

//     if (updateError) {
//       console.error('Error updating project:', updateError)
//       return NextResponse.json(
//         { error: 'Failed to update project' },
//         { status: 500 }
//       )
//     }

//     return NextResponse.json({
//       success: true,
//       project: updatedProject,
//       message: 'Project updated successfully',
//     })
//   } catch (error) {
//     console.error('Unexpected error updating project:', error)
//     return NextResponse.json(
//       { error: 'Unexpected error occurred' },
//       { status: 500 }
//     )
//   }
// }

// // DELETE para eliminar proyecto
// export async function DELETE(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { user, role, error } = await getSupabaseAuthWithRole(req)

//     if (error || !user || !role) {
//       return NextResponse.json(
//         { error: error || 'Unauthorized' },
//         { status: 401 }
//       )
//     }

//     // Solo Admin y Manager pueden eliminar proyectos
//     if (!['admin', 'manager'].includes(role)) {
//       return NextResponse.json(
//         { error: 'You dont have permission to delete projects' },
//         { status: 403 }
//       )
//     }

//     const projectId = parseInt(params.id)
//     if (!projectId) {
//       return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
//     }

//     const serviceClient = getServiceSupabase()

//     // Eliminar en cascada (en el orden correcto)
//     await serviceClient
//       .from('project_technicians')
//       .delete()
//       .eq('project_id', projectId)
//     await serviceClient
//       .from('project_repair_types')
//       .delete()
//       .eq('project_id', projectId)
//     await serviceClient
//       .from('project_elevations')
//       .delete()
//       .eq('project_id', projectId)

//     const { error: deleteError } = await serviceClient
//       .from('projects')
//       .delete()
//       .eq('id', projectId)

//     if (deleteError) {
//       console.error('Error deleting project:', deleteError)
//       return NextResponse.json(
//         { error: 'Failed to delete project' },
//         { status: 500 }
//       )
//     }

//     return NextResponse.json({
//       success: true,
//       message: 'Project deleted successfully',
//     })
//   } catch (error) {
//     console.error('Unexpected error deleting project:', error)
//     return NextResponse.json(
//       { error: 'Unexpected error occurred' },
//       { status: 500 }
//     )
//   }
// }
