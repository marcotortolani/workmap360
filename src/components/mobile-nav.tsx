/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import type React from 'react'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

import {
  FolderKanban,
  UserCog,
  Users,
  Wrench,
  User,
  PlusCircle,
} from 'lucide-react'

interface MobileNavProps {
  items: {
    title: string
    href: string
    icon?: string
  }[]
}

export function MobileNav({ items }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Mapeo de strings a íconos
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    'folder-kanban': FolderKanban,
    'user-cog': UserCog,
    users: Users,
    wrench: Wrench,
    user: User,
    'plus-circle': PlusCircle,
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-white hover:bg-transparent md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-black px-0 pt-0">
        <div className="flex h-16 items-center border-b border-gray-800 px-6">
          <Link
            href="/"
            className="flex items-center"
            onClick={() => setOpen(false)}
          >
            <span className="text-xl font-bold text-white">
              Stamp & Label
            </span>
          </Link>
          <Button
            variant="ghost"
            className="ml-auto h-8 w-8 p-0 text-white"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {items.map((item) => {
            const isActive = pathname.includes(item.href)
            // const Icon = item.icon
            const Icon = item.icon ? iconMap[item.icon] : null // Mapeamos el string al ícono

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
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
      </SheetContent>
    </Sheet>
  )
}
