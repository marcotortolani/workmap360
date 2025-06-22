// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { NextResponse } from 'next/server'
// import { getSupabaseAuthWithRole } from '@/lib/getSupabaseAuthWithRole'
// import { getServiceSupabase } from '@/lib/supabaseAuth'
// import { getCloudinary } from '@/lib/cloudinary'

// interface ImageUpdateRequest {
//   file?: string
//   metadata?: Record<string, any>
// }

// // GET /api/images/[id]
// export async function GET(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { user, role, error } = await getSupabaseAuthWithRole(req)

//     if (error || !user || !role) {
//       return NextResponse.json(
//         { error: error || 'No autorizado' },
//         { status: 401 }
//       )
//     }

//     const serviceClient = getServiceSupabase()
//     let query = serviceClient
//       .from('images')
//       .select('*')
//       .eq('id', params.id)
//       .single()

//     if (!['admin', 'manager'].includes(role)) {
//       query = query.eq('user_id', user.id)
//     }

//     const { data, error: fetchError } = await query

//     if (fetchError || !data) {
//       console.error('Error obteniendo imagen:', fetchError?.message)
//       return NextResponse.json(
//         { error: 'Imagen no encontrada' },
//         { status: 404 }
//       )
//     }

//     return NextResponse.json({ image: data }, { status: 200 })
//   } catch (err: any) {
//     console.error('Error obteniendo imagen:', err)
//     return NextResponse.json(
//       { error: err.message || 'Error obteniendo imagen' },
//       { status: 500 }
//     )
//   }
// }

// // PUT /api/images/[id]
// export async function PUT(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { user, role, error } = await getSupabaseAuthWithRole(req)

//     if (error || !user || !role) {
//       return NextResponse.json(
//         { error: error || 'No autorizado' },
//         { status: 401 }
//       )
//     }

//     if (!['admin', 'manager'].includes(role)) {
//       return NextResponse.json(
//         { error: 'No tienes permiso para actualizar imágenes' },
//         { status: 403 }
//       )
//     }

//     const body: ImageUpdateRequest = await req.json()
//     const { file, metadata } = body

//     const serviceClient = getServiceSupabase()
//     const { data: existingImage, error: fetchError } = await serviceClient
//       .from('images')
//       .select('*')
//       .eq('id', params.id)
//       .single()

//     if (fetchError || !existingImage) {
//       console.error('Error obteniendo imagen:', fetchError?.message)
//       return NextResponse.json(
//         { error: 'Imagen no encontrada' },
//         { status: 404 }
//       )
//     }

//     const cloudinary = getCloudinary()
//     const updateData: any = { updated_at: new Date().toISOString() }

//     if (file) {
//       if (!file.startsWith('data:image/')) {
//         return NextResponse.json(
//           { error: 'Formato de imagen inválido' },
//           { status: 400 }
//         )
//       }

//       const uploadOptions: any = {
//         public_id: existingImage.public_id,
//         invalidate: true,
//         resource_type: 'image',
//       }

//       const uploadResult = await cloudinary.uploader.upload(file, uploadOptions)
//       updateData.url = uploadResult.secure_url
//       updateData.metadata = uploadResult
//     }

//     if (metadata) {
//       updateData.metadata = metadata
//     }

//     const { data, error: updateError } = await serviceClient
//       .from('images')
//       .update(updateData)
//       .eq('id', params.id)
//       .select()
//       .single()

//     if (updateError) {
//       console.error(
//         'Error actualizando imagen en Supabase:',
//         updateError.message
//       )
//       return NextResponse.json(
//         { error: 'Error actualizando imagen' },
//         { status: 500 }
//       )
//     }

//     return NextResponse.json({ image: data }, { status: 200 })
//   } catch (err: any) {
//     console.error('Error actualizando imagen:', err)
//     return NextResponse.json(
//       { error: err.message || 'Error actualizando imagen' },
//       { status: 500 }
//     )
//   }
// }

// // DELETE /api/images/[id]
// export async function DELETE(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { user, role, error } = await getSupabaseAuthWithRole(req)

//     if (error || !user || !role) {
//       return NextResponse.json(
//         { error: error || 'No autorizado' },
//         { status: 401 }
//       )
//     }

//     if (!['admin', 'manager'].includes(role)) {
//       return NextResponse.json(
//         { error: 'No tienes permiso para eliminar imágenes' },
//         { status: 403 }
//       )
//     }

//     const serviceClient = getServiceSupabase()
//     const { data: existingImage, error: fetchError } = await serviceClient
//       .from('images')
//       .select('*')
//       .eq('id', params.id)
//       .single()

//     if (fetchError || !existingImage) {
//       console.error('Error obteniendo imagen:', fetchError?.message)
//       return NextResponse.json(
//         { error: 'Imagen no encontrada' },
//         { status: 404 }
//       )
//     }

//     const cloudinary = getCloudinary()
//     await cloudinary.uploader.destroy(existingImage.public_id)

//     const { error: deleteError } = await serviceClient
//       .from('images')
//       .delete()
//       .eq('id', params.id)

//     if (deleteError) {
//       console.error('Error eliminando imagen en Supabase:', deleteError.message)
//       return NextResponse.json(
//         { error: 'Error eliminando imagen' },
//         { status: 500 }
//       )
//     }

//     return NextResponse.json(
//       { message: 'Imagen eliminada exitosamente' },
//       { status: 200 }
//     )
//   } catch (err: any) {
//     console.error('Error eliminando imagen:', err)
//     return NextResponse.json(
//       { error: err.message || 'Error eliminando imagen' },
//       { status: 500 }
//     )
//   }
// }
