// app/api/images/signed-upload/route.ts
import { NextResponse } from 'next/server'
//import { getSupabaseAuthWithRole } from '@/lib/getSupabaseAuthWithRole'
import { getCloudinary } from '@/lib/cloudinary'
import { validateCSRFForRequest } from '@/lib/security/csrf'

interface SignedUploadRequest {
  public_id?: string
  folder?: string
  transformations?: { width?: number; height?: number; crop?: string }
}

export async function POST(req: Request) {
  // CSRF Protection
  const csrfValidation = await validateCSRFForRequest(req)
  if (csrfValidation) return csrfValidation

  try {
    // Descomenta esto cuando quieras habilitar autenticación
    // const { user, role, error } = await getSupabaseAuthWithRole(req)
    // if (error || !user || !role) {
    //   return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    // }

    const body: SignedUploadRequest = await req.json()
    const { public_id, folder = 'unkwown', transformations } = body

    // Sanitizar public_id
    let sanitizedPublicId = public_id || `image-${Date.now()}`
    sanitizedPublicId = sanitizedPublicId
      .replace(/[^a-zA-Z0-9-_\/]/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 255)

    if (!sanitizedPublicId) {
      return NextResponse.json(
        { error: 'Nombre de archivo inválido' },
        { status: 400 }
      )
    }

    const cloudinary = getCloudinary()
    const timestamp = Math.round(new Date().getTime() / 1000)

    // Parámetros para la firma - SOLO los que Cloudinary necesita para validar
    const paramsToSign: Record<string, unknown> = {
      public_id: `${folder}/${sanitizedPublicId}`,
      timestamp,
      asset_folder: folder,
    }

    // Agregar transformaciones individuales si existen
    if (transformations?.width) {
      paramsToSign.width = transformations.width
    }
    if (transformations?.height) {
      paramsToSign.height = transformations.height
    }
    if (transformations?.crop) {
      paramsToSign.crop = transformations.crop
    }

    // Generar firma
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    )

    const response = {
      signature,
      timestamp,
      public_id: paramsToSign.public_id,
      asset_folder: paramsToSign.asset_folder,
      apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      // Devolver transformaciones separadas para el FormData
      ...(transformations?.width && { width: transformations.width }),
      ...(transformations?.height && { height: transformations.height }),
      ...(transformations?.crop && { crop: transformations.crop }),
    }
    return NextResponse.json(response)
  } catch (err: ErrorConstructor | unknown) {
    console.error('Error generando firma de carga:', err)
    return NextResponse.json(
      {
        error:
          (err instanceof Error && err.message) ||
          'Error generando firma de carga',
      },
      { status: 500 }
    )
  }
}
