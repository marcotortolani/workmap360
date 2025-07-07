// lib/api/projects.ts
import {
  ProjectData,
  Elevation,
  ProjectRepairType,
  TechnicianAssignment,
} from '@/types/project-types'

// Función para crear un proyecto usando el endpoint
export async function createProjectViaAPI(
  projectData: {
    name: string
    client_name: string
    client_id: number
    status: ProjectData['status']
    elevations: Elevation[]
    repair_types: ProjectRepairType[]
    technicians: TechnicianAssignment[]
    created_by_user_name: string
    created_by_user_id: number
  },
  accessToken: string
): Promise<{ success: boolean; projectId?: number; error?: string }> {
  try {
    const response = await fetch('/api/projects/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(projectData),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to create project',
      }
    }

    return { success: true, projectId: result.projectId }
  } catch (error) {
    console.error('Error creating project:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

// 🔧 NUEVA FUNCIÓN: Más robusta para lista de proyectos
export async function fetchProjectsListViaAPI(
  params: ProjectListParams = {},
  accessToken: string
): Promise<{ success: boolean; data?: ProjectListResponse; error?: string }> {
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

    const response = await fetch(
      `/api/projects/list?${searchParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}`,
      }
    }

    const data: ProjectListResponse = await response.json()
    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('Error fetching projects list:', error)
    return {
      success: false,
      error: 'Network error or unexpected error occurred',
    }
  }
}

// 🔧 ACTUALIZAR: Función existente para compatibilidad
export async function getProjectsViaAPI(
  accessToken: string,
  page: number = 1,
  limit: number = 20
): Promise<{
  success: boolean
  projects?: ProjectData[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  error?: string
}> {
  try {
    const response = await fetch(
      `/api/projects/list?page=${page}&limit=${limit}`,
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
        error: result.error || 'Failed to fetch projects',
      }
    }

    return {
      success: true,
      projects: result.projects,
      pagination: result.pagination,
    }
  } catch (error) {
    console.error('Error fetching projects:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

// Función para obtener un proyecto específico
export async function getProjectViaAPI(
  projectId: number,
  accessToken: string
): Promise<{ success: boolean; project?: ProjectData; error?: string }> {
  try {
    const response = await fetch(`/api/projects/${projectId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to fetch project',
      }
    }

    return { success: true, project: result.project }
  } catch (error) {
    console.error('Error fetching project:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

// Función para actualizar un proyecto
export async function updateProjectViaAPI(
  projectId: number,
  updateData: Partial<ProjectData>,
  accessToken: string
): Promise<{ success: boolean; project?: ProjectData; error?: string }> {
  try {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(updateData),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to update project',
      }
    }

    return { success: true, project: result.project }
  } catch (error) {
    console.error('Error updating project:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

// Función para eliminar un proyecto
export async function deleteProjectViaAPI(
  projectId: number,
  accessToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to delete project',
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting project:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

// 🔧 ACTUALIZAR: Tipos para la respuesta de paginación
export interface ProjectListResponse {
  projects: ProjectData[]
  pagination: Pagination
}

export interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ProjectListParams {
  page?: number
  limit?: number
  status?: string
  clientId?: number
}
