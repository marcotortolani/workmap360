'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

import { PageWrapper } from '@/components/page-wrapper'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Home, Key } from 'lucide-react'

export default function Page() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })
      if (error) throw error
      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageWrapper backgroundImage="/images/bg-wall-brutalism-01.jpg">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          {success ? (
            <Card className="w-full max-w-md bg-white/30  drop-shadow-xl backdrop-blur-lg border-neutral-400">
              <CardHeader>
                <CardTitle className="text-2xl">Check Your Email</CardTitle>
                <CardDescription className=" text-neutral-800">
                  Password reset instructions sent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-700">
                  If you registered using your email and password, you will
                  receive a password reset email.
                </p>
                <div className=" mt-6 flex items-center gap-4">
                  <Link href="/auth/login" className=" w-full ">
                    <Button
                      className="w-full bg-sky-500 text-white hover:bg-sky-400"
                      size="lg"
                    >
                      <Key className="mr-2 h-4 w-4" />
                      <span className=" mr-2 ">Login</span>
                    </Button>
                  </Link>
                  <Link href="/" className=" w-full ">
                    <Button
                      className="w-full bg-neutral-900 text-white hover:bg-neutral-700"
                      size="lg"
                    >
                      <Home className="mr-2 h-4 w-4" />
                      <span className=" mr-2 ">Home</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="w-full max-w-md bg-white/30  drop-shadow-xl backdrop-blur-lg border-neutral-400">
              <CardHeader>
                <CardTitle className="text-2xl">Reset Your Password</CardTitle>
                <CardDescription className=" text-neutral-800">
                  Type in your email and we&apos;ll send you a link to reset
                  your password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleForgotPassword}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="mail@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Sending...' : 'Send reset email'}
                    </Button>
                  </div>
                  <div className="mt-4 text-center text-sm">
                    Already have an account?{' '}
                    <Link
                      href="/auth/login"
                      className="underline underline-offset-4"
                    >
                      Login
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
