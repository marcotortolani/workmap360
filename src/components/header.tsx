"use client"
import React from 'react'
import { MobileNav } from './mobile-nav'
import { Role } from '@/types/database-types'
import { UserType } from '@/types/user-types'
import { LogoutButton } from './logout-button'

interface HeaderProps {
  role: Role
  userData?: UserType
}

export function Header({ role = 'guest', userData }: HeaderProps) {
  console.log('user data: ', userData)

  return (
    <header className="md:hidden flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2 shadow-sm md:px-6 md:py-4">
      <MobileNav role={role} userData={userData} />
      <h1 className=" text-xl font-bold">Workmap360</h1>
      <LogoutButton />
    </header>
  )
}
