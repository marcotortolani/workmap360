// utils/projectFilters.ts

import { ProjectData, ProjectRepairType } from '@/types/project-types'
import {
  FilteredProjectData,
  FilteredProjectRepairType,
} from '@/types/filtered-project-types'
import { UserRole } from "@/types/user-types"

// Campos sensibles que deben ser excluidos para technician y client
const SENSITIVE_REPAIR_TYPE_FIELDS = [
  'price',
  'unit_to_charge',
  'minimum_charge_per_repair',
  'minimum_charge_per_drop',
] as const

// Función para filtrar un solo repair type
function filterRepairType(
  repairType: ProjectRepairType,
  role: UserRole
): FilteredProjectRepairType | ProjectRepairType {
  if (role === 'admin' || role === 'manager') {
    return repairType // Devolver datos completos
  }

  if (role === 'technician' || role === 'client') {
    // Crear objeto sin campos sensibles
    const filtered: FilteredProjectRepairType = {
      repair_type_id: repairType.repair_type_id,
      repair_type: repairType.repair_type,
      phases: repairType.phases,
      status: repairType.status,
    }
    return filtered
  }

  // Guest no debería ver repair types, pero por si acaso devolvemos filtrado
  return {
    repair_type_id: repairType.repair_type_id,
    repair_type: repairType.repair_type,
    phases: repairType.phases,
    status: repairType.status,
  }
}

// Función principal para filtrar proyectos
export function filterProjectsByRole(
  projects: ProjectData[],
  role: UserRole
): (ProjectData | FilteredProjectData)[] {
  // Admin y manager ven todos los datos
  if (role === 'admin' || role === 'manager') {
    return projects
  }

  // Client y technician ven datos limitados
  if (role === 'client' || role === 'technician') {
    return projects.map((project) => {
      const filteredProject: FilteredProjectData = {
        ...project,
        repair_types:
          project.repair_types?.map(
            (repairType) =>
              filterRepairType(repairType, role) as FilteredProjectRepairType
          ) || [],
      }
      return filteredProject
    })
  }

  // Guest u otros roles - podrías decidir qué mostrar o devolver array vacío
  return []
}

// Función helper para validar si un usuario puede ver datos sensibles
export function canViewSensitiveData(role: UserRole): boolean {
  return role === 'admin' || role === 'manager'
}

// Función para obtener los campos permitidos según el rol
export function getAllowedRepairTypeFields(role: UserRole): string[] {
  const baseFields = ['repair_type_id', 'repair_type', 'phases', 'status']

  if (canViewSensitiveData(role)) {
    return [...baseFields, ...SENSITIVE_REPAIR_TYPE_FIELDS]
  }

  return baseFields
}
