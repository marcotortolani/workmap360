'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FolderKanban,
  UserCog,
  Users,
  Wrench,
  User,
  PlusCircle,
  UserCircle,
  PenToolIcon,
  MapIcon,
  TableIcon,
  ListOrderedIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  items: {
    title: string
    href: string
    icon?: string
  }[]
}

export function Sidebar({ items }: SidebarProps) {
  const pathname = usePathname()
  // Mapeo de strings a íconos

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    'folder-kanban': FolderKanban,
    'user-cog': UserCog,
    users: Users,
    wrench: Wrench,
    user: User,
    'plus-circle': PlusCircle,
    'user-circle': UserCircle,
    'pen-tool': PenToolIcon,
    map: MapIcon,
    table: TableIcon,
    'list-ordered': ListOrderedIcon,
  }

  return (
    <div className="hidden h-screen w-64 flex-col bg-black md:flex">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white">Stamp & Label</h2>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-2">
        {items.map((item) => {
          const isActive = pathname.includes(item.href)
          // const Icon = item.icon
          const Icon = item.icon ? iconMap[item.icon] : null // Mapeamos el string al ícono

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center rounded-md px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-orange-500/10 text-orange-500'
                  : 'text-white hover:bg-orange-500/10 hover:text-orange-500'
              )}
            >
              {Icon && <Icon className="mr-3 h-5 w-5 text-orange-500" />}
              {item.title}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
