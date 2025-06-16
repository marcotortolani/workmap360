'use client'

import { FileQuestion, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'
import { PageWrapper } from '@/components/page-wrapper'

export default function NotFound() {
  return (
    <PageWrapper backgroundImage="/images/bg-building-bottom-view-02.jpg">
      <Card className="w-full max-w-md bg-white/30  drop-shadow-xl backdrop-blur-lg border-neutral-400">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <FileQuestion className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            Page not found
          </CardTitle>
          <CardDescription className="text-center text-neutral-800">
            The page you are looking for does not exist or has been moved to
            another location.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-6xl font-bold text-gray-300 mb-2">404</div>
            <p className="text-neutral-800">
              Verify the URL or use the navigation links to find what you´re
              looking for.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/" className="flex-1">
              <Button className="w-full bg-sky-500 text-white hover:bg-sky-400">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>

            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="flex-1 border-sky-500 text-sky-500 hover:bg-sky-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go back
            </Button>
          </div>

          {/* <div className="mt-6 text-center">
            <p className="text-sm text-sky-300 mb-2">Do you need help?</p>
          </div> */}
        </CardContent>
      </Card>
    </PageWrapper>
  )
}
