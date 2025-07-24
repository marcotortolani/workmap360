// src/app/auth/login/page.tsx

'use client'
import type React from 'react'
import { useState, useEffect } from 'react'
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
  const { initializeUser, currentUser, isAuthenticated } = useUserStore()
  const [isMounted, setIsMounted] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Evitar hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // ✅ Redirigir si ya está autenticado - SOLO en useEffect
  useEffect(() => {
    if (isMounted && isAuthenticated && currentUser?.role) {
      router.push(`/dashboard/${currentUser.role}`)
    }
  }, [isMounted, isAuthenticated, currentUser, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevenir múltiples submissions
    if (isLoading) return

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {

      // 1. Autentificar con Supabase
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        console.error('Supabase auth error:', authError)
        throw authError
      }


      // 2. Inicializar el store con los datos del usuario
      await initializeUser()

      // 3. Obtener el usuario actualizado del store
      const {
        currentUser: updatedUser,
        isAuthenticated: storeAuthenticated,
        error: storeError,
      } = useUserStore.getState()

      // ✅ 4. Si hay error en el store y es por usuario inactivo, redirigir
      if (
        storeError === 'Account is inactive' ||
        (updatedUser && updatedUser.status !== 'active')
      ) {
        router.push('/inactive')
        return
      }

      // 5. Verificar que tenemos datos del usuario y rol
      if (!updatedUser?.role) {
        throw new Error('Failed to load user data')
      }

      // 6. Verificar que el usuario esté autenticado
      if (!storeAuthenticated) {
        throw new Error('Authentication failed')
      }

      // 7. Redirigir según el rol
      router.push(`/dashboard/${updatedUser.role}`)
    } catch (error: unknown) {
      console.error('Login error:', error)

      // ✅ Verificar si el error es por usuario inactivo
      const { currentUser: storeUser, error: storeError } =
        useUserStore.getState()

      if (
        storeError === 'Account is inactive' ||
        (storeUser && storeUser.status !== 'active')
      ) {
        router.push('/inactive')
        return
      }

      let errorMessage = 'An error occurred during login'

      if (error instanceof Error) {
        // Manejar errores específicos de Supabase
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and confirm your account'
        } else if (error.message.includes('Account is inactive')) {
          // Este caso ya se maneja arriba, pero por seguridad
          router.push('/inactive')
          return
        } else {
          errorMessage = error.message
        }
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // No renderizar el formulario hasta que esté montado
  if (!isMounted) {
    return (
      <PageWrapper backgroundImage="/images/bg-wall-concrete-glass.jpg">
        <Card className="w-full max-w-md bg-white/30 drop-shadow-xl backdrop-blur-lg border-neutral-400">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Login
            </CardTitle>
            <CardDescription className="text-center text-neutral-800">
              Loading...
            </CardDescription>
          </CardHeader>
        </Card>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper backgroundImage="/images/bg-wall-concrete-glass.jpg">
      <Card className="w-full max-w-md bg-white/30 drop-shadow-xl backdrop-blur-lg border-neutral-400">
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
                disabled={isLoading}
                autoComplete="email"
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
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  tabIndex={-1}
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
                tabIndex={isLoading ? -1 : 0}
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
              className="w-full bg-sky-600 text-white hover:bg-sky-400 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="mr-2">Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  <span className="mr-2">Login</span>
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </PageWrapper>
  )
}

// // src/app/auth/login/page.tsx

// 'use client'
// import type React from 'react'
// import { useState, useEffect } from 'react'
// import { useUserStore } from '@/stores/user-store'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import { createClient } from '@/lib/supabase/client'

// import { PageWrapper } from '@/components/page-wrapper'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card'
// import { Alert, AlertDescription } from '@/components/ui/alert'
// import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react'

// export default function LoginPage() {
//   const router = useRouter()
//   const { initializeUser, currentUser, isAuthenticated } = useUserStore()
//   const [isMounted, setIsMounted] = useState(false)
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//   })
//   const [showPassword, setShowPassword] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   // Evitar hydration mismatch
//   useEffect(() => {
//     setIsMounted(true)
//   }, [])

//   // ✅ Redirigir si ya está autenticado - SOLO en useEffect
//   useEffect(() => {
//     if (isMounted && isAuthenticated && currentUser?.role) {
//       console.log('User already authenticated, redirecting to dashboard')
//       router.push(`/dashboard/${currentUser.role}`)
//     }
//   }, [isMounted, isAuthenticated, currentUser, router])

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault()

//     // Prevenir múltiples submissions
//     if (isLoading) return

//     const supabase = createClient()
//     setIsLoading(true)
//     setError(null)

//     try {
//       console.log('Attempting login for:', formData.email)

//       // 1. Autentificar con Supabase
//       const { error: authError } = await supabase.auth.signInWithPassword({
//         email: formData.email,
//         password: formData.password,
//       })

//       if (authError) {
//         console.error('Supabase auth error:', authError)
//         throw authError
//       }

//       console.log('Authentication successful, initializing user...')

//       // 2. Inicializar el store con los datos del usuario
//       await initializeUser()

//       // 3. Obtener el usuario actualizado del store
//       const updatedUser = useUserStore.getState().currentUser

//       console.log('User initialized:', updatedUser)

//       if (!updatedUser?.role) {
//         throw new Error('Failed to load user data')
//       }

//       // ✅ 4. Verificar que el usuario esté activo
//       if (updatedUser.status !== 'active') {
//         console.log('User is inactive, redirecting to inactive page')
//         // Logout automáticamente
//         const supabase = createClient()
//         await supabase.auth.signOut()
//         useUserStore.getState().clear()

//         router.push('/inactive')
//         return
//       }

//       // 5. Redirigir según el rol
//       console.log('Redirecting to dashboard:', updatedUser.role)
//       router.push(`/dashboard/${updatedUser.role}`)
//     } catch (error: unknown) {
//       console.error('Login error:', error)

//       let errorMessage = 'An error occurred during login'

//       if (error instanceof Error) {
//         // Manejar errores específicos de Supabase
//         if (error.message.includes('Invalid login credentials')) {
//           errorMessage = 'Invalid email or password'
//         } else if (error.message.includes('Email not confirmed')) {
//           errorMessage = 'Please check your email and confirm your account'
//         } else {
//           errorMessage = error.message
//         }
//       }

//       setError(errorMessage)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // No renderizar el formulario hasta que esté montado
//   if (!isMounted) {
//     return (
//       <PageWrapper backgroundImage="/images/bg-wall-concrete-glass.jpg">
//         <Card className="w-full max-w-md bg-white/30 drop-shadow-xl backdrop-blur-lg border-neutral-400">
//           <CardHeader className="space-y-1">
//             <CardTitle className="text-2xl font-bold text-center">
//               Login
//             </CardTitle>
//             <CardDescription className="text-center text-neutral-800">
//               Loading...
//             </CardDescription>
//           </CardHeader>
//         </Card>
//       </PageWrapper>
//     )
//   }

//   return (
//     <PageWrapper backgroundImage="/images/bg-wall-concrete-glass.jpg">
//       <Card className="w-full max-w-md bg-white/30 drop-shadow-xl backdrop-blur-lg border-neutral-400">
//         <CardHeader className="space-y-1">
//           <CardTitle className="text-2xl font-bold text-center">
//             Login
//           </CardTitle>
//           <CardDescription className="text-center text-neutral-800">
//             Enter your credentials to access the system
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleLogin} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="user@mail.com"
//                 value={formData.email}
//                 onChange={(e) =>
//                   setFormData({ ...formData, email: e.target.value })
//                 }
//                 required
//                 disabled={isLoading}
//                 autoComplete="email"
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <div className="relative">
//                 <Input
//                   id="password"
//                   type={showPassword ? 'text' : 'password'}
//                   placeholder="••••••••"
//                   value={formData.password}
//                   onChange={(e) =>
//                     setFormData({ ...formData, password: e.target.value })
//                   }
//                   required
//                   disabled={isLoading}
//                   autoComplete="current-password"
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="sm"
//                   className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                   onClick={() => setShowPassword(!showPassword)}
//                   disabled={isLoading}
//                   tabIndex={-1}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-4 w-4 text-gray-400" />
//                   ) : (
//                     <Eye className="h-4 w-4 text-gray-400" />
//                   )}
//                 </Button>
//               </div>
//               <Link
//                 href="/auth/forgot-password"
//                 className="my-2 text-sky-700 inline-block text-sm underline-offset-4 hover:underline"
//                 tabIndex={isLoading ? -1 : 0}
//               >
//                 Forgot your password?
//               </Link>
//             </div>

//             {error && (
//               <Alert variant="destructive">
//                 <AlertDescription>{error}</AlertDescription>
//               </Alert>
//             )}

//             <Button
//               type="submit"
//               className="w-full bg-sky-600 text-white hover:bg-sky-400 disabled:opacity-50"
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   <span className="mr-2">Logging in...</span>
//                 </>
//               ) : (
//                 <>
//                   <LogIn className="mr-2 h-4 w-4" />
//                   <span className="mr-2">Login</span>
//                 </>
//               )}
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </PageWrapper>
//   )
// }

// // src/app/auth/login/page.tsx

// 'use client'
// import type React from 'react'
// import { useState, useEffect } from 'react'
// import { useUserStore } from '@/stores/user-store'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import { createClient } from '@/lib/supabase/client'

// import { PageWrapper } from '@/components/page-wrapper'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card'
// import { Alert, AlertDescription } from '@/components/ui/alert'
// import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react'

// export default function LoginPage() {
//   const router = useRouter()
//   const { initializeUser, currentUser, isAuthenticated } = useUserStore()
//   const [isMounted, setIsMounted] = useState(false)
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//   })
//   const [showPassword, setShowPassword] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   // Evitar hydration mismatch
//   useEffect(() => {
//     setIsMounted(true)
//   }, [])

//   // ✅ Redirigir si ya está autenticado - SOLO en useEffect
//   useEffect(() => {
//     if (isMounted && isAuthenticated && currentUser?.role) {
//       router.push(`/dashboard/${currentUser.role}`)
//     }
//   }, [isMounted, isAuthenticated, currentUser, router])

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault()

//     // Prevenir múltiples submissions
//     if (isLoading) return

//     const supabase = createClient()
//     setIsLoading(true)
//     setError(null)

//     try {
//       // 1. Autentificar con Supabase
//       const { error: authError } = await supabase.auth.signInWithPassword({
//         email: formData.email,
//         password: formData.password,
//       })

//       if (authError) {
//         console.error('Supabase auth error:', authError)
//         throw authError
//       }

//       // 2. Inicializar el store con los datos del usuario
//       await initializeUser()

//       // 3. Obtener el usuario actualizado del store
//       const updatedUser = useUserStore.getState().currentUser

//       if (!updatedUser?.role) {
//         throw new Error('Failed to load user data')
//       }

//       // 4. Redirigir según el rol
//       router.push(`/dashboard/${updatedUser.role}`)
//     } catch (error: unknown) {
//       console.error('Login error:', error)

//       let errorMessage = 'An error occurred during login'

//       if (error instanceof Error) {
//         // Manejar errores específicos de Supabase
//         if (error.message.includes('Invalid login credentials')) {
//           errorMessage = 'Invalid email or password'
//         } else if (error.message.includes('Email not confirmed')) {
//           errorMessage = 'Please check your email and confirm your account'
//         } else {
//           errorMessage = error.message
//         }
//       }

//       setError(errorMessage)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // No renderizar el formulario hasta que esté montado
//   if (!isMounted) {
//     return (
//       <PageWrapper backgroundImage="/images/bg-wall-concrete-glass.jpg">
//         <Card className="w-full max-w-md bg-white/30 drop-shadow-xl backdrop-blur-lg border-neutral-400">
//           <CardHeader className="space-y-1">
//             <CardTitle className="text-2xl font-bold text-center">
//               Login
//             </CardTitle>
//             <CardDescription className="text-center text-neutral-800">
//               Loading...
//             </CardDescription>
//           </CardHeader>
//         </Card>
//       </PageWrapper>
//     )
//   }

//   return (
//     <PageWrapper backgroundImage="/images/bg-wall-concrete-glass.jpg">
//       <Card className="w-full max-w-md bg-white/30 drop-shadow-xl backdrop-blur-lg border-neutral-400">
//         <CardHeader className="space-y-1">
//           <CardTitle className="text-2xl font-bold text-center">
//             Login
//           </CardTitle>
//           <CardDescription className="text-center text-neutral-800">
//             Enter your credentials to access the system
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleLogin} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="user@mail.com"
//                 value={formData.email}
//                 onChange={(e) =>
//                   setFormData({ ...formData, email: e.target.value })
//                 }
//                 required
//                 disabled={isLoading}
//                 autoComplete="email"
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <div className="relative">
//                 <Input
//                   id="password"
//                   type={showPassword ? 'text' : 'password'}
//                   placeholder="••••••••"
//                   value={formData.password}
//                   onChange={(e) =>
//                     setFormData({ ...formData, password: e.target.value })
//                   }
//                   required
//                   disabled={isLoading}
//                   autoComplete="current-password"
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="sm"
//                   className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                   onClick={() => setShowPassword(!showPassword)}
//                   disabled={isLoading}
//                   tabIndex={-1}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-4 w-4 text-gray-400" />
//                   ) : (
//                     <Eye className="h-4 w-4 text-gray-400" />
//                   )}
//                 </Button>
//               </div>
//               <Link
//                 href="/auth/forgot-password"
//                 className="my-2 text-sky-700 inline-block text-sm underline-offset-4 hover:underline"
//                 tabIndex={isLoading ? -1 : 0}
//               >
//                 Forgot your password?
//               </Link>
//             </div>

