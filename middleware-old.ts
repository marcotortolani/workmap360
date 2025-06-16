// app/middleware.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function middleware(request: any) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/users-test', request.url))
  }

  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('email', user.email)
    .single()

  const protectedRoutes = ['/admin', '/manager', '/technician', '/client']
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (
    isProtectedRoute &&
    (!data?.role || data.role !== request.nextUrl.pathname.split('/')[1])
  ) {
    return NextResponse.redirect(new URL('/users-test', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/manager', '/technician', '/client', '/guest'],
}
