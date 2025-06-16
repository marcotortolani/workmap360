'use client'

import { AlertCircle, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PageWrapper } from '@/components/page-wrapper'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <html>
      <body>
        <div className=" relative flex min-h-screen flex-col items-center justify-center p-4">
          <PageWrapper backgroundImage="/images/bg-building-bottom-view-02.jpg">
            <Card className="w-full max-w-md bg-white/30  drop-shadow-xl backdrop-blur-lg border-neutral-400">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-red-600">
                  Critical system error
                </CardTitle>
                <CardDescription className="text-center text-neutral-800">
                  A critical error has occurred in the application. Please
                  reload the page or contact technical support.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <h3 className="text-sm font-medium text-red-800">
                      System error
                    </h3>
                  </div>
                  <p className="mt-2 text-sm text-red-700">
                    The application has encountered an error it cannot recover
                    from automatically.
                  </p>
                  {error.digest && (
                    <p className="mt-1 text-xs text-red-600 font-mono">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    onClick={reset}
                    className="flex-1 bg-sky-500 text-white hover:bg-sky-400"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reload app
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
                  <p className="text-sm text-neutral-800 mb-2">
                    If the problem persists, please contact immediately:
                  </p>
                  <div className="space-y-1">
                    <a
                      href="mailto:soporte@trazalot.com"
                      className="block text-sm text-sky-500 hover:text-sky-400 underline"
                    >
                      help@workmap360.com
                    </a>
                    {/* <a
                    href="tel:+1234567890"
                    className="block text-sm text-sky-500 hover:text-sky-400 underline"
                  >
                    +1 (234) 567-890
                  </a> */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </PageWrapper>
        </div>
      </body>
    </html>
  )
}
