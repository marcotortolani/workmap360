'use client'
import { useEffect } from 'react'
import { useTabsNavStore } from '@/stores/tabs-nav-store'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'
import { UserType } from '@/types/user-types'
import Image from 'next/image'
import { Role } from '@/types/database-types'

interface SidebarProps {
  role: Role
  userData?: UserType
}

export function Sidebar({ role = 'guest', userData }: SidebarProps) {
  const { tabsNavItems, setTabsNavItems } = useTabsNavStore()
  const pathname = usePathname()

  console.log('user data: ', userData)

  useEffect(() => {
    setTabsNavItems(role)
  }, [role, setTabsNavItems])

  return (
    <div className="hidden h-screen w-64 pb-10 flex-col bg-black md:flex">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white">Workmap360</h2>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-2">
        {tabsNavItems?.map((item) => {
          const isActive = pathname.includes(item.href)
          const Icon = item.icon ? item.icon : null

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
          <p className="text-sm font-normal text-sky-300 capitalize">
            {userData.role}
          </p>
        </div>
      )}
    </div>
  )
}
