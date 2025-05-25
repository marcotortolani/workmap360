export interface UnitMeasure {
  type: 'length' | 'area' | 'volume' | 'unit' | 'custom'
  value: string // ex: 'mm', "mm x mm", 'mm x mm x mm', 'unit', '1m bar'
  defaultValues?: Partial<Record<string, number>> // Para valores predeterminados, ej. { depth: 10 }
  dimensions?: string[]
}

export interface UnitConversion {
  from: UnitMeasure // Unidad de medición
  to: string // Unidad de cobro, ej. "Lt"
  conversionFactor: (measurements: Record<string, number>) => number // Función para convertir
}

export interface RepairType {
  id: number // ID único (incremental)
  variation: string // Nombre del tipo de reparación, ej. "Concrete Repair Custom 10mm"
  type: string // Código único, ej. "CR1"
  description: string // Descripción (opcional)
  unitMeasure: UnitMeasure // Unidad de medición
  unitToCharge: string // Unidad de cobro
  conversion?: UnitConversion // Regla de conversión (opcional)
  createdBy: string // Nombre del usuario que lo creó
  createdByUser: number // ID del usuario que lo creó
  createdAt: number // Timestamp de creación
  updatedAt?: number // Timestamp de última actualización
  status: 'active' | 'inactive'
}

export type RepairDataStatusType = 'approved' | 'pending' | 'rejected'

export interface RepairData {
  id: number // ID de reparacion en BD
  // repairCode: string // Codigo de reparacion: D11.L2.MR
  projectId: number
  projectName: string
  elevation: string
  drop: number
  level: number
  repairType: string
  repairTypeId: number
  repairIndex: number
  status: RepairDataStatusType
  phases: {
    survey: {
      createdByUserName: string
      createdByUserId: number
      createdAt: number
      measurements: Record<string, number>
      image: Blob
    }
    progress: {
      createdByUserName: string
      createdByUserId: number
      createdAt: number
      measurements?: Record<string, number> | null
      image: Blob
    }[]
    finish: {
      createdByUserName: string
      createdByUserId: number
      createdAt: number
      measurements?: Record<string, number> | null
      image: Blob
    }
  }
}
