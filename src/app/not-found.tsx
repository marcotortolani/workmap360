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

export default function NotFound() {
  const currentYear = new Date().getFullYear()
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

      <Card className="w-full max-w-md bg-white/30  drop-shadow-xl backdrop-blur-lg border-neutral-400">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-100">
            <FileQuestion className="h-8 w-8 text-sky-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-sky-600">
            Page not found
          </CardTitle>
          <CardDescription className="text-center">
            The page you are looking for does not exist or has been moved to
            another location.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-6xl font-bold text-gray-300 mb-2">404</div>
            <p className="text-gray-600">
              Verify the URL or use the navigation links to find what you´re
              looking for.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/" className="flex-1">
              <Button className="w-full bg-sky-500 text-white hover:bg-sky-400">
                <Home className="mr-2 h-4 w-4" />
                Go to Home
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

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Do you need help?</p>
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
