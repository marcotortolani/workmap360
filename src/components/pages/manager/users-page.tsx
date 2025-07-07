// src/components/pages/manager/users-page.tsx

'use client'

import { useState } from 'react'
import { useCurrentUser } from '@/stores/user-store'
import { useUsersList } from '@/hooks/use-users-list'

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

import { FallbackAvatar } from '@/components/fallback-avatar'
import { toast } from 'sonner'
import { UserPlus, Edit, Trash2 } from 'lucide-react'
import { UserRole, UserType } from '@/types/user-types'

export default function ManagerUsersPage() {
  const { accessToken } = useCurrentUser()
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)
  const [userToDelete, setUserToDelete] = useState<UserType['id'] | null>(null)

  // 🔧 USAR EL HOOK PERSONALIZADO
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

  // 🔧 FUNCIONES SIMPLIFICADAS - Solo manejan la operación y refrescan
  const createUser = async (user: UserType) => {
    if (!user.first_name || !user.last_name || !user.email) {
      toast.error('All fields are required', {
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

    if (!accessToken) {
      toast.error('Authentication Error', {
        description: 'You must be logged in to create users',
        duration: 5000,
        position: 'bottom-right',
      })
      return
    }

    try {
      const newRandomAvatar =
        'https://avatar.iran.liara.run/public/' +
        Math.floor(Math.random() * 49 + 1).toString()

      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role,
          createdAt: new Date().toLocaleString('en-NZ'),
          status: user.status,
          avatar: newRandomAvatar,
        }),
      })
      const result = await response.json()

      if (!response.ok) {
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
        return
      }

      toast('User created successfully', {
        description: `${user.first_name} ${user.last_name} - ${user.email}`,
        duration: 3000,
        icon: '🚀',
        position: 'bottom-center',
        style: {
          background: '#07c',
          color: '#000',
        },
      })

      await refetch() // 🔧 Usar refetch del hook
      setShowForm(false)
    } catch (err: unknown) {
      console.log('Error creating user:', err)
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

  const confirmEdit = async (user: UserType) => {
    if (
      !user.id ||
      !user.first_name ||
      !user.last_name ||
      !user.role ||
      !user.status ||
      !user.avatar
    ) {
      toast.error('All fields are required', {
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

    if (!accessToken) {
      toast.error('Authentication Error', {
        description: 'You must be logged in to edit users',
        duration: 5000,
        position: 'bottom-right',
      })
      return
    }

    try {
      const res = await fetch(`/api/users/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          status: user.status,
          avatar: user.avatar,
        }),
      })

      if (!res.ok) {
        const result = await res.json()
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
        return
      }

      toast('User edited successfully', {
        description: `${user.first_name} ${user.last_name} - ${user.email}`,
        duration: 3000,
        icon: '✏',
        position: 'bottom-center',
        style: {
          background: '#333',
          color: '#fff',
        },
      })

      await refetch() // 🔧 Usar refetch del hook
      setEditingUser(null)
      setShowForm(false)
    } catch (err) {
      console.error(err)
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

  const deleteUser = async (userId: UserType['id']) => {
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

    if (!accessToken) {
      toast.error('Authentication Error', {
        description: 'You must be logged in to delete users',
        duration: 5000,
        position: 'bottom-right',
      })
      return
    }

    try {
      const res = await fetch('/api/users/delete', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: userId }),
      })

      const json = await res.json()
      if (!res.ok) {
        toast.error('Error deleting user', {
          description: json.error,
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

      toast('User deleted successfully', {
        duration: 2000,
        icon: '🗑️',
        position: 'bottom-center',
        style: {
          background: '#333',
          color: '#fff',
        },
      })

      await refetch() // 🔧 Usar refetch del hook
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
            <h2 className="text-xl font-semibold">Users</h2>
            <Button
              className="bg-sky-600 text-white hover:bg-sky-500"
              onClick={handleCreateButton}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </div>

          {/* 🔧 FILTROS SIMPLIFICADOS */}
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

          {/* 🔧 LOADING STATE */}
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          )}

          {/* 🔧 ERROR STATE */}
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

          {/* 🔧 USERS TABLE */}
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
                          No users found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <FallbackAvatar
                              src={user.avatar}
                              fallbackInitials={
                                user.first_name.charAt(0) +
                                user.last_name.charAt(0)
                              }
                              className="md:h-12 md:w-12 rounded-full"
                              alt={user.first_name + ' User Avatar'}
                            />
                          </TableCell>
                          <TableCell>{user.first_name}</TableCell>
                          <TableCell>{user.last_name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                              {user.role}
                            </span>
                          </TableCell>
                          <TableCell>{user.created_at.split('T')[0]}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                user.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {user.status === 'active' ? 'Active' : 'Inactive'}
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

              {/* 🔧 PAGINATION */}
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
        <div className="rounded-lg border bg-white p-6 shadow-sm">
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

      {/* 🔧 MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
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

// 'use client'

// import { useState, useEffect } from 'react'
// import { useCurrentUser } from '@/stores/user-store'

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
//   const [users, setUsers] = useState<UserType[]>([])
//   const [role, setRole] = useState<UserRole | null>(null)
//   const [error, setError] = useState<string | null>(null)
//   const [loading, setLoading] = useState(false)

//   const withLoading = async (fn: () => Promise<void>) => {
//     setError(null)
//     setLoading(true)
//     try {
//       await fn()
//     } catch (err) {
//       const message = err instanceof Error ? err.message : String(err)
//       setError(message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const listUsers = async () => {
//     if (!accessToken) {
//       toast.error('Authentication Error', {
//         description: 'You must be logged in to delete projects',
//         duration: 5000,
//         position: 'bottom-right',
//       })
//       return
//     }

//     await withLoading(async () => {
//       const response = await fetch('/api/users/list?page=1&limit=20', {
//         method: 'GET',
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       })
//       const { users, pagination, error } = await response.json()

//       if (!response.ok) {
//         toast.error('Error en la solicitud', {
//           description: error,
//           duration: 5000,
//           position: 'bottom-right',
//           style: {
//             backgroundColor: 'red',
//             color: 'white',
//             fontSize: '14px',
//           },
//         })
//       }

//       console.log('Pagination:', pagination)
//       setUsers(users)
//       setError(null)
//     })
//   }

//   const filterUsersByRole = async (role: UserRole) => {
//     setRole(role)

//     if (!role) {
//       listUsers()
//       return
//     }
//     if (!accessToken) {
//       toast.error('Authentication Error', {
//         description: 'You must be logged in to delete projects',
//         duration: 5000,
//         position: 'bottom-right',
//       })
//       return
//     }

//     await withLoading(async () => {
//       const response = await fetch(
//         `/api/users/by-role/?role=${role}&page=1&limit=20`,
//         {
//           headers: { Authorization: `Bearer ${accessToken}` },
//         }
//       )
//       const { users, pagination, error } = await response.json()

//       if (!response.ok) {
//         toast.error('Error en la solicitud', {
//           description: error,
//           duration: 5000,
//           position: 'bottom-right',
//           style: {
//             backgroundColor: 'red',
//             color: 'white',
//             fontSize: '14px',
//           },
//         })
//       }
//       setUsers(users)
//       console.log('pagination', pagination)
//       setError(null)
//     })
//   }

//   useEffect(() => {
//     if (accessToken) {
//       listUsers()
//     }
//   }, [accessToken])

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

//   const createUser = async (user: UserType) => {
//     setError(null)
//     setLoading(true)

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

//       setError('All fields are required.')
//       return
//     }

//     try {
//       if (!accessToken) {
//         toast.error('Authentication Error', {
//           description: 'You must be logged in to delete projects',
//           duration: 5000,
//           position: 'bottom-right',
//         })
//         return
//       }

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
//       }

//       toast('User created successfully', {
//         id: 'create-user-success',
//         description: `${user.first_name} ${user.last_name} - ${user.email}`,
//         duration: 3000,
//         icon: '🚀',
//         position: 'bottom-center',
//         style: {
//           background: '#07c',
//           color: '#000',
//         },
//       })
//       await listUsers() // refrescar lista
//     } catch (err: unknown) {
//       console.log('Error creating user:', err)
//       const message = err instanceof Error ? err.message : String(err)
//       setError(message)
//     } finally {
//       setLoading(false)
//       setShowForm(false)
//     }
//   }

//   const confirmEdit = async (user: UserType) => {
//     setError(null)
//     setLoading(true)

//     if (
//       !user.id ||
//       !user.first_name ||
//       !user.last_name ||
//       !user.role ||
//       !user.status ||
//       !user.avatar
//     ) {
//       setError('All fields are required.')
//       setLoading(false)
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
//         description: 'You must be logged in to delete projects',
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
//         toast.error('Error editing user', {
//           duration: 5000,
//           position: 'bottom-right',
//           style: {
//             backgroundColor: 'red',
//             color: 'white',
//             fontSize: '14px',
//           },
//         })
//       }
//       await listUsers() // refrescar lista
//       setEditingUser(null) // cerrar formulario

//       toast('User edited successfully', {
//         id: 'edit-user-success',
//         description: `${user.first_name} ${user.last_name} - ${user.email}`,
//         duration: 3000,
//         icon: '✏',
//         position: 'bottom-center',
//         style: {
//           background: '#333',
//           color: '#fff',
//         },
//       })
//     } catch (err) {
//       console.error(err)
//       toast('Error editing user', {
//         id: 'edit-user-error',
//         description: 'Error: ' + err,
//         duration: 3000,
//         icon: '❌',
//         position: 'bottom-center',
//         style: {
//           background: 'red',
//           color: '#fff',
//           padding: '10px',
//           fontSize: '16px',
//         },
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const deleteUser = async (userId: UserType['id']) =>
//     await withLoading(async () => {
//       if (!userId) {
//         toast.error('User ID is required', {
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
//       if (!accessToken) {
//         toast.error('Authentication Error', {
//           description: 'You must be logged in to delete projects',
//           duration: 5000,
//           position: 'bottom-right',
//         })
//         return
//       }

//       const res = await fetch('/api/users/delete', {
//         method: 'DELETE',
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ id: userId }),
//       })
//       const json = await res.json()
//       if (!res.ok) throw new Error(json.error)

//       await listUsers()

//       toast('User deleted successfully', {
//         id: 'delete-user-success',
//         duration: 2000,
//         icon: '🗑️',
//         position: 'bottom-center',
//         style: {
//           background: '#333',
//           color: '#fff',
//         },
//       })
//     })

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

//           {/* Filtrar por rol */}

//           <div className="w-full sm:w-auto">
//             <Label htmlFor="clientId" className="mb-1 block text-sm">
//               Filter by Role
//             </Label>
//             <div className=" flex items-center gap-5">
//               <Select
//                 value={role || ''}
//                 onValueChange={(value) => filterUsersByRole(value as UserRole)}
//               >
//                 <SelectTrigger id="clientId" className="w-full sm:w-[180px]">
//                   <SelectValue placeholder={'Select role'} />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="admin">Admin</SelectItem>
//                   <SelectItem value="manager">Manager</SelectItem>
//                   <SelectItem value="technician">Technician</SelectItem>
//                   <SelectItem value="client">Client</SelectItem>
//                   <SelectItem value="guest">Guest</SelectItem>
//                 </SelectContent>
//               </Select>
//               {/* clean filter */}
//               {role && (
//                 <Button
//                   className="bg-orange-500 text-white hover:bg-orange-400"
//                   onClick={() => {
//                     setRole(null)
//                     listUsers()
//                   }}
//                 >
//                   <Trash2 className="mr-2 h-4 w-4" />
//                   Clean Filter
//                 </Button>
//               )}
//             </div>
//           </div>

//           <div className="overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Avatar</TableHead>
//                   <TableHead>First Name</TableHead>
//                   <TableHead>Last Name</TableHead>
//                   <TableHead>Email</TableHead>
//                   <TableHead>Role</TableHead>
//                   <TableHead>Created Date</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {users.length ? (
//                   users.map((user) => (
//                     <TableRow key={user.id}>
//                       <TableCell>
//                         <FallbackAvatar
//                           src={user.avatar}
//                           fallbackInitials={
//                             user.first_name.charAt(0) + user.last_name.charAt(0)
//                           }
//                           className="md:h-12 md:w-12 rounded-full"
//                           alt={user.first_name + ' User Avatar'}
//                         />
//                       </TableCell>
//                       <TableCell>{user.first_name}</TableCell>
//                       <TableCell>{user.last_name}</TableCell>
//                       <TableCell>{user.email}</TableCell>
//                       <TableCell>
//                         <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
//                           {user.role}
//                         </span>
//                       </TableCell>
//                       <TableCell>{user.created_at.split('T')[0]}</TableCell>
//                       <TableCell>
//                         <span
//                           className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
//                             user.status === 'active'
//                               ? 'bg-green-100 text-green-800'
//                               : 'bg-red-100 text-red-800'
//                           }`}
//                         >
//                           {user.status === 'active' ? 'Active' : 'Inactive'}
//                         </span>
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex space-x-2">
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             className="text-orange-500 hover:bg-orange-50 hover:text-orange-600"
//                             onClick={() => handleEditButton(user)}
//                           >
//                             <Edit className="mr-2 h-4 w-4" />
//                             Edit
//                           </Button>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             className="text-red-500 hover:bg-red-50 hover:text-red-600"
//                             onClick={() => handleDeleteButton(user.id)}
//                           >
//                             <Trash2 className="mr-2 h-4 w-4" />
//                             Delete
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={8} className="h-24 text-center">
//                       No results.
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//           {error && (
//             <p className="text-red-500 mt-4">
//               Error:
//               {error}
//             </p>
//           )}
//           {loading && <p>Cargando...</p>}
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
//       {/* create a modal component to ensure the delete of the user selected */}
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
//                     Are you sure you want to delete this user?
//                   </p>
//                   <div className="flex justify-end">
//                     <Button
//                       variant="outline"
//                       className="mr-2"
//                       onClick={() => setUserToDelete(null)}
//                     >
//                       Cancel
//                     </Button>
//                     <Button
//                       variant="destructive"
//                       className=" text-white"
//                       onClick={() => {
//                         deleteUser(userToDelete)
//                         setUserToDelete(null)
//                       }}
//                     >
//                       Delete
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
