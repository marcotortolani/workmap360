// hooks/use-csrf-token.ts
'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to manage CSRF tokens for API requests
 *
 * @example
 * const { token, isLoading } = useCSRFToken()
 *
 * const createProject = async (data) => {
 *   const response = await fetch('/api/projects/create', {
 *     method: 'POST',
 *     headers: {
 *       'x-csrf-token': token,
 *       'Content-Type': 'application/json'
 *     },
 *     body: JSON.stringify(data)
 *   })
 * }
 */
export function useCSRFToken() {
  const [token, setToken] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchToken() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/csrf')

        if (!response.ok) {
          throw new Error('Failed to fetch CSRF token')
        }

        const data = await response.json()
        setToken(data.token)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
        console.error('Error fetching CSRF token:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchToken()
  }, [])

  return { token, isLoading, error }
}

/**
 * Utility function to make CSRF-protected API calls
 *
 * @example
 * import { fetchWithCSRF } from '@/hooks/use-csrf-token'
 *
 * const data = await fetchWithCSRF('/api/projects/create', {
 *   method: 'POST',
 *   body: JSON.stringify({ name: 'New Project' })
 * })
 */
export async function fetchWithCSRF(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get CSRF token
  const tokenResponse = await fetch('/api/csrf')
  const { token } = await tokenResponse.json()

  // Merge headers with CSRF token
  const headers = new Headers(options.headers)
  headers.set('x-csrf-token', token)

  if (options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json')
  }

  // Make the actual request
  return fetch(url, {
    ...options,
    headers,
  })
}
