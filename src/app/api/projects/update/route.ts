// app/api/projects/update/route.ts - CORREGIDO
import { NextResponse, NextRequest } from 'next/server'
import { getSupabaseAuthWithRole } from '@/lib/getSupabaseAuthWithRole'
import { getServiceSupabase } from '@/lib/supabaseAuth'

export async function PUT(
  req: NextRequest
) {
  const { id, updateData } = await req.json()
  try {
    const { user, role, error } = await getSupabaseAuthWithRole(req)

    if (error || !user || !role) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    // Solo Admin y Manager pueden actualizar proyectos
    if (!['admin', 'manager'].includes(role)) {
      return NextResponse.json(
        { error: 'You dont have permission to update projects' },
        { status: 403 }
      )
    }

    const projectId = parseInt(id)
    if (!projectId || isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
    }

    const {
      name,
      client_name,
      client_id,
      status,
      elevations,
      repair_types,
      technicians,
    } = updateData

    // Validaciones básicas
    if (!name || !client_name || !client_id) {
      return NextResponse.json(
        { error: 'Missing required fields: name, client_name, client_id' },
        { status: 400 }
      )
    }

    const serviceClient = getServiceSupabase()

    // 🔧 VERIFICAR QUE EL PROYECTO EXISTE
    const { data: existingProject, error: checkError } = await serviceClient
      .from('projects')
      .select('id, name')
      .eq('id', projectId)
      .single()

    if (checkError || !existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // 🔧 ACTUALIZAR PROYECTO COMPLETO (todos los campos en una sola operación)
    const { data: updatedProject, error: updateError } = await serviceClient
      .from('projects')
      .update({
        name,
        client_name,
        client_id,
        status,
        // 🔧 Campos JSON directamente en la tabla projects
        elevations: elevations || [],
        repair_types: repair_types || [],
        technicians: technicians || [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .select('*')
      .single()

    if (updateError) {
      console.error('Error updating project:', updateError)
      return NextResponse.json(
        { error: 'Failed to update project', details: updateError.message },
        { status: 500 }
      )
    }

    console.log(
      `✅ Project updated successfully: ID ${projectId} - "${updatedProject.name}"`
    )

    return NextResponse.json({
      success: true,
      project: updatedProject,
      message: `Project "${updatedProject.name}" updated successfully`,
    })
  } catch (error) {
    console.error('Unexpected error updating project:', error)
    return NextResponse.json(
      { error: 'Unexpected error occurred' },
      { status: 500 }
    )
  }
}

// 2. CORREGIDO: app/api/projects/list/route.ts - Simplificado sin JOINs

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

//     // 🔧 CONSULTA SIMPLIFICADA - Solo tabla projects
//     let query = serviceClient.from('projects').select('*', { count: 'exact' })

//     // Filtrar según el rol (si es necesario)
//     if (role === 'client') {
//       const userIdInUsersTable = await getUserDataFromAuthId(
//         user.id,
//         serviceClient
//       )
//       if (!userIdInUsersTable) {
//         return NextResponse.json({
//           projects: [],
//           pagination: { total: 0, page, limit, totalPages: 0 },
//         })
//       }
//       query = query.eq('client_id', userIdInUsersTable)
//     } else if (role === 'technician') {
//       // Para técnicos, necesitarías filtrar por technicians JSON
//       // Esta lógica podría ser más compleja si necesitas buscar dentro del JSON
//       const userIdInUsersTable = await getUserDataFromAuthId(
//         user.id,
//         serviceClient
//       )
//       if (!userIdInUsersTable) {
//         return NextResponse.json({
//           projects: [],
//           pagination: { total: 0, page, limit, totalPages: 0 },
//         })
//       }
//       // Filtrar proyectos donde el técnico esté asignado (búsqueda en JSON)
//       query = query.contains('technicians', [
//         { technician_id: userIdInUsersTable },
//       ])
//     }
//     // Admin y Manager ven todos los proyectos

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

//     // 🔧 NO NECESITA TRANSFORMACIÓN - Los datos ya vienen en el formato correcto
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

// 3. CORREGIDO: app/api/projects/create/route.ts - Simplificado para una tabla

// export async function POST(req: NextRequest) {
//   try {
//     const { user, role, error } = await getSupabaseAuthWithRole(req)

//     if (error || !user || !role) {
//       return NextResponse.json(
//         { error: error || 'Unauthorized' },
//         { status: 401 }
//       )
//     }

//     // Solo Admin y Manager pueden crear proyectos
//     if (!['admin', 'manager'].includes(role)) {
//       return NextResponse.json(
//         { error: 'You dont have permission to create projects' },
//         { status: 403 }
//       )
//     }

//     const {
//       name,
//       client_name,
//       client_id,
//       status,
//       elevations,
//       repair_types,
//       technicians,
//     } = await req.json()

//     if (
//       !name ||
//       !client_name ||
//       !client_id ||
//       !elevations ||
//       elevations.length === 0
//     ) {
//       return NextResponse.json(
//         { error: 'Required fields are missing' },
//         { status: 400 }
//       )
//     }

//     const serviceClient = getServiceSupabase()

//     // Obtener datos del usuario
//     const userData = await getUserDataFromAuthId(user.id, serviceClient)
//     if (!userData) {
//       return NextResponse.json(
//         { error: 'User data not found' },
//         { status: 400 }
//       )
//     }

//     // 🔧 INSERTAR PROYECTO COMPLETO EN UNA SOLA OPERACIÓN
//     const { data: project, error: projectError } = await serviceClient
//       .from('projects')
//       .insert({
//         name,
//         client_name,
//         client_id,
//         status: status || 'pending',
//         // 🔧 Campos JSON directamente
//         elevations: elevations || [],
//         repair_types: repair_types || [],
//         technicians: technicians || [],
//         created_by_user_name:
//           `${user.user_metadata.first_name} ${user.user_metadata.last_name}`.trim(),
//         created_by_user_id: userData.id,
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString(),
//       })
//       .select('id')
//       .single()

//     if (projectError || !project) {
//       console.error('Error creating project:', projectError)
//       return NextResponse.json(
//         { error: 'Failed to create project' },
//         { status: 500 }
//       )
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         projectId: project.id,
//         message: 'Project created successfully',
//       },
//       { status: 201 }
//     )
//   } catch (error) {
//     console.error('Unexpected error creating project:', error)
//     return NextResponse.json(
//       { error: 'Unexpected error occurred' },
//       { status: 500 }
//     )
//   }
// }

// 4. CORREGIDO: app/api/projects/[id]/route.ts - DELETE simplificado

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
//     if (!projectId || isNaN(projectId)) {
//       return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
//     }

//     const serviceClient = getServiceSupabase()

//     // Verificar que el proyecto existe
//     const { data: projectExists, error: checkError } = await serviceClient
//       .from('projects')
//       .select('id, name, client_name')
//       .eq('id', projectId)
//       .single()

//     if (checkError || !projectExists) {
//       return NextResponse.json({ error: 'Project not found' }, { status: 404 })
//     }

//     // 🔧 ELIMINAR PROYECTO (solo una operación)
//     const { error: deleteError } = await serviceClient
//       .from('projects')
//       .delete()
//       .eq('id', projectId)

//     if (deleteError) {
//       console.error('Error deleting project:', deleteError)
//       return NextResponse.json(
//         {
//           error: 'Failed to delete project',
//           details: deleteError.message,
//         },
//         { status: 500 }
//       )
//     }

//     console.log(
//       `✅ Project deleted successfully: ID ${projectId} - "${projectExists.name}"`
//     )

//     return NextResponse.json({
//       success: true,
//       message: `Project "${projectExists.name}" deleted successfully`,
//       deletedProject: {
//         id: projectId,
//         name: projectExists.name,
//         client: projectExists.client_name,
//       },
//     })
//   } catch (error) {
//     console.error('Unexpected error deleting project:', error)
//     return NextResponse.json(
//       { error: 'Unexpected error occurred' },
//       { status: 500 }
//     )
//   }
// }

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
