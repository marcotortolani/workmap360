import { UserPlus, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LogoutButton } from "@/components/logout-button"
import { TabsNavigation } from "@/components/tabs"

const adminTabs = [
  { value: "projects", label: "Projects", href: "/admin/projects" },
  { value: "roles", label: "Roles", href: "/admin/roles" },
  { value: "users", label: "Users", href: "/admin/users" },
  { value: "repairs", label: "Repairs", href: "/admin/repairs" },
]

export default function AdminRolesPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-orange-500">Admin Dashboard</h1>
        <LogoutButton />
      </div>

      <TabsNavigation tabs={adminTabs} basePath="/admin" />

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Roles</h2>
          <Button className="bg-orange-500 text-white hover:bg-orange-400">
            <UserPlus className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map((permission, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-orange-500 hover:bg-orange-50 hover:text-orange-600"
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

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Create Role</h2>
        <form className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Role Name</label>
            <Input placeholder="Enter role name" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Permissions</label>
            <div className="grid gap-2 sm:grid-cols-2">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-center space-x-2">
                  <Checkbox id={`permission-${permission.id}`} />
                  <label
                    htmlFor={`permission-${permission.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {permission.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Button className="bg-orange-500 text-white hover:bg-orange-400">Save Role</Button>
        </form>
      </div>
    </div>
  )
}

const roles = [
  {
    id: 1,
    name: "Admin",
    permissions: [
      "View Projects",
      "Edit Projects",
      "View Repairs",
      "Edit Repairs",
      "Upload Images",
      "Manage Users",
      "Manage Roles",
    ],
  },
  {
    id: 2,
    name: "Manager",
    permissions: ["View Projects", "Edit Projects", "View Repairs", "Edit Repairs", "Upload Images", "Manage Users"],
  },
  {
    id: 3,
    name: "Technician",
    permissions: ["View Projects", "View Repairs", "Edit Repairs", "Upload Images"],
  },
  {
    id: 4,
    name: "Client",
    permissions: ["View Projects", "View Repairs"],
  },
]

const permissions = [
  { id: 1, name: "View Projects" },
  { id: 2, name: "Edit Projects" },
  { id: 3, name: "View Repairs" },
  { id: 4, name: "Edit Repairs" },
  { id: 5, name: "Upload Images" },
  { id: 6, name: "Manage Users" },
  { id: 7, name: "Manage Roles" },
  { id: 8, name: "Approve Repairs" },
]

