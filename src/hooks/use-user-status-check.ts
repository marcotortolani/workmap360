// hooks/useUserStatusCheck.ts
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/stores/user-store'

/**
 * Hook para verificar periódicamente el estado del usuario
 * y redirigir a /inactive si se desactiva
 */
export function useUserStatusCheck(intervalMinutes: number = 5) {
  const router = useRouter()
  const { checkUserStatus, currentUser, logout } = useUserStore()

  useEffect(() => {
    // Solo verificar si hay un usuario autenticado
    if (!currentUser?.email) return

    const checkStatus = async () => {
      try {
        const status = await checkUserStatus()

        if (status === 'inactive') {
          console.log('User status changed to inactive, logging out')
          await logout()
          router.push('/inactive')
        }
      } catch (error) {
        console.error('Error checking user status:', error)
      }
    }

    // Verificar inmediatamente
    checkStatus()

    // Configurar intervalo de verificación
    const interval = setInterval(checkStatus, intervalMinutes * 60 * 1000)

    return () => clearInterval(interval)
  }, [currentUser?.email, checkUserStatus, logout, router, intervalMinutes])
}
