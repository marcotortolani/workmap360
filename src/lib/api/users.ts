// lib/api/users.ts
import { UserType, UserRole, UserStatus } from '@/types/user-types'
import { generateRandomPeepsAvatar } from "../utils/avatar-peeps";

// 🔧 FUNCIÓN PRINCIPAL: Lista de usuarios con paginación y filtros
export async function fetchUsersListViaAPI(
  params: UserListParams = {},
  accessToken: string
): Promise<{ success: boolean; data?: UserListResponse; error?: string }> {
  try {
    const { page = 1, limit = 20, ...otherParams } = params

    // Construir query parameters
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    // Agregar filtros adicionales si existen
    Object.entries(otherParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString())
      }
    })

    const response = await fetch(`/api/users/list?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}`,
      }
    }

    const data: UserListResponse = await response.json()
    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('Error fetching users list:', error)
    return {
      success: false,
      error: 'Network error or unexpected error occurred',
    }
  }
}

// 🔧 FUNCIÓN PARA COMPATIBILIDAD: Versión simplificada
export async function getUsersViaAPI(
  accessToken: string,
  page: number = 1,
  limit: number = 20,
  role?: UserRole
): Promise<{
  success: boolean
  users?: UserType[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  error?: string
}> {
  try {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    if (role) {
      searchParams.append('role', role)
    }

    const response = await fetch(`/api/users/list?${searchParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to fetch users',
      }
    }

    return {
      success: true,
      users: result.users,
      pagination: result.pagination,
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

// 🔧 FUNCIÓN PARA CREAR USUARIO
export async function createUserViaAPI(
  userData: Partial<UserType>,
  accessToken: string
): Promise<{
  success: boolean
  userId?: number
  user?: UserType
  error?: string
}> {
  try {
    // Generar avatar aleatorio si no se proporciona
    const defaultAvatar = userData.avatar || generateRandomPeepsAvatar()

    const requestData = {
      firstName: userData.first_name,
      lastName: userData.last_name,
      email: userData.email,
      role: userData.role,
      status: userData.status,
      avatar: defaultAvatar,
      createdAt: userData.created_at || new Date().toISOString(),
    }

    const response = await fetch('/api/users/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestData),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to create user',
      }
    }

    return {
      success: true,
      userId: result.userId,
      user: result.user,
    }
  } catch (error) {
    console.error('Error creating user:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

// 🔧 FUNCIÓN PARA OBTENER UN USUARIO ESPECÍFICO
export async function getUserViaAPI(
  userId: number,
  accessToken: string
): Promise<{ success: boolean; user?: UserType; error?: string }> {
  try {
    const response = await fetch(`/api/users/read-by-id`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ id: userId }),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to fetch user',
      }
    }

    return { success: true, user: result.user }
  } catch (error) {
    console.error('Error fetching user:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

// 🔧 FUNCIÓN PARA ACTUALIZAR USUARIO
export async function updateUserViaAPI(
  userId: number,
  updateData: Partial<UserType>,
  accessToken: string
): Promise<{ success: boolean; user?: UserType; error?: string }> {
  
  try {
    const response = await fetch('/api/users/edit', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        id: userId,
        ...updateData,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to update user',
      }
    }

    return { success: true, user: result.user }
  } catch (error) {
    console.error('Error updating user:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

// 🔧 FUNCIÓN PARA ELIMINAR USUARIO
export async function deleteUserViaAPI(
  userId: number,
  accessToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/users/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ id: userId }),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to delete user',
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

// 🔧 FUNCIÓN PARA CAMBIAR ESTADO DE USUARIO
export async function changeUserStatusViaAPI(
  userId: number,
  status: UserStatus,
  accessToken: string
): Promise<{ success: boolean; user?: UserType; error?: string }> {
  try {
    const response = await fetch('/api/users/change-status', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        id: userId,
        status: status,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to change user status',
      }
    }

    return { success: true, user: result.user }
  } catch (error) {
    console.error('Error changing user status:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

// 🔧 FUNCIÓN PARA BUSCAR USUARIOS
export async function searchUsersViaAPI(
  searchTerm: string,
  accessToken: string,
  page: number = 1,
  limit: number = 20
): Promise<{
  success: boolean
  users?: UserType[]
  pagination?: Pagination
  error?: string
}> {
  try {
    const searchParams = new URLSearchParams({
      search: searchTerm,
      page: page.toString(),
      limit: limit.toString(),
    })

    const response = await fetch(
      `/api/users/search?${searchParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to search users',
      }
    }

    return {
      success: true,
      users: result.users,
      pagination: result.pagination,
    }
  } catch (error) {
    console.error('Error searching users:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

// 🔧 FUNCIÓN PARA OBTENER ESTADÍSTICAS DE USUARIOS
export async function getUserStatsViaAPI(accessToken: string): Promise<{
  success: boolean
  stats?: UserStats
  error?: string
}> {
  try {
    const response = await fetch('/api/users/stats', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to fetch user stats',
      }
    }

    return { success: true, stats: result.stats }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

// 🔧 TIPOS PARA LAS RESPUESTAS DE API

export interface UserListResponse {
  users: UserType[]
  pagination: Pagination
}

export interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface UserListParams {
  page?: number
  limit?: number
  role?: UserRole
  status?: UserStatus
  search?: string
  sortBy?: 'created_at' | 'first_name' | 'last_name' | 'email'
  sortOrder?: 'asc' | 'desc'
}

export interface UserStats {
  total: number
  byRole: Record<UserRole, number>
  byStatus: Record<UserStatus, number>
  recentlyCreated: number
  activeUsers: number
}

// 🔧 FUNCIÓN PARA FORMATEAR NOMBRE COMPLETO
export function getFullName(user: UserType): string {
  return `${user.first_name} ${user.last_name}`.trim()
}

// 🔧 FUNCIÓN PARA OBTENER INICIALES
export function getUserInitials(user: UserType): string {
  return `${user.first_name.charAt(0) || 'U'}${user.last_name.charAt(
    0
  )}`.toUpperCase()
}

// 🔧 FUNCIÓN PARA VALIDAR EMAIL
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 🔧 FUNCIÓN PARA VALIDAR DATOS DE USUARIO
export function validateUserData(userData: {
  firstName: string
  lastName: string
  email: string
  role: UserRole
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!userData.firstName?.trim()) {
    errors.push('First name is required')
  }

  if (!userData.lastName?.trim()) {
    errors.push('Last name is required')
  }

  if (!userData.email?.trim()) {
    errors.push('Email is required')
  } else if (!validateEmail(userData.email)) {
    errors.push('Invalid email format')
  }

  if (!userData.role) {
    errors.push('Role is required')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
