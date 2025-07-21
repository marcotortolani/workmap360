// app/api/users/change-password/route.ts

import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { newPassword } = body

    // Validaciones básicas
    if (!newPassword) {
      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Crear cliente de Supabase desde el servidor
    const supabase = await createClient()

    // Verificar si hay una sesión activa
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: 'No active session found. Please log in again.' },
        { status: 401 }
      )
    }

    // Actualizar la contraseña usando la sesión actual
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      console.error('Error updating password:', updateError)

      // Manejar diferentes tipos de errores específicos de Supabase
      if (updateError.message.includes('session_not_found')) {
        return NextResponse.json(
          { error: 'Session expired. Please log out and log in again.' },
          { status: 401 }
        )
      }

      if (updateError.message.includes('invalid_credentials')) {
        return NextResponse.json(
          { error: 'Invalid session. Please log out and log in again.' },
          { status: 401 }
        )
      }

      if (updateError.message.includes('weak_password')) {
        return NextResponse.json(
          { error: 'Password is too weak. Please choose a stronger password.' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        {
          error:
            updateError.message ||
            'Failed to update password. Please try again.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Password updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error changing password:', error)
    return NextResponse.json(
      { error: 'Unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

// // app/api/users/change-password/route.ts

// import { NextResponse, NextRequest } from 'next/server'
// import { getSupabaseAuthWithRole } from '@/lib/getSupabaseAuthWithRole'
// import { createClient } from '@/lib/supabase/client'

// export async function PUT(req: NextRequest) {
//   try {
//     const body = await req.json()
//     const { currentPassword, newPassword } = body

//     // Validaciones básicas
//     if (!currentPassword || !newPassword) {
//       return NextResponse.json(
//         { error: 'Current password and new password are required' },
//         { status: 400 }
//       )
//     }

//     if (newPassword.length < 6) {
//       return NextResponse.json(
//         { error: 'New password must be at least 6 characters long' },
//         { status: 400 }
//       )
//     }

//     if (currentPassword === newPassword) {
//       return NextResponse.json(
//         { error: 'New password must be different from current password' },
//         { status: 400 }
//       )
//     }

//     // Verificar autenticación
//     const { user, error: authError } = await getSupabaseAuthWithRole(req)

//     if (authError || !user) {
//       return NextResponse.json(
//         { error: authError || 'Unauthorized' },
//         { status: 401 }
//       )
//     }

//     // Crear cliente de Supabase para operaciones de auth
//     const supabase = createClient()
//     console.log(currentPassword)

//     // Verificar la contraseña actual intentando hacer sign in
//     const { error: signInError } = await supabase.auth.signInWithPassword({
//       email: user.email!,
//       password: currentPassword,
//     })

//     console.log('Sign In Error:', signInError)

//     if (signInError) {
//       return NextResponse.json(
//         { error: 'Current password is incorrect' },
//         { status: 400 }
//       )
//     }

//     // Actualizar la contraseña
//     const { error: updateError } = await supabase.auth.updateUser({
//       password: newPassword,
//     })

//     if (updateError) {
//       console.error('Error updating password:', updateError)
//       return NextResponse.json(
//         { error: 'Failed to update password. Please try again.' },
//         { status: 500 }
//       )
//     }

//     return NextResponse.json(
//       { message: 'Password updated successfully' },
//       { status: 200 }
//     )
//   } catch (error) {
//     console.error('Unexpected error changing password:', error)
//     return NextResponse.json(
//       { error: 'Unexpected error occurred' },
//       { status: 500 }
//     )
//   }
// }
