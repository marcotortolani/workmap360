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
import { PageWrapper } from '@/components/page-wrapper'
import { useCurrentUser } from '@/stores/user-store'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  const { refreshCurrentUser } = useCurrentUser()
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  const handleReset = () => {
    refreshCurrentUser()
    reset()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <PageWrapper backgroundImage="/images/bg-building-bottom-view-02.jpg">
      <Card className="w-full max-w-md bg-white/30  drop-shadow-xl backdrop-blur-lg border-neutral-400">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            ¡Oops! Something went wrong
          </CardTitle>
          <CardDescription className="text-center text-neutral-800">
            An unexpected error has occurred. Our team has been notified and is
            working to resolve it.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="rounded-md bg-gray-50 p-4">
              <h3 className="text-sm font-medium text-neutral-800">
                Error Details (only visible in development):
              </h3>
              <p className="mt-1 text-xs text-gray-600 font-mono break-all">
                {error.message || 'Error desconocido'}
              </p>
              {error.digest && (
                <p className="mt-1 text-xs text-neutral-500">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={handleReset}
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
    </PageWrapper>
  )
}
