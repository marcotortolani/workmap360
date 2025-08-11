// src/app/dashboard/client/layout.tsx
'use client'
import type React from 'react'
import { redirect } from 'next/navigation'
import { useCurrentUser } from '@/stores/user-store'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useCurrentUser()

  // El UserProvider ya maneja las redirecciones, así que solo necesitamos verificar loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    redirect('/')
  }

  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      <Header role="guest" userData={user} />
      <Sidebar role="guest" userData={user} />
      <main className="py-8 sm:px-2 md:px-10 flex-1 space-y-6 overflow-auto bg-gray-50">
        <div className="hidden md:flex items-center justify-between ">
          <h2 className=" text-3xl font-bold text-orange-500">
            Guest Dashboard
          </h2>
        </div>
        {children}
      </main>
    </div>
  )
}
