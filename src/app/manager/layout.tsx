import type React from 'react'

import { Sidebar } from '@/components/sidebar'

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

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <Sidebar items={sidebarItems} />
      <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
    </div>
  )
}
