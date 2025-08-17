// src/lib/api/repairs.ts

import {
  RepairData,
  RepairPhases,
  RepairListParams,
  RepairListResponse,
  RepairDataStatusType,
} from '@/types/repair-type'

// Función para obtener listado de reparaciones
export async function getRepairsViaAPI(
  accessToken: string,
  page: number = 1,
  limit: number = 20,
  filters?: Omit<RepairListParams, 'page' | 'limit'>
): Promise<{
  success: boolean
  repairs?: RepairData[]
  pagination?: RepairListResponse['pagination']
  error?: string
}> {
  try {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    // Agregar filtros
    if (filters?.project_id)
      searchParams.append('project_id', filters.project_id.toString())

    if (filters?.status) searchParams.append('status', filters.status)
    if (filters?.elevation_name)
      searchParams.append('elevation_name', filters.elevation_name)
    if (filters?.drop) searchParams.append('drop', filters.drop.toString())
    if (filters?.level) searchParams.append('level', filters.level.toString())

    const response = await fetch(
      `/api/repairs/list?${searchParams.toString()}`,
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
        error: result.error || 'Failed to fetch repairs',
      }
    }

    return {
      success: true,
      repairs: result.repairs,
      pagination: result.pagination,
    }
  } catch (error) {
    console.error('Error fetching repairs:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

// Función para obtener una reparación específica
export async function getRepairViaAPI(
  repairId: number,
  accessToken: string
): Promise<{ success: boolean; repair?: RepairData; error?: string }> {
  try {
    const response = await fetch(`/api/repairs/read-by-id`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ id: repairId }),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to fetch repair',
      }
    }

    return { success: true, repair: result.repair }
  } catch (error) {
    console.error('Error fetching repair:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

// Función para obtener reparaciones por ubicación específica
export async function getRepairsByLocationViaAPI(
  accessToken: string,
  projectId: number,
  drop: number,
  level: number,
  repairType?: string
): Promise<{
  success: boolean
  repairs?: RepairData[]
  location?: {
    project_id: number
    drop: number
    level: number
    repair_type?: string
  }
  total?: number
  error?: string
}> {
  try {
    const searchParams = new URLSearchParams({
      project_id: projectId.toString(),
      drop: drop.toString(),
      level: level.toString(),
    })

    // Agregar repair_type si se proporciona
    if (repairType) {
      searchParams.append('repair_type', repairType)
    }

    const response = await fetch(
      `/api/repairs/by-location?${searchParams.toString()}`,
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
        error: result.error || 'Failed to fetch repairs by location',
      }
    }

    return {
      success: true,
      repairs: result.repairs,
      location: result.location,
      total: result.total,
    }
  } catch (error) {
    console.error('Error fetching repairs by location:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

// Función para crear una reparación
export async function createRepairViaAPI(
  repairData: {
    project_id: number
    project_name: string
    elevation_name: string
    drop: number
    level: number
    repair_index: number
    phases?: RepairPhases
  },
  accessToken: string
): Promise<{ success: boolean; repairId?: number; error?: string }> {
  try {
    const response = await fetch('/api/repairs/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(repairData),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to create repair',
      }
    }

    return { success: true, repairId: result.repairId }
  } catch (error) {
    console.error('Error creating repair:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

// Función para actualizar una reparación (técnicos)
export async function updateRepairViaAPI(
  repairId: number,
  updateData: {
    phases?: RepairPhases
    status?: RepairDataStatusType
  },
  accessToken: string
): Promise<{ success: boolean; repair?: RepairData; error?: string }> {
  try {
    const response = await fetch(`/api/repairs/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ id: repairId, repairData: updateData }),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to update repair',
      }
    }

    return { success: true, repair: result.repair }
  } catch (error) {
    console.error('Error updating repair:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

// Función específica para que clientes actualicen solo el status
export async function updateRepairStatusViaAPI(
  repairId: number,
  status: RepairDataStatusType,
  accessToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/repairs/update-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ id: repairId, status }),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to update repair status',
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating repair status:', error)
    return { success: false, error: 'Network error occurred' }
  }
}

// Función para eliminar una reparación
export async function deleteRepairViaAPI(
  repairId: number,
  accessToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/repairs/delete`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ id: repairId }),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to delete repair',
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting repair:', error)
    return { success: false, error: 'Network error occurred' }
  }
}
