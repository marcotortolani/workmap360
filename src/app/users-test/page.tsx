'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

import { UserRole, UserType } from '@/types/user-types'
import { User } from '@supabase/supabase-js'
import { Edit } from 'lucide-react'
import { Label } from '@/components/ui/label'

export default function UsersTestPage() {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [role, setRole] = useState<UserRole>('guest')
  const [status, setStatus] = useState('active')
  const [avatar, setAvatar] = useState('')
  const [users, setUsers] = useState<UserType[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [editingUser, setEditingUser] = useState<UserType | null>(null)
  const [editValues, setEditValues] = useState({
    first_name: '',
    last_name: '',
    role: 'guest',
    status: 'active',
    avatar: '',
  })

  console.log('users: ', users)

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      console.log('Usuario autenticado:', user)
      setUser(user)
    }
    getUser()
  }, [])

  const login = async () => {
    if (!supabase) return
    console.log('login')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    } catch (err: unknown) {
      console.error(err)
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const createUser = async () => {
    setError(null)
    setLoading(true)
    if (!supabase) return
    if (!firstName || !lastName || !newUserEmail) {
      setError('Todos los campos obligatorios deben completarse.')
      return
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      console.log('Session in createUser:', session)

      if (!session) {
        throw new Error('No hay sesión activa')
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
          firstName,
          lastName,
          email: newUserEmail,
          role,
          createdAt: new Date().toISOString(),
          status,
          avatar: avatar ? avatar : newRandomAvatar,
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      alert('Usuario creado: ' + JSON.stringify(result.user))

      setFirstName('')
      setLastName('')
      setNewUserEmail('')
      setRole('guest')
      setStatus('active')
      setAvatar('')
    } catch (err: unknown) {
      console.log('Error creating user:', err)
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      setFirstName('')
      setLastName('')
      setNewUserEmail('')
      setRole('guest')
      setStatus('active')
      setAvatar('')
    } finally {
      setLoading(false)
    }
  }

  const editUser = async (user: UserType) => {
    setEditingUser(user)
    setEditValues({
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
    })
  }

  const confirmEdit = async () => {
    setError(null)
    setLoading(true)
    if (!supabase) return
    if (!editingUser) return
    if (!editValues.first_name || !editValues.last_name) {
      setError('Todos los campos obligatorios deben completarse.')
      return
    }
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      throw new Error('No hay sesión activa')
    }

    try {
      const res = await fetch(`/api/users/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          id: editingUser.id,
          firstName: editValues.first_name,
          lastName: editValues.last_name,
          role: editValues.role,
          status: editValues.status,
          avatar: editValues.avatar,
        }),
      })

      const resJson = await res.json()
      console.log('PUT response status:', res.status)
      console.log('PUT response body:', resJson)

      if (!res.ok) throw new Error('Error al editar usuario')
      await listUsers() // refrescar lista
      setEditingUser(null) // cerrar formulario
    } catch (err) {
      console.error(err)
      setError('No se pudo actualizar el usuario')
    } finally {
      setLoading(false)
    }
  }

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
      setFilteredUsers(users)
      console.log('Filtered users:', users)
      console.log('Pagination:', pagination)

      // setFilteredUsers(
      //   result.users.map((u: any) => ({
      //     id: u.id,
      //     firstName: u.first_name,
      //     lastName: u.last_name || '',
      //     email: u.email,
      //     role: u.role,
      //     createdDate: u.created_at.toISOString(),
      //     status: u.status,
      //     avatar: u.avatar || '',
      //   }))
      // )
      setError(null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId: string) => {
    setError(null)
    setLoading(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      console.log('Session in deleteUser:', session)

      if (!session) {
        throw new Error('No hay sesión activa')
      }

      const response = await fetch(`/api/users/delete`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ id: userId }),
      })

      const result = await response.json()
      console.log('Delete result:', result)
      console.log('Response status:', response.status)

      if (!response.ok) {
        throw new Error(result.error || 'Error al eliminar usuario')
      }

      alert('Usuario eliminado: ' + userId)

      // Actualiza la lista de usuarios después de eliminar
      await listUsers()
    } catch (err: unknown) {
      console.log('Error deleting user:', err)
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Iniciar Sesión</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 mr-2"
        />
        <Button
          onClick={login}
          className="bg-blue-500 hover:bg-blue-600  text-white p-2 rounded"
        >
          Iniciar Sesión
        </Button>
        {error && (
          <p className="text-red-500 mt-4">
            Error:
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className=" relative w-full p-8">
      <div className=" w-full flex items-center justify-between ">
        <h1 className="text-2xl font-bold mb-4">Pruebas de Usuarios</h1>
        <div>
          <p className="text-gray-500">User Email: {user.email}</p>
        </div>
        <Button onClick={logout} className="bg-gray-500 text-white p-2 rounded">
          Cerrar Sesión
        </Button>
      </div>

      {/* Crear usuario */}
      <div className="mb-8">
        <h2 className="text-xl mb-2">Crear Usuario</h2>

        <input
          type="text"
          placeholder="Nombre"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="border p-2 mr-2"
          required
        />
        <input
          type="text"
          placeholder="Apellido"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="border p-2 mr-2"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={newUserEmail}
          onChange={(e) => setNewUserEmail(e.target.value)}
          className="border p-2 mr-2"
          required
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="border p-2 mr-2"
        >
          <option value="admin">admin</option>
          <option value="manager">manager</option>
          <option value="technician">technician</option>
          <option value="client">client</option>
          <option value="guest">guest</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border p-2 mr-2"
        >
          <option value="active">active</option>
          <option value="inactive">inactive</option>
        </select>
        {/* Deshabilitado cargar un avatar, se genera uno random */}
        {/* Luego hay que hacer que se pueda subir una imagen a cloudinary */}
        {/* <input
          type="text"
          placeholder="Avatar URL"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          className="border p-2 mr-2"
        /> */}
        <button
          onClick={createUser}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Crear
        </button>
      </div>

      {/* Editar usuario */}
      {editingUser && (
        <div className="p-4 border mt-4">
          <h2 className="text-xl mb-2">Editar usuario</h2>
          {/* Label first_name */}
          <Label
            htmlFor="edit_first_name"
            className="text-sm font-medium text-gray-500"
          >
            Nombre
          </Label>
          <input
            id="edit_first_name"
            type="text"
            placeholder="Nombre"
            value={editValues.first_name}
            onChange={(e) =>
              setEditValues({ ...editValues, first_name: e.target.value })
            }
            className="border p-2 mr-2"
          />
          <Label
            htmlFor="edit_last_name"
            className="text-sm font-medium text-gray-500"
          >
            Apellido
          </Label>
          <input
            id="edit_last_name"
            type="text"
            placeholder="Apellido"
            value={editValues.last_name}
            onChange={(e) =>
              setEditValues({ ...editValues, last_name: e.target.value })
            }
            className="border p-2 mr-2"
          />

          <Label
            htmlFor="edit_role"
            className="text-sm font-medium text-gray-500"
          >
            Rol
          </Label>

          <select
            id="edit_role"
            value={editValues.role}
            onChange={(e) =>
              setEditValues({ ...editValues, role: e.target.value as UserRole })
            }
            className="border p-2 mr-2"
          >
            <option value="admin">admin</option>
            <option value="manager">manager</option>
            <option value="technician">technician</option>
            <option value="client">client</option>
            <option value="guest">guest</option>
          </select>

          <Label
            htmlFor="edit_status"
            className="text-sm font-medium text-gray-500"
          >
            Status
          </Label>
          <select
            id="edit_status"
            value={editValues.status}
            onChange={(e) =>
              setEditValues({ ...editValues, status: e.target.value })
            }
            className="border p-2 mr-2"
          >
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>

          <Label className="text-sm font-medium text-gray-500">Avatar</Label>
          <input
            type="text"
            placeholder="Avatar URL"
            value={editValues.avatar}
            onChange={(e) =>
              setEditValues({ ...editValues, avatar: e.target.value })
            }
            className="border p-2 mr-2"
          />

          <Button onClick={confirmEdit}>Confirmar</Button>
          <Button onClick={() => setEditingUser(null)} className="ml-2">
            Cancelar
          </Button>
        </div>
      )}

      {/* Listar usuarios */}
      <div className="mb-8">
        <h2 className="text-xl mb-2">Listar Todos los Usuarios</h2>
        <Button
          onClick={listUsers}
          className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white p-2 rounded"
        >
          Obtener Usuarios
        </Button>
        {users.length > 0 && (
          <ul className="mt-2">
            {users.map((user) => (
              <li key={user.id} className="mb-2 flex items-center">
                {user.avatar ? (
                  <Image
                    src={user.avatar || ''}
                    alt={user.first_name}
                    width={50}
                    height={50}
                    className="mr-2"
                  />
                ) : (
                  <div className=" w-10 h-10 mr-2 flex items-center justify-center bg-gray-300 rounded-full ">
                    {user.first_name.trim().charAt(0)}
                    {user.last_name.trim().charAt(0)}
                  </div>
                )}
                ID: {user.id}, Nombre: {user.first_name} {user.last_name},
                Email: {user.email}, Rol: {user.role}, Creado: {user.created_at}
                , Estado: {user.status}
                <div className="ml-2 space-x-4">
                  <button
                    onClick={() => deleteUser(user.id.toString())}
                    className="ml-2 bg-red-500 text-white p-1 rounded"
                  >
                    Eliminar
                  </button>
                  <Button
                    onClick={() => {
                      editUser(user)
                    }}
                  >
                    <Edit className="mr-2" />
                    Editar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Filtrar por rol */}
      <div>
        <h2 className="text-xl mb-2">Filtrar Usuarios por Rol</h2>
        <button
          onClick={() => filterUsersByRole('technician')}
          className="bg-purple-500 text-white p-2 rounded mr-2"
        >
          technicians
        </button>
        <button
          onClick={() => filterUsersByRole('manager')}
          className="bg-purple-500 text-white p-2 rounded mr-2"
        >
          managers
        </button>
        <button
          onClick={() => filterUsersByRole('admin')}
          className="bg-purple-500 text-white p-2 rounded mr-2"
        >
          admins
        </button>
        <button
          onClick={() => filterUsersByRole('client')}
          className="bg-purple-500 text-white p-2 rounded mr-2"
        >
          clients
        </button>
        <button
          onClick={() => filterUsersByRole('guest')}
          className="bg-purple-500 text-white p-2 rounded"
        >
          guests
        </button>
        {filteredUsers.length > 0 && (
          <ul className="mt-2">
            {filteredUsers.map((user) => (
              <li key={user.id}>
                ID: {user.id}, Nombre: {user.first_name} {user.last_name},
                Email: {user.email}, Rol: {user.role}, Creado: {user.created_at}
                , Estado: {user.status}, Avatar: {user.avatar}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <p className="text-red-500 mt-4">
          Error:
          {error}
        </p>
      )}
      {loading && <p>Cargando...</p>}
    </div>
  )
}
