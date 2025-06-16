import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-white">Trazalot</h1>
        <p className="mt-2 text-gray-400">Select your role to continue</p>
      </div>

      <div className="grid w-full max-w-md gap-4 sm:grid-cols-2">
        <Link href="/admin" className="w-full">
          <Button
            className="w-full bg-orange-500 text-white hover:bg-orange-400"
            size="lg"
          >
            Admin
          </Button>
        </Link>

        <Link href="/manager" className="w-full">
          <Button
            className="w-full bg-orange-500 text-white hover:bg-orange-400"
            size="lg"
          >
            Manager
          </Button>
        </Link>

        <Link href="/technician" className="w-full">
          <Button
            className="w-full bg-orange-500 text-white hover:bg-orange-400"
            size="lg"
          >
            Technician
          </Button>
        </Link>

        <Link href="/client" className="w-full">
          <Button
            className="w-full bg-orange-500 text-white hover:bg-orange-400"
            size="lg"
          >
            Client
          </Button>
        </Link>
      </div>
    </div>
  )
}
