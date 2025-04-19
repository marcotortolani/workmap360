export type RepairStatusType = 'Approved' | 'Pending' | 'Rejected'

export interface RepairDataType {
  id: string
  projectId: string
  drop: number
  level: number
  repairType: string
  date: string
  technician: string
  status: RepairStatusType
}