//             {error && (
//               <Alert variant="destructive">
//                 <AlertDescription>{error}</AlertDescription>
//               </Alert>
//             )}

//             <Button
//               type="submit"
//               className="w-full bg-sky-600 text-white hover:bg-sky-400 disabled:opacity-50"
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   <span className="mr-2">Logging in...</span>
//                 </>
//               ) : (
//                 <>
//                   <LogIn className="mr-2 h-4 w-4" />
//                   <span className="mr-2">Login</span>
//                 </>
//               )}
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </PageWrapper>
//   )
// }

// // src/app/auth/login/page.tsx
// 'use client'
// import type React from 'react'
// import { useState } from 'react'
// import { useUserStore } from '@/stores/user-store'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import { createClient } from '@/lib/supabase/client'

// import { PageWrapper } from '@/components/page-wrapper'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card'
// import { Alert, AlertDescription } from '@/components/ui/alert'
// import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react'

// export default function LoginPage() {
//   const router = useRouter()
//   const { initializeUser } = useUserStore()
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//   })
//   const [showPassword, setShowPassword] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault()
//     const supabase = createClient()
//     setIsLoading(true)
//     setError(null)

//     try {
//       // 1. Autentizar con Supabase
//       const { error: authError } = await supabase.auth.signInWithPassword({
//         email: formData.email,
//         password: formData.password,
//       })
//       if (authError) throw authError

