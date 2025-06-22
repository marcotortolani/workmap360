'use client'
import React from 'react'
import { MobileNav } from './mobile-nav'
import { Role } from '@/types/database-types'
import { UserType } from '@/types/user-types'
import Image from 'next/image'

interface HeaderProps {
  role: Role
  userData?: UserType
}

export function Header({ role = 'guest', userData }: HeaderProps) {
  return (
    <header className="md:hidden flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2 shadow-sm md:px-6 md:py-4">
      <MobileNav role={role} userData={userData} />
      <h1 className=" text-xl font-bold">Workmap360</h1>
      {userData && (
        <div className=" w-16 flex flex-col items-center">
          {userData.avatar ? (
            <Image
              src={userData.avatar}
              alt={userData.first_name}
              className="h-10 w-10 rounded-full"
              width={30}
              height={30}
            />
          ) : (
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-orange-500">
              <span className=" font-bold ">
                {userData.first_name.charAt(0) + userData.last_name.charAt(0)}
              </span>
            </div>
          )}
          <h3 className="text-xs font-semibold line-clamp-1 text-black text-nowrap">
            {userData.first_name}
          </h3>
        </div>
      )}
    </header>
  )
}
