// src/components/pages/profile-page.tsx

'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { useCurrentUser } from '@/stores/user-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Shuffle, Eye, EyeOff, Lock, Palette } from 'lucide-react'
import { getUserInitials } from '@/lib/api/users'
import { UserType } from '@/types/user-types'
import { generateRandomPeepsAvatar } from '@/lib/utils/avatar-peeps'
import { updateUserViaAPI } from '@/lib/api/users'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import AvatarCustomizer from '../avatar-customizer'
//import { Separator } from '../ui/separator'

export default function ProfilePage() {
  const {
    user,
    isLoading: userLoading,
    accessToken,
    refreshCurrentUser,
  } = useCurrentUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showChangingPassword, setShowChangingPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showCustomizer, setShowCustomizer] = useState(false)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    avatar: '',
  })

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
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

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const res = await updateUserViaAPI(user!.id, formData, accessToken!)

    if (res.success) {
      toast.success('Profile updated successfully!')
      await refreshCurrentUser()
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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones del frontend
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long')
      return
    }

    setIsChangingPassword(true)

    try {
      // Usar el cliente de Supabase directamente desde el frontend
      const supabase = createClient()

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (error) {
        console.error('Error updating password:', error)

        if (error.message.includes('session_not_found')) {
          toast.error('Session expired. Please log out and log in again.')
        } else if (error.message.includes('weak_password')) {
          toast.error(
            'Password is too weak. Please choose a stronger password.'
          )
        } else {
          toast.error(error.message || 'Failed to change password')
        }
      } else {
        toast.success('Password changed successfully!')
        setPasswordData({
          newPassword: '',
          confirmPassword: '',
        })
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('An unexpected error occurred. Please try again.')
    }

    setIsChangingPassword(false)
  }

  const handleRandomAvatar = async () => {
    const newAvatar = await generateRandomPeepsAvatar()
    setFormData({ ...formData, avatar: newAvatar })
  }

  const handleCustomAvatar = (avatarUrl: string) => {
    setFormData({ ...formData, avatar: avatarUrl })
    setShowCustomizer(false)
    toast.success('Avatar personalizado aplicado!')
  }

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
    <div className="flex flex-col gap-4 p-0 ">
      <div className=" flex flex-col xl:flex-row gap-8">
        {/* Profile Information Card */}
        <Card className="w-full lg:w-2/3 xl:w-1/2">
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>
              Update your profile information and avatar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start">
                <div className="w-full flex sm:flex-col items-center gap-4 md:max-w-[300px] mx-auto ">
                  <Avatar className="w-32 h-32 lg:w-40 lg:h-40 overflow-hidden rounded-full">
                    <AvatarImage src={formData.avatar} alt="Avatar" />
                    <AvatarFallback className="flex items-center justify-center text-4xl bg-gradient-to-br font-bold text-sky-100 from-blue-500 to-purple-600">
                      {getUserInitials(formData as UserType)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="mt-4 space-y-2">
                    <Button
                      type="button"
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={handleRandomAvatar}
                    >
                      <Shuffle className="w-4 h-4 mr-2" />
                      Random Avatar
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-purple-500 text-purple-500 hover:bg-purple-50"
                      onClick={() => setShowCustomizer(!showCustomizer)}
                    >
                      <Palette className="w-4 h-4 mr-2" />
                      {showCustomizer ? 'Close Editor' : 'Customize Avatar'}
                    </Button>
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

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button
                  type="button"
                  className="bg-purple-500 text-white hover:bg-purple-400"
                  onClick={() => setShowChangingPassword(!showChangingPassword)}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  {showChangingPassword ? 'Close Password' : 'Change Password'}
                </Button>
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
          </CardContent>
        </Card>
        {/* Password Change Card */}
        <Card
          className="w-full lg:w-2/3 xl:w-1/2"
          hidden={!showChangingPassword}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      handlePasswordChange('newPassword', e.target.value)
                    }
                    placeholder="Enter your new password"
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      handlePasswordChange('confirmPassword', e.target.value)
                    }
                    placeholder="Confirm your new password"
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>Password requirements:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>At least 6 characters long</li>
                  <li>Must be different from your current password</li>
                </ul>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button
                  type="submit"
                  variant="outline"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4 mr-2" />
                  )}
                  {isChangingPassword ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      {/* Personalizador de Avatar */}
      <AvatarCustomizer
        isOpen={showCustomizer}
        onClose={() => setShowCustomizer(false)}
        onSave={handleCustomAvatar}
        currentAvatar={formData.avatar}
      />
    </div>
  )
}

// // src/components/pages/profile-page.tsx

// 'use client'

// import type React from 'react'
// import { useState, useEffect } from 'react'
// import {  useCurrentUser } from '@/stores/user-store'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { toast } from 'sonner'
// import { Loader2, Shuffle } from 'lucide-react'
// import { getUserInitials } from '@/lib/api/users'
// import { UserType } from '@/types/user-types'
// import { generateRandomPeepsAvatar } from '@/lib/utils/avatar-peeps'
// import { updateUserViaAPI } from '@/lib/api/users'
// import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

// // import AvatarCustomizer from "../avatar-customizer"

// export default function ProfilePage() {
//   const { user, isLoading: userLoading, accessToken, refreshCurrentUser } = useCurrentUser()
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   //const [showCustomizer, setShowCustomizer] = useState(false)

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

//     const res = await updateUserViaAPI(user!.id, formData, accessToken!)

//     if (res.success) {
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

//   // const handleCustomAvatar = (avatarUrl: string) => {
//   //   setFormData({ ...formData, avatar: avatarUrl })
//   //   setShowCustomizer(false)
//   //   toast.success('Avatar personalizado aplicado!')
//   // }

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
//       <div className="w-full lg:w-2/3 xl:w-1/2 rounded-lg border bg-white p-6 shadow-sm">
//         <h2 className="mb-6 text-xl font-semibold">My Profile</h2>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
//             <div className="w-full max-w-[200px]">
//               <Avatar className="w-24 h-24 lg:w-40 lg:h-40 overflow-hidden rounded-full">
//                 <AvatarImage src={formData.avatar} alt="Avatar" />
//                 <AvatarFallback className="flex items-center justify-center text-4xl bg-gradient-to-br font-bold text-sky-100 from-blue-500 to-purple-600">
//                   {getUserInitials(formData as UserType)}
//                 </AvatarFallback>
//               </Avatar>

//               {/* Botones de Avatar */}
//               <div className="mt-4 space-y-2">
//                 <Button
//                   type="button"
//                   className="w-full bg-blue-500 hover:bg-blue-600 text-white"
//                   onClick={handleRandomAvatar}
//                 >
//                   <Shuffle className="w-4 h-4 mr-2" />
//                   Random Avatar
//                 </Button>

//                 {/* <Button
//                   type="button"
//                   variant="outline"
//                   className="w-full border-purple-500 text-purple-500 hover:bg-purple-50"
//                   onClick={() => setShowCustomizer(!showCustomizer)}
//                 >
//                   <Palette className="w-4 h-4 mr-2" />
//                   {showCustomizer ? 'Cerrar Editor' : 'Personalizar Avatar'}
//                 </Button> */}
//               </div>
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

//         {/* Personalizador de Avatar */}
//         {/* <AvatarCustomizer
//           isOpen={showCustomizer}
//           onClose={() => setShowCustomizer(false)}
//           onSave={handleCustomAvatar}
//           currentAvatar={formData.avatar}
//         /> */}
//       </div>
//     </div>
//   )
// }
