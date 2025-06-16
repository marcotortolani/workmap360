/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { UserType } from '@/types/user-types'
import Image from 'next/image'

interface SidebarProps {
  items: {
    title: string
    href: string
    icon?: string
  }[]
  userData?: UserType
}

export function Sidebar({ items, userData }: SidebarProps) {
  const pathname = usePathname()
  // Mapeo de strings a íconos

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
    <div className="hidden h-screen w-64 pb-10 flex-col bg-black md:flex">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white">Workmap360</h2>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-2">
        {items.map((item) => {
          const isActive = pathname.includes(item.href)
          // const Icon = item.icon
          const Icon = item.icon ? iconMap[item.icon] : null

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
      {userData && (
        <div className="p-6">
          {userData.avatar ? (
            <Image
              src={userData.avatar}
              alt={userData.first_name}
              className="h-12 w-12 rounded-full"
              width={48}
              height={48}
            />
          ) : (
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-orange-500">
              <span className=" font-bold ">
                {userData.first_name.charAt(0) + userData.last_name.charAt(0)}
              </span>
            </div>
          )}
          <h2 className="text-lg font-normal text-white text-wrap">
            {userData.first_name} {userData.last_name}
          </h2>
          <p className="text-sm font-light text-white">{userData.email}</p>
        </div>
      )}
    </div>
  )
}
