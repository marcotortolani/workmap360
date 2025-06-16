/* eslint-disable @typescript-eslint/no-explicit-any */
// /app/api/users/create/route.ts
import { NextResponse } from 'next/server'
import { getSupabaseAuthWithRole } from '@/lib/getSupabaseAuthWithRole'
import { getServiceSupabase } from '@/lib/supabaseAuth'

export async function POST(req: Request) {
  const redirectTo = new URL(req.url).origin + `/auth/confirm`
  try {
    const { user, role, error } = await getSupabaseAuthWithRole(req)

    if (error || !user || !role) {
      return NextResponse.json({ error }, { status: 401 })
    }

    if (!['admin', 'manager'].includes(role)) {
      return NextResponse.json(
        { error: 'No tenés permisos para crear usuarios' },
        { status: 403 }
      )
    }

    const {
      firstName,
      lastName,
      email,
      role: newUserRole,
      createdAt,
      status,
      avatar,
      useInviteFlow = true,
    } = await req.json()

    if (!firstName || !email || !newUserRole || !createdAt) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      )
    }

    const validRoles = ['admin', 'manager', 'technician', 'client', 'guest']
    if (!validRoles.includes(newUserRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const serviceClient = getServiceSupabase()

    const authPayload: any = {
      email,
      redirectTo: redirectTo,
      redirectToComplete: redirectTo,
    }
    if (useInviteFlow) {
      authPayload.sendEmailInvitation = true
      authPayload.password = `${firstName.toLowerCase()}123`
    } else {
      authPayload.password = `${firstName.toLowerCase()}123`
    }

    const { data: authUser, error: authError } =
      await serviceClient.auth.admin.createUser(authPayload)

    if (authError?.message?.includes('User already registered')) {
      return NextResponse.json({ error: 'Email ya en uso' }, { status: 409 })
    }

    if (authError || !authUser?.user) {
      return NextResponse.json(
        { error: 'Error creando usuario en Auth' },
        { status: 500 }
      )
    }

    const uid = authUser.user.id

    const { data, error: insertError } = await serviceClient
      .from('users')
      .insert({
        uid,
        first_name: firstName,
        last_name: lastName,
        email,
        role: newUserRole,
        created_at: createdAt,
        status: status || 'active',
        avatar,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ user: data }, { status: 201 })
  } catch (err) {
    console.error('Error:', err)
    return NextResponse.json(
      { error: 'Error creando usuario' },
      { status: 500 }
    )
  }
}
