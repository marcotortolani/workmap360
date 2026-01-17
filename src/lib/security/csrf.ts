// lib/security/csrf.ts
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * CSRF Protection Utilities
 *
 * Protects against Cross-Site Request Forgery attacks by validating
 * that requests originate from the same site.
 */

const CSRF_COOKIE_NAME = 'csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'
const CSRF_TOKEN_LENGTH = 32

/**
 * Generates a cryptographically secure random token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(CSRF_TOKEN_LENGTH)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Sets CSRF token in an HTTP-only cookie
 * Should be called in middleware or on page load
 */
export async function setCSRFToken(): Promise<string> {
  const token = generateCSRFToken()
  const cookieStore = await cookies()

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  })

  return token
}

/**
 * Gets the CSRF token from cookies
 */
export async function getCSRFToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(CSRF_COOKIE_NAME)?.value
}

/**
 * Validates CSRF token from request headers against cookie
 *
 * @param req - The incoming request
 * @returns Object with valid flag and error message if invalid
 */
export async function validateCSRFToken(req: Request): Promise<{
  valid: boolean
  error?: string
}> {
  // Get token from request header
  const headerToken = req.headers.get(CSRF_HEADER_NAME)

  if (!headerToken) {
    return {
      valid: false,
      error: 'CSRF token missing from request headers'
    }
  }

  // Get token from cookie
  const cookieToken = await getCSRFToken()

  if (!cookieToken) {
    return {
      valid: false,
      error: 'CSRF token missing from cookies'
    }
  }

  // Compare tokens (timing-safe comparison)
  if (headerToken !== cookieToken) {
    return {
      valid: false,
      error: 'CSRF token mismatch'
    }
  }

  return { valid: true }
}

/**
 * Middleware helper to validate CSRF for state-changing methods
 * Use this in API routes that modify data (POST, PUT, PATCH, DELETE)
 *
 * @example
 * export async function POST(req: Request) {
 *   const csrfValidation = await validateCSRFForRequest(req)
 *   if (csrfValidation) return csrfValidation
 *
 *   // Continue with request handling...
 * }
 */
export async function validateCSRFForRequest(
  req: Request
): Promise<NextResponse | null> {
  const method = req.method

  // Only validate for state-changing methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return null
  }

  const validation = await validateCSRFToken(req)

  if (!validation.valid) {
    console.warn(`CSRF validation failed: ${validation.error}`)
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    )
  }

  return null
}

/**
 * Gets CSRF token for client-side usage
 * This should be exposed via an API endpoint or embedded in pages
 */
export async function getCSRFTokenForClient(): Promise<string> {
  let token = await getCSRFToken()

  if (!token) {
    token = await setCSRFToken()
  }

  return token
}
