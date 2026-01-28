// src/hooks/use-technicians-list.ts

import { useState, useEffect } from 'react'
import { useCurrentUser } from '@/stores/user-store'

interface Technician {
  id: number
  first_name: string
  last_name: string
  email: string
  role: string
}

export function useTechniciansList() {
  const { accessToken, isAuthenticated } = useCurrentUser()
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTechnicians = async () => {
      if (!accessToken || !isAuthenticated) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch('/api/users/by-role?role=technician&limit=100', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch technicians')
        }

        const data = await response.json()
        setTechnicians(data.users || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setTechnicians([])
      } finally {
        setLoading(false)
      }
    }

    fetchTechnicians()
  }, [accessToken, isAuthenticated])

  return {
    technicians,
    loading,
    error,
  }
}
