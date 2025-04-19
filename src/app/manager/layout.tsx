import type React from 'react'

import { Sidebar } from '@/components/sidebar'
import { TabsNavigation } from '@/components/tabs'
import { LogoutButton } from '@/components/logout-button'

const sidebarItems = [
  {
    title: 'Projects',
    href: '/manager/projects',
    icon: 'folder-kanban',
  },
  {
    title: 'Roles',
    href: '/manager/roles',
    icon: 'user-cog',
  },
  {
    title: 'Users',
    href: '/manager/users',
    icon: 'users',
  },
  {
    title: 'Repairs',
    href: '/manager/repairs',
    icon: 'wrench',
  },
]

const managerTabs = [
  { value: 'projects', label: 'Projects', href: '/manager/projects' },
  { value: 'roles', label: 'Roles', href: '/manager/roles' },
  { value: 'users', label: 'Users', href: '/manager/users' },
  { value: 'repairs', label: 'Repairs', href: '/manager/repairs' },
]

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <Sidebar items={sidebarItems} />

      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="px-2 flex items-center justify-between ">
          <h1 className=" text-3xl font-bold text-orange-500">
            Manager Dashboard
          </h1>
          <LogoutButton />
        </div>
        <TabsNavigation tabs={managerTabs} basePath="/manager" />
        {children}
      </main>
    </div>
  )
}
