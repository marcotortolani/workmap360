'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <Button
      onClick={handleLogout}
      className="bg-red-600 text-white hover:bg-red-500 static md:mt-0 z-10 shadow-md md:shadow-none"
    >
      <LogOut className="md:mr-2 h-4 w-4 stroke-3" />
      <span className="hidden md:inline font-bold">Logout</span>
    </Button>
  )
}
