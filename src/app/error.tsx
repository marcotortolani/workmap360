'use client'

import { useEffect } from 'react'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
      <div
        className=" absolute top-0 left-0 z-[-1] h-full w-full"
        style={{
          backgroundImage: 'url("/images/bg-stairs-concrete-02.jpg")',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      ></div>
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-stretch-75% font-bold text-neutral-200 text-shadow text-shadow-md text-shadow-black/60 md:text-5xl">
          Workmap360
        </h1>
        <p className="mt-2 text-neutral-200 text-shadow text-shadow-2xs text-shadow-black/60">
          Project Management System
        </p>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            ¡Oops! Something went wrong
          </CardTitle>
          <CardDescription className="text-center">
            An unexpected error has occurred. Our team has been notified and is
            working to resolve it.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="rounded-md bg-gray-50 p-4">
              <h3 className="text-sm font-medium text-gray-800">
                Error Details (only visible in development):
              </h3>
              <p className="mt-1 text-xs text-gray-600 font-mono break-all">
                {error.message || 'Error desconocido'}
              </p>
              {error.digest && (
                <p className="mt-1 text-xs text-gray-500">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={reset}
              className="flex-1 bg-sky-500 text-white hover:bg-sky-400"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>

            <Button
              onClick={handleGoHome}
              variant="outline"
              className="flex-1 border-sky-500 text-sky-500 hover:bg-sky-50"
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              If the problem persists, please contact immediately:
            </p>
            <a
              href="mailto:soporte@trazalot.com"
              className="block text-sm text-sky-500 hover:text-sky-400 underline"
            >
              help@workmap360.com
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="absolute bottom-8 md:bottom-10 ">
        <p className="mt-2 text-center font-semibold text-sm md:text-base lg:text-lg text-neutral-100 text-shadow text-shadow-md text-shadow-black/60 ">
          © {currentYear} Workmap360. All rights reserved.
        </p>
      </div>
    </div>
  )
}
