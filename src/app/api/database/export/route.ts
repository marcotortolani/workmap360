// src/app/api/database/export/route.ts
import { NextResponse } from 'next/server'
import { getSupabaseAuthWithRole } from '@/lib/getSupabaseAuthWithRole'
import { getServiceSupabase } from '@/lib/supabaseAuth'
import type { DatabaseExport } from '@/types/database-backup-types'

export async function GET(request: Request) {
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

    // Get user profile for export metadata
    const { data: userProfile, error: profileError } = await serviceSupabase
      .from('users')
      .select('first_name, last_name')
      .eq('uid', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      throw new Error(`Profile error: ${profileError.message}`)
    }

    // Fetch all data from tables with better error handling
    console.log('Fetching users data...')
    const { data: usersData, error: usersError } = await serviceSupabase
      .from('users')
      .select('*')

    if (usersError) {
      console.error('Error fetching users:', usersError)
      throw new Error(`Users error: ${usersError.message}`)
    }

    console.log('Fetching projects data...')
    const { data: projectsData, error: projectsError } = await serviceSupabase
      .from('projects')
      .select('*')

    if (projectsError) {
      console.error('Error fetching projects:', projectsError)
      throw new Error(`Projects error: ${projectsError.message}`)
    }

    console.log('Fetching repairs data...')
    const { data: repairsData, error: repairsError } = await serviceSupabase
      .from('repairs')
      .select('*')

    if (repairsError) {
      console.error('Error fetching repairs:', repairsError)
      throw new Error(`Repairs error: ${repairsError.message}`)
    }

    // Note: Images are stored in Cloudinary, not in Supabase, so we skip fetching them

    // Try to fetch repair_types (may not exist as it's often hardcoded)
    console.log('Fetching repair_types data...')
    const { data: repairTypesData, error: repairTypesError } = await serviceSupabase
      .from('repair_types')
      .select('*')

    // Don't fail if repair_types table doesn't exist
    let repairTypesForExport: any[] = []
    if (repairTypesError) {
      console.warn('Warning: repair_types table not found, using hardcoded data without functions:', repairTypesError)
      // Use hardcoded data but remove function properties to make it JSON-serializable
      const { REPAIR_TYPE_LIST } = await import('@/data/repair-type-list')
      repairTypesForExport = REPAIR_TYPE_LIST.map(rt => ({
        ...rt,
        conversion: rt.conversion ? {
          from: rt.conversion.from,
          to: rt.conversion.to,
          // Remove conversion_factor function
        } : undefined
      }))
    } else {
      repairTypesForExport = repairTypesData || []
    }

    // Create export object
    const timestamp = new Date().toISOString()
    const tables = ['users', 'projects', 'repairs', 'repair_types']

    const exportData: DatabaseExport = {
      metadata: {
        exportedAt: timestamp,
        exportedBy: `${userProfile.first_name} ${userProfile.last_name}`,
        version: '1.0.0',
        tables
      },
      data: {
        users: usersData || [],
        projects: projectsData || [],
        repairs: repairsData || [],
        repair_types: repairTypesForExport
      }
    }

    // Generate filename with timestamp
    const filename = `workmap360-backup-${Date.now()}.json`

    // Return as downloadable JSON file
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error('Error exporting database:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    const errorStack = err instanceof Error ? err.stack : undefined
    return NextResponse.json({
      error: 'Error exporting database',
      details: errorMessage,
      stack: errorStack
    }, { status: 500 })
  }
}
