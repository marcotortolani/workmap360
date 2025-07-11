// import { redirect } from 'next/navigation'

// export default function Home() {
//   redirect('/dashboard')
// }

// src/app/page.tsx

'use client'

import { useEffect } from 'react'
import { redirect } from 'next/navigation'
import { useCurrentUser } from '@/stores/user-store'

export default function Home() {
  const { isAuthenticated, isLoading } = useCurrentUser()

  useEffect(() => {
    // Registrar Service Worker para PWA
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        })
        .then((registration) => {
          console.log('SW registered: ', registration)
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    }
  }, [])

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        redirect('/dashboard')
      } else {
        redirect('/auth/login')
      }
    }
  }, [isAuthenticated, isLoading])

  // Loading spinner mientras se determina la autenticación
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
    </div>
  )
}
