import { UserPlus, Edit, Trash2, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ManagerRolesPage() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 p-2 sm:p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Roles Management Section */}
      <Card className="w-full">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <CardTitle className="text-lg sm:text-xl font-semibold">
              Roles Management
            </CardTitle>
            <Button
              className="bg-orange-500 text-white hover:bg-orange-400 w-full sm:w-auto"
              size="sm"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Create Role
            </Button>
          </div>
        </CardHeader>

        <CardContent className="px-2 sm:px-6">
          {/* Mobile Card View */}
          <div className="block lg:hidden space-y-3">
            {roles.map((role) => (
              <Card key={role.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-base">{role.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {role.permissions.length} permissions
                      </p>
                    </div>

                    {/* Mobile Actions Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-orange-600">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Permissions Pills */}
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map((permission, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-gray-100 
                          px-2 py-0.5 text-xs font-medium text-gray-800"
                      >
                        {permission}
                      </span>
                    ))}
                    {role.permissions.length > 3 && (
                      <span
                        className="inline-flex items-center rounded-full bg-blue-100 
                        px-2 py-0.5 text-xs font-medium text-blue-800"
                      >
                        +{role.permissions.length - 3} more
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Role Name</TableHead>
                    <TableHead className="min-w-[300px]">Permissions</TableHead>
                    <TableHead className="w-[200px]">Actions</TableHead>
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
                              className="inline-flex items-center rounded-full bg-gray-100 
                                px-2.5 py-0.5 text-xs font-medium text-gray-800"
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
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Role Section */}
      <Card className="w-full">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl font-semibold">
            Create New Role
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-4 sm:space-y-6">
            {/* Role Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Role Name
              </label>
              <Input placeholder="Enter role name" className="w-full" />
            </div>

            {/* Permissions Section */}
            <div className="space-y-3 sm:space-y-4">
              <label className="text-sm font-medium leading-none">
                Permissions
              </label>

              {/* Mobile: Stacked Layout */}
              <div className="grid gap-3 sm:hidden">
                {permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border bg-gray-50/50"
                  >
                    <Checkbox id={`permission-mobile-${permission.id}`} />
                    <label
                      htmlFor={`permission-mobile-${permission.id}`}
                      className="text-sm font-medium leading-none flex-1 cursor-pointer"
                    >
                      {permission.name}
                    </label>
                  </div>
                ))}
              </div>

              {/* Tablet: 2 Columns */}
              <div className="hidden sm:grid lg:hidden gap-3 sm:grid-cols-2">
                {permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border bg-gray-50/50"
                  >
                    <Checkbox id={`permission-tablet-${permission.id}`} />
                    <label
                      htmlFor={`permission-tablet-${permission.id}`}
                      className="text-sm font-medium leading-none flex-1 cursor-pointer"
                    >
                      {permission.name}
                    </label>
                  </div>
                ))}
              </div>

              {/* Desktop: 3 Columns */}
              <div className="hidden lg:grid gap-3 lg:grid-cols-3 xl:grid-cols-4">
                {permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                  >
                    <Checkbox id={`permission-desktop-${permission.id}`} />
                    <label
                      htmlFor={`permission-desktop-${permission.id}`}
                      className="text-sm font-medium leading-none flex-1 cursor-pointer"
                    >
                      {permission.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 sm:pt-4">
              <Button
                className="bg-orange-500 text-white hover:bg-orange-400 w-full sm:w-auto"
                size="default"
              >
                Save Role
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

const roles = [
  {
    id: 1,
    name: 'Admin',
    permissions: [
      'View Projects',
      'Edit Projects',
      'View Repairs',
      'Edit Repairs',
      'Upload Images',
      'Manage Users',
      'Manage Roles',
    ],
  },
  {
    id: 2,
    name: 'Manager',
    permissions: [
      'View Projects',
      'Edit Projects',
      'View Repairs',
      'Edit Repairs',
      'Upload Images',
      'Manage Users',
    ],
  },
  {
    id: 3,
    name: 'Technician',
    permissions: [
      'View Projects',
      'View Repairs',
      'Edit Repairs',
      'Upload Images',
    ],
  },
  {
    id: 4,
    name: 'Client',
    permissions: ['View Projects', 'View Repairs'],
  },
]

const permissions = [
  { id: 1, name: 'View Projects' },
  { id: 2, name: 'Edit Projects' },
  { id: 3, name: 'View Repairs' },
  { id: 4, name: 'Edit Repairs' },
  { id: 5, name: 'Upload Images' },
  { id: 6, name: 'Manage Users' },
  { id: 7, name: 'Manage Roles' },
  { id: 8, name: 'Approve Repairs' },
]

// import { UserPlus, Edit, Trash2 } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Checkbox } from '@/components/ui/checkbox'
// import { Input } from '@/components/ui/input'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'

// export default function ManagerRolesPage() {
//   return (
//     <div className="flex flex-col gap-8 p-8">
//       <div className="rounded-lg border bg-white p-6 shadow-sm">
//         <div className="mb-4 flex items-center justify-between">
//           <h2 className="text-xl font-semibold">Roles</h2>
//           <Button className="bg-orange-500 text-white hover:bg-orange-400">
//             <UserPlus className="mr-2 h-4 w-4" />
//             Create Role
//           </Button>
//         </div>

//         <div className="overflow-x-auto">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Role Name</TableHead>
//                 <TableHead>Permissions</TableHead>
//                 <TableHead>Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {roles.map((role) => (
//                 <TableRow key={role.id}>
//                   <TableCell className="font-medium">{role.name}</TableCell>
//                   <TableCell>
//                     <div className="flex flex-wrap gap-1">
//                       {role.permissions.map((permission, index) => (
//                         <span
//                           key={index}
//                           className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
//                         >
//                           {permission}
//                         </span>
//                       ))}
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     <div className="flex space-x-2">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         className="text-orange-500 hover:bg-orange-50 hover:text-orange-600"
//                       >
//                         <Edit className="mr-2 h-4 w-4" />
//                         Edit
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         className="text-red-500 hover:bg-red-50 hover:text-red-600"
//                       >
//                         <Trash2 className="mr-2 h-4 w-4" />
//                         Delete
//                       </Button>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>
//       </div>

//       <div className="rounded-lg border bg-white p-6 shadow-sm">
//         <h2 className="mb-4 text-xl font-semibold">Create Role</h2>
//         <form className="space-y-4">
//           <div>
//             <label className="mb-2 block text-sm font-medium">Role Name</label>
//             <Input placeholder="Enter role name" />
//           </div>

//           <div>
//             <label className="mb-2 block text-sm font-medium">
//               Permissions
//             </label>
//             <div className="grid gap-2 sm:grid-cols-2">
//               {permissions.map((permission) => (
//                 <div
//                   key={permission.id}
//                   className="flex items-center space-x-2"
//                 >
//                   <Checkbox id={`permission-${permission.id}`} />
//                   <label
//                     htmlFor={`permission-${permission.id}`}
//                     className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//                   >
//                     {permission.name}
//                   </label>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <Button className="bg-orange-500 text-white hover:bg-orange-400">
//             Save Role
//           </Button>
//         </form>
//       </div>
//     </div>
//   )
// }

// const roles = [
//   {
//     id: 1,
//     name: 'Admin',
//     permissions: [
//       'View Projects',
//       'Edit Projects',
//       'View Repairs',
//       'Edit Repairs',
//       'Upload Images',
//       'Manage Users',
//       'Manage Roles',
//     ],
//   },
//   {
//     id: 2,
//     name: 'Manager',
//     permissions: [
//       'View Projects',
//       'Edit Projects',
//       'View Repairs',
//       'Edit Repairs',
//       'Upload Images',
//       'Manage Users',
//     ],
//   },
//   {
//     id: 3,
//     name: 'Technician',
//     permissions: [
//       'View Projects',
//       'View Repairs',
//       'Edit Repairs',
//       'Upload Images',
//     ],
//   },
//   {
//     id: 4,
//     name: 'Client',
//     permissions: ['View Projects', 'View Repairs'],
//   },
// ]

// const permissions = [
//   { id: 1, name: 'View Projects' },
//   { id: 2, name: 'Edit Projects' },
//   { id: 3, name: 'View Repairs' },
//   { id: 4, name: 'Edit Repairs' },
//   { id: 5, name: 'Upload Images' },
//   { id: 6, name: 'Manage Users' },
//   { id: 7, name: 'Manage Roles' },
//   { id: 8, name: 'Approve Repairs' },
// ]
