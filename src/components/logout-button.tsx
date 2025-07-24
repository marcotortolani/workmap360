'use client'

import { useRouter } from 'next/navigation'
import { useUserStore } from '@/stores/user-store'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

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
  const { logout } = useUserStore()

  const handleLogout = async () => {
    try {
      // ✅ Usar la función logout del store que limpia todo
      await logout()

      // ✅ Mostrar confirmación
      toast.success('Logged out successfully', {
        duration: 3000,
        position: 'bottom-right',
      })

      // ✅ Redirigir al login
      router.push('/auth/login')

      // ✅ Forzar recarga para limpiar cualquier estado residual
      setTimeout(() => {
        window.location.href = '/auth/login'
      }, 100)
    } catch (error) {
      console.error('Error during logout:', error)
      toast.error('Error during logout', {
        description: 'Please try again',
        duration: 5000,
        position: 'bottom-right',
      })
    }
  }

  return (
    <Button variant={variant} onClick={handleLogout}>
      <LogOut className="ml-2 md:ml-0 mr-2 h-4 w-4 stroke-3 text-red-400" />
      <span className="text-red-400 md:inline font-bold">Logout</span>
    </Button>
  )
}

// 'use client'

// import { useRouter } from 'next/navigation'
// import { createClient } from '@/lib/supabase/client'
// import { LogOut } from 'lucide-react'
// import { Button } from '@/components/ui/button'

// export function LogoutButton({
//   variant = 'default',
// }: {
//   variant?:
//     | 'default'
//     | 'destructive'
//     | 'link'
//     | 'outline'
//     | 'secondary'
//     | 'ghost'
// }) {
//   const router = useRouter()

//   const handleLogout = async () => {
//     const supabase = createClient()
//     await supabase.auth.signOut()
//     router.push('/auth/login')
//   }

//   return (
//     <Button variant={variant} onClick={handleLogout}>
//       <LogOut className="ml-2 md:ml-0 mr-2 h-4 w-4 stroke-3 text-red-400" />
//       <span className="text-red-400 md:inline font-bold">Logout</span>
//     </Button>
//   )
// }
