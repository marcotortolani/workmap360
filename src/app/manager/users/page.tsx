/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { UserPlus, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogoutButton } from "@/components/logout-button"
import { TabsNavigation } from "@/components/tabs"
import { UserForm } from "@/components/user-form"

const managerTabs = [
  { value: "projects", label: "Projects", href: "/manager/projects" },
  { value: "roles", label: "Roles", href: "/manager/roles" },
  { value: "users", label: "Users", href: "/manager/users" },
  { value: "repairs", label: "Repairs", href: "/manager/repairs" },
]

export default function ManagerUsersPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)

  const handleCreateUser = () => {
    setEditingUser(null)
    setShowForm(true)
  }

  const handleEditUser = (user: any) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const handleSubmit = (user: any) => {
    // Handle form submission
    console.log("Submitted user:", user)
    setShowForm(false)
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-orange-500">Manager Dashboard</h1>
        <LogoutButton />
      </div>

      <TabsNavigation tabs={managerTabs} basePath="/manager" />

      {!showForm ? (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Users</h2>
            <Button className="bg-orange-500 text-white hover:bg-orange-400" onClick={handleCreateUser}>
              <UserPlus className="mr-2 h-4 w-4" />
              Create User
            </Button>
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
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-orange-100 text-orange-800">
                          {user.firstName.charAt(0)}
                          {user.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>{user.firstName}</TableCell>
                    <TableCell>{user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>{user.createdDate}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.status === "active" ? "Active" : "Inactive"}
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
                        <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">{editingUser ? "Edit User" : "Create User"}</h2>
          <UserForm user={editingUser} onSubmit={handleSubmit} />
          <Button variant="outline" className="mt-4" onClick={() => setShowForm(false)}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}

const users = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    role: "Admin",
    createdDate: "2023-01-15",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    role: "Manager",
    createdDate: "2023-02-20",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    firstName: "Robert",
    lastName: "Johnson",
    email: "robert.johnson@example.com",
    role: "Technician",
    createdDate: "2023-03-10",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    firstName: "Emily",
    lastName: "Williams",
    email: "emily.williams@example.com",
    role: "Client",
    createdDate: "2023-04-05",
    status: "inactive",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

