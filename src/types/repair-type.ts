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
  variation: string // Nombre del tipo de reparación, ej. "Concrete Repair Custom 20mm"
  type: string // Código único, ej. "CR-Custom1"
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
  id: string // podria ser el ID del proyecto + el ID de la reparación
  timestamp: number
  projectId: number
  drop: number
  level: number
  repairType: string
  repairTypeId: number
  measurements: Record<string, number>
  technician: string
  technicianId: number
  status: RepairDataStatusType
  images: { survey: Blob; progress: Blob[]; finish: Blob }
}
