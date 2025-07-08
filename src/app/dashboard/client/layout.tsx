// src/app/dashboard/client/layout.tsx
'use client'
import type React from 'react'
import { useCurrentUser } from '@/stores/user-store'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { LogoutButton } from '@/components/logout-button'

// import { redirect } from 'next/navigation'
// import { createClient } from '@/lib/supabase/server'

export default function ClientLayout({
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
  // if (dbUser.role !== 'client') {
  //   redirect('/')
  // }
  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen">
      <Header role="client" userData={user} />
      <Sidebar role="client" userData={user} />
      <main className="py-8 px-10 flex-1 space-y-6 overflow-auto bg-gray-50">
        <div className="hidden md:flex items-center justify-between ">
          <h2 className=" text-3xl font-bold text-orange-500">
            Client Dashboard
          </h2>
          <LogoutButton />
        </div>
        {/* <TabsNavigation tabs={managerTabs} basePath="/dashboard/manager" /> */}
        {children}
      </main>
    </div>
  )
}
