// src/app/auth/login/page.tsx
'use client'
import type React from 'react'
import { useState } from 'react'
import { useUserStore } from '@/stores/user-store'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

import { PageWrapper } from '@/components/page-wrapper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { initializeUser } = useUserStore()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      // 1. Autentizar con Supabase
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })
      if (authError) throw authError

      // 2. Inicializar el store con los datos del usuario
      await initializeUser()

      // 3. Pequeña espera para asegurar que el store se actualice
      // Update this route to redirect to an authenticated route. The user already has an active session.
      await new Promise((resolve) => setTimeout(resolve, 100))

      // 4. Obtener el rol del usuario desde el store
      const currentUser = useUserStore.getState().currentUser

      if (!currentUser || !currentUser.role) {
        throw new Error('Failed to load user data')
      }

      // 5. Redirigir según el rol
      router.push(`/dashboard/${currentUser.role}`)

    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageWrapper backgroundImage="/images/bg-wall-concrete-glass.jpg">
      <Card className="w-full max-w-md bg-white/30  drop-shadow-xl backdrop-blur-lg border-neutral-400">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Login
          </CardTitle>
          <CardDescription className="text-center text-neutral-800">
            Enter your credentials to access the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@mail.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              <Link
                href="/auth/forgot-password"
                className="my-2 text-sky-700 inline-block text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-sky-600 text-white hover:bg-sky-400"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className=" mr-2">Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  <span className=" mr-2">Login</span>
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </PageWrapper>
  )
}
