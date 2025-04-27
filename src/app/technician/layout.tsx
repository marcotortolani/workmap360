import type React from 'react'

import { Sidebar } from '@/components/sidebar'

const sidebarItems = [
  {
    title: 'My Projects',
    href: '/technician/projects',
    icon: 'folder-kanban',
  },
  {
    title: 'New Repair',
    href: '/technician/new-repair',
    icon: 'pen-tool',
  },
  {
    title: 'Reparations',
    href: '/technician/reparations',
    icon: 'table',
  },
  {
    title: "Map's View",
    href: '/technician/maps-view',
    icon: 'map',
  },
  {
    title: 'Profile',
    href: '/technician/profile',
    icon: 'user-circle',
  },
]

export default function TechnicianLayout({
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
