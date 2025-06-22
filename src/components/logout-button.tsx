'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LogoutButton({
  variant = 'default',
}: {
  variant?:
    | 'default'
    | 'destructive'
    | 'link'
    | 'outline'
    | 'secondary'
    | 'ghost'
}) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <Button variant={variant} onClick={handleLogout}>
      <LogOut className="ml-2 md:ml-0 mr-2 h-4 w-4 stroke-3 text-red-400" />
      <span className="text-red-400 md:inline font-bold">Logout</span>
    </Button>
  )
}
