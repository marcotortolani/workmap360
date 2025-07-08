// app/api/projects/delete/route.ts - CORREGIDO
import { NextResponse, NextRequest } from 'next/server'
import { getSupabaseAuthWithRole } from '@/lib/getSupabaseAuthWithRole'
import { getServiceSupabase } from '@/lib/supabaseAuth'

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  try {
    const { user, role, error } = await getSupabaseAuthWithRole(req)

    if (error || !user || !role) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    // Solo Admin y Manager pueden eliminar proyectos
    if (!['admin', 'manager'].includes(role)) {
      return NextResponse.json(
        { error: 'You dont have permission to delete projects' },
        { status: 403 }
      )
    }

    const projectId = parseInt(id)
    if (!projectId || isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
    }

    const serviceClient = getServiceSupabase()

    // Verificar que el proyecto existe
    const { data: projectExists, error: checkError } = await serviceClient
      .from('projects')
      .select('id, name, client_name')
      .eq('id', projectId)
      .single()

    if (checkError || !projectExists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // 🔧 ELIMINAR PROYECTO (solo una operación)
    const { error: deleteError } = await serviceClient
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (deleteError) {
      console.error('Error deleting project:', deleteError)
      return NextResponse.json(
        {
          error: 'Failed to delete project',
          details: deleteError.message,
        },
        { status: 500 }
      )
    }

    console.log(
      `✅ Project deleted successfully: ID ${projectId} - "${projectExists.name}"`
    )

    return NextResponse.json({
      success: true,
      message: `Project "${projectExists.name}" deleted successfully`,
      deletedProject: {
        id: projectId,
        name: projectExists.name,
        client: projectExists.client_name,
      },
    })
  } catch (error) {
    console.error('Unexpected error deleting project:', error)
    return NextResponse.json(
      { error: 'Unexpected error occurred' },
      { status: 500 }
    )
  }
}
