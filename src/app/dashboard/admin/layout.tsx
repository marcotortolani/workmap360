import type React from 'react'
import { Sidebar } from '@/components/sidebar'
import { MobileNav } from '@/components/mobile-nav'
import { LogoutButton } from '@/components/logout-button'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
// import { MobileTabs } from '@/components/mobile-tabs'

const basePath = '/dashboard/admin'

const sidebarItems = [
  {
    title: 'Projects',
    href: `${basePath}/projects`,
    icon: 'folder-kanban',
  },
  {
    title: 'Roles',
    href: `${basePath}/roles`,
    icon: 'user-cog',
  },
  {
    title: 'Users',
    href: `${basePath}/users`,
    icon: 'users',
  },
  {
    title: 'New Repair',
    href: `${basePath}/new-repair`,
    icon: 'pen-tool',
  },
  {
    title: 'Repairs',
    href: `${basePath}/repairs`,
    icon: 'wrench',
  },
  {
    title: 'Repair Type',
    href: `${basePath}/repair-type`,
    icon: 'list-ordered',
  },
  {
    title: "Map's View",
    href: `${basePath}/maps-view`,
    icon: 'map',
  },
  {
    title: 'Reports',
    href: `${basePath}/reports`,
    icon: 'clipboard',
  },
  {
    title: 'Profile',
    href: `${basePath}/profile`,
    icon: 'user-circle',
  },
  // {
  //   title: 'Settings',
  // href: `${basePath}/settings`,
  //   icon: 'gear',
  // },
  // {
  //   title: 'Logout',
  // href: `${basePath}/logout`,
  //   icon: 'logout',
  // },
]

export default async function AdminLayout({
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
  if (dbUser.role !== 'admin') {
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
            Admin Dashboard
          </h1>
          <LogoutButton />
        </div>
        {/* <TabsNavigation tabs={managerTabs} basePath="/dashboard/manager" /> */}
        {children}
      </main>
    </div>
  )
}
