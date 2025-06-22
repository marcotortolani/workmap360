/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { getSupabaseAuthWithRole } from '@/lib/getSupabaseAuthWithRole'
import { getServiceSupabase } from '@/lib/supabaseAuth'
import { getCloudinary } from '@/lib/cloudinary'

interface ImageUploadRequest {
  file: string // Base64-encoded image
  folder?: string
  transformations?: { width?: number; height?: number; crop?: string }
}

// POST /api/images/upload
export async function POST(req: Request) {
  try {
    const { user, role, error } = await getSupabaseAuthWithRole(req)

    if (error || !user || !role) {
      return NextResponse.json(
        { error: error || 'No autorizado' },
        { status: 401 }
      )
    }

    if (!['admin', 'manager'].includes(role)) {
      return NextResponse.json(
        { error: 'No tienes permiso para subir imágenes' },
        { status: 403 }
      )
    }

    const body: ImageUploadRequest = await req.json()
    const { file, folder = 'user_uploads', transformations } = body

    if (!file) {
      return NextResponse.json(
        { error: 'Archivo de imagen requerido' },
        { status: 400 }
      )
    }

    if (!file.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Formato de imagen inválido' },
        { status: 400 }
      )
    }

    const cloudinary = getCloudinary()
    const uploadOptions: any = {
      folder,
      resource_type: 'image',
      public_id: `image-${user.id}-${Date.now()}`,
    }

    if (transformations) {
      uploadOptions.transformation = [
        {
          width: transformations.width,
          height: transformations.height,
          crop: transformations.crop || 'scale',
        },
      ]
    }

    const uploadResult = await cloudinary.uploader.upload(file, uploadOptions)

    const serviceClient = getServiceSupabase()
    const { data, error: insertError } = await serviceClient
      .from('images')
      .insert({
        user_id: user.id,
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
        metadata: uploadResult,
      })
      .select()
      .single()

    if (insertError) {
      await cloudinary.uploader.destroy(uploadResult.public_id)
      console.error('Error insertando imagen en Supabase:', insertError.message)
      return NextResponse.json(
        { error: 'Error guardando imagen' },
        { status: 500 }
      )
    }

    return NextResponse.json({ image: data }, { status: 201 })
  } catch (err: any) {
    console.error('Error subiendo imagen:', err)
    return NextResponse.json(
      { error: err.message || 'Error subiendo imagen' },
      { status: 500 }
    )
  }
}

