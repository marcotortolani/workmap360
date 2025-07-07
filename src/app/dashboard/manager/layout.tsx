// src/app/dashboard/manager/layout.tsx

'use client'
import type React from 'react'
import { useCurrentUser } from '@/stores/user-store'
import { Sidebar } from '@/components/sidebar'
import { LogoutButton } from '@/components/logout-button'
import { Header } from '@/components/header'
// import { redirect } from 'next/navigation'
// import { createClient } from '@/lib/supabase/server'
// import { TabsNavigation } from '@/components/tabs'

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useCurrentUser()
  // const supabase = await createClient()

  // const { data, error } = await supabase.auth.getUser()
  // if (error || !data?.user) {
  //   redirect('/auth/login')
  // }

  // const { data: dbUser, error: dbError } = await supabase
  //   .from('users')
  //   .select('*')
  //   .eq('email', data.user.email)
  //   .single()
  // if (dbError || !dbUser) {
  //   redirect('/auth/login')
  // }
  // if (dbUser.role !== 'manager') {
  //   redirect('/')
  // }
  if (!user) {
    return null
  }

  return (
    <div className="flex flex-col md:flex-row w-full h-screen bg-red-500/0">
      <Header role="manager" userData={user} />
      <Sidebar role="manager" userData={user} />
      <main className="py-8 px-2 md:px-10 flex-1 space-y-6 overflow-auto bg-gray-50">
        <div className="hidden md:flex items-center justify-between ">
          <h2 className=" text-3xl font-bold text-orange-500">
            Manager Dashboard
          </h2>
          <LogoutButton />
        </div>
        {/* <TabsNavigation tabs={managerTabs} basePath="/dashboard/manager" /> */}
        {children}
      </main>
    </div>
  )
}
