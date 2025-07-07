/* eslint-disable react-hooks/exhaustive-deps */
// src/hooks/useRepairsList.ts

import { useState, useEffect } from 'react'
import { useCurrentUser } from '@/stores/user-store'
import { getRepairsViaAPI } from '@/lib/api/repairs'

import {
  RepairData,
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
}

export function useRepairsList(limit: number = 20): UseRepairsListReturn {
  const { accessToken, isAuthenticated } = useCurrentUser()
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

  const fetchRepairs = async (
    page: number = currentPage,
    filters: Omit<RepairListParams, 'page' | 'limit'> = currentFilters
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
      const result = await getRepairsViaAPI(accessToken, page, limit, filters)

      if (result.success && result.repairs) {
        setRepairs(result.repairs)
        setPagination(result.pagination || pagination)
        setCurrentPage(page)
        setCurrentFilters(filters)
      } else {
        setError(result.error || 'Failed to fetch repairs')
        toast.error('Error loading repairs', {
          description: result.error || 'Failed to fetch repairs',
          duration: 5000,
          position: 'bottom-right',
        })
      }
    } catch (error) {
      const errorMessage = 'Unexpected error occurred'
      setError(errorMessage)
      toast.error('Unexpected error occurred', {
        description: 'Error: ' + error,
        duration: 5000,
        position: 'bottom-right',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refetch = async () => {
    await fetchRepairs(currentPage, currentFilters)
  }

  const setPage = (page: number) => {
    setCurrentPage(page)
    fetchRepairs(page, currentFilters)
  }

  const setFilters = (filters: Omit<RepairListParams, 'page' | 'limit'>) => {
    setCurrentFilters(filters)
    setCurrentPage(1) // Reset to first page when filtering
    fetchRepairs(1, filters)
  }

  // Fetch initial data
  useEffect(() => {
    if (accessToken && isAuthenticated) {
      fetchRepairs(1, {})
    }
  }, [accessToken, isAuthenticated])

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
  }
}
