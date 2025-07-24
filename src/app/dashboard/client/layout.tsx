// src/app/dashboard/client/layout.tsx (Versión simplificada)
'use client'
import type React from 'react'
import { useUserStatusCheck } from '@/hooks/use-user-status-check'
import { useCurrentUser } from '@/stores/user-store'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useCurrentUser()

  // ✅ Verificar estado del usuario cada 10 minutos
  useUserStatusCheck(10)

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

  // Si no hay usuario, el UserProvider se encargará de redirigir
  if (!user) {
    return null
  }

  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      <Header role="client" userData={user} />
      <Sidebar role="client" userData={user} />
      <main className="py-8 sm:px-2 md:px-10 flex-1 space-y-6 overflow-auto bg-gray-50">
        <div className="hidden md:flex items-center justify-between">
          <h2 className="text-3xl font-bold text-orange-500">
            Client Dashboard
          </h2>
        </div>
        {children}
      </main>
    </div>
  )
}
