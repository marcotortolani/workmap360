// @/store/userStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User } from '@supabase/supabase-js'
import { UserType, UserRole } from '@/types/user-types'

type UserState = {
  user: User | null
  users: UserType[]
  filteredUsers: UserType[]
  error: string | null
  role: UserRole | null
  setUser: (user: User | null) => void
  setUsers: (users: UserType[]) => void
  setFilteredUsers: (filteredUsers: UserType[]) => void
  setError: (error: string | null) => void
  setRole: (role: UserRole | null) => void
  clear: () => void
}

// Factory function para crear el store con un nombre dinámico
const createUserStore = (userId: string | null) => {
  return create(
    persist<UserState>(
      (set) => ({
        user: null,
        users: [],
        filteredUsers: [],
        error: null,
        role: null,
        setUser: (user) => set({ user }),
        setUsers: (users) => set({ users }),
        setFilteredUsers: (filteredUsers) => set({ filteredUsers }),
        setError: (error) => set({ error }),
        setRole: (role) => set({ role }),
        clear: () =>
          set({
            user: null,
            users: [],
            filteredUsers: [],
            error: null,
            role: null,
          }),
      }),
      {
        name: userId ? `user-storage-${userId}` : 'user-storage-default', // Nombre dinámico
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          user: state.user,
          users: state.users,
          filteredUsers: state.filteredUsers,
          error: state.error,
          role: state.role,
          setUser: () => {},
          setUsers: () => {},
          setFilteredUsers: () => {},
          setError: () => {},
          setRole: () => {},
          clear: () => {},
        }), // Solo persiste los datos, no las funciones
      }
    )
  )
}

// Exporta una función para obtener o crear el store basado en el userId
let store: ReturnType<typeof createUserStore> | null = null

export const getUserStore = (userId: string | null) => {
  if (!store || (userId && store.getState().user?.id !== userId)) {
    store = createUserStore(userId)
  }
  return store
}

// Hook personalizado para usar el store
export const useUserStore = (userId: string | null) => getUserStore(userId)()
