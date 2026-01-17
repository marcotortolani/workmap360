// app/api/projects/create/route.ts - CORREGIDO
import { NextResponse, NextRequest } from 'next/server'
import { getSupabaseAuthWithRole } from '@/lib/getSupabaseAuthWithRole'
import { getServiceSupabase } from '@/lib/supabaseAuth'
import { getUserDataFromAuthId } from '@/lib/api/utils'
import { validateCSRFForRequest } from '@/lib/security/csrf'

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

    // Solo Admin y Manager pueden crear proyectos
    if (!['admin', 'manager'].includes(role)) {
      return NextResponse.json(
        { error: 'You dont have permission to create projects' },
        { status: 403 }
      )
    }

    const {
      name,
      client_name,
      client_id,
      status,
      elevations,
      repair_types,
      technicians,
    } = await req.json()

    if (
      !name ||
      !client_name ||
      !client_id ||
      !elevations ||
      elevations.length === 0
    ) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      )
    }

    const serviceClient = getServiceSupabase()

    // ✅ Obtener datos del usuario de la tabla users
    const userData = await getUserDataFromAuthId(user.id, serviceClient)
    if (!userData) {
      return NextResponse.json(
        { error: 'User data not found' },
        { status: 400 }
      )
    }

    // 1. Insertar el proyecto principal
    const { data: project, error: projectError } = await serviceClient
      .from('projects')
      .insert({
        name,
        client_name: client_name,
        client_id: client_id,
        status: status || 'pending',
        created_by_user_name:
          `${userData.first_name} ${userData.last_name}`.trim(),
        created_by_user_id: userData.id, // ✅ Ahora es un número válido
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        elevations: elevations || [],
        repair_types: repair_types || [],
        technicians: technicians || [],
      })
      .select('id')
      .single()

    if (projectError || !project) {
      console.error('Error creating project:', projectError)
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      )
    }

    const project_id = project.id

    // 2. Insertar elevations
    // if (elevations && elevations.length > 0) {
    //   const elevationsToInsert = elevations.map((elevation: Elevation) => ({
    //     project_id: project_id,
    //     name: elevation.name,
    //     drops: elevation.drops,
    //     levels: elevation.levels,
    //     created_at: new Date().toISOString(),
    //   }))

    //   const { error: elevationsError } = await serviceClient
    //     .from('project_elevations')
    //     .insert(elevationsToInsert)

    //   if (elevationsError) {
    //     console.error('Error creating elevations:', elevationsError)
    //     // Rollback: eliminar el proyecto creado
    //     await serviceClient.from('projects').delete().eq('id', project_id)
    //     return NextResponse.json(
    //       { error: 'Failed to create elevations' },
    //       { status: 500 }
    //     )
    //   }
    // }

    // 3. Insertar repair types
    // if (repair_types && repair_types.length > 0) {
    //   const repair_typesToInsert = repair_types.map(
    //     (repair_type: ProjectRepairType) => ({
    //       project_id: project_id,
    //       repair_type_id: repair_type.repair_type_id,
    //       repair_type: repair_type.repair_type,
    //       phases: repair_type.phases,
    //       price: repair_type.price,
    //       unit_to_charge: repair_type.unit_to_charge,
    //       minimum_charge_per_repair: repair_type.minimum_charge_per_repair,
    //       minimum_charge_per_drop: repair_type.minimum_charge_per_drop,
    //       status: repair_type.status,
    //       created_at: new Date().toISOString(),
    //     })
    //   )

    //   const { error: repair_typesError } = await serviceClient
    //     .from('project_repair_types')
    //     .insert(repair_typesToInsert)

    //   if (repair_typesError) {
    //     console.error('Error creating repair types:', repair_typesError)
    //     // Opcional: rollback completo
    //     await serviceClient
    //       .from('project_elevations')
    //       .delete()
    //       .eq('project_id', project_id)
    //     await serviceClient.from('projects').delete().eq('id', project_id)
    //     return NextResponse.json(
    //       { error: 'Failed to create repair types' },
    //       { status: 500 }
    //     )
    //   }
    // }

    // 4. Insertar technicians
    // if (technicians && technicians.length > 0) {
    //   const techniciansToInsert = technicians.map(
    //     (technician: TechnicianAssignment) => ({
    //       project_id: project_id,
    //       technician_id: technician.technician_id,
    //       technician_first_name: technician.technician_first_name,
    //       technician_last_name: technician.technician_last_name,
    //       technician_avatar: technician.technician_avatar,
    //       created_at: new Date().toISOString(),
    //     })
    //   )

    //   const { error: techniciansError } = await serviceClient
    //     .from('project_technicians')
    //     .insert(techniciansToInsert)

    //   if (techniciansError) {
    //     console.error('Error creating technicians:', techniciansError)
    //     // Opcional: rollback completo
    //     await serviceClient
    //       .from('project_repair_types')
    //       .delete()
    //       .eq('project_id', project_id)
    //     await serviceClient
    //       .from('project_elevations')
    //       .delete()
    //       .eq('project_id', project_id)
    //     await serviceClient.from('projects').delete().eq('id', project_id)
    //     return NextResponse.json(
    //       { error: 'Failed to assign technicians' },
    //       { status: 500 }
    //     )
    //   }
    // }

    return NextResponse.json(
      {
        success: true,
        project_id,
        message: 'Project created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error creating project:', error)
    return NextResponse.json(
      { error: 'Unexpected error occurred' },
      { status: 500 }
    )
  }
}
