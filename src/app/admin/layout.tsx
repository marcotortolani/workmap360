import type React from 'react'
import { Sidebar } from '@/components/sidebar'
import { MobileNav } from '@/components/mobile-nav'

const sidebarItems = [
  {
    title: 'Projects',
    href: '/admin/projects',
    icon: 'folder-kanban',
  },
  {
    title: 'Roles',
    href: '/admin/roles',
    icon: 'user-cog',
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: 'users',
  },
  {
    title: 'Repairs',
    href: '/admin/repairs',
    icon: 'wrench',
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <Sidebar items={sidebarItems} />
      <MobileNav items={sidebarItems} />
      <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
    </div>
  )
}
