import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabaseAuth'
import { getSupabaseAuthWithRole } from '@/lib/getSupabaseAuthWithRole'
import { getUserDataFromAuthId } from '@/lib/api/utils'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, role, error } = await getSupabaseAuthWithRole(req)

    if (error || !user || !role) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    const repairId = parseInt(params.id)
    if (!repairId || isNaN(repairId)) {
      return NextResponse.json({ error: 'Invalid repair ID' }, { status: 400 })
    }

    const { status } = await req.json()

    if (!status || !['approved', 'pending', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: approved, pending, or rejected' },
        { status: 400 }
      )
    }

    const serviceClient = getServiceSupabase()
    const userData = await getUserDataFromAuthId(user.id, serviceClient)

    if (!userData) {
      return NextResponse.json(
        { error: 'User data not found' },
        { status: 400 }
      )
    }

    // Usar la función SQL específica para clientes
    if (role === 'client') {
      const { error: functionError } = await serviceClient.rpc(
        'update_repair_status_by_client',
        {
          repair_id_param: repairId,
          new_status: status,
          user_id_param: userData.id,
        }
      )

      if (functionError) {
        return NextResponse.json(
          { error: functionError.message },
          { status: 403 }
        )
      }
    } else if (['admin', 'manager'].includes(role)) {
      // Admin y Manager pueden actualizar directamente
      const { error: updateError } = await serviceClient
        .from('repairs')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', repairId)

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update repair status' },
          { status: 500 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'You dont have permission to update repair status' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Repair status updated successfully',
    })
  } catch (error) {
    console.error('Unexpected error updating repair status:', error)
    return NextResponse.json(
      { error: 'Unexpected error occurred' },
      { status: 500 }
    )
  }
}
