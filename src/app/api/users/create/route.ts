/* eslint-disable @typescript-eslint/no-explicit-any */
// /app/api/users/create/route.ts
import { NextResponse } from 'next/server'
import { getSupabaseAuthWithRole } from '@/lib/getSupabaseAuthWithRole'
import { getServiceSupabase } from '@/lib/supabaseAuth'
import { validRoles } from '@/data/roles'

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  }

  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`

  try {
    const { user, role, error } = await getSupabaseAuthWithRole(req)

    if (error || !user || !role) {
      return NextResponse.json({ error }, { status: 401 })
    }

    if (!['admin', 'manager'].includes(role)) {
      return NextResponse.json(
        { error: 'You don`t have permission to create users' },
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

    // const validRoles = ['admin', 'manager', 'technician', 'client', 'guest']
    if (!validRoles.includes(newUserRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const serviceClient = getServiceSupabase()

    const authPayload: any = {
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    }
    if (useInviteFlow) {
      authPayload.password = `${firstName.toLowerCase()}123`
      authPayload.email_confirm = false
      authPayload.invited_by =
        user.user_metadata.first_name + ' ' + user.user_metadata.last_name
      authPayload.invited_by_email = user.email
      authPayload.invited_by_role = role
      authPayload.options.emailRedirectTo = redirectTo
      authPayload.email_confirm = true // el correo se confirma automaticamente
    } else {
      authPayload.password = `${firstName.toLowerCase()}123`
      authPayload.email_confirm = true // el correo se confirma automaticamente
    }

    const { data: authUser, error: authError } =
      await serviceClient.auth.admin.createUser(authPayload)

    if (
      authError?.message?.includes('User already registered') ||
      authError?.code?.includes('email_exists')
    ) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    if (authError || !authUser?.user) {
      return NextResponse.json(
        { error: 'Error creating user' },
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
      console.error(
        'Error inserting user in table:',
        insertError.message
      )
      await serviceClient.auth.admin.deleteUser(uid)
      return NextResponse.json(
        { error: 'Error saving user' },
        { status: 500 }
      )
    }

    return NextResponse.json({ user: data }, { status: 201 })
  } catch (err) {
    console.error('Error:', err)
    return NextResponse.json({ error: 'Error creating user' }, { status: 500 })
  }
}
