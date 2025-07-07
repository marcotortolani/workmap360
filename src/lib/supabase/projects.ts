// Agregar estas funciones al archivo donde está tu ProjectForm o crear un archivo separado (ej: lib/supabase/projects.ts)

// lib/supabase/projects.ts
import { createClient } from '@/lib/supabase/client'
import {
  ProjectData,
  Elevation,
  ProjectRepairType,
  TechnicianAssignment,
} from '@/types/project-types'

// Función para crear un proyecto completo en Supabase
export async function createProjectInSupabase(projectData: {
  name: string
  clientName: string
  clientId: number
  status: ProjectData['status']
  elevations: Elevation[]
  repairTypes: ProjectRepairType[]
  technicians: TechnicianAssignment[]
  createdByUserName: string
  createdByUserId: number
}): Promise<{ success: boolean; projectId?: number; error?: string }> {
  try {
    const supabase = await createClient()

    // 1. Insertar el proyecto principal
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: projectData.name,
        client_name: projectData.clientName,
        client_id: projectData.clientId,
        status: projectData.status,
        created_by_user_name: projectData.createdByUserName,
        created_by_user_id: projectData.createdByUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (projectError || !project) {
      console.error('Error creating project:', projectError)
      return { success: false, error: 'Failed to create project' }
    }

    const projectId = project.id

    // 2. Insertar elevations
    if (projectData.elevations.length > 0) {
      const elevationsToInsert = projectData.elevations.map((elevation) => ({
        project_id: projectId,
        name: elevation.name,
        drops: elevation.drops,
        levels: elevation.levels,
        created_at: new Date().toISOString(),
      }))

      const { error: elevationsError } = await supabase
        .from('project_elevations')
        .insert(elevationsToInsert)

      if (elevationsError) {
        console.error('Error creating elevations:', elevationsError)
        // Opcionalmente, podrías eliminar el proyecto creado si falla
        return { success: false, error: 'Failed to create elevations' }
      }
    }

    // 3. Insertar repair types
    if (projectData.repairTypes.length > 0) {
      const repairTypesToInsert = projectData.repairTypes.map((repairType) => ({
        project_id: projectId,
        repair_type_id: repairType.repairTypeId,
        repair_type: repairType.repairType,
        phases: repairType.phases,
        price: repairType.price,
        unit_to_charge: repairType.unitToCharge,
        minimum_charge_per_repair: repairType.minimumChargePerRepair,
        minimum_charge_per_drop: repairType.minimumChargePerDrop,
        status: repairType.status,
        created_at: new Date().toISOString(),
      }))

      const { error: repairTypesError } = await supabase
        .from('project_repair_types')
        .insert(repairTypesToInsert)

      if (repairTypesError) {
        console.error('Error creating repair types:', repairTypesError)
        return { success: false, error: 'Failed to create repair types' }
      }
    }

    // 4. Insertar technicians
    if (projectData.technicians.length > 0) {
      const techniciansToInsert = projectData.technicians.map((technician) => ({
        project_id: projectId,
        technician_id: technician.technicianId,
        technician_first_name: technician.technicianFirstName,
        technician_last_name: technician.technicianLastName,
        technician_avatar: technician.technicianAvatar,
        created_at: new Date().toISOString(),
      }))

      const { error: techniciansError } = await supabase
        .from('project_technicians')
        .insert(techniciansToInsert)

      if (techniciansError) {
        console.error('Error creating technicians:', techniciansError)
        return { success: false, error: 'Failed to assign technicians' }
      }
    }

    return { success: true, projectId }
  } catch (error) {
    console.error('Unexpected error creating project:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

// Función para obtener proyecto completo desde Supabase
export async function getProjectFromSupabase(
  projectId: number
): Promise<{ success: boolean; project?: ProjectData; error?: string }> {
  try {
    const supabase = await createClient()

    // Usar la función que creamos anteriormente
    const { data, error } = await supabase.rpc('get_project_complete', {
      p_id: projectId,
    })

    if (error) {
      console.error('Error fetching project:', error)
      return { success: false, error: 'Failed to fetch project' }
    }

    return { success: true, project: data }
  } catch (error) {
    console.error('Unexpected error fetching project:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}
