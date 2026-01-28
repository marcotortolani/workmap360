// src/app/api/database/backup/route.ts
import { NextResponse } from 'next/server'
import { getSupabaseAuthWithRole } from '@/lib/getSupabaseAuthWithRole'
import { getServiceSupabase } from '@/lib/supabaseAuth'
import { calculateJsonSize } from '@/lib/database/stats-utils'

// POST - Create backup record
export async function POST(request: Request) {
  const { error, role, user } = await getSupabaseAuthWithRole(request)

  if (error) {
    return NextResponse.json({ error }, { status: 401 })
  }

  // Verify user is admin
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
  }

  try {
    const serviceSupabase = getServiceSupabase()

    // Get user profile to get name
    const { data: userProfile, error: profileError } = await serviceSupabase
      .from('users')
      .select('id, first_name, last_name')
      .eq('uid', user.id)
      .single()

    if (profileError) throw profileError

    // Fetch counts for all tables
    const { count: usersCount } = await serviceSupabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    const { count: projectsCount } = await serviceSupabase
      .from('projects')
      .select('*', { count: 'exact', head: true })

    const { count: repairsCount } = await serviceSupabase
      .from('repairs')
      .select('*', { count: 'exact', head: true })

    // Note: Images are stored in Cloudinary, not in Supabase, so we skip counting them

    // Try to fetch repair_types count (may not exist)
    const { count: repairTypesCount, error: repairTypesError } = await serviceSupabase
      .from('repair_types')
      .select('*', { count: 'exact', head: true })

    let finalRepairTypesCount = repairTypesCount || 0
    if (repairTypesError) {
      console.warn('Warning: repair_types table not found, using hardcoded count:', repairTypesError)
      const { REPAIR_TYPE_LIST } = await import('@/data/repair-type-list')
      finalRepairTypesCount = REPAIR_TYPE_LIST.length
    }

    const totalRecords = (usersCount || 0) + (projectsCount || 0) + (repairsCount || 0) + finalRepairTypesCount
    const tablesCount = 4

    // Create metadata object
    const metadata = {
      users: usersCount || 0,
      projects: projectsCount || 0,
      repairs: repairsCount || 0,
      repair_types: finalRepairTypesCount,
    }

    // Estimate backup size (will be accurate after export)
    const estimatedSize = calculateJsonSize(metadata) * totalRecords

    // Insert backup record
    const { data: backupRecord, error: insertError } = await serviceSupabase
      .from('backup_history')
      .insert({
        created_by_user_id: userProfile.id,
        created_by_user_name: `${userProfile.first_name} ${userProfile.last_name}`,
        backup_size_bytes: estimatedSize,
        tables_count: tablesCount,
        total_records: totalRecords,
        metadata,
        status: 'completed'
      })
      .select()
      .single()

    if (insertError) throw insertError

    return NextResponse.json(
      {
        success: true,
        backup: backupRecord
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('Error creating backup record:', err)
    return NextResponse.json({ error: 'Error creating backup record' }, { status: 500 })
  }
}

// GET - Fetch backup history
export async function GET(request: Request) {
  const { error, role } = await getSupabaseAuthWithRole(request)

  if (error) {
    return NextResponse.json({ error }, { status: 401 })
  }

  // Verify user is admin
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
  }

  // Get pagination params
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  const from = (page - 1) * limit
  const to = from + limit - 1

  try {
    const serviceSupabase = getServiceSupabase()

    const {
      data: backups,
      count,
      error: fetchError,
    } = await serviceSupabase
      .from('backup_history')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (fetchError) throw fetchError

    return NextResponse.json(
      {
        backups,
        pagination: {
          page,
          limit,
          total: count ?? 0,
          totalPages: Math.ceil((count ?? 0) / limit),
        },
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('Error fetching backup history:', err)
    return NextResponse.json({ error: 'Error fetching backup history' }, { status: 500 })
  }
}
