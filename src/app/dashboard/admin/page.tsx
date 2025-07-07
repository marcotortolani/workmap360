// src/app/dashboard/admin/page.tsx
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  redirect('/dashboard/admin/projects')
}
