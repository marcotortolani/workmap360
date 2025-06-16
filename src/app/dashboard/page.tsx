import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
//import { LogoutButton } from '@/components/logout-button'

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

  // return (
  //   <div className="relative bg-white text-black w-screen h-screen overflow-hidden flex items-center justify-center">
  //     <div className=" absolute top-0 right-0 ">
  //       <LogoutButton />
  //     </div>
  //     <div className=" w-5/6 px-4 flex flex-col gap-2 items-start">
  //       <h1>Dashboard</h1>
  //       <h2 className="font-bold text-2xl mb-4">Your user details</h2>
  //       <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
  //         {JSON.stringify(data.user.email, null, 2)}
  //       </pre>
  //     </div>
  //   </div>
  // )
}
