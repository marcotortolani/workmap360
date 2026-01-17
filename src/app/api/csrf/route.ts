// app/api/csrf/route.ts
import { NextResponse } from 'next/server'
import { getCSRFTokenForClient } from '@/lib/security/csrf'

/**
 * GET /api/csrf
 *
 * Returns the CSRF token for the current session.
 * Client-side code should call this endpoint to get the token
 * and include it in subsequent state-changing requests.
 *
 * @example
 * const response = await fetch('/api/csrf')
 * const { token } = await response.json()
 * // Include token in subsequent requests:
 * fetch('/api/projects/create', {
 *   method: 'POST',
 *   headers: {
 *     'x-csrf-token': token,
 *     'Content-Type': 'application/json'
 *   },
 *   body: JSON.stringify(data)
 * })
 */
export async function GET() {
  try {
    const token = await getCSRFTokenForClient()

    return NextResponse.json({ token }, { status: 200 })
  } catch (error) {
    console.error('Error generating CSRF token:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    )
  }
}
