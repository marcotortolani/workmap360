// src/hooks/useRepairsList.ts

import { useState, useEffect, useCallback, useRef } from 'react'
import { useCurrentUser } from '@/stores/user-store'
import { getRepairsViaAPI, updateRepairStatusViaAPI } from '@/lib/api/repairs'

import {
  RepairData,
  RepairDataStatusType,
  RepairListParams,
  RepairListResponse,
} from '@/types/repair-type'
import { toast } from 'sonner'

export interface UseRepairsListReturn {
  repairs: RepairData[]
  pagination: RepairListResponse['pagination']
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  setPage: (page: number) => void
  setFilters: (filters: Omit<RepairListParams, 'page' | 'limit'>) => void
  currentPage: number
  totalPages: number
  currentFilters: Omit<RepairListParams, 'page' | 'limit'>
  setCurrentFilters: (filters: Omit<RepairListParams, 'page' | 'limit'>) => void
  updateStatus: (id: number, status: RepairDataStatusType) => Promise<void>
}

export function useRepairsList(limit: number = 20): UseRepairsListReturn {
  // ✅ Incluir refreshSession y userLoading
  const {
    accessToken,
    isAuthenticated,
    refreshSession,
    isLoading: userLoading,
  } = useCurrentUser()
  const [repairs, setRepairs] = useState<RepairData[]>([])
  const [pagination, setPagination] = useState<
    RepairListResponse['pagination']
  >({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentFilters, setCurrentFilters] = useState<
    Omit<RepairListParams, 'page' | 'limit'>
  >({})

  // ✅ Control de inicialización y retry
  const isInitialized = useRef(false)
  const retryAttempted = useRef(false)

  const fetchRepairs = useCallback(
    async (
      page: number = currentPage,
      filters: Omit<RepairListParams, 'page' | 'limit'> = currentFilters
    ) => {
      // Si el usuario aún está cargando, no hacer nada
      if (userLoading) {
        return
      }      

      // ✅ Si no hay token o no está autenticado, intentar refrescar una sola vez
      if ((!accessToken || !isAuthenticated) && !retryAttempted.current) {
        retryAttempted.current = true

        try {
          const refreshSuccess = await refreshSession()

          if (!refreshSuccess) {
            setError('Authentication expired. Please log in again.')
            toast.error('Authentication expired', {
              description: 'Please log in again to continue',
              duration: 5000,
              position: 'bottom-right',
              style: {
                background: 'red',
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
          toast.error('Failed to refresh authentication', {
            description: 'Please log in again to continue',
            duration: 5000,
            position: 'bottom-right',
            style: {
              background: 'red',
              color: 'white',
            },
          })
          return
        }
      }

      // Si aún no hay token después del retry, mostrar error
      if (!accessToken || !isAuthenticated) {
        setError('Not authenticated')
        toast.error('Not authenticated', {
          description: 'Please log in to view repairs',
          duration: 5000,
          position: 'bottom-right',
          style: {
            background: 'red',
            color: 'white',
          },
        })
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const result = await getRepairsViaAPI(accessToken, page, limit, filters)

        if (result.success && result.repairs) {
          setRepairs(result.repairs)
          setPagination(result.pagination || pagination)
          setCurrentPage(page)
          setCurrentFilters(filters)

          // Reset retry flag on success
          retryAttempted.current = false
        } else {
          console.error('API returned error:', result.error)
          setError(result.error || 'Failed to fetch repairs')
          toast.error('Error loading repairs', {
            description: result.error || 'Failed to fetch repairs',
            duration: 5000,
            position: 'bottom-right',
            style: {
              background: 'red',
              color: 'white',
            },
          })
        }
      } catch (error) {
        console.error('Unexpected error fetching repairs:', error)
        const errorMessage = 'Unexpected error occurred'
        setError(errorMessage)
        toast.error('Unexpected error occurred', {
          description: 'Error: ' + error,
          duration: 5000,
          position: 'bottom-right',
          style: {
            background: 'red',
            color: 'white',
          },
        })
      } finally {
        setIsLoading(false)
      }
    },
    [
      accessToken,
      isAuthenticated,
      userLoading,
      refreshSession,
      currentPage,
      currentFilters,
      limit,
      pagination,
    ]
  )

  const updateStatus = useCallback(
    async (repairId: number, status: RepairDataStatusType) => {
      try {
        if (!accessToken) {
          throw new Error('Not authenticated')
        }

        await updateRepairStatusViaAPI(repairId, status, accessToken)

        toast.success('Repair status updated successfully', {
          duration: 3000,
          position: 'bottom-right',
          style: {
            background: 'green',
            color: 'white',
          },
        })

        // Refetch to update the list
        await fetchRepairs(currentPage, currentFilters)
      } catch (error) {
        toast.error('Failed to update repair status', {
          description: 'Error: ' + error,
          duration: 5000,
          position: 'bottom-right',
          style: {
            background: 'red',
            color: 'white',
          },
        })
      }
    },
    [accessToken, fetchRepairs, currentPage, currentFilters]
  )

  const refetch = useCallback(async () => {
    retryAttempted.current = false // Reset retry flag
    await fetchRepairs(currentPage, currentFilters)
  }, [fetchRepairs, currentPage, currentFilters])

  const setPage = useCallback(
    (page: number) => {
      setCurrentPage(page)
      retryAttempted.current = false // Reset retry flag
      fetchRepairs(page, currentFilters)
    },
    [fetchRepairs, currentFilters]
  )

  const setFilters = useCallback(
    (filters: Omit<RepairListParams, 'page' | 'limit'>) => {
      setCurrentFilters(filters)
      setCurrentPage(1) // Reset to first page when filtering
      retryAttempted.current = false // Reset retry flag
      fetchRepairs(1, filters)
    },
    [fetchRepairs]
  )

  // ✅ Efecto simplificado que solo se ejecuta una vez cuando hay autenticación
  useEffect(() => {
    if (
      !userLoading &&
      isAuthenticated &&
      accessToken &&
      !isInitialized.current
    ) {
      isInitialized.current = true
      retryAttempted.current = false
      fetchRepairs(1, {})
    } else if (!userLoading && !isAuthenticated && isInitialized.current) {
      isInitialized.current = false
      retryAttempted.current = false
      setRepairs([])
      setError(null)
    }
  }, [accessToken, isAuthenticated, userLoading, fetchRepairs])

  return {
    repairs,
    pagination,
    isLoading,
    error,
    refetch,
    setPage,
    setFilters,
    currentPage,
    totalPages: pagination?.totalPages || 1,
    currentFilters,
    setCurrentFilters,
    updateStatus,
  }
}

// /* eslint-disable react-hooks/exhaustive-deps */
// // src/hooks/useRepairsList.ts

// import { useState, useEffect } from 'react'
// import { useCurrentUser } from '@/stores/user-store'
// import { getRepairsViaAPI, updateRepairStatusViaAPI } from '@/lib/api/repairs'

// import {
//   RepairData,
//   RepairDataStatusType,
//   RepairListParams,
//   RepairListResponse,
// } from '@/types/repair-type'
// import { toast } from 'sonner'

// export interface UseRepairsListReturn {
//   repairs: RepairData[]
//   pagination: RepairListResponse['pagination']
//   isLoading: boolean
//   error: string | null
//   refetch: () => Promise<void>
//   setPage: (page: number) => void
//   setFilters: (filters: Omit<RepairListParams, 'page' | 'limit'>) => void
//   currentPage: number
//   totalPages: number
//   currentFilters: Omit<RepairListParams, 'page' | 'limit'>
//   setCurrentFilters: (filters: Omit<RepairListParams, 'page' | 'limit'>) => void
//   updateStatus: (id: number, status: RepairDataStatusType) => Promise<void>
// }

// export function useRepairsList(limit: number = 20): UseRepairsListReturn {
//   const { accessToken, isAuthenticated } = useCurrentUser()
//   const [repairs, setRepairs] = useState<RepairData[]>([])
//   const [pagination, setPagination] = useState<
//     RepairListResponse['pagination']
//   >({
//     total: 0,
//     page: 1,
//     limit: 20,
//     totalPages: 1,
//   })
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [currentPage, setCurrentPage] = useState(1)
//   const [currentFilters, setCurrentFilters] = useState<
//     Omit<RepairListParams, 'page' | 'limit'>
//   >({})

//   const fetchRepairs = async (
//     page: number = currentPage,
//     filters: Omit<RepairListParams, 'page' | 'limit'> = currentFilters
//   ) => {
//     if (!accessToken || !isAuthenticated) {
//       setError('Not authenticated')
//       toast.error('Not authenticated', {
//         duration: 5000,
//         position: 'bottom-right',
//         style: {
//           backgroundColor: 'red',
//           color: 'white',
//           fontSize: '14px',
//         },
//       })
//       return
//     }

//     setIsLoading(true)
//     setError(null)

//     try {
//       const result = await getRepairsViaAPI(accessToken, page, limit, filters)

//       if (result.success && result.repairs) {
//         setRepairs(result.repairs)
//         setPagination(result.pagination || pagination)
//         setCurrentPage(page)
//         setCurrentFilters(filters)
//       } else {
//         setError(result.error || 'Failed to fetch repairs')
//         toast.error('Error loading repairs', {
//           description: result.error || 'Failed to fetch repairs',
//           duration: 5000,
//           position: 'bottom-right',
//         })
//       }
//     } catch (error) {
//       const errorMessage = 'Unexpected error occurred'
//       setError(errorMessage)
//       toast.error('Unexpected error occurred', {
//         description: 'Error: ' + error,
//         duration: 5000,
//         position: 'bottom-right',
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const updateStatus = async (repairId: number, status: string) => {
//     try {
//       await updateRepairStatusViaAPI(
//         repairId,
//         status as RepairDataStatusType,
//         accessToken as string
//       )
//       toast.success('Repair status updated successfully', {
//         duration: 3000,
//         position: 'bottom-right',
//       })
//     } catch (error) {
//       toast.error('Failed to update repair status', {
//         description: 'Error: ' + error,
//         duration: 5000,
//         position: 'bottom-right',
//       })
//     }
//   }

//   const refetch = async () => {
//     await fetchRepairs(currentPage, currentFilters)
//   }

//   const setPage = (page: number) => {
//     setCurrentPage(page)
//     fetchRepairs(page, currentFilters)
//   }

//   const setFilters = (filters: Omit<RepairListParams, 'page' | 'limit'>) => {
//     setCurrentFilters(filters)
//     setCurrentPage(1) // Reset to first page when filtering
//     fetchRepairs(1, filters)
//   }

//   // Fetch initial data
//   useEffect(() => {
//     if (accessToken && isAuthenticated) {
//       fetchRepairs(1, {})
//     }
//   }, [accessToken, isAuthenticated])

//   return {
//     repairs,
//     pagination,
//     isLoading,
//     error,
//     refetch,
//     setPage,
//     setFilters,
//     currentPage,
//     totalPages: pagination?.totalPages || 1,
//     currentFilters,
//     setCurrentFilters,
//     updateStatus,
//   }
// }
