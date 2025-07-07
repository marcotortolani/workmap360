'use client'

import type React from 'react'

// import { useState, useEffect } from 'react'
import { useCurrentUser } from '@/stores/user-store'
//import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AvatarUpload } from '@/components/avatar-upload'

export default function ProfilePage() {
  const { user } = useCurrentUser()

  // const [formData, setFormData] = useState<UserType>({
  //   id: 0,
  //   first_name: '',
  //   last_name: '',
  //   email: '',
  //   role: 'guest',
  //   created_at: '0',
  //   status: 'active',
  //   avatar: '',
  //   // password: '',
  // })

  //const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    //console.log('Profile updated:', formData)
    // In a real app, you would update the profile in your backend
  }

  // useEffect(() => {
  //   const getDataUser = async () => {
  //     try {
  //       setLoading(true)

  //       setFormData({
  //         id: dbUser.id || 0,
  //         first_name: dbUser.first_name || '',
  //         last_name: dbUser.last_name || '',
  //         email: dbUser.email || '',
  //         role: dbUser.role || 'guest',
  //         created_at: dbUser.created_at || '0', // ✅ Corregido: created_at en lugar de created_date
  //         status: dbUser.status || 'active',
  //         avatar: dbUser.avatar || '', // ✅ Esto debería mostrar la URL del avatar
  //       })
  //     } catch (error) {
  //       console.error('Error fetching user data:', error)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   getDataUser()
  // }, [])

  // Mostrar loading mientras se cargan los datos
  // if (loading) {
  //   return (
  //     <div className="flex flex-col gap-8 p-8">
  //       <div className="w-1/2 rounded-lg border bg-white p-6 shadow-sm">
  //         <h2 className="mb-6 text-xl font-semibold">My Profile</h2>
  //         <div className="text-center animate-pulse">Loading...</div>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="w-1/2 rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold">My Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="w-full max-w-[200px]">
              <AvatarUpload
                initialImage={user?.avatar}
                // onImageChange={(image) =>
                //   setFormData({ ...formData, avatar: image || '' })
                // }
              />
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={user?.first_name}
                    disabled
                    // onChange={(e) =>
                    //   setFormData({ ...formData, first_name: e.target.value })
                    // }
                    placeholder="Enter first name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={user?.last_name}
                    disabled
                    // onChange={(e) =>
                    //   setFormData({ ...formData, last_name: e.target.value })
                    // }
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="email" className="text-gray-500">
                    Email (Non-editable)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email}
                    disabled
                    className="bg-gray-100"
                  />
                </div>

                <div>
                  <Label htmlFor="role" className="text-gray-500">
                    Role (Non-editable)
                  </Label>
                  <Input
                    id="role"
                    value={user?.role}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Enter new password"
                  />
                </div> */}

                <div>
                  <Label htmlFor="createdDate" className="text-gray-500">
                    Created Date (Non-editable)
                  </Label>
                  <Input
                    id="createdDate"
                    value={new Date(user?.created_at || 0).toLocaleString()}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status" className="text-gray-500">
                  Status (Non-editable)
                </Label>
                <div className="mt-1 flex items-center">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user?.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user?.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    (Only Admin/Manager can change your status)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-orange-500 text-white hover:bg-orange-400"
            >
              Save Changes
            </Button>
          </div> */}
        </form>
      </div>
    </div>
  )
}
