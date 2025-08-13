// src/hooks/use-repairs-by-location.ts
import { useState, useCallback, useRef } from 'react'
import { useCurrentUser } from '@/stores/user-store'
import { getRepairsByLocationViaAPI } from '@/lib/api/repairs'
import { RepairData } from '@/types/repair-type'
import { toast } from 'sonner'

export interface UseRepairsByLocationReturn {
  repairs: RepairData[]
  isLoading: boolean
  error: string | null
  total: number
  location: {
    project_id: number
    drop: number
    level: number
    repair_type?: string
  } | null
  refetch: () => Promise<void>
  fetchRepairsByLocation: (
    projectId: number,
    drop: number,
    level: number,
    repairType?: string
  ) => Promise<void>
  clearRepairs: () => void
}

export function useRepairsByLocation(): UseRepairsByLocationReturn {
  const {
    accessToken,
    isAuthenticated,
    refreshSession,
    isLoading: userLoading,
  } = useCurrentUser()
  const [repairs, setRepairs] = useState<RepairData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [location, setLocation] = useState<{
    project_id: number
    drop: number
    level: number
    repair_type?: string
  } | null>(null)

  // Control de retry
  const retryAttempted = useRef(false)

  const fetchRepairsByLocation = useCallback(
    async (
      projectId: number,
      drop: number,
      level: number,
      repairType?: string
    ) => {
      // console.log('fetchRepairsByLocation called:', {
      //   projectId,
      //   drop,
      //   level,
      //   repairType,
      // })

      // Si el usuario aún está cargando, no hacer nada
      if (userLoading) {
        console.log('User is still loading, skipping fetch')
        return
      }

      // Si no hay token o no está autenticado, intentar refrescar una sola vez
      if ((!accessToken || !isAuthenticated) && !retryAttempted.current) {
        console.log(
          'No access token or not authenticated, trying to refresh session'
        )
        retryAttempted.current = true

        try {
          const refreshSuccess = await refreshSession()

          if (!refreshSuccess) {
            console.log('Session refresh failed')
            setError('Authentication expired. Please log in again.')
            toast.error('Authentication expired', {
              description: 'Please log in again to continue',
              duration: 5000,
              position: 'bottom-right',
              style: {
                backgroundColor: 'red',
                color: 'white',
              },
            })
            return
          }

          // No hacer retry inmediatamente, esperar a que el efecto se ejecute de nuevo
          return
        } catch (refreshError) {
          console.error('Error refreshing session:', refreshError)
          setError('Failed to refresh authentication')
          return
        }
      }

      // Si aún no hay token después del retry, mostrar error
      if (!accessToken || !isAuthenticated) {
        console.log('Still no access token after refresh attempt')
        setError('Not authenticated')
        toast.error('Not authenticated', {
          description: 'Please log in to view repairs',
          duration: 5000,
          position: 'bottom-right',
          style: {
            backgroundColor: 'red',
            color: 'white',
          },
        })
        return
      }

      setIsLoading(true)
      setError(null)

      try {

        const result = await getRepairsByLocationViaAPI(
          accessToken,
          projectId,
          drop,
          level,
          repairType
        )

        if (result.success && result.repairs) {
          console.log(
            'Repairs by location fetched successfully:',
            result.repairs.length
          )
          setRepairs(result.repairs)
          setTotal(result.total || 0)
          setLocation(result.location || null)

          // Reset retry flag on success
          retryAttempted.current = false
        } else {
          console.error('API returned error:', result.error)
          setError(result.error || 'Failed to fetch repairs by location')
          toast.error('Error loading repairs by location', {
            description: result.error || 'Failed to fetch repairs by location',
            duration: 5000,
            position: 'bottom-right',
            style: {
              backgroundColor: 'red',
              color: 'white',
            },
          })
        }
      } catch (error) {
        console.error('Unexpected error fetching repairs by location:', error)
        setError('Unexpected error occurred')
        toast.error('Unexpected error occurred', {
          description: 'Error: ' + error,
          duration: 5000,
          position: 'bottom-right',
          style: {
            backgroundColor: 'red',
            color: 'white',
          },
        })
      } finally {
        setIsLoading(false)
      }
    },
    [accessToken, isAuthenticated, userLoading, refreshSession]
  )

  const refetch = useCallback(async () => {
    if (location) {
      retryAttempted.current = false // Reset retry flag
      await fetchRepairsByLocation(
        location.project_id,
        location.drop,
        location.level,
        location.repair_type
      )
    }
  }, [fetchRepairsByLocation, location])

  const clearRepairs = useCallback(() => {
    setRepairs([])
    setTotal(0)
    setLocation(null)
    setError(null)
    retryAttempted.current = false
  }, [])

  return {
    repairs,
    isLoading,
    error,
    total,
    location,
    refetch,
    fetchRepairsByLocation,
    clearRepairs,
  }
}
