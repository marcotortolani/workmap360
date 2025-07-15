/* eslint-disable react-hooks/exhaustive-deps */
// src/hooks/use-users-list.ts
import { useState, useEffect } from 'react'
import { useCurrentUser } from '@/stores/user-store'
import { UserType, UserRole } from '@/types/user-types'
import { toast } from 'sonner'

export interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface UseUsersListReturn {
  users: UserType[]
  pagination: Pagination
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  setPage: (page: number) => void
  setRole: (role: UserRole | null) => void
  currentPage: number
  totalPages: number
  currentRole: UserRole | null
}

export function useUsersList(limit: number = 20): UseUsersListReturn {
  const { accessToken, isAuthenticated } = useCurrentUser()
  const [users, setUsers] = useState<UserType[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null)

  const fetchUsers = async (
    page: number = currentPage,
    role: UserRole | null = currentRole
  ) => {
    if (!accessToken || !isAuthenticated) {
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
      let endpoint = `/api/users/list?page=${page}&limit=${limit}`

      // Si hay un rol seleccionado, usar el endpoint específico
      if (role) {
        endpoint = `/api/users/by-role/?role=${role}&page=${page}&limit=${limit}`
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to fetch users')
        toast.error('Error loading users', {
          description: result.error || 'Failed to fetch users',
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

      if (result.users) {
        setUsers(result.users)
        setPagination(result.pagination || pagination)
        setCurrentPage(page)
        setCurrentRole(role)
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
    await fetchUsers(currentPage, currentRole)
  }

  const setPage = (page: number) => {
    setCurrentPage(page)
    fetchUsers(page, currentRole)
  }

  const setRole = (role: UserRole | null) => {
    setCurrentRole(role)
    setCurrentPage(1) // Reset to first page when changing role
    fetchUsers(1, role)
  }

  // Fetch initial data
  useEffect(() => {
    if (accessToken && isAuthenticated) {
      fetchUsers(1, null)
    }
  }, [accessToken, isAuthenticated])

  return {
    users,
    pagination,
    isLoading,
    error,
    refetch,
    setPage,
    setRole,
    currentPage,
    totalPages: pagination?.totalPages || 1,
    currentRole,
  }
}


// /* eslint-disable react-hooks/exhaustive-deps */
// // src/hooks/use-users-list.ts
// import { useState, useEffect } from 'react'
// import { useCurrentUser } from '@/stores/user-store'
// import { UserType, UserRole } from '@/types/user-types'
// import { toast } from 'sonner'
// import { fetchUsersListViaAPI, UserListParams } from '@/lib/api/users'

// export interface Pagination {
//   total: number
//   page: number
//   limit: number
//   totalPages: number
// }

// export interface UseUsersListReturn {
//   users: UserType[]
//   pagination: Pagination
//   isLoading: boolean
//   error: string | null
//   refetch: () => Promise<void>
//   setPage: (page: number) => void
//   setRole: (role: UserRole | null) => void
//   currentPage: number
//   totalPages: number
//   currentRole: UserRole | null
// }

// export function useUsersList(limit: number = 20): UseUsersListReturn {
//   const { accessToken, isAuthenticated } = useCurrentUser()
//   const [users, setUsers] = useState<UserType[]>([])
//   const [pagination, setPagination] = useState<Pagination>({
//     total: 0,
//     page: 1,
//     limit: 20,
//     totalPages: 1,
//   })
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [currentPage, setCurrentPage] = useState(1)
//   const [currentRole, setCurrentRole] = useState<UserRole | null>(null)

//   const fetchUsers = async (
//     page: number = currentPage,
//     role: UserRole | null = currentRole
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
//       // 🔧 USAR LA NUEVA FUNCIÓN DE API
//       const params: UserListParams = {
//         page,
//         limit,
//         ...(role && { role }), // Solo incluir role si no es null
//         sortBy: 'created_at',
//         sortOrder: 'desc',
//       }

//       const result = await fetchUsersListViaAPI(params, accessToken)

//       if (result.success && result.data) {
//         setUsers(result.data.users)
//         setPagination(result.data.pagination)
//         setCurrentPage(page)
//         setCurrentRole(role)
//       } else {
//         const errorMessage = result.error || 'Failed to fetch users'
//         setError(errorMessage)
//         toast.error('Error loading users', {
//           description: errorMessage,
//           duration: 5000,
//           position: 'bottom-right',
//           style: {
//             backgroundColor: 'red',
//             color: 'white',
//             fontSize: '14px',
//           },
//         })
//       }
//     } catch (error) {
//       const errorMessage = 'Unexpected error occurred: ' + error
//       setError(errorMessage)
//       toast.error('Unexpected error occurred', {
//         description: error as string,
//         duration: 5000,
//         position: 'bottom-right',
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const refetch = async () => {
//     await fetchUsers(currentPage, currentRole)
//   }

//   const setPage = (page: number) => {
//     setCurrentPage(page)
//     fetchUsers(page, currentRole)
//   }

//   const setRole = (role: UserRole | null) => {
//     setCurrentRole(role)
//     setCurrentPage(1) // Reset to first page when changing role
//     fetchUsers(1, role)
//   }

//   // Fetch initial data
//   useEffect(() => {
//     if (accessToken && isAuthenticated) {
//       fetchUsers(1, null)
//     }
//   }, [accessToken, isAuthenticated])

//   return {
//     users,
//     pagination,
//     isLoading,
//     error,
//     refetch,
//     setPage,
//     setRole,
//     currentPage,
//     totalPages: pagination?.totalPages || 1,
//     currentRole,
//   }
// }
