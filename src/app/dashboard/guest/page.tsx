import { LogoutButton } from '@/components/logout-button'

export default function page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white text-black">
      <h1>Guest Page</h1>
      <p>This is the guest page</p>
      <LogoutButton />
    </div>
  )
}
