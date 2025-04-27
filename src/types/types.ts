import { RepairType } from './repair-type'

export type RepairStatusType = 'approved' | 'pending' | 'rejected'

export interface RepairData {
  id: string
  timestamp: number
  projectId: string
  drop: number
  level: number
  repairType: string
  repairTypeId: number
  measurements: Record<string, number>
  technician: string
  technicianId: number
  status: RepairStatusType
  images: { survey: Blob; progress: Blob[]; finish: Blob }
}

export interface ProjectsDataType {
  id: string
  dropRange: string
  levelRange: string
  status: string
  repairTypes: RepairType[]
  repairs: RepairData[]
}
