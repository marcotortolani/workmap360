// src/components/pages/profile-page.tsx

'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import {  useCurrentUser } from '@/stores/user-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Shuffle } from 'lucide-react'
import { getUserInitials } from '@/lib/api/users'
import { UserType } from '@/types/user-types'
import { generateRandomPeepsAvatar } from '@/lib/utils/avatar-peeps'
import { updateUserViaAPI } from '@/lib/api/users'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

// import AvatarCustomizer from "../avatar-customizer"

export default function ProfilePage() {
  const { user, isLoading: userLoading, accessToken, refreshCurrentUser } = useCurrentUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  //const [showCustomizer, setShowCustomizer] = useState(false)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    avatar: '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        avatar: user.avatar,
      })
    }
  }, [user])

  const handleFormChange = (field: string, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value || '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const res = await updateUserViaAPI(user!.id, formData, accessToken!)

    if (res.success) {
      toast.success('Profile updated successfully!')
      await refreshCurrentUser() // Re-fetch user data to reflect changes everywhere
    } else {
      toast.error('Failed to update profile.', {
        description: 'Please try again.',
        style: {
          backgroundColor: 'red',
          color: 'white',
          fontSize: '14px',
        },
      })
    }
    setIsSubmitting(false)
  }

  const handleRandomAvatar = async () => {
    const newAvatar = await generateRandomPeepsAvatar()
    setFormData({ ...formData, avatar: newAvatar })
  }

  // const handleCustomAvatar = (avatarUrl: string) => {
  //   setFormData({ ...formData, avatar: avatarUrl })
  //   setShowCustomizer(false)
  //   toast.success('Avatar personalizado aplicado!')
  // }

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center text-muted-foreground">
        Could not load user profile.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-4 sm:p-8">
      <div className="w-full lg:w-2/3 xl:w-1/2 mx-auto rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold">My Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="w-full max-w-[200px]">
              <Avatar className="w-24 h-24 lg:w-40 lg:h-40 overflow-hidden rounded-full">
                <AvatarImage src={formData.avatar} alt="Avatar" />
                <AvatarFallback className="flex items-center justify-center text-4xl bg-gradient-to-br font-bold text-sky-100 from-blue-500 to-purple-600">
                  {getUserInitials(formData as UserType)}
                </AvatarFallback>
              </Avatar>

              {/* Botones de Avatar */}
              <div className="mt-4 space-y-2">
                <Button
                  type="button"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={handleRandomAvatar}
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Random Avatar
                </Button>

                {/* <Button
                  type="button"
                  variant="outline"
                  className="w-full border-purple-500 text-purple-500 hover:bg-purple-50"
                  onClick={() => setShowCustomizer(!showCustomizer)}
                >
                  <Palette className="w-4 h-4 mr-2" />
                  {showCustomizer ? 'Cerrar Editor' : 'Personalizar Avatar'}
                </Button> */}
              </div>
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.first_name}
                    onChange={(e) =>
                      handleFormChange('first_name', e.target.value)
                    }
                    placeholder="Enter first name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.last_name}
                    onChange={(e) =>
                      handleFormChange('last_name', e.target.value)
                    }
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
                    value={user.email}
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
                    value={user.role}
                    disabled
                    className="bg-gray-100 capitalize"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="createdDate" className="text-gray-500">
                    Member Since (Non-editable)
                  </Label>
                  <Input
                    id="createdDate"
                    value={new Date(user.created_at).toLocaleDateString()}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="status" className="text-gray-500">
                    Status (Non-editable)
                  </Label>
                  <div className="mt-1 flex items-center h-10">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              type="submit"
              className="bg-orange-500 text-white hover:bg-orange-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>

        {/* Personalizador de Avatar */}
        {/* <AvatarCustomizer
          isOpen={showCustomizer}
          onClose={() => setShowCustomizer(false)}
          onSave={handleCustomAvatar}
          currentAvatar={formData.avatar}
        /> */}
      </div>
    </div>
  )
}

// // src/components/pages/profile-page.tsx

// 'use client'

// import type React from 'react'
// import { useState, useEffect } from 'react'
// import { useUserStore, useCurrentUser } from '@/stores/user-store'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { toast } from 'sonner'
// import { Loader2 } from 'lucide-react'
// import { getUserInitials } from '@/lib/api/users'
// import { UserType } from '@/types/user-types'
// import { generateRandomPeepsAvatar } from '@/lib/utils/avatar-peeps'
// import { updateUserViaAPI } from '@/lib/api/users'
// import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

