/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'
//import { getSessionToken } from '@/lib/supabaseAuth'

import { UserPlus, Edit, Trash2 } from 'lucide-react'
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
import { UserRole, UserType } from '@/types/user-types'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { FallbackAvatar } from '@/components/fallback-avatar'

// const getSessionToken = async (): Promise<string> => {
//   const {
//     data: { session },
//   } = await supabase.auth.getSession()
//   if (!session) throw new Error('No hay sesión activa')
//   return session.access_token
// }

export default function ManagerUsersPage() {
  const [supabase] = useState(() => createSupabaseBrowserClient())
  const [session, setSession] = useState<Session | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)
  const [userToDelete, setUserToDelete] = useState<UserType['id'] | null>(null)
  const [users, setUsers] = useState<UserType[]>([])
  const [role, setRole] = useState<UserRole | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const withLoading = async (fn: () => Promise<void>) => {
    setError(null)
    setLoading(true)
    try {
      await fn()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const listUsers = async () => {
    // const {
    //   data: { session },
    // } = await supabase.auth.getSession()
    if (!session) throw new Error('No hay sesión activa')
    // const token = await getSessionToken()
    // if (!token) throw new Error('No hay sesión activa')

    await withLoading(async () => {
      const response = await fetch('/api/users/list?page=1&limit=20', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      const { users, pagination, error } = await response.json()
      if (!response.ok) throw new Error(error || 'Error en la solicitud')
      console.log('Pagination:', pagination)
      setUsers(users)
      setError(null)
    })
  }

  const filterUsersByRole = async (role: UserRole) => {
    setRole(role)

    if (!role) {
      listUsers()
      return
    }
    // const token = await getSessionToken()
    // if (!token) throw new Error('No hay sesión activa')
    // const {
    //   data: { session },
    // } = await supabase.auth.getSession()
    if (!session) throw new Error('No hay sesión activa')

    await withLoading(async () => {
      const response = await fetch(
        `/api/users/by-role/?role=${role}&page=1&limit=20`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      )
      const { users, pagination, error } = await response.json()
      if (!response.ok) throw new Error(error)
      setUsers(users)
      console.log('pagination', pagination)
      setError(null)
    })
  }

  useEffect(() => {
    if (session) {
      listUsers()
    }
  }, [session])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!session && data.session) {
        setSession(data.session)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

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

  // const handleSubmit = (user: UserType) => {
  //   // Handle form submission
  //   console.log('Submitted user:', user)
  //   setShowForm(false)
  // }

  const createUser = async (user: UserType) => {
    setError(null)
    setLoading(true)
    // if (!supabase) return
    if (!user.first_name || !user.last_name || !user.email) {
      setError('All fields are required.')
      return
    }

    try {
      // const {
      //   data: { session },
      // } = await supabase.auth.getSession()
      // const token = await getSessionToken()

      if (!session) {
        throw new Error('There is no active session.')
      }
      const newRandomAvatar =
        'https://avatar.iran.liara.run/public/' +
        Math.floor(Math.random() * 49 + 1).toString()

      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role,
          createdAt: new Date().toISOString(),
          status: user.status,
          avatar: newRandomAvatar,
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      alert('Usuario creado: ' + JSON.stringify(result.user))
      await listUsers() // refrescar lista
    } catch (err: unknown) {
      console.log('Error creating user:', err)
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
    } finally {
      setLoading(false)
      setShowForm(false)
    }
  }

  const confirmEdit = async (user: UserType) => {
    setError(null)
    setLoading(true)
    // if (!supabase) return

    if (
      !user.id ||
      !user.first_name ||
      !user.last_name ||
      !user.role ||
      !user.status ||
      !user.avatar
    ) {
      setError('All fields are required.')
      return
    }
    // const {
    //   data: { session },
    // } = await supabase.auth.getSession()

    if (!session) {
      throw new Error('There is no active session.')
    }

    try {
      const res = await fetch(`/api/users/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
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

      const resJson = await res.json()
      console.log('PUT response status:', res.status)
      console.log('PUT response body:', resJson)

      if (!res.ok) throw new Error('Error editing user')
      await listUsers() // refrescar lista
      setEditingUser(null) // cerrar formulario
    } catch (err) {
      console.error(err)
      setError('Error editing user')
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId: UserType['id']) =>
    await withLoading(async () => {
      if (!userId) return
      if (!session) throw new Error('No hay sesión activa')

      const res = await fetch('/api/users/delete', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: userId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      await listUsers()
    })

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

          {/* Filtrar por rol */}

          <div className="w-full sm:w-auto">
            <Label htmlFor="clientId" className="mb-1 block text-sm">
              Filter by Role
            </Label>
            <div className=" flex items-center gap-5">
              <Select
                value={role || ''}
                onValueChange={(value) => filterUsersByRole(value as UserRole)}
              >
                <SelectTrigger id="clientId" className="w-full sm:w-[180px]">
                  <SelectValue placeholder={'Select role'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
              {/* clean filter */}
              {role && (
                <Button
                  className="bg-orange-500 text-white hover:bg-orange-400"
                  onClick={() => {
                    setRole(null)
                    listUsers()
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clean Filter
                </Button>
              )}
            </div>
          </div>

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
                {users.length ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <FallbackAvatar
                          src={user.avatar}
                          fallbackInitials={
                            user.first_name.charAt(0) + user.last_name.charAt(0)
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
                      <TableCell>{user.created_at}</TableCell>
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
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {error && (
            <p className="text-red-500 mt-4">
              Error:
              {error}
            </p>
          )}
          {loading && <p>Cargando...</p>}
        </div>
      ) : (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">
            {editingUser ? 'Edit User' : 'Create User'}
          </h2>
          <UserForm
            user={editingUser}
            onSubmit={editingUser ? confirmEdit : createUser}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}
      {/* create a modal component to ensure the delete of the user selected */}
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
                    Are you sure you want to delete this user?
                  </p>
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      className="mr-2"
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
                      Delete
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