//       // 2. Inicializar el store con los datos del usuario
//       await initializeUser()

//       // 3. Pequeña espera para asegurar que el store se actualice
//       // Update this route to redirect to an authenticated route. The user already has an active session.
//       await new Promise((resolve) => setTimeout(resolve, 100))

//       // 4. Obtener el rol del usuario desde el store
//       const currentUser = useUserStore.getState().currentUser

//       if (!currentUser || !currentUser.role) {
//         throw new Error('Failed to load user data')
//       }

//       // 5. Redirigir según el rol
//       router.push(`/dashboard/${currentUser.role}`)

//     } catch (error: unknown) {
//       setError(error instanceof Error ? error.message : 'An error occurred')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <PageWrapper backgroundImage="/images/bg-wall-concrete-glass.jpg">
//       <Card className="w-full max-w-md bg-white/30  drop-shadow-xl backdrop-blur-lg border-neutral-400">
//         <CardHeader className="space-y-1">
//           <CardTitle className="text-2xl font-bold text-center">
//             Login
//           </CardTitle>
//           <CardDescription className="text-center text-neutral-800">
//             Enter your credentials to access the system
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleLogin} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="user@mail.com"
//                 value={formData.email}
//                 onChange={(e) =>
//                   setFormData({ ...formData, email: e.target.value })
//                 }
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <div className="relative">
//                 <Input
//                   id="password"
//                   type={showPassword ? 'text' : 'password'}
//                   placeholder="••••••••"
//                   value={formData.password}
//                   onChange={(e) =>
//                     setFormData({ ...formData, password: e.target.value })
//                   }
//                   required
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="sm"
//                   className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-4 w-4 text-gray-400" />
//                   ) : (
//                     <Eye className="h-4 w-4 text-gray-400" />
//                   )}
//                 </Button>
//               </div>
//               <Link
//                 href="/auth/forgot-password"
//                 className="my-2 text-sky-700 inline-block text-sm underline-offset-4 hover:underline"
//               >
//                 Forgot your password?
//               </Link>
//             </div>

//             {error && (
//               <Alert variant="destructive">
//                 <AlertDescription>{error}</AlertDescription>
//               </Alert>
//             )}

//             <Button
//               type="submit"
//               className="w-full bg-sky-600 text-white hover:bg-sky-400"
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   <span className=" mr-2">Logging in...</span>
//                 </>
//               ) : (
//                 <>
//                   <LogIn className="mr-2 h-4 w-4" />
//                   <span className=" mr-2">Login</span>
//                 </>
//               )}
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </PageWrapper>
//   )
// }
