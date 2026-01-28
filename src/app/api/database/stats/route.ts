// src/app/api/database/stats/route.ts
import { NextResponse } from 'next/server'
import { getSupabaseAuthWithRole } from '@/lib/getSupabaseAuthWithRole'
import { getServiceSupabase } from '@/lib/supabaseAuth'
import type { DatabaseStats } from '@/types/database-backup-types'

export async function GET(request: Request) {
  const { error, role } = await getSupabaseAuthWithRole(request)

  if (error) {
    return NextResponse.json({ error }, { status: 401 })
  }

  // Verify user is admin
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
  }

  try {
    const serviceSupabase = getServiceSupabase()

    // Users statistics - use count queries
    const { count: totalUsers, error: totalUsersError } = await serviceSupabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (totalUsersError) throw totalUsersError

    const { count: activeUsers, error: activeUsersError } = await serviceSupabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    if (activeUsersError) throw activeUsersError

    const { count: inactiveUsers, error: inactiveUsersError } = await serviceSupabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'inactive')

    if (inactiveUsersError) throw inactiveUsersError

    const { count: adminUsers, error: adminUsersError } = await serviceSupabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin')

    if (adminUsersError) throw adminUsersError

    const { count: managerUsers, error: managerUsersError } = await serviceSupabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'manager')

    if (managerUsersError) throw managerUsersError

    const { count: technicianUsers, error: technicianUsersError } = await serviceSupabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'technician')

    if (technicianUsersError) throw technicianUsersError

    const { count: clientUsers, error: clientUsersError } = await serviceSupabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'client')

    if (clientUsersError) throw clientUsersError

    const { count: guestUsers, error: guestUsersError } = await serviceSupabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'guest')

    if (guestUsersError) throw guestUsersError

    // Projects statistics - use count queries
    const { count: totalProjects, error: totalProjectsError } = await serviceSupabase
      .from('projects')
      .select('*', { count: 'exact', head: true })

    if (totalProjectsError) throw totalProjectsError

    const { count: pendingProjects, error: pendingProjectsError } = await serviceSupabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    if (pendingProjectsError) throw pendingProjectsError

    const { count: inProgressProjects, error: inProgressProjectsError } = await serviceSupabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'in-progress')

    if (inProgressProjectsError) throw inProgressProjectsError

    const { count: completedProjects, error: completedProjectsError } = await serviceSupabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')

    if (completedProjectsError) throw completedProjectsError

    // Repairs statistics - use count queries
    const { count: totalRepairs, error: totalRepairsError } = await serviceSupabase
      .from('repairs')
      .select('*', { count: 'exact', head: true })

    if (totalRepairsError) throw totalRepairsError

    const { count: approvedRepairs, error: approvedRepairsError } = await serviceSupabase
      .from('repairs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')

    if (approvedRepairsError) throw approvedRepairsError

    const { count: pendingRepairs, error: pendingRepairsError } = await serviceSupabase
      .from('repairs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    if (pendingRepairsError) throw pendingRepairsError

    const { count: rejectedRepairs, error: rejectedRepairsError } = await serviceSupabase
      .from('repairs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected')

    if (rejectedRepairsError) throw rejectedRepairsError

    // Note: Images are stored in Cloudinary, not in Supabase, so we skip counting them

    // Try to fetch repair_types count (may not exist as it's often hardcoded)
    const { count: repairTypesCount, error: repairTypesError } = await serviceSupabase
      .from('repair_types')
      .select('*', { count: 'exact', head: true })

    // Don't fail if repair_types table doesn't exist, use hardcoded count instead
    let finalRepairTypesCount = repairTypesCount || 0
    if (repairTypesError) {
      console.warn('Warning: repair_types table not found, using hardcoded count:', repairTypesError)
      const { REPAIR_TYPE_LIST } = await import('@/data/repair-type-list')
      finalRepairTypesCount = REPAIR_TYPE_LIST.length
    }

    // Build statistics objects
    const usersStats = {
      total: totalUsers || 0,
      active: activeUsers || 0,
      inactive: inactiveUsers || 0,
      byRole: {
        admin: adminUsers || 0,
        manager: managerUsers || 0,
        technician: technicianUsers || 0,
        client: clientUsers || 0,
        guest: guestUsers || 0,
      }
    }

    const projectsStats = {
      total: totalProjects || 0,
      byStatus: {
        pending: pendingProjects || 0,
        'in-progress': inProgressProjects || 0,
        completed: completedProjects || 0,
      }
    }

    const repairsStats = {
      total: totalRepairs || 0,
      byStatus: {
        approved: approvedRepairs || 0,
        pending: pendingRepairs || 0,
        rejected: rejectedRepairs || 0,
      }
    }

    const stats: DatabaseStats = {
      users: usersStats,
      projects: projectsStats,
      repairs: repairsStats,
      repair_types: {
        total: finalRepairTypesCount
      },
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(stats, { status: 200 })
  } catch (err) {
    console.error('Error fetching database stats:', err)
    return NextResponse.json({ error: 'Error fetching database stats' }, { status: 500 })
  }
}
