'use client'

import { useState, useEffect } from 'react'
import { FolderPlus, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LogoutButton } from '@/components/logout-button'
import { TabsNavigation } from '@/components/tabs'
import { MobileTabs } from '@/components/mobile-tabs'
import { ProjectCard } from '@/components/project-card'

const adminTabs = [
  { value: 'projects', label: 'Projects', href: '/admin/projects' },
  { value: 'roles', label: 'Roles', href: '/admin/roles' },
  { value: 'users', label: 'Users', href: '/admin/users' },
  { value: 'repairs', label: 'Repairs', href: '/admin/repairs' },
]

export default function AdminProjectsPage() {
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile when component mounts
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="flex flex-col">
      <MobileTabs tabs={adminTabs} />

      <div className="flex flex-col gap-8 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-orange-500 md:text-3xl">
            Admin Dashboard
          </h1>
          <LogoutButton />
        </div>

        <div className="hidden md:block">
          <TabsNavigation tabs={adminTabs} basePath="/admin" />
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Projects</h2>
            <Button className="bg-orange-500 text-white hover:bg-orange-400">
              <FolderPlus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </div>

          {isMobile ? (
            <div className="space-y-4">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Drop Range</TableHead>
                    <TableHead>Level Range</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        {project.id}
                      </TableCell>
                      <TableCell>{project.client}</TableCell>
                      <TableCell>{project.dropRange}</TableCell>
                      <TableCell>{project.levelRange}</TableCell>
                      <TableCell>${project.price}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            project.status === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : project.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {project.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm md:p-6">
          <h2 className="mb-4 text-xl font-semibold">Create Project</h2>
          <form className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Project ID
              </label>
              <Input placeholder="Enter project ID" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Client</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client1">ABC Corporation</SelectItem>
                  <SelectItem value="client2">XYZ Industries</SelectItem>
                  <SelectItem value="client3">123 Enterprises</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Drop Range
              </label>
              <Input type="number" placeholder="Enter drop range" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Level Range
              </label>
              <Input type="number" placeholder="Enter level range" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Repair Type
              </label>
              <Input type="text" placeholder="Enter repair type" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Status</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Price mr-1
                </label>
                <Input type="text" placeholder="Enter price" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Price jr-1
                </label>
                <Input type="text" placeholder="Enter price" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Price cr-2
                </label>
                <Input type="text" placeholder="Enter price" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <Button className="mt-4 bg-orange-500 text-white hover:bg-orange-400">
                Save Project
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const projects = [
  {
    id: 'PRJ-001',
    client: 'ABC Corporation',
    dropRange: '10-20',
    levelRange: '1-5',
    price: '5,000',
    status: 'In Progress',
  },
  {
    id: 'PRJ-002',
    client: 'XYZ Industries',
    dropRange: '15-25',
    levelRange: '3-8',
    price: '7,500',
    status: 'Pending',
  },
  {
    id: 'PRJ-003',
    client: '123 Enterprises',
    dropRange: '5-15',
    levelRange: '2-6',
    price: '4,200',
    status: 'Completed',
  },
]
