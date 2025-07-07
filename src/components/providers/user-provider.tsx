// components/providers/user-provider.tsx
'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useUserStore, useCurrentUser } from '@/stores/user-store'

// Rutas que no requieren autenticación
const PUBLIC_ROUTES = [
  '/auth/confirm',
  '/auth/error',
  '/auth/forgot-password',
  '/auth/login',
  '/auth/update-password',
  // '/auth/signup',
]

export function UserProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { initializeUser } = useUserStore()
  const { isLoading, isAuthenticated } = useCurrentUser()

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  // Verificar token cada X tiempo
  // useEffect(() => {
  //   const interval = setInterval(async () => {
  //     const { data } = await supabase.auth.getSession()
  //     if (!data.session) {
  //       logout() // Limpiar store y redirect
  //     }
  //   }, 60000) // Cada minuto

  //   return () => clearInterval(interval)
  // }, [])

  useEffect(() => {
    // Solo inicializar en rutas protegidas o si no estamos autenticados
    if (!isPublicRoute && !isAuthenticated) {
      initializeUser()
    }
  }, [initializeUser, isPublicRoute, isAuthenticated])

  // Mostrar loading solo en rutas protegidas
  if (!isPublicRoute && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
