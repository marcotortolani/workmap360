/* eslint-disable react-hooks/exhaustive-deps */
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
  const { accessToken, isAuthenticated } = useCurrentUser()
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
