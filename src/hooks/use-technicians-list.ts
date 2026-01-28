// src/hooks/use-technicians-list.ts

import { useState, useEffect } from 'react'

interface Technician {
  id: number
  first_name: string
  last_name: string
  email: string
  role: string
}

export function useTechniciansList() {
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/users/by-role?role=technician&limit=100')

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
  }, [])

  return {
    technicians,
    loading,
    error,
  }
}
