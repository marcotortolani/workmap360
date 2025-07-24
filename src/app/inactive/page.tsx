// src/app/inactive/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/stores/user-store'
import { PageWrapper } from '@/components/page-wrapper'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UserX, LogOut, RefreshCw } from 'lucide-react'

export default function InactivePage() {
  const router = useRouter()
  const { logout, currentUser, refreshCurrentUser } = useUserStore()

  // Verificar si el usuario se reactivó
  const handleRefreshStatus = async () => {
    try {
      await refreshCurrentUser()

      // Si el usuario está activo ahora, redirigir al dashboard
      const updatedUser = useUserStore.getState().currentUser
      if (updatedUser?.status === 'active' && updatedUser?.role) {
        router.push(`/dashboard/${updatedUser.role}`)
      }
    } catch (error) {
      console.error('Error refreshing user status:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error during logout:', error)
      // Force redirect even if logout fails
      router.push('/auth/login')
    }
  }

  // Redirigir si el usuario está activo
  useEffect(() => {
    if (currentUser?.status === 'active' && currentUser?.role) {
      router.push(`/dashboard/${currentUser.role}`)
    }
  }, [currentUser, router])

  return (
    <PageWrapper backgroundImage="/images/bg-wall-concrete-glass.jpg">
      <Card className="w-full max-w-lg bg-white/30 drop-shadow-xl backdrop-blur-lg border-neutral-400">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <UserX className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Account Inactive
          </CardTitle>
          <CardDescription className="text-center text-gray-700">
            Your account access has been restricted
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className="border-amber-200 bg-amber-50/80">
            <UserX className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Access Denied:</strong> Your account status is currently
              set to inactive. You do not have permission to access the system
              at this time.
            </AlertDescription>
          </Alert>

          <div className="space-y-4 text-sm text-gray-700">
            <div className="rounded-lg bg-white/50 p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                What does this mean?
              </h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>Your account has been temporarily deactivated</li>
                <li>You cannot access any system features or data</li>
                <li>Contact your administrator for assistance</li>
              </ul>
            </div>

            <div className="rounded-lg bg-white/50 p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Next steps:</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>Contact your system administrator</li>
                <li>Request account reactivation if needed</li>
                <li>Check back later or refresh your status</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleRefreshStatus}
              variant="outline"
              className="w-full bg-white/50 hover:bg-white/70"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Check Account Status
            </Button>

            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>

          {currentUser?.email && (
            <div className="text-center text-xs text-gray-600">
              Account: {currentUser.email}
            </div>
          )}
        </CardContent>
      </Card>
    </PageWrapper>
  )
}
