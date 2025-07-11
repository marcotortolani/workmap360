// src/types/project-types.ts

import { UserType } from './user-types'

export type ProjectStatusType = 'pending' | 'in-progress' | 'completed'
export const PROJECT_STATUS: Record<ProjectStatusType, ProjectStatusType> = {
  pending: 'pending',
  'in-progress': 'in-progress',
  completed: 'completed',
}

export type RepairStatusType = 'pending' | 'active'
export const REPAIR_STATUS_OPTIONS: RepairStatusType[] = ['pending', 'active']

export interface Elevation {
  name: string // Nombre de la cara, ej. "Norte", "Sur", "George St"
  drops: number // Cantidad de drops, ej. 11
  levels: number // Cantidad de niveles, ej. 7
}

export interface ProjectRepairType {
  repair_type_id: number // ID del tipo de reparación, ej. 1
  repair_type: string // Código del tipo de reparación, ej. "CR"
  phases: number // Cantidad de fases (mín: 3, máx: 10)
  price: number // Precio de la reparación para este proyecto, ej. 1500
  unit_to_charge: string // Unidad usada para facturar en el tipo de reparacion, ej. "unit"
  minimum_charge_per_repair: number // Cantidad mínima a facturar por reparación, ej. 2
  minimum_charge_per_drop: number // Cantidad mínima a facturar por drop, ej. 1
  status: RepairStatusType
}

export interface TechnicianAssignment {
  technician_id: UserType['id'] // ID del técnico, ej. 10
  technician_first_name: UserType['first_name'] // Nombre del técnico, ej. "Jose"
  technician_last_name: UserType['last_name'] // Apellido del técnico, ej. "Hernandez"
  technician_avatar: UserType['avatar'] // URL o referencia al avatar (como string, ya que es un dato que luego se sincronizará)
}

export interface ProjectData {
  id: number // ID único del proyecto, ej. 1
  name: string // Nombre del proyecto (dirección), ej. "957 George Av"
  client_id: number // ID del cliente, ej. 100
  client_name: string // Nombre del cliente, ej. "Walter Perez"
  client_user?: UserType // Objeto de usuario del cliente
  elevations: Elevation[] // Array de caras del edificio (mín: 1, máx: 20)
  repair_types: ProjectRepairType[] // Tipos de reparación permitidos en el proyecto
  technicians: TechnicianAssignment[] // Técnicos asignados al proyecto
  created_by_user_name: string // Nombre del Manager que creó el proyecto
  created_by_user_id: number // ID del Manager que creó el proyecto
  created_at: string // Date string ISO
  updated_at: string // Date string ISO
  status: ProjectStatusType // Estado del proyecto
}
