// src/components/pages/manager/users-page.tsx

'use client'

import { useState } from 'react'
import { useCurrentUser } from '@/stores/user-store'
import { useUsersList } from '@/hooks/use-users-list'
import {
  createUserViaAPI,
  updateUserViaAPI,
  deleteUserViaAPI,
  validateUserData,
  getFullName,
  getUserInitials,
} from '@/lib/api/users'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { UserForm } from '@/components/user-form'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { toast } from 'sonner'
import { UserPlus, Edit, Trash2 } from 'lucide-react'
import { UserRole, UserType } from '@/types/user-types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function ManagerUsersPage() {
  const { accessToken } = useCurrentUser()
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)
  const [userToDelete, setUserToDelete] = useState<UserType['id'] | null>(null)

  // Hook personalizado para manejo de usuarios
  const {
    users,
    pagination,
    isLoading,
    error,
    refetch,
    setPage,
    setRole,
    currentPage,
    totalPages,
    currentRole,
  } = useUsersList(20)

  const handleCreateButton = () => {
    setEditingUser(null)
    setShowForm(true)
  }

  const handleEditButton = (user: UserType) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const handleDeleteButton = (userId: UserType['id']) => {
    setUserToDelete(userId)
  }

  // 🔧 FUNCIÓN SIMPLIFICADA PARA CREAR USUARIO USANDO API FUNCTIONS
  const createUser = async (user: UserType) => {
    if (!accessToken) {
      toast.error('Authentication Error', {
        description: 'You must be logged in to create users',
        duration: 5000,
        position: 'bottom-right',
      })
      return
    }

    // 🔧 USAR VALIDACIÓN DE API FUNCTIONS
    const validation = validateUserData({
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
    })

    if (!validation.isValid) {
      toast.error('Validation Error', {
        description: validation.errors.join(', '),
        duration: 5000,
        position: 'bottom-right',
        style: {
          backgroundColor: 'red',
          color: 'white',
          fontSize: '14px',
        },
      })
      return
    }

    try {
      // 🔧 USAR LA FUNCIÓN createUserViaAPI
      const result = await createUserViaAPI(
        {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          status: user.status,
          avatar: user.avatar,
          // La función genera automáticamente el avatar y createdAt
        },
        accessToken
      )

      if (result.success) {
        toast('User created successfully', {
          description: `${getFullName(user)} - ${user.email}`,
          duration: 3000,
          icon: '🚀',
          position: 'bottom-center',
          style: {
            background: '#07c',
            color: '#FFF',
            fontWeight: 'bold',
          },
        })

        await refetch()
        setShowForm(false)
      } else {
        toast.error('Error creating user', {
          description: result.error,
          duration: 5000,
          position: 'bottom-right',
          style: {
            backgroundColor: 'red',
            color: 'white',
            fontSize: '14px',
          },
        })
      }
    } catch (err: unknown) {
      console.error('Error creating user:', err)
      toast.error('Error creating user', {
        description: 'An unexpected error occurred',
        duration: 5000,
        position: 'bottom-right',
        style: {
          backgroundColor: 'red',
          color: 'white',
          fontSize: '14px',
        },
      })
    }
  }

  // 🔧 FUNCIÓN SIMPLIFICADA PARA EDITAR USUARIO USANDO API FUNCTIONS
  const confirmEdit = async (user: UserType) => {
    if (!accessToken) {
      toast.error('Authentication Error', {
        description: 'You must be logged in to edit users',
        duration: 5000,
        position: 'bottom-right',
      })
      return
    }

    if (!user.id) {
      toast.error('User ID is required', {
        duration: 5000,
        position: 'bottom-right',
        style: {
          backgroundColor: 'red',
          color: 'white',
          fontSize: '14px',
        },
      })
      return
    }

    // 🔧 USAR VALIDACIÓN DE API FUNCTIONS
    const validation = validateUserData({
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
    })

    if (!validation.isValid) {
      toast.error('Validation Error', {
        description: validation.errors.join(', '),
        duration: 5000,
        position: 'bottom-right',
        style: {
          backgroundColor: 'red',
          color: 'white',
          fontSize: '14px',
        },
      })
      return
    }

    try {
      // 🔧 USAR LA FUNCIÓN updateUserViaAPI
      const result = await updateUserViaAPI(
        user.id,
        {
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          status: user.status,
          avatar: user.avatar,
        },
        accessToken
      )

      if (result.success) {
        toast('User edited successfully', {
          description: `${getFullName(user)} - ${user.email}`,
          duration: 3000,
          icon: '✏',
          position: 'bottom-center',
          style: {
            background: '#333',
            color: '#fff',
          },
        })

        await refetch()
        setEditingUser(null)
        setShowForm(false)
      } else {
        toast.error('Error editing user', {
          description: result.error,
          duration: 5000,
          position: 'bottom-right',
          style: {
            backgroundColor: 'red',
            color: 'white',
            fontSize: '14px',
          },
        })
      }
    } catch (err) {
      console.error('Error editing user:', err)
      toast.error('Error editing user', {
        description: 'An unexpected error occurred',
        duration: 5000,
        position: 'bottom-right',
        style: {
          backgroundColor: 'red',
          color: 'white',
          fontSize: '14px',
        },
      })
    }
  }

  // 🔧 FUNCIÓN SIMPLIFICADA PARA ELIMINAR USUARIO USANDO API FUNCTIONS
  const deleteUser = async (userId: UserType['id']) => {
    if (!accessToken) {
      toast.error('Authentication Error', {
        description: 'You must be logged in to delete users',
        duration: 5000,
        position: 'bottom-right',
      })
      return
    }

    if (!userId) {
      toast.error('User ID is required', {
        duration: 5000,
        position: 'bottom-right',
        style: {
          backgroundColor: 'red',
          color: 'white',
          fontSize: '14px',
        },
      })
      return
    }

    try {
      // 🔧 USAR LA FUNCIÓN deleteUserViaAPI
      const result = await deleteUserViaAPI(userId, accessToken)

      if (result.success) {
        toast('User deleted successfully', {
          duration: 2000,
          icon: '🗑️',
          position: 'bottom-center',
          style: {
            background: '#333',
            color: '#fff',
          },
        })

        await refetch()
      } else {
        toast.error('Error deleting user', {
          description: result.error,
          duration: 5000,
          position: 'bottom-right',
          style: {
            backgroundColor: 'red',
            color: 'white',
            fontSize: '14px',
          },
        })
      }
    } catch (err) {
      console.error('Error deleting user:', err)
      toast.error('Error deleting user', {
        description: 'An unexpected error occurred',
        duration: 5000,
        position: 'bottom-right',
        style: {
          backgroundColor: 'red',
          color: 'white',
          fontSize: '14px',
        },
      })
    }
  }

  return (
    <div className="flex flex-col gap-8 p-2 md:p-4 lg:p-8">
      {!showForm ? (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Users Management</h2>
              {pagination && (
                <p className="text-sm text-muted-foreground mt-1">
                  Showing {users.length} of {pagination.total} users
                </p>
              )}
            </div>
            <Button
              className="bg-sky-600 text-white hover:bg-sky-500"
              onClick={handleCreateButton}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </div>

          {/* Filtros */}
          <div className="mb-4 w-full sm:w-auto">
            <Label htmlFor="roleFilter" className="mb-1 block text-sm">
              Filter by Role
            </Label>
            <div className="flex items-center gap-5">
              <Select
                value={currentRole || ''}
                onValueChange={(value) => setRole((value as UserRole) || null)}
              >
                <SelectTrigger id="roleFilter" className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
              {currentRole && (
                <Button
                  className="bg-orange-500 text-white hover:bg-orange-400"
                  onClick={() => setRole(null)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Filter
                </Button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-medium">Error loading users:</p>
              <p>{error}</p>
              <Button
                onClick={refetch}
                className="mt-2 bg-red-600 text-white hover:bg-red-700"
                size="sm"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Users Table */}
          {!isLoading && !error && (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Avatar</TableHead>
                      <TableHead>First Name</TableHead>
                      <TableHead>Last Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center py-8 text-gray-500"
                        >
                          {currentRole
                            ? `No users found with role: ${currentRole}`
                            : 'No users found.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Avatar className="w-10 h-10 lg:w-12 lg:h-12  overflow-hidden  rounded-full">
                              <AvatarImage src={user.avatar} alt="Avatar" />
                              <AvatarFallback className="flex items-center justify-center lg:text-base bg-gradient-to-br font-bold text-sky-100 from-blue-500 to-purple-600">
                                {getUserInitials(user as UserType)}
                              </AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell>{user.first_name}</TableCell>
                          <TableCell>{user.last_name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <span
                              className={`${
                                user.role === 'admin'
                                  ? ' border-black '
                                  : user.role === 'manager'
                                  ? ' border-sky-500 '
                                  : user.role === 'technician'
                                  ? ' border-green-500 '
                                  : user.role === 'client'
                                  ? ' border-red-500 '
                                  : user.role === 'guest'
                                  ? ' border-amber-500 '
                                  : ' border-gray-700 '
                              } inline-flex items-center rounded-full border-2 bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 capitalize`}
                            >
                              {user.role}
                            </span>
                          </TableCell>
                          <TableCell>{user.created_at.split('T')[0]}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                                user.status === 'active'
                                  ? 'bg-green-200 text-green-800 '
                                  : 'bg-red-100 text-red-800 '
                              }`}
                            >
                              {user.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                                onClick={() => handleEditButton(user)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                onClick={() => handleDeleteButton(user.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-700">
                    Showing {(currentPage - 1) * (pagination.limit || 20) + 1}{' '}
                    to{' '}
                    {Math.min(
                      currentPage * (pagination.limit || 20),
                      pagination.total
                    )}{' '}
                    of {pagination.total} users
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(1)}
                      disabled={currentPage === 1}
                    >
                      Initial
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="w-full max-w-screen-lg rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">
            {editingUser ? 'Edit User' : 'Create User'}
          </h2>
          <UserForm
            adminPermissions={true}
            user={editingUser}
            onSubmit={editingUser ? confirmEdit : createUser}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {userToDelete && (
        <div>
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none">
            <div className="relative mx-auto my-6 w-auto max-w-3xl">
              <div className="relative flex w-full flex-col rounded-lg bg-white shadow-lg outline-none focus:outline-none">
                <div className="flex items-start justify-between rounded-t border-b border-solid border-slate-200 p-5">
                  <h3 className="text-3xl font-semibold">Delete User</h3>
                </div>
                <div className="relative flex-auto p-6">
                  <p className="mb-8 text-slate-500">
                    Are you sure you want to delete this user? This action
                    cannot be undone.
                  </p>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setUserToDelete(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        deleteUser(userToDelete)
                        setUserToDelete(null)
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete User
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
        </div>
      )}
    </div>
  )
}

//? Anterior funciona
// // src/components/pages/manager/users-page.tsx

// 'use client'

// import { useState } from 'react'
// import { useCurrentUser } from '@/stores/user-store'
// import { useUsersList } from '@/hooks/use-users-list'

// import { Button } from '@/components/ui/button'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'

// import { UserForm } from '@/components/user-form'
// import { Label } from '@/components/ui/label'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'

// import { FallbackAvatar } from '@/components/fallback-avatar'
// import { toast } from 'sonner'
// import { UserPlus, Edit, Trash2 } from 'lucide-react'
// import { UserRole, UserType } from '@/types/user-types'

// export default function ManagerUsersPage() {
//   const { accessToken } = useCurrentUser()
//   const [showForm, setShowForm] = useState(false)
//   const [editingUser, setEditingUser] = useState<UserType | null>(null)
//   const [userToDelete, setUserToDelete] = useState<UserType['id'] | null>(null)

//   // 🔧 USAR EL HOOK PERSONALIZADO
//   const {
//     users,
//     pagination,
//     isLoading,
//     error,
//     refetch,
//     setPage,
//     setRole,
//     currentPage,
//     totalPages,
//     currentRole,
//   } = useUsersList(20)

//   const handleCreateButton = () => {
//     setEditingUser(null)
//     setShowForm(true)
//   }

//   const handleEditButton = (user: UserType) => {
//     setEditingUser(user)
//     setShowForm(true)
//   }

//   const handleDeleteButton = (userId: UserType['id']) => {
//     setUserToDelete(userId)
//   }

//   // 🔧 FUNCIONES SIMPLIFICADAS - Solo manejan la operación y refrescan
//   const createUser = async (user: UserType) => {
//     if (!user.first_name || !user.last_name || !user.email) {
//       toast.error('All fields are required', {
//         duration: 5000,
//         position: 'bottom-right',
//         style: {
//           backgroundColor: 'red',
//           color: 'white',
//           fontSize: '14px',
//         },
//       })
//       return
//     }

//     if (!accessToken) {
//       toast.error('Authentication Error', {
//         description: 'You must be logged in to create users',
//         duration: 5000,
//         position: 'bottom-right',
//       })
//       return
//     }

//     try {
//       const newRandomAvatar =
//         'https://avatar.iran.liara.run/public/' +
//         Math.floor(Math.random() * 49 + 1).toString()

//       const response = await fetch('/api/users/create', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Accept: 'application/json',
//           Authorization: `Bearer ${accessToken}`,
//         },
//         body: JSON.stringify({
//           firstName: user.first_name,
//           lastName: user.last_name,
//           email: user.email,
//           role: user.role,
//           createdAt: new Date().toLocaleString('en-NZ'),
//           status: user.status,
//           avatar: newRandomAvatar,
//         }),
//       })
//       const result = await response.json()

//       if (!response.ok) {
//         toast.error('Error creating user', {
//           description: result.error,
//           duration: 5000,
//           position: 'bottom-right',
//           style: {
//             backgroundColor: 'red',
//             color: 'white',
//             fontSize: '14px',
//           },
//         })
//         return
//       }

//       toast('User created successfully', {
//         description: `${user.first_name} ${user.last_name} - ${user.email}`,
//         duration: 3000,
//         icon: '🚀',
//         position: 'bottom-center',
//         style: {
//           background: '#07c',
//           color: '#000',
//         },
//       })

//       await refetch() // 🔧 Usar refetch del hook
//       setShowForm(false)
//     } catch (err: unknown) {
//       console.log('Error creating user:', err)
//       toast.error('Error creating user', {
//         description: 'An unexpected error occurred',
//         duration: 5000,
//         position: 'bottom-right',
//         style: {
//           backgroundColor: 'red',
//           color: 'white',
//           fontSize: '14px',
//         },
//       })
//     }
//   }

//   const confirmEdit = async (user: UserType) => {
//     if (
//       !user.id ||
//       !user.first_name ||
//       !user.last_name ||
//       !user.role ||
//       !user.status ||
//       !user.avatar
//     ) {
//       toast.error('All fields are required', {
//         duration: 5000,
//         position: 'bottom-right',
//         style: {
//           backgroundColor: 'red',
//           color: 'white',
//           fontSize: '14px',
//         },
//       })
//       return
//     }

//     if (!accessToken) {
//       toast.error('Authentication Error', {
//         description: 'You must be logged in to edit users',
//         duration: 5000,
//         position: 'bottom-right',
//       })
//       return
//     }

//     try {
//       const res = await fetch(`/api/users/edit`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${accessToken}`,
//         },
//         body: JSON.stringify({
//           id: user.id,
//           firstName: user.first_name,
//           lastName: user.last_name,
//           role: user.role,
//           status: user.status,
//           avatar: user.avatar,
//         }),
//       })

//       if (!res.ok) {
//         const result = await res.json()
//         toast.error('Error editing user', {
//           description: result.error,
//           duration: 5000,
//           position: 'bottom-right',
//           style: {
//             backgroundColor: 'red',
//             color: 'white',
//             fontSize: '14px',
//           },
//         })
//         return
//       }

//       toast('User edited successfully', {
//         description: `${user.first_name} ${user.last_name} - ${user.email}`,
//         duration: 3000,
//         icon: '✏',
//         position: 'bottom-center',
//         style: {
//           background: '#333',
//           color: '#fff',
//         },
//       })

//       await refetch() // 🔧 Usar refetch del hook
//       setEditingUser(null)
//       setShowForm(false)
//     } catch (err) {
//       console.error(err)
//       toast.error('Error editing user', {
//         description: 'An unexpected error occurred',
//         duration: 5000,
//         position: 'bottom-right',
//         style: {
//           backgroundColor: 'red',
//           color: 'white',
//           fontSize: '14px',
//         },
//       })
//     }
//   }

//   const deleteUser = async (userId: UserType['id']) => {
//     if (!userId) {
//       toast.error('User ID is required', {
//         duration: 5000,
//         position: 'bottom-right',
//         style: {
//           backgroundColor: 'red',
//           color: 'white',
//           fontSize: '14px',
//         },
//       })
//       return
//     }

//     if (!accessToken) {
//       toast.error('Authentication Error', {
//         description: 'You must be logged in to delete users',
//         duration: 5000,
//         position: 'bottom-right',
//       })
//       return
//     }

//     try {
//       const res = await fetch('/api/users/delete', {
//         method: 'DELETE',
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ id: userId }),
//       })

//       const json = await res.json()
//       if (!res.ok) {
//         toast.error('Error deleting user', {
//           description: json.error,
//           duration: 5000,
//           position: 'bottom-right',
//           style: {
//             backgroundColor: 'red',
//             color: 'white',
//             fontSize: '14px',
//           },
//         })
//         return
//       }

//       toast('User deleted successfully', {
//         duration: 2000,
//         icon: '🗑️',
//         position: 'bottom-center',
//         style: {
//           background: '#333',
//           color: '#fff',
//         },
//       })

//       await refetch() // 🔧 Usar refetch del hook
//     } catch (err) {
//       console.error('Error deleting user:', err)
//       toast.error('Error deleting user', {
//         description: 'An unexpected error occurred',
//         duration: 5000,
//         position: 'bottom-right',
//         style: {
//           backgroundColor: 'red',
//           color: 'white',
//           fontSize: '14px',
//         },
//       })
//     }
//   }

//   return (
//     <div className="flex flex-col gap-8 p-2 md:p-4 lg:p-8">
//       {!showForm ? (
//         <div className="rounded-lg border bg-white p-6 shadow-sm">
//           <div className="mb-4 flex items-center justify-between">
//             <h2 className="text-xl font-semibold">Users</h2>
//             <Button
//               className="bg-sky-600 text-white hover:bg-sky-500"
//               onClick={handleCreateButton}
//             >
//               <UserPlus className="mr-2 h-4 w-4" />
//               Create User
//             </Button>
//           </div>

//           {/* 🔧 FILTROS SIMPLIFICADOS */}
//           <div className="mb-4 w-full sm:w-auto">
//             <Label htmlFor="roleFilter" className="mb-1 block text-sm">
//               Filter by Role
//             </Label>
//             <div className="flex items-center gap-5">
//               <Select
//                 value={currentRole || ''}
//                 onValueChange={(value) => setRole((value as UserRole) || null)}
//               >
//                 <SelectTrigger id="roleFilter" className="w-full sm:w-[180px]">
//                   <SelectValue placeholder="Select role" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="admin">Admin</SelectItem>
//                   <SelectItem value="manager">Manager</SelectItem>
//                   <SelectItem value="technician">Technician</SelectItem>
//                   <SelectItem value="client">Client</SelectItem>
//                   <SelectItem value="guest">Guest</SelectItem>
//                 </SelectContent>
//               </Select>
//               {currentRole && (
//                 <Button
//                   className="bg-orange-500 text-white hover:bg-orange-400"
//                   onClick={() => setRole(null)}
//                 >
//                   <Trash2 className="mr-2 h-4 w-4" />
//                   Clear Filter
//                 </Button>
//               )}
//             </div>
//           </div>

//           {/* 🔧 LOADING STATE */}
//           {isLoading && (
//             <div className="flex justify-center items-center py-8">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
//               <span className="ml-2 text-gray-600">Loading users...</span>
//             </div>
//           )}

//           {/* 🔧 ERROR STATE */}
//           {error && (
//             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//               <p className="font-medium">Error loading users:</p>
//               <p>{error}</p>
//               <Button
//                 onClick={refetch}
//                 className="mt-2 bg-red-600 text-white hover:bg-red-700"
//                 size="sm"
//               >
//                 Retry
//               </Button>
//             </div>
//           )}

//           {/* 🔧 USERS TABLE */}
//           {!isLoading && !error && (
//             <>
//               <div className="overflow-x-auto">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Avatar</TableHead>
//                       <TableHead>First Name</TableHead>
//                       <TableHead>Last Name</TableHead>
//                       <TableHead>Email</TableHead>
//                       <TableHead>Role</TableHead>
//                       <TableHead>Created Date</TableHead>
//                       <TableHead>Status</TableHead>
//                       <TableHead>Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {users.length === 0 ? (
//                       <TableRow>
//                         <TableCell
//                           colSpan={8}
//                           className="text-center py-8 text-gray-500"
//                         >
//                           No users found.
//                         </TableCell>
//                       </TableRow>
//                     ) : (
//                       users.map((user) => (
//                         <TableRow key={user.id}>
//                           <TableCell>
//                             <FallbackAvatar
//                               src={user.avatar}
//                               fallbackInitials={
//                                 user.first_name.charAt(0) +
//                                 user.last_name.charAt(0)
//                               }
//                               className="md:h-12 md:w-12 rounded-full"
//                               alt={user.first_name + ' User Avatar'}
//                             />
//                           </TableCell>
//                           <TableCell>{user.first_name}</TableCell>
//                           <TableCell>{user.last_name}</TableCell>
//                           <TableCell>{user.email}</TableCell>
//                           <TableCell>
//                             <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
//                               {user.role}
//                             </span>
//                           </TableCell>
//                           <TableCell>{user.created_at.split('T')[0]}</TableCell>
//                           <TableCell>
//                             <span
//                               className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
//                                 user.status === 'active'
//                                   ? 'bg-green-100 text-green-800'
//                                   : 'bg-red-100 text-red-800'
//                               }`}
//                             >
//                               {user.status === 'active' ? 'Active' : 'Inactive'}
//                             </span>
//                           </TableCell>
//                           <TableCell>
//                             <div className="flex space-x-2">
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 className="text-orange-500 hover:bg-orange-50 hover:text-orange-600"
//                                 onClick={() => handleEditButton(user)}
//                               >
//                                 <Edit className="mr-2 h-4 w-4" />
//                                 Edit
//                               </Button>
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 className="text-red-500 hover:bg-red-50 hover:text-red-600"
//                                 onClick={() => handleDeleteButton(user.id)}
//                               >
//                                 <Trash2 className="mr-2 h-4 w-4" />
//                                 Delete
//                               </Button>
//                             </div>
//                           </TableCell>
//                         </TableRow>
//                       ))
//                     )}
//                   </TableBody>
//                 </Table>
//               </div>

//               {/* 🔧 PAGINATION */}
//               {pagination && pagination.totalPages > 1 && (
//                 <div className="flex items-center justify-between mt-4">
//                   <div className="text-sm text-gray-700">
//                     Showing {(currentPage - 1) * (pagination.limit || 20) + 1}{' '}
//                     to{' '}
//                     {Math.min(
//                       currentPage * (pagination.limit || 20),
//                       pagination.total
//                     )}{' '}
//                     of {pagination.total} users
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => setPage(currentPage - 1)}
//                       disabled={currentPage <= 1}
//                     >
//                       Previous
//                     </Button>
//                     <span className="text-sm">
//                       Page {currentPage} of {totalPages}
//                     </span>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => setPage(currentPage + 1)}
//                       disabled={currentPage >= totalPages}
//                     >
//                       Next
//                     </Button>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       ) : (
//         <div className="rounded-lg border bg-white p-6 shadow-sm">
//           <h2 className="mb-4 text-xl font-semibold">
//             {editingUser ? 'Edit User' : 'Create User'}
//           </h2>
//           <UserForm
//             adminPermissions={true}
//             user={editingUser}
//             onSubmit={editingUser ? confirmEdit : createUser}
//             onCancel={() => setShowForm(false)}
//           />
//         </div>
//       )}

//       {/* 🔧 MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
//       {userToDelete && (
//         <div>
//           <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none">
//             <div className="relative mx-auto my-6 w-auto max-w-3xl">
//               <div className="relative flex w-full flex-col rounded-lg bg-white shadow-lg outline-none focus:outline-none">
//                 <div className="flex items-start justify-between rounded-t border-b border-solid border-slate-200 p-5">
//                   <h3 className="text-3xl font-semibold">Delete User</h3>
//                 </div>
//                 <div className="relative flex-auto p-6">
//                   <p className="mb-8 text-slate-500">
//                     Are you sure you want to delete this user? This action
//                     cannot be undone.
//                   </p>
//                   <div className="flex justify-end gap-3">
//                     <Button
//                       variant="outline"
//                       onClick={() => setUserToDelete(null)}
//                     >
//                       Cancel
//                     </Button>
//                     <Button
//                       variant="destructive"
//                       onClick={() => {
//                         deleteUser(userToDelete)
//                         setUserToDelete(null)
//                       }}
//                     >
//                       <Trash2 className="mr-2 h-4 w-4" />
//                       Delete User
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
//         </div>
//       )}
//     </div>
//   )
// }