// export default function ProfilePage() {
//   const { user, isLoading: userLoading } = useCurrentUser()
//   const { refreshCurrentUser, session } = useUserStore()
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   const [formData, setFormData] = useState({
//     first_name: '',
//     last_name: '',
//     avatar: '',
//   })

//   useEffect(() => {
//     if (user) {
//       setFormData({
//         first_name: user.first_name,
//         last_name: user.last_name,
//         avatar: user.avatar,
//       })
//     }
//   }, [user])

//   const handleFormChange = (field: string, value: string | null) => {
//     setFormData((prev) => ({ ...prev, [field]: value || '' }))
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsSubmitting(true)
//     //    const success = await updateUserProfile(formData)
//     const success = await updateUserViaAPI(
//       user!.id,
//       formData,
//       session!.access_token
//     )

//     if (success) {
//       toast.success('Profile updated successfully!')
//       await refreshCurrentUser() // Re-fetch user data to reflect changes everywhere
//     } else {
//       toast.error('Failed to update profile.', {
//         description: 'Please try again.',
//         style: {
//           backgroundColor: 'red',
//           color: 'white',
//           fontSize: '14px',
//         },
//       })
//     }
//     setIsSubmitting(false)
//   }

//   const handleRandomAvatar = async () => {
//     const newAvatar = await generateRandomPeepsAvatar()
//     setFormData({ ...formData, avatar: newAvatar })
//   }

//   if (userLoading) {
//     return (
//       <div className="flex items-center justify-center h-full">
//         <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
//       </div>
//     )
//   }

//   if (!user) {
//     return (
//       <div className="text-center text-muted-foreground">
//         Could not load user profile.
//       </div>
//     )
//   }

//   return (
//     <div className="flex flex-col gap-8 p-4 sm:p-8">
//       <div className="w-full lg:w-2/3 xl:w-1/2 mx-auto rounded-lg border bg-white p-6 shadow-sm">
//         <h2 className="mb-6 text-xl font-semibold">My Profile</h2>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
//             <div className="w-full max-w-[200px]">
//               <Avatar className="w-24 h-24 lg:w-40 lg:h-40 overflow-hidden  rounded-full">
//                 <AvatarImage src={formData.avatar} alt="Avatar" />
//                 <AvatarFallback className="flex items-center justify-center text-4xl bg-gradient-to-br font-bold text-sky-100 from-blue-500 to-purple-600">
//                   {getUserInitials(formData as UserType)}
//                 </AvatarFallback>
//               </Avatar>
//               <Button
//                 type="button"
//                 className="mt-4 w-full"
//                 onClick={handleRandomAvatar}
//               >
//                 Random Avatar
//               </Button>
//             </div>

//             <div className="flex-1 space-y-4 w-full">
//               <div className="grid gap-4 sm:grid-cols-2">
//                 <div>
//                   <Label htmlFor="firstName">First Name</Label>
//                   <Input
//                     id="firstName"
//                     value={formData.first_name}
//                     onChange={(e) =>
//                       handleFormChange('first_name', e.target.value)
//                     }
//                     placeholder="Enter first name"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <Label htmlFor="lastName">Last Name</Label>
//                   <Input
//                     id="lastName"
//                     value={formData.last_name}
//                     onChange={(e) =>
//                       handleFormChange('last_name', e.target.value)
//                     }
//                     placeholder="Enter last name"
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="grid gap-4 sm:grid-cols-2">
//                 <div>
//                   <Label htmlFor="email" className="text-gray-500">
//                     Email (Non-editable)
//                   </Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     value={user.email}
//                     disabled
//                     className="bg-gray-100"
//                   />
//                 </div>

//                 <div>
//                   <Label htmlFor="role" className="text-gray-500">
//                     Role (Non-editable)
//                   </Label>
//                   <Input
//                     id="role"
//                     value={user.role}
//                     disabled
//                     className="bg-gray-100 capitalize"
//                   />
//                 </div>
//               </div>

//               <div className="grid gap-4 sm:grid-cols-2">
//                 <div>
//                   <Label htmlFor="createdDate" className="text-gray-500">
//                     Member Since (Non-editable)
//                   </Label>
//                   <Input
//                     id="createdDate"
//                     value={new Date(user.created_at).toLocaleDateString()}
//                     disabled
//                     className="bg-gray-100"
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="status" className="text-gray-500">
//                     Status (Non-editable)
//                   </Label>
//                   <div className="mt-1 flex items-center h-10">
//                     <span
//                       className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
//                         user.status === 'active'
//                           ? 'bg-green-100 text-green-800'
//                           : 'bg-red-100 text-red-800'
//                       }`}
//                     >
//                       {user.status === 'active' ? 'Active' : 'Inactive'}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="flex justify-end pt-4 border-t">
//             <Button
//               type="submit"
//               className="bg-orange-500 text-white hover:bg-orange-400"
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? (
//                 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//               ) : null}
//               {isSubmitting ? 'Saving...' : 'Save Changes'}
//             </Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }
