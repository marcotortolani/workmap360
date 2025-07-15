///* eslint-disable @typescript-eslint/no-unused-vars */
// src/stores/users-store.ts

// import { create } from 'zustand'
// import { UserType, UserRole } from '@/types/user-types'
// import {
//   fetchUsersListViaAPI,
//   createUserViaAPI,
//   updateUserViaAPI,
//   deleteUserViaAPI,
//   UserListParams,
//   Pagination,
// } from '@/lib/api/users'

// interface UsersState {
//   // Data
//   users: UserType[]
//   pagination: Pagination | null

//   // Loading states
//   isLoading: boolean
//   isRefetching: boolean

//   // Error
//   error: string | null

//   // Filters
//   currentPage: number
//   currentRole: UserRole | null
//   currentSearch: string
//   limit: number

//   // Actions - SIMPLIFIED
//   setUsers: (users: UserType[]) => void
//   setPagination: (pagination: Pagination) => void
//   setLoading: (loading: boolean) => void
//   setRefetching: (refetching: boolean) => void
//   setError: (error: string | null) => void
//   setCurrentPage: (page: number) => void
//   setCurrentRole: (role: UserRole | null) => void
//   setCurrentSearch: (search: string) => void
//   setLimit: (limit: number) => void

//   // Reset
//   reset: () => void
// }

// export const useUsersStore = create<UsersState>((set) => ({
//   // Initial state
//   users: [],
//   pagination: null,
//   isLoading: false,
//   isRefetching: false,
//   error: null,
//   currentPage: 1,
//   currentRole: null,
//   currentSearch: '',
//   limit: 20,

//   // Simple setters
//   setUsers: (users) => set({ users }),
//   setPagination: (pagination) => set({ pagination }),
//   setLoading: (isLoading) => set({ isLoading }),
//   setRefetching: (isRefetching) => set({ isRefetching }),
//   setError: (error) => set({ error }),
//   setCurrentPage: (currentPage) => set({ currentPage }),
//   setCurrentRole: (currentRole) => set({ currentRole }),
//   setCurrentSearch: (currentSearch) => set({ currentSearch }),
//   setLimit: (limit) => set({ limit }),

//   // Reset
//   reset: () =>
//     set({
//       users: [],
//       pagination: null,
//       isLoading: false,
//       isRefetching: false,
//       error: null,
//       currentPage: 1,
//       currentRole: null,
//       currentSearch: '',
//       limit: 20,
//     }),
// }))

// // Simple API functions outside the store
// export const fetchUsers = async (
//   accessToken: string,
//   params: {
//     page?: number
//     limit?: number
//     role?: UserRole | null
//     search?: string
//   } = {}
// ) => {
//   const store = useUsersStore.getState()

//   try {
//     if (store.users.length === 0) {
//       store.setLoading(true)
//     } else {
//       store.setRefetching(true)
//     }

//     store.setError(null)

//     const apiParams: UserListParams = {
//       page: params.page || store.currentPage,
//       limit: params.limit || store.limit,
//       ...(params.role && { role: params.role }),
//       ...(params.search && { search: params.search }),
//       sortBy: 'created_at',
//       sortOrder: 'desc',
//     }

//     console.log('Fetching users with params:', apiParams) // Debug

//     const result = await fetchUsersListViaAPI(apiParams, accessToken)

//     if (result.success && result.data) {
//       console.log('Users fetched successfully:', result.data) // Debug
//       store.setUsers(result.data.users)
//       store.setPagination(result.data.pagination)
//     } else {
//       console.error('Failed to fetch users:', result.error) // Debug
//       store.setError(result.error || 'Failed to fetch users')
//     }
//   } catch (error) {
//     console.error('Error in fetchUsers:', error)
//     store.setError('An unexpected error occurred')
//   } finally {
//     store.setLoading(false)
//     store.setRefetching(false)
//   }
// }

// export const createUser = async (
//   userData: Partial<UserType>,
//   accessToken: string
// ) => {
//   try {
//     const result = await createUserViaAPI(userData, accessToken)

//     if (result.success) {
//       // Refetch users after creation
//       await fetchUsers(accessToken)
//       return { success: true }
//     } else {
//       return { success: false, error: result.error }
//     }
//   } catch (error) {
//     return { success: false, error: 'An unexpected error occurred' }
//   }
// }

// export const updateUser = async (
//   userId: number,
//   userData: Partial<UserType>,
//   accessToken: string
// ) => {
//   const store = useUsersStore.getState()

//   try {
//     const result = await updateUserViaAPI(userId, userData, accessToken)

//     if (result.success) {
//       // Update user in the store
//       const updatedUsers = store.users.map((user) =>
//         user.id === userId ? { ...user, ...userData } : user
//       )
//       store.setUsers(updatedUsers)
//       return { success: true }
//     } else {
//       return { success: false, error: result.error }
//     }
//   } catch (error) {
//     return { success: false, error: 'An unexpected error occurred' }
//   }
// }

// export const deleteUser = async (userId: number, accessToken: string) => {
//   const store = useUsersStore.getState()

//   try {
//     const result = await deleteUserViaAPI(userId, accessToken)

//     if (result.success) {
//       // Remove user from store
//       const updatedUsers = store.users.filter((user) => user.id !== userId)
//       store.setUsers(updatedUsers)

//       // Update pagination
//       if (store.pagination) {
//         store.setPagination({
//           ...store.pagination,
//           total: store.pagination.total - 1,
//         })
//       }

//       return { success: true }
//     } else {
//       return { success: false, error: result.error }
//     }
//   } catch (error) {
//     return { success: false, error: 'An unexpected error occurred' }
//   }
// }
