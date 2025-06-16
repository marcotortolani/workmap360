import type React from 'react'

import { Sidebar } from '@/components/sidebar'
// import { TabsNavigation } from '@/components/tabs'
import { LogoutButton } from '@/components/logout-button'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const sidebarItems = [
  {
    title: 'Projects',
    href: '/dashboard/manager/projects',
    icon: 'folder-kanban',
  },
  {
    title: 'Roles',
    href: '/dashboard/manager/roles',
    icon: 'user-cog',
  },
  {
    title: 'Users',
    href: '/dashboard/manager/users',
    icon: 'users',
  },
  {
    title: 'Repairs',
    href: '/dashboard/manager/repairs',
    icon: 'wrench',
  },
  {
    title: 'Repair Type',
    href: '/dashboard/manager/repair-type',
    icon: 'list-ordered',
  },
]

// const managerTabs = [
//   { value: 'projects', label: 'Projects', href: '/dashboard/manager/projects' },
//   { value: 'roles', label: 'Roles', href: '/dashboard/manager/roles' },
//   { value: 'users', label: 'Users', href: '/dashboard/manager/users' },
//   { value: 'repairs', label: 'Repairs', href: '/dashboard/manager/repairs' },
//   {
//     value: 'repair type',
//     label: 'Repair Type',
//     href: '/dashboard/manager/repair-type',
//   },
// ]

export default async function ManagerLayout({
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
  if (dbUser.role !== 'manager') {
    redirect('/')
  }
  return (
    <div className="flex h-screen">
      <Sidebar items={sidebarItems} userData={dbUser} />
      <main className="py-8 px-10 flex-1 space-y-6 overflow-auto bg-gray-50">
        <div className=" flex items-center justify-between ">
          <h1 className=" text-3xl font-bold text-orange-500">
            Manager Dashboard
          </h1>
          <LogoutButton />
        </div>
        {/* <TabsNavigation tabs={managerTabs} basePath="/dashboard/manager" /> */}
        {children}
      </main>
    </div>
  )
}
