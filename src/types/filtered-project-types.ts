// src/types/filtered-project-types.ts

import {
  ProjectData,
  TechnicianAssignment,
  Elevation,
  ProjectStatusType,
  RepairStatusType,
} from './project-types'
import { UserType } from './user-types'

// Versión filtrada de ProjectRepairType para technician y client
export interface FilteredProjectRepairType {
  repair_type_id: number // ID del tipo de reparación, ej. 1
  repair_type: string // Código del tipo de reparación, ej. "CR"
  phases: number // Cantidad de fases (mín: 3, máx: 10)
  status: RepairStatusType
}

// Versión filtrada de ProjectData para technician y client
export interface FilteredProjectData {
  id: number // ID único del proyecto, ej. 1
  name: string // Nombre del proyecto (dirección), ej. "957 George Av"
  client_id: number // ID del cliente, ej. 100
  client_name: string // Nombre del cliente, ej. "Walter Perez"
  client_user?: UserType // Objeto de usuario del cliente
  elevations: Elevation[] // Array de caras del edificio (mín: 1, máx: 20)
  repair_types: FilteredProjectRepairType[] // Tipos de reparación SIN datos sensibles
  technicians: TechnicianAssignment[] // Técnicos asignados al proyecto
  created_by_user_name: string // Nombre del Manager que creó el proyecto
  created_by_user_id: number // ID del Manager que creó el proyecto
  created_at: string // Date string ISO
  updated_at: string // Date string ISO
  status: ProjectStatusType // Estado del proyecto
}

// Tipo union para diferentes niveles de acceso
export type ProjectResponse = ProjectData | FilteredProjectData

// Función type guard para verificar si es un proyecto completo
export function isFullProjectData(
  project: ProjectResponse
): project is ProjectData {
  const repairType = project.repair_types[0]
  return repairType && 'price' in repairType
}

// Función type guard para verificar si es un proyecto filtrado
export function isFilteredProjectData(
  project: ProjectResponse
): project is FilteredProjectData {
  return !isFullProjectData(project)
}
