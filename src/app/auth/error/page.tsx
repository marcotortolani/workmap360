import { PageWrapper } from '@/components/page-wrapper'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Key } from "lucide-react"
import Link from 'next/link'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <PageWrapper backgroundImage="/images/bg-building-bottom-view-02.jpg">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="w-full max-w-md bg-white/30  drop-shadow-xl backdrop-blur-lg border-neutral-400">
            <CardHeader>
              <CardTitle className="text-2xl">
                Sorry, something went wrong.
              </CardTitle>
            </CardHeader>
            <CardContent>
              {params?.error ? (
                <p className="text-sm text-neutral-800">
                  Code error: {params.error}
                </p>
              ) : (
                <p className="text-sm text-neutral-800">
                  An unspecified error occurred.
                </p>
              )}
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
        </div>
      </div>
    </PageWrapper>
  )
}
