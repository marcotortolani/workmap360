// src/types/repair-type.ts

// export interface UnitMeasure {
//   type: 'length' | 'area' | 'volume' | 'unit' | 'custom'
//   value: string // ex: 'mm', "mm x mm", 'mm x mm x mm', 'unit', '1m bar'
//   default_values?: Partial<Record<string, number>> // Para valores predeterminados, ej. { depth: 10 }
//   dimensions?: string[]
// }
export interface UnitMeasure {
  type:
    | 'length'
    | 'area'
    | 'volume'
    | 'each'
    | 'length_thickness'
    | 'area_thickness'
  value: string // ex: 'mm', "mm x mm", 'mm x mm x mm', 'unit', '1m bar'
  default_values?: Partial<Record<string, number>> // Para valores predeterminados, ej. { depth: 10 }
  dimensions?: string[]
}

export interface UnitConversion {
  from: UnitMeasure // Unidad de medición
  to: string // Unidad de cobro, ej. "Lt"
  conversion_factor: (measurements: Record<string, number>) => number // Función para convertir
}

export interface RepairType {
  id: number // ID único (incremental)
  variation: string // Nombre del tipo de reparación, ej. "Concrete Repair Custom 10mm"
  type: string // Código único, ej. "CR1"
  description: string // Descripción (opcional)
  unit_measure: UnitMeasure // Unidad de medición
  unit_to_charge: string // Unidad de cobro
  conversion?: UnitConversion // Regla de conversión (opcional)
  created_by_user_name: string // Nombre del usuario que lo creó
  created_by_user_id: number // ID del usuario que lo creó
  created_at: string // Date string ISO
  updated_at?: string // Date string ISO
  status: 'active' | 'inactive'
  color?: string
}

export type RepairDataStatusType = 'approved' | 'pending' | 'rejected'

export interface RepairPhase {
  created_by_user_name: string
  created_by_user_id: number
  created_at: string
  repair_type?: string | null
  repair_type_id?: number | null
  measurements?: Record<string, number> | null
  comments?: string
}

export interface SurveyPhase extends RepairPhase {
  // repair_type: string
  // repair_type_id: number
  // measurements: Record<string, number>
  photos: string[]
}

export interface ProgressPhase extends RepairPhase {
  photo: string
}

export interface FinishPhase
  extends Omit<RepairPhase, 'repair_type' | 'repair_type_id' | 'measurements'> {
  photos: string[]
}

export interface RepairPhases {
  survey?: SurveyPhase
  progress?: ProgressPhase[]
  finish?: FinishPhase
}

export interface RepairData {
  id: number
  project_id: number
  project_name: string
  elevation_name: string
  drop: number
  level: number
  repair_index: number
  status: RepairDataStatusType
  phases: RepairPhases
  created_by_user_name?: string
  created_by_user_id?: number
  created_at: string
  updated_at: string
}

export interface RepairListParams {
  page?: number
  limit?: number
  project_id?: number
  status?: RepairDataStatusType
  elevation_name?: string
  drop?: number
  level?: number
  repair_code?: string
}

export interface RepairListResponse {
  repairs: RepairData[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// export interface RepairData {
//   id: number // ID de reparacion en BD
//   // repairCode: string // Codigo de reparacion: D11.L2.MR
//   project_id: number
//   project_name: string
//   elevation_name: string
//   drop: number
//   level: number
//   repair_index: number
//   status: RepairDataStatusType
//   phases: {
//     survey: {
//       created_by_user_name: string
//       created_by_user_id: number
//       created_at: string
//       repair_type: RepairType['type']
//       repair_type_id: RepairType['id']
//       measurements: Record<string, number>
//       images: Blob[]
//       comments?: string
//     }
//     progress: {
//       created_by_user_name: string
//       created_by_user_id: number
//       created_at: string
//       repair_type?: string | null
//       repair_type_id?: number | null
//       measurements?: Record<string, number> | null
//       image: Blob
//       comments?: string
//     }[]
//     finish: {
//       created_by_user_name: string
//       created_by_user_id: number
//       created_at: string
//       images: Blob[]
//       comments?: string
//     }
//   }
// }
