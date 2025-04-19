'use client'

import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = () => {
    router.push('/')
  }

  return (
    <Button
      onClick={handleLogout}
      className="bg-orange-500 text-white hover:bg-orange-400 static md:mt-0 z-10 shadow-md md:shadow-none"
    >
      <LogOut className="md:mr-2 h-4 w-4" />
      <span className="hidden md:inline">Logout</span>
    </Button>
  )
}
