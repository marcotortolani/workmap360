// src/types/database-backup-types.ts

export interface DatabaseStats {
  users: {
    total: number
    active: number
    inactive: number
    byRole: {
      admin: number
      manager: number
      technician: number
      client: number
      guest: number
    }
  }
  projects: {
    total: number
    byStatus: {
      pending: number
      'in-progress': number
      completed: number
    }
  }
  repairs: {
    total: number
    byStatus: {
      approved: number
      pending: number
      rejected: number
    }
  }
  repair_types: {
    total: number
  }
  lastUpdated: string
}

export interface BackupHistory {
  id: number
  created_at: string
  created_by_user_id: number
  created_by_user_name: string
  backup_size_bytes: number
  tables_count: number
  total_records: number
  metadata: {
    users: number
    projects: number
    repairs: number
    repair_types: number
  }
  status: 'completed' | 'failed'
}

export interface DatabaseExport {
  metadata: {
    exportedAt: string
    exportedBy: string
    version: string
    tables: string[]
  }
  data: {
    users: Record<string, unknown>[]
    projects: Record<string, unknown>[]
    repairs: Record<string, unknown>[]
    repair_types: Record<string, unknown>[]
  }
}
