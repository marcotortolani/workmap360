import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { validRoles } from '@/data/roles'

export default async function page() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/auth/login')
  }
  // get user role on supabase to redirect to the correct dashboard
  const { data: dbUser, error: dbError } = await supabase
    .from('users')
    .select('role')
    .eq('email', data.user.email)
    .single()
  if (dbError || !dbUser) {
    redirect('/auth/login')
  }
  if (!validRoles.includes(dbUser.role) || !dbUser || !dbUser.role) {
    redirect('/')
  }
  redirect(`/dashboard/${dbUser.role}`) 
}
