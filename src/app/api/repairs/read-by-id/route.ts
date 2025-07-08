// src/app/api/repairs/read-by-id/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabaseAuth'
import { getSupabaseAuthWithRole } from '@/lib/getSupabaseAuthWithRole'

export async function GET(req: NextRequest) {
  const { id } = await req.json()
  try {
    const { user, role, error } = await getSupabaseAuthWithRole(req)

    if (error || !user || !role) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    const repairId = parseInt(id)
    if (!repairId || isNaN(repairId)) {
      return NextResponse.json({ error: 'Invalid repair ID' }, { status: 400 })
    }

    const serviceClient = getServiceSupabase()

    // Usar la función auxiliar para obtener reparación completa
    const { data: repairData, error: rpcError } = await serviceClient.rpc(
      'get_repair_with_phases',
      { repair_id_param: repairId }
    )

    if (rpcError || !repairData) {
      return NextResponse.json({ error: 'Repair not found' }, { status: 404 })
    }

    return NextResponse.json({ repair: repairData })
  } catch (error) {
    console.error('Unexpected error fetching repair:', error)
    return NextResponse.json(
      { error: 'Unexpected error occurred' },
      { status: 500 }
    )
  }
}
