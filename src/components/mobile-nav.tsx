'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { useTabsNavStore } from '@/stores/tabs-nav-store'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { Role } from '@/types/database-types'

import { UserType } from '@/types/user-types'
import Image from 'next/image'
import { LogoutButton } from './logout-button'

export function MobileNav({
  role = 'guest',
  userData,
}: {
  role: Role
  userData?: UserType
}) {
  const { tabsNavItems, setTabsNavItems } = useTabsNavStore()
  const [open, setOpen] = useState(false)

  const pathname = usePathname()

  useEffect(() => {
    setTabsNavItems(role)
  }, [role, setTabsNavItems])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="default"
          className="mr-2 px-4 text-black bg-transparent hover:bg-neutral-200 md:hidden"
        >
          <Menu className="h-6 w-6 " />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-black px-0 pt-0 overflow-scroll">
        <div className="px-6 pt-4">
          <SheetTitle className="sr-only">Nav Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Sidebar Menu Navigation for mobile devices
          </SheetDescription>
        </div>
        <div className="flex h-16 items-center border-b border-gray-800 px-6">
          <Link
            href="/"
            className="flex items-center"
            onClick={() => setOpen(false)}
          >
            <span className="text-xl font-bold text-white">Workmap360</span>
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
        <nav className="flex flex-col gap-1 p-4 mb-4">
          {tabsNavItems.map((item) => {
            const isActive = pathname.includes(item.href)
            const Icon = item.icon ? item.icon : null

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
        <LogoutButton variant="link" />
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
            <p className="text-sm font-normal text-sky-300 capitalize">
              {userData.role}
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
