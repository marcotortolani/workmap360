import type React from 'react'

import { Sidebar } from '@/components/sidebar'

const sidebarItems = [
  {
    title: 'My Projects',
    href: '/client/projects',
    icon: 'folder-kanban',
  },
]

export default function ClientLayout({
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
