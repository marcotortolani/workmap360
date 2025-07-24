// hooks/useProjectsList.ts - Hook mejorado sin hooks condicionales
// import { useState, useEffect, useCallback, useRef } from 'react'
// import { useCurrentUser } from '@/stores/user-store'
// import { getProjectsViaAPI, Pagination } from '@/lib/api/projects'
// import { ProjectData } from '@/types/project-types'
// import { toast } from 'sonner'

// export interface UseProjectsListReturn {
//   projects: ProjectData[]
//   pagination: Pagination
//   isLoading: boolean
//   error: string | null
//   refetch: () => Promise<void>
//   setPage: (page: number) => void
//   currentPage: number
//   totalPages: number
// }

// export function useProjectsList(limit: number = 20): UseProjectsListReturn {
//   // ✅ Siempre llamar todos los hooks en el mismo orden
//   const {
//     accessToken,
//     isAuthenticated,
//     refreshSession,
//     isLoading: userLoading,
//   } = useCurrentUser()
//   const [projects, setProjects] = useState<ProjectData[]>([])
//   const [pagination, setPagination] = useState<Pagination>({
//     total: 0,
//     page: 1,
//     limit: 20,
//     totalPages: 1,
//   })
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [currentPage, setCurrentPage] = useState(1)

//   // ✅ useRef para evitar llamadas múltiples
//   const isInitialized = useRef(false)
//   const retryAttempted = useRef(false)

//   const fetchProjects = useCallback(
//     async (page: number = currentPage) => {
//       // Si el usuario aún está cargando, no hacer nada
//       if (userLoading) {
//         return
//       }

//       // Si no hay token o no está autenticado, intentar refrescar una sola vez
//       if ((!accessToken || !isAuthenticated) && !retryAttempted.current) {
//         retryAttempted.current = true

//         try {
//           const refreshSuccess = await refreshSession()

//           if (!refreshSuccess) {
//             setError('Authentication expired. Please log in again.')
//             toast.error('Authentication expired', {
//               description: 'Please log in again to continue',
//               duration: 5000,
//               position: 'bottom-right',
//             })
//             return
//           }

//           // No hacer retry inmediatamente, esperar a que el efecto se ejecute de nuevo
//           return
//         } catch (refreshError) {
//           console.error('Error refreshing session:', refreshError)
//           setError('Failed to refresh authentication')
//           return
//         }
//       }

//       // Si aún no hay token después del retry, mostrar error
//       if (!accessToken || !isAuthenticated) {
//         setError('Not authenticated')
//         toast.error('Not authenticated', {
//           description: 'Please log in to view projects',
//           duration: 5000,
//           position: 'bottom-right',
//         })
//         return
//       }

//       setIsLoading(true)
//       setError(null)

//       try {
//         const result = await getProjectsViaAPI(accessToken, page, limit)

//         if (result.success && result.projects) {
//           setProjects(result.projects)
//           setPagination(result.pagination || pagination)
//           setCurrentPage(page)

//           // Reset retry flag on success
//           retryAttempted.current = false
//         } else {
//           console.error('API returned error:', result.error)
//           setError(result.error || 'Failed to fetch projects')
//           toast.error('Failed to fetch projects', {
//             description: result.error || 'Unknown error occurred',
//             duration: 5000,
//             position: 'bottom-right',
//           })
//         }
//       } catch (error) {
//         console.error('Unexpected error fetching projects:', error)
//         setError('Error: ' + error)
//         toast.error('Unexpected error occurred', {
//           description: error as string,
//           duration: 5000,
//           position: 'bottom-right',
//         })
//       } finally {
//         setIsLoading(false)
//       }
//     },
//     [
//       accessToken,
//       isAuthenticated,
//       userLoading,
//       refreshSession,
//       currentPage,
//       limit,
//       pagination,
//     ]
//   )

//   const refetch = useCallback(async () => {
//     retryAttempted.current = false // Reset retry flag
//     await fetchProjects(currentPage)
//   }, [fetchProjects, currentPage])

//   const setPage = useCallback(
//     (page: number) => {
//       setCurrentPage(page)
//       retryAttempted.current = false // Reset retry flag
//       fetchProjects(page)
//     },
//     [fetchProjects]
//   )

//   // ✅ Efecto simplificado que solo se ejecuta una vez cuando hay autenticación
//   useEffect(() => {
//     if (
//       !userLoading &&
//       isAuthenticated &&
//       accessToken &&
//       !isInitialized.current
//     ) {
//       isInitialized.current = true
//       retryAttempted.current = false
//       fetchProjects(1)
//     } else if (!userLoading && !isAuthenticated && isInitialized.current) {
//       isInitialized.current = false
//       retryAttempted.current = false
//       setProjects([])
//       setError(null)
//     }
//   }, [accessToken, isAuthenticated, userLoading, fetchProjects])

//   // ✅ Siempre devolver el mismo objeto con las mismas propiedades
//   return {
//     projects,
//     pagination,
//     isLoading,
//     error,
//     refetch,
//     setPage,
//     currentPage,
//     totalPages: pagination?.totalPages || 1,
//   }
// }

// hooks/useProjectsList.ts - Hook simplificado usando tu API existente
import { useState, useEffect } from 'react'
import { useCurrentUser } from '@/stores/user-store'
import { getProjectsViaAPI, Pagination } from '@/lib/api/projects'
import { ProjectData } from '@/types/project-types'
import { toast } from 'sonner'

export interface UseProjectsListReturn {
  projects: ProjectData[]
  pagination: Pagination
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  setPage: (page: number) => void
  currentPage: number
  totalPages: number
}

export function useProjectsList(limit: number = 20): UseProjectsListReturn {
  const { accessToken, isAuthenticated, refreshSession } = useCurrentUser()
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchProjects = async (page: number = currentPage) => {
    console.log('fetchProjects', page)

    if (!accessToken || !isAuthenticated) {
      const res = await refreshSession()

      console.log('res', res)

      setError('Not authenticated')
      toast.error('Not authenticated', {
        duration: 5000,
        position: 'bottom-right',
        style: {
          backgroundColor: 'red',
          color: 'white',
          fontSize: '14px',
        },
      })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // 🔧 USAR TU FUNCIÓN EXISTENTE
      const result = await getProjectsViaAPI(accessToken, page, limit)

      if (result.success && result.projects) {
        setProjects(result.projects)
        setPagination(result.pagination || pagination)
        setCurrentPage(page)
      } else {
        setError(result.error || 'Failed to fetch projects')
      }
    } catch (error) {
      setError('Error: ' + error)
      toast.error('Unexpected error occurred', {
        description: error as string,
        duration: 5000,
        position: 'bottom-right',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refetch = async () => {
    await fetchProjects(currentPage)
  }

  const setPage = (page: number) => {
    setCurrentPage(page)
    fetchProjects(page)
  }

  // Fetch initial data
  useEffect(() => {
    if (accessToken && isAuthenticated) {
      fetchProjects(1)
    }
  }, [accessToken, isAuthenticated])

  return {
    projects,
    pagination,
    isLoading,
    error,
    refetch,
    setPage,
    currentPage,
    totalPages: pagination?.totalPages || 1,
  }
}
