import type React from 'react'

import { Sidebar } from '@/components/sidebar'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/logout-button'
import { MobileNav } from '@/components/mobile-nav'

const sidebarItems = [
  {
    title: 'My Projects',
    href: '/dashboard/technician/projects',
    icon: 'folder-kanban',
  },
  {
    title: 'New Repair',
    href: '/dashboard/technician/new-repair',
    icon: 'pen-tool',
  },
  {
    title: 'Repairs',
    href: '/dashboard/technician/reparations',
    icon: 'wrench',
  },
  {
    title: "Map's View",
    href: '/dashboard/technician/maps-view',
    icon: 'map',
  },
  {
    title: 'Profile',
    href: '/dashboard/technician/profile',
    icon: 'user-circle',
  },
]

export default async function TechnicianLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/auth/login')
  }

  const { data: dbUser, error: dbError } = await supabase
    .from('users')
    .select('*')
    .eq('email', data.user.email)
    .single()
  if (dbError || !dbUser) {
    redirect('/auth/login')
  }
  if (dbUser.role !== 'technician') {
    redirect('/')
  }
  return (
    <div className="flex h-screen">
      <Sidebar items={sidebarItems} userData={dbUser} />
      {/* <MobileTabs tabs={adminTabs} /> */}
      <MobileNav items={sidebarItems} />
      <main className="py-8 px-10 flex-1 space-y-6 overflow-auto bg-gray-50">
        <div className=" flex items-center justify-between ">
          <h1 className=" text-3xl font-bold text-orange-500">
            Technician Dashboard
          </h1>
          <LogoutButton />
        </div>
        {/* <TabsNavigation tabs={managerTabs} basePath="/dashboard/manager" /> */}
        {children}
      </main>
    </div>
  )
}
