'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

export default function ManagerUsersPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)
  const [users, setUsers] = useState<UserType[]>([])
  const [role, setRole] = useState<UserRole | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const listUsers = async () => {
    setLoading(true)
    if (!supabase) return

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      console.log('Session:', session)

      if (!session) {
        throw new Error('No hay sesión activa')
      }

      const response = await fetch('/api/users/list?page=1&limit=20', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const { users, pagination, error } = await response.json()

      if (!response.ok) {
        throw new Error(error || 'Error en la solicitud')
      }
      console.log('Pagination:', pagination)

      setUsers(users)
      setError(null)
    } catch (err: unknown) {
      console.log('Error creating user:', err)
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const filterUsersByRole = async (role: UserRole) => {
    setLoading(true)
    setRole(role)
    if (!supabase) return
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) throw new Error('No hay sesión activa')
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    listUsers()
  }, [])

  const handleCreateUser = () => {
    setEditingUser(null)
    setShowForm(true)
  }

  const handleEditUser = (user: UserType) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const handleSubmit = (user: UserType) => {
    // Handle form submission
    console.log('Submitted user:', user)
    setShowForm(false)
  }

  return (
    <div className="flex flex-col gap-8 p-2 md:p-4 lg:p-8">
      {!showForm ? (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Users</h2>
            <Button
              className="bg-orange-500 text-white hover:bg-orange-400"
              onClick={handleCreateUser}
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
                  onClick={() => listUsers()}
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
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-orange-100 text-orange-800">
                            {user.first_name.charAt(0)}
                            {user.last_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
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
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:bg-red-50 hover:text-red-600"
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
          <UserForm user={editingUser} onSubmit={handleSubmit} />
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}

// const users = [
//   {
//     id: '1',
//     firstName: 'John',
//     lastName: 'Doe',
//     email: 'john.doe@example.com',
//     role: 'Admin',
//     createdDate: '2023-01-15',
//     status: 'active',
//     avatar: 'https://avatar.iran.liara.run/public/42',
//   },
//   {
//     id: '2',
//     firstName: 'Jane',
//     lastName: 'Smith',
//     email: 'jane.smith@example.com',
//     role: 'Manager',
//     createdDate: '2023-02-20',
//     status: 'active',
//     avatar: 'https://avatar.iran.liara.run/public/15',
//   },
//   {
//     id: '3',
//     firstName: 'Robert',
//     lastName: 'Johnson',
//     email: 'robert.johnson@example.com',
//     role: 'Technician',
//     createdDate: '2023-03-10',
//     status: 'active',
//     avatar: 'https://avatar.iran.liara.run/public/47',
//   },
//   {
//     id: '4',
//     firstName: 'Emily',
//     lastName: 'Williams',
//     email: 'emily.williams@example.com',
//     role: 'Client',
//     createdDate: '2023-04-05',
//     status: 'inactive',
//     avatar: 'https://avatar.iran.liara.run/public/24',
//   },
// ]
