'use client'
import { FallbackImage } from './fallback-image'

type PageProps = {
  children: React.ReactNode
  backgroundImage?: string
}

export function PageWrapper({ children, backgroundImage }: PageProps) {
  const currentYear = new Date().getFullYear()
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
      <div className=" absolute top-0 left-0 z-[-1] h-full w-full bg-gradient-to-br from-neutral-500 to-neutral-800">
        <FallbackImage
          src={backgroundImage}
          fallbackSrc="/images/bg-stairs-concrete-02.jpg"
          alt="Background Image"
          width={6000}
          height={4000}
          className="object-cover w-full h-full"
        />
      </div>
      <div className=" mb-8 text-center">
        <h1 className="text-4xl font-bold text-neutral-200 text-shadow text-shadow-md text-shadow-black/60 md:text-5xl">
          Workmap360
        </h1>
        <p className="mt-2 text-neutral-200 text-shadow text-shadow-2xs text-shadow-black/60">
          Project Management System
        </p>
      </div>
      {children}
      <div className="mt-10 ">
        <p className="mt-2 text-center font-semibold text-sm md:text-base lg:text-lg text-neutral-100 text-shadow text-shadow-md text-shadow-black/60 ">
          © {currentYear} Workmap360. All rights reserved.
        </p>
      </div>
    </div>
  )
}
