// src/lib/dashboard-data.ts
'use server'

import { unstable_cache } from 'next/cache'
import { getServiceSupabase } from '@/lib/supabaseAuth'
import { UserRole } from '@/types/user-types'
import { RepairData } from '@/types/repair-type'
// import { ProjectData } from '@/types/project-types'
// import { DashboardStats } from '@/types/dashboard-types'
import { DashboardStats } from '@/types/dashboard-types'
import { getRepairType } from './utils'

export const getDashboardStats = unstable_cache(
  async (): Promise<DashboardStats> => {
    const supabase = getServiceSupabase()

    // --- USER STATS ---
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, role, created_at, first_name, last_name, avatar')

    if (usersError)
      throw new Error('Failed to fetch users: ' + usersError.message)

    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    const usersByRole = usersData.reduce((acc, user) => {
      const role = user.role as UserRole
      acc[role] = (acc[role] || 0) + 1
      return acc
    }, {} as Record<UserRole, number>)

    const newLastMonth = usersData.filter(
      (user) => new Date(user.created_at) > oneMonthAgo
    ).length

    // --- REPAIR STATS ---
    const { data: repairsData, error: repairsError } = await supabase
      .from('repairs')
      .select('status, phases, created_at, created_by_user_id')

    if (repairsError)
      throw new Error('Failed to fetch repairs: ' + repairsError.message)

    const repairsByType = (repairsData as RepairData[]).reduce(
      (acc, repair) => {
        const type = getRepairType(repair.phases) || 'Unknown'
        acc[type] = (acc[type] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const openRepairs = repairsData.filter((r) => r.status === 'pending').length
    const approvedRepairs = repairsData.filter(
      (r) => r.status === 'approved'
    ).length
    const rejectedRepairs = repairsData.filter(
      (r) => r.status === 'rejected'
    ).length

    // --- PROJECT STATS ---
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('status, client_name')

    if (projectsError)
      throw new Error('Failed to fetch projects: ' + projectsError.message)

    const projectsInProgress = projectsData.filter(
      (p) => p.status === 'in-progress'
    ).length
    const projectsCompleted = projectsData.filter(
      (p) => p.status === 'completed'
    ).length
    const projectsPending = projectsData.filter(
      (p) => p.status === 'pending'
    ).length

    // --- TECHNICIAN RANKING ---
    const repairsByTechnician = (repairsData as RepairData[]).reduce(
      (acc, repair) => {
        if (repair.created_by_user_id) {
          acc[repair.created_by_user_id] =
            (acc[repair.created_by_user_id] || 0) + 1
        }
        return acc
      },
      {} as Record<number, number>
    )

    const technicianRanking = Object.entries(repairsByTechnician)
      .map(([userId, count]) => {
        const user = usersData.find((u) => u.id === parseInt(userId))
        if (user && user.role === 'technician') {
          return {
            name: `${user.first_name} ${user.last_name}`,
            count,
            avatar: user.avatar || '', // Asegurar que avatar esté presente, usar string vacío como fallback
          }
        }
        return null
      })
      .filter(
        (item): item is { name: string; count: number; avatar: string } =>
          item !== null
      ) // Type guard explícito
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // --- REPAIRS BY MONTH ---
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    const repairsByMonth = Array.from({ length: 12 }).reduce(
      (acc: Record<string, number>, _, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthKey = date.toISOString().substring(0, 7) // YYYY-MM
        acc[monthKey] = 0
        return acc
      },
      {} as Record<string, number>
    )

    repairsData.forEach((repair) => {
      const repairDate = new Date(repair.created_at)
      if (repairDate >= twelveMonthsAgo) {
        const monthKey = repair.created_at.substring(0, 7)
        if (monthKey in repairsByMonth) {
          repairsByMonth[monthKey]++
        }
      }
    })

    const repairsByMonthData = Object.entries(repairsByMonth)
      .map(([month, count]) => ({
        month: new Date(month + '-02').toLocaleString('default', {
          month: 'short',
        }), // Use a specific date to avoid timezone issues
        count,
      }))
      .reverse()

    return {
      users: {
        total: usersData.length,
        byRole: usersByRole,
        newLastMonth: newLastMonth,
      },
      repairs: {
        open: openRepairs,
        approved: approvedRepairs,
        rejected: rejectedRepairs,
        byType: repairsByType,
      },
      projects: {
        inProgress: projectsInProgress,
        completed: projectsCompleted,
        pending: projectsPending,
      },
      technicianRanking,
      repairsByMonth: repairsByMonthData,
    }
  },
  ['dashboard-stats'], // Cache key
  { revalidate: 300 } // Revalidate every 5 minutes
)
