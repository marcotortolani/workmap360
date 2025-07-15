// @/stores/user-store.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { UserType } from '@/types/user-types'

interface UserState {
  // Estado del usuario autenticado
  session: Session | null
  authUser: User | null // Usuario de Supabase Auth
  currentUser: UserType | null // Usuario completo de la tabla users
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Lista de usuarios (para componentes administrativos)
  users: UserType[]
  filteredUsers: UserType[]

  // Acciones
  setSession: (session: Session | null) => void
  setAuthUser: (user: User | null) => void
  setCurrentUser: (user: UserType | null) => void
  setUsers: (users: UserType[]) => void
  setFilteredUsers: (filteredUsers: UserType[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clear: () => void

  // Funciones principales
  initializeUser: () => Promise<void>
  refreshCurrentUser: () => Promise<void>
  updateUserProfile: (updates: Partial<UserType>) => Promise<boolean>
  logout: () => Promise<void>
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      session: null,
      authUser: null,
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      users: [],
      filteredUsers: [],

      // Acciones básicas
      setSession: (session) => set({ session }),
      setAuthUser: (authUser) => set({ authUser }),
      setCurrentUser: (currentUser) =>
        set({
          currentUser,
          isAuthenticated: !!currentUser,
          error: null,
        }),
      setUsers: (users) => set({ users }),
      setFilteredUsers: (filteredUsers) => set({ filteredUsers }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clear: () =>
        set({
          authUser: null,
          currentUser: null,
          isAuthenticated: false,
          error: null,
          users: [],
          filteredUsers: [],
        }),

      // Inicializar usuario (llamar al startup de la app)
      initializeUser: async () => {
        try {
          set({ isLoading: true, error: null })
          const supabase = await createClient()

          // 1. Verificar si hay sesión activa
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession()

          if (sessionError || !session?.user) {
            set({
              isLoading: false,
              isAuthenticated: false,
              authUser: null,
              currentUser: null,
              session: null,
            })
            return
          }

          // 2. Guardar usuario de auth
          set({
            authUser: session.user,
            session: session, // ✅ Guardar sesión con access_token
          })

          // 3. Obtener datos completos del usuario desde la tabla users
          const { data: dbUser, error: dbError } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .single()

          if (dbError || !dbUser) {
            console.error('Error fetching user data:', dbError)
            set({
              error: 'Failed to load user data',
              isLoading: false,
              isAuthenticated: false,
            })
            return
          }

          // 4. Guardar usuario completo en el store
          const userData: UserType = {
            id: dbUser.id,
            first_name: dbUser.first_name || '',
            last_name: dbUser.last_name || '',
            email: dbUser.email,
            role: dbUser.role || 'guest',
            status: dbUser.status || 'active',
            avatar: dbUser.avatar || '',
            created_at: dbUser.created_at,
          }

          set({
            currentUser: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          console.error('Error initializing user:', error)
          set({
            error: 'Failed to initialize user',
            isLoading: false,
            isAuthenticated: false,
          })
        }
      },

      // Refrescar datos del usuario actual
      refreshCurrentUser: async () => {
        const currentUser = get().currentUser
        if (!currentUser?.email) return

        try {
          set({ isLoading: true })
          const supabase = await createClient()

          const { data: dbUser, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', currentUser.email)
            .single()

          if (error || !dbUser) {
            console.error('Error refreshing user:', error)
            set({ isLoading: false })
            return
          }

          const userData: UserType = {
            id: dbUser.id,
            first_name: dbUser.first_name || '',
            last_name: dbUser.last_name || '',
            email: dbUser.email,
            role: dbUser.role || 'guest',
            status: dbUser.status || 'active',
            avatar: dbUser.avatar || '',
            created_at: dbUser.created_at,
          }

          set({ currentUser: userData, isLoading: false })
        } catch (error) {
          console.error('Error refreshing user:', error)
          set({ isLoading: false })
        }
      },

      // Actualizar perfil del usuario
      updateUserProfile: async (updates): Promise<boolean> => {
        const currentUser = get().currentUser
        if (!currentUser) return false

        try {
          set({ isLoading: true })
          const supabase = await createClient()

          // Actualizar en la base de datos
          const { error } = await supabase
            .from('users')
            .update({
              ...updates,
              updated_at: new Date().toISOString(),
            })
            .eq('id', currentUser.id)

          if (error) {
            console.error('Error updating user:', error)
            set({ error: 'Failed to update profile', isLoading: false })
            return false
          }

          // Actualizar en el store local
          set({
            currentUser: { ...currentUser, ...updates },
            isLoading: false,
            error: null,
          })

          return true
        } catch (error) {
          console.error('Error updating user profile:', error)
          set({ error: 'Failed to update profile', isLoading: false })
          return false
        }
      },

      // Logout
      logout: async () => {
        try {
          const supabase = await createClient()
          await supabase.auth.signOut()
          get().clear()
        } catch (error) {
          console.error('Error during logout:', error)
        }
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }), // Solo persistir datos esenciales
    }
  )
)

// Hook personalizado para facilitar el uso
export const useCurrentUser = () => {
  const { currentUser, authUser, session, isAuthenticated, isLoading, error } =
    useUserStore()

  return {
    user: currentUser,
    authUser: authUser,
    session: session,
    accessToken: session?.access_token || null,
    isAuthenticated,
    isLoading,
    error,
    isGuest: currentUser?.role === 'guest',
    isAdmin: currentUser?.role === 'admin',
    isManager: currentUser?.role === 'manager',
    isTechnician: currentUser?.role === 'technician',
    fullName: currentUser
      ? `${currentUser.first_name} ${currentUser.last_name}`.trim()
      : '',
    initials: currentUser
      ? `${currentUser.first_name.charAt(0)}${currentUser.last_name.charAt(0)}`
      : 'AA',
    userId: currentUser?.id || null,
    userEmail: currentUser?.email || '',
    userRole: currentUser?.role || 'guest',
    refreshCurrentUser: useUserStore.getState().refreshCurrentUser,
  }
}

// Hook para operaciones administrativas (listado de usuarios)
export const useUsersAdmin = () => {
  const { users, filteredUsers, setUsers, setFilteredUsers } = useUserStore()

  return {
    users,
    filteredUsers,
    setUsers,
    setFilteredUsers,
  }
}
