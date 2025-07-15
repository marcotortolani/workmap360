// src/types/dashboard-types.ts
import { UserRole } from './user-types'

export interface DashboardStats {
  users: {
    total: number
    byRole: Record<UserRole, number>
    newLastMonth: number
  }
  repairs: {
    open: number
    approved: number
    rejected: number
    byType: Record<string, number>
  }
  projects: {
    inProgress: number
    completed: number
    pending: number
  }
  technicianRanking: {
    name: string
    count: number
    avatar: string
  }[]
  repairsByMonth: {
    month: string
    count: number
  }[]
}
