'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useUserStore } from '@/stores/user-store'

// Rutas que no requieren autenticación
const PUBLIC_ROUTES = [
  '/auth/confirm',
  '/auth/error',
  '/auth/forgot-password',
  '/auth/login',
  '/auth/update-password',
  '/inactive', // ✅ Agregar ruta de inactive como pública
]

export function UserProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const {
    initializeUser,
    isAuthenticated,
    currentUser,
    isLoading,
    refreshSession,
  } = useUserStore()
  const [mounted, setMounted] = useState(false)

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  // Solo para evitar hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Inicializar usuario solo en rutas protegidas
  useEffect(() => {
    if (mounted && !isPublicRoute && !isAuthenticated && !isLoading) {
      initializeUser().catch(console.error)
    }
  }, [mounted, isPublicRoute, isAuthenticated, isLoading, initializeUser])

  // ✅ Manejar redirecciones en useEffect separado para evitar setState durante render
  useEffect(() => {
    if (!mounted) return

    // Pequeño delay para asegurar que el estado esté estable
    const timeoutId = setTimeout(() => {
      // Redirigir usuarios autenticados desde login a su dashboard
      if (isAuthenticated && currentUser?.role && pathname === '/auth/login') {
        // ✅ Verificar que el usuario esté activo antes de redirigir
        if (currentUser.status !== 'active') {
          router.push('/inactive')
        } else {
          refreshSession()
          router.push(`/dashboard/${currentUser.role}`)
        }
      }
      // Redirigir usuarios inactivos a /inactive
      else if (
        isAuthenticated &&
        currentUser?.status === 'inactive' &&
        pathname !== '/inactive'
      ) {
        router.push('/inactive')
      }
      // Redirigir usuarios no autenticados desde rutas protegidas al login
      else if (!isPublicRoute && !isAuthenticated && !isLoading && mounted) {
        router.push('/auth/login')
      }
    }, 100) // Pequeño delay para evitar redirecciones durante hydratación

    return () => clearTimeout(timeoutId)
  }, [
    mounted,
    isAuthenticated,
    currentUser,
    pathname,
    isLoading,
    isPublicRoute,
    router,
    refreshSession,
  ])

  // ✅ Siempre renderizar children sin condiciones
  return <>{children}</>
}

// // src/components/providers/user-provider.tsx

// 'use client'

// import { useEffect, useState } from 'react'
// import { usePathname, useRouter } from 'next/navigation'
// import { useUserStore } from '@/stores/user-store'

// // Rutas que no requieren autenticación
// const PUBLIC_ROUTES = [
//   '/auth/confirm',
//   '/auth/error',
//   '/auth/forgot-password',
//   '/auth/login',
//   '/auth/update-password',
// ]

// export function UserProvider({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname()
//   const router = useRouter()
//   const { initializeUser, isAuthenticated, currentUser, isLoading } =
//     useUserStore()
//   const [mounted, setMounted] = useState(false)

//   const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

//   // Solo para evitar hydration mismatch
//   useEffect(() => {
//     setMounted(true)
//   }, [])

//   // Inicializar usuario solo en rutas protegidas
//   useEffect(() => {
//     if (mounted && !isPublicRoute && !isAuthenticated && !isLoading) {
//       initializeUser().catch(console.error)
//     }
//   }, [mounted, isPublicRoute, isAuthenticated, isLoading, initializeUser])

//   // ✅ Manejar redirecciones en useEffect para evitar setState durante render
//   useEffect(() => {
//     if (!mounted) return

//     // Redirigir usuarios autenticados desde login a su dashboard
//     if (isAuthenticated && currentUser?.role && pathname === '/auth/login') {
//       console.log('Authenticated user on login page, redirecting to dashboard')
//       router.push(`/dashboard/${currentUser.role}`)
//     }
//     // Redirigir usuarios no autenticados desde rutas protegidas al login
//     else if (!isPublicRoute && !isAuthenticated && !isLoading && mounted) {
//       router.push('/auth/login')
//     }
//   }, [
//     mounted,
//     isAuthenticated,
//     currentUser,
//     pathname,
//     isLoading,
//     isPublicRoute,
//     router,
//   ])

//   // No renderizar hasta estar montado para evitar hydration issues
//   if (!mounted) {
//     return <div suppressHydrationWarning>{children}</div>
//   }

//   return <>{children}</>
// }

// // components/providers/user-provider.tsx
// 'use client'

// import { useEffect } from 'react'
// import { usePathname } from 'next/navigation'
// import { useUserStore, useCurrentUser } from '@/stores/user-store'

// // Rutas que no requieren autenticación
// const PUBLIC_ROUTES = [
//   '/auth/confirm',
//   '/auth/error',
//   '/auth/forgot-password',
//   '/auth/login',
//   '/auth/update-password',
//   // '/auth/signup',
// ]

// export function UserProvider({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname()
//   const { initializeUser } = useUserStore()
//   const { isLoading, isAuthenticated } = useCurrentUser()

//   const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

//   // Verificar token cada X tiempo
//   // useEffect(() => {
//   //   const interval = setInterval(async () => {
//   //     const { data } = await supabase.auth.getSession()
//   //     if (!data.session) {
//   //       logout() // Limpiar store y redirect
//   //     }
//   //   }, 60000) // Cada minuto

//   //   return () => clearInterval(interval)
//   // }, [])

//   useEffect(() => {
//     // Solo inicializar en rutas protegidas o si no estamos autenticados
//     if (!isPublicRoute && !isAuthenticated) {
//       initializeUser()
//     }
//   }, [initializeUser, isPublicRoute, isAuthenticated])

//   // Mostrar loading solo en rutas protegidas
//   if (!isPublicRoute && isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
//           <p className="mt-4 text-gray-600">Loading...</p>
//         </div>
//       </div>
//     )
//   }

//   return <>{children}</>
// }
