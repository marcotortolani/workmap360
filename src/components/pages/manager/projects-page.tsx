// src/components/pages/manager/projects-page.tsx

'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRepairTypeStore } from '@/stores/repair-type-store'
import { useCurrentUser, useUserStore } from '@/stores/user-store'
import { toast } from 'sonner'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  FolderPlus,
  Edit,
  XIcon,
  Trash2Icon,
  Pencil,
  Trash2,
  MessageSquareWarning,
  Eye,
  MoreVertical,
  User,
  Building,
  Calendar,
  Wrench,
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  PROJECT_STATUS,
  Elevation,
  ProjectData,
  ProjectRepairType,
  TechnicianAssignment,
} from '@/types/project-types'
import { Separator } from '@/components/ui/separator'
import { UserType } from '@/types/user-types'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ProjectsFilter,
  ProjectFilterOptions,
} from '@/components/projects-filter'
import {
  createProjectViaAPI,
  deleteProjectViaAPI,
  updateProjectViaAPI,
} from '@/lib/api/projects'
import { useProjectsList } from '@/hooks/use-projects-list'

const clientList = [
  { id: 1, name: 'ABC Corporation' },
  { id: 2, name: 'XYZ Industries' },
  { id: 3, name: 'DEF Enterprises' },
  { id: 4, name: 'GHI Holdings' },
  { id: 5, name: 'JKL Enterprises' },
]

const techniciansList: UserType[] = [
  {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'oT0Y4@example.com',
    role: 'technician',
    created_at: '2023-01-15',
    status: 'active',
    avatar: 'https://avatar.iran.liara.run/public/42',
  },
  {
    id: 2,
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@example.com',
    role: 'technician',
    created_at: '2023-02-20',
    status: 'active',
    avatar: 'https://avatar.iran.liara.run/public/15',
  },
  {
    id: 3,
    first_name: 'Robert',
    last_name: 'Johnson',
    email: 'robert.johnson@example.com',
    role: 'technician',
    created_at: '2023-03-10',
    status: 'active',
    avatar: 'https://avatar.iran.liara.run/public/42',
  },
]

// Componente de paginación responsive
interface PaginationProps {
  currentPage: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

const Pagination = ({
  currentPage,
  totalPages,
  total,
  limit,
  onPageChange,
  isLoading,
}: PaginationProps) => {
  if (totalPages <= 1) return null

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 p-2">
      <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
        Showing {(currentPage - 1) * limit + 1} to{' '}
        {Math.min(currentPage * limit, total)} of {total} projects
      </div>

      <div className="flex items-center justify-center sm:justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          className="text-xs sm:text-sm px-2 sm:px-3"
        >
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">
            <ChevronLeft className="h-4 w-4" />
          </span>
        </Button>
        <span className="text-xs sm:text-sm px-2">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          className="text-xs sm:text-sm px-2 sm:px-3"
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">
            <ChevronRight className="h-4 w-4" />
          </span>
        </Button>
      </div>
    </div>
  )
}

// Card component para mobile
const ProjectCard = ({
  project,
  onView,
  onEdit,
  onDelete,
}: {
  project: ProjectData
  onView: (project: ProjectData) => void
  onEdit: (project: ProjectData) => void
  onDelete: (project: ProjectData) => void
}) => {
  const isCompleted = project.status === PROJECT_STATUS['completed']

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-muted-foreground">
                #{project.id}
              </span>
            </div>
            <h3 className="font-semibold text-base truncate">{project.name}</h3>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(project)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit(project)}
                disabled={isCompleted}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(project)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-3 w-3 text-muted-foreground" />
            <span className="truncate">{project.client_name}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <User className="h-3 w-3 text-muted-foreground" />
            <span className="truncate">{project.created_by_user_name}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs">
                {project.created_at.split('T')[0]}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Updated: </span>
              <span className="text-xs">
                {project.updated_at.split('T')[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Repair Types */}
        {project.repair_types && project.repair_types.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1 mb-1">
              <Wrench className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Repair Types:
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {project.repair_types.slice(0, 2).map((repair) => (
                <Badge
                  key={`${project.id}-${repair.repair_type}`}
                  variant="secondary"
                  className="text-xs"
                >
                  {repair.repair_type}
                </Badge>
              ))}
              {project.repair_types.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{project.repair_types.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Badge
            variant={
              project.status === PROJECT_STATUS['completed']
                ? 'default'
                : project.status === PROJECT_STATUS['in-progress']
                ? 'secondary'
                : 'outline'
            }
            className={`text-xs ${
              project.status === PROJECT_STATUS['completed']
                ? 'bg-green-100 text-green-800'
                : project.status === PROJECT_STATUS['in-progress']
                ? 'bg-blue-100 text-blue-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {project.status}
          </Badge>

          {project.technicians && project.technicians.length > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {project.technicians.length} tech
                {project.technicians.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function ManagerProjectsPage() {
  const { refreshCurrentUser } = useUserStore()
  const [actionSelected, setActionSelected] = useState<
    'close' | 'new' | 'edit' | 'view'
  >('close')
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(
    null
  )
  const [messageAdvice, setMessageAdvice] = useState<'delete' | null>(null)
  const [filters, setFilters] = useState<ProjectFilterOptions>({
    status: 'all',
    client: 'all',
    searchTerm: '',
    sortBy: 'date',
    sortOrder: 'desc',
  })

  // Zustand stores
  const { accessToken } = useCurrentUser()

  // Usar el hook simplificado
  const {
    projects: projectsList,
    pagination,
    isLoading,
    error,
    refetch,
    setPage,
    currentPage,
    totalPages,
  } = useProjectsList(20)

  // Filtrar y ordenar los proyectos
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = [...projectsList]

    // Aplicar filtro de búsqueda
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter((project) => {
        const projectName = project.name.toLowerCase()
        const clientName = project.client_name.toLowerCase()
        const createdBy = project.created_by_user_name?.toLowerCase() || ''
        const repairTypes =
          project.repair_types
            ?.map((rt) => rt.repair_type.toLowerCase())
            .join(' ') || ''

        return (
          projectName.includes(searchLower) ||
          clientName.includes(searchLower) ||
          createdBy.includes(searchLower) ||
          repairTypes.includes(searchLower) ||
          project.id.toString().includes(searchLower)
        )
      })
    }

    // Aplicar filtro de estado
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((project) => project.status === filters.status)
    }

    // Aplicar filtro de cliente
    if (filters.client && filters.client !== 'all') {
      filtered = filtered.filter(
        (project) => project.client_name === filters.client
      )
    }

    // Ordenar los resultados
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let comparison = 0

        switch (filters.sortBy) {
          case 'date':
            comparison =
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
            break
          case 'id':
            comparison = a.id - b.id
            break
          case 'name':
            comparison = a.name.localeCompare(b.name)
            break
          case 'client':
            comparison = a.client_name.localeCompare(b.client_name)
            break
          case 'status':
            const statusOrder = {
              [PROJECT_STATUS.pending]: 1,
              [PROJECT_STATUS['in-progress']]: 2,
              [PROJECT_STATUS.completed]: 3,
            }
            comparison = statusOrder[a.status] - statusOrder[b.status]
            break
          default:
            comparison = 0
        }

        return filters.sortOrder === 'asc' ? comparison : -comparison
      })
    }

    return filtered
  }, [projectsList, filters])

  const handleFilter = (newFilters: ProjectFilterOptions) => {
    setFilters(newFilters)
  }

  const handleSort = ({
    sortBy,
    sortOrder,
  }: {
    sortBy: ProjectFilterOptions['sortBy']
    sortOrder: ProjectFilterOptions['sortOrder']
  }) => {
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder,
    }))
  }

  const handleDeleteProject = async (projectId: number) => {
    if (!accessToken) {
      toast.error('Authentication Error', {
        description: 'You must be logged in to delete projects',
        duration: 5000,
        position: 'bottom-right',
      })
      return
    }

    try {
      const result = await deleteProjectViaAPI(projectId, accessToken)

      if (result.success) {
        toast.success('Project deleted', {
          description: 'Project has been deleted successfully',
          duration: 3000,
          position: 'bottom-right',
          style: {
            background: '#10B981',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '16px',
          },
        })
        await refetch()
      } else {
        toast.error('Delete failed', {
          description: result.error || 'Failed to delete project',
          duration: 5000,
          position: 'bottom-right',
          style: {
            background: '#EF4444',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '16px',
          },
        })
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('Unexpected error', {
        description: 'Error' + error,
        duration: 5000,
        position: 'bottom-right',
        style: {
          background: '#EF4444',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
        },
      })
    } finally {
      setMessageAdvice(null)
      setSelectedProject(null)
    }
  }

  const handleProjectChange = async () => {
    await refetch()
  }

  const handleViewProject = (project: ProjectData) => {
    setSelectedProject(project)
    setActionSelected('view')
  }

  const handleEditProject = (project: ProjectData) => {
    setSelectedProject(project)
    setActionSelected('edit')
  }

  const handleDeleteClick = (project: ProjectData) => {
    setMessageAdvice('delete')
    setSelectedProject(project)
  }

  return (
    <div className="relative w-full max-w-screen-2xl flex flex-col gap-4 sm:gap-6 lg:gap-8 p-2 sm:p-4 lg:p-8 mx-auto">
      <Card className="w-full  ">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl lg:text-2xl font-semibold">
                Projects Management
              </CardTitle>
              {filteredAndSortedProjects.length !== projectsList.length && (
                <p className="text-sm text-muted-foreground mt-1">
                  Showing {filteredAndSortedProjects.length} of{' '}
                  {projectsList.length} projects
                </p>
              )}
            </div>
            <Button
              className="bg-green-600 text-white hover:bg-green-500 w-full sm:w-auto"
              onClick={() => {
                setSelectedProject(null)
                setActionSelected('new')
              }}
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filtros */}
          <ProjectsFilter onFilter={handleFilter} onSort={handleSort} />

          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-sm sm:text-base">
                  Loading projects...
                </span>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <p className="font-medium text-sm sm:text-base">
                Error loading projects:
              </p>
              <p className="text-sm">{error}</p>
              <Button
                onClick={refreshCurrentUser}
                className="mt-2 bg-red-600 text-white hover:bg-red-700"
                size="sm"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Content */}
          {!isLoading && !error && (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden">
                {filteredAndSortedProjects.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-sm">
                      {projectsList.length === 0
                        ? 'No projects found. Create your first project!'
                        : 'No projects found matching the current filters'}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {filteredAndSortedProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onView={handleViewProject}
                        onEdit={handleEditProject}
                        onDelete={handleDeleteClick}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">ID</TableHead>
                        <TableHead className="min-w-[200px]">
                          Project Name
                        </TableHead>
                        <TableHead className="w-32">Created by</TableHead>
                        <TableHead className="w-32">Client</TableHead>
                        <TableHead className="min-w-[150px]">Repairs</TableHead>
                        <TableHead className="w-24">Status</TableHead>
                        <TableHead className="w-24">Created</TableHead>
                        <TableHead className="w-24">Updated</TableHead>
                        <TableHead className="w-48">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedProjects.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className="text-center py-8 text-muted-foreground"
                          >
                            {projectsList.length === 0
                              ? 'No projects found. Create your first project!'
                              : 'No projects found matching the current filters'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAndSortedProjects.map((project) => (
                          <TableRow
                            key={project?.id}
                            className="hover:bg-muted/50"
                          >
                            <TableCell className="font-medium">
                              #{project?.id}
                            </TableCell>
                            <TableCell className="font-medium truncate max-w-[200px]">
                              {project?.name}
                            </TableCell>
                            <TableCell className="truncate">
                              {project?.created_by_user_name}
                            </TableCell>
                            <TableCell className="truncate">
                              {project?.client_name}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {project?.repair_types
                                  ?.slice(0, 2)
                                  .map((repair) => (
                                    <Badge
                                      key={`${project.id}-${repair.repair_type}`}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {repair.repair_type}
                                    </Badge>
                                  ))}
                                {project?.repair_types &&
                                  project.repair_types.length > 2 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      +{project.repair_types.length - 2}
                                    </Badge>
                                  )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  project.status === PROJECT_STATUS['completed']
                                    ? 'default'
                                    : project.status ===
                                      PROJECT_STATUS['in-progress']
                                    ? 'secondary'
                                    : 'outline'
                                }
                                className={`text-xs text-nowrap ${
                                  project.status === PROJECT_STATUS['completed']
                                    ? 'bg-green-100 text-green-800'
                                    : project.status ===
                                      PROJECT_STATUS['in-progress']
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {project.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {project?.created_at.split('T')[0]}
                            </TableCell>
                            <TableCell className="text-sm">
                              {project?.updated_at.split('T')[0]}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 hover:bg-green-100 hover:text-green-700"
                                  onClick={() => handleViewProject(project)}
                                >
                                  <Eye className="mr-1 h-3 w-3" />
                                  <span className="hidden xl:inline">View</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-500 hover:bg-blue-100 hover:text-blue-600"
                                  onClick={() => handleEditProject(project)}
                                  disabled={
                                    project.status ===
                                    PROJECT_STATUS['completed']
                                  }
                                >
                                  <Edit className="mr-1 h-3 w-3" />
                                  <span className="hidden xl:inline">Edit</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-500 hover:bg-red-100 hover:text-red-600"
                                  onClick={() => handleDeleteClick(project)}
                                >
                                  <Trash2 className="mr-1 h-3 w-3" />
                                  <span className="hidden xl:inline">
                                    Delete
                                  </span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination - Solo mostrar para todos los proyectos, no los filtrados */}
              {pagination &&
                pagination.totalPages > 1 &&
                filteredAndSortedProjects.length === projectsList.length && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    total={pagination.total}
                    limit={pagination.limit || 20}
                    onPageChange={setPage}
                    isLoading={isLoading}
                  />
                )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de confirmación de eliminación */}
      <div
        className={`${
          messageAdvice !== null
            ? ' translate-y-0 scale-100 '
            : ' translate-y-[200%] scale-50 '
        } fixed top-0 left-0 z-50 w-screen h-screen bg-black/50 flex items-center justify-center transition-all duration-300 ease-in-out px-4`}
      >
        {messageAdvice === 'delete' && (
          <div className="w-full max-w-md flex flex-col gap-4 bg-white p-4 sm:p-6 shadow-lg rounded-lg">
            <div className="flex items-center gap-3">
              <MessageSquareWarning className="h-8 w-8 sm:h-12 sm:w-12 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-base sm:text-lg font-medium">
                  Delete this project?
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="space-y-1 text-sm">
                <p className="font-medium text-gray-700">
                  ID:{' '}
                  <span className="font-bold text-red-600">
                    #{selectedProject?.id}
                  </span>
                </p>
                <p className="font-medium text-gray-700">
                  Name:{' '}
                  <span className="font-bold text-red-600 break-words">
                    {selectedProject?.name}
                  </span>
                </p>
                <p className="font-medium text-gray-700">
                  Client:{' '}
                  <span className="font-bold text-red-600">
                    {selectedProject?.client_name}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setMessageAdvice(null)}
                variant="outline"
                className="flex-1 order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 bg-red-500 text-white hover:bg-red-600 order-1 sm:order-2"
                onClick={() => handleDeleteProject(selectedProject?.id || 0)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modales de crear/editar y ver */}
      <div
        className={`${
          actionSelected === 'new' || actionSelected === 'edit'
            ? ' translate-y-0 scale-100 bg-black/50 '
            : ' translate-y-[200%] scale-50 bg-black/0 '
        } fixed top-0 left-0 z-50 w-screen h-screen flex items-center justify-center transition-all duration-300 ease-in-out px-2 sm:px-4`}
      >
        <ProjectForm
          projectData={selectedProject || undefined}
          onClose={() => {
            setActionSelected('close')
            handleProjectChange()
          }}
        />
      </div>

      <div
        className={`${
          actionSelected === 'view'
            ? ' translate-y-0 scale-100 '
            : ' translate-y-[200%] scale-50 '
        } fixed top-0 left-0 z-50 w-screen h-screen bg-black/50 flex items-center justify-center transition-all duration-300 ease-in-out px-2 sm:px-4`}
      >
        <ProjectDataModal
          projectData={selectedProject}
          onClose={() => setActionSelected('close')}
        />
      </div>
    </div>
  )
}

const ProjectForm = ({
  projectData,
  onClose,
}: {
  projectData?: ProjectData
  onClose: () => void
}) => {
  const { userId, accessToken, fullName } = useCurrentUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Project Data
  const [projectName, setProjectName] = useState<ProjectData['name']>('')
  const [client_name, setclient_name] = useState<ProjectData['client_name']>('')
  const [elevations, setElevations] = useState<Elevation[]>([])
  const [repairTypes, setRepairTypes] = useState<ProjectData['repair_types']>(
    []
  )
  const [technicians, setTechnicians] = useState<ProjectData['technicians']>([])
  const [status, setStatus] = useState<ProjectData['status']>('pending')
  const [newElevation, setNewElevation] = useState<Elevation>({
    name: '',
    drops: 0,
    levels: 0,
  })

  // Estado para el valor común de levels (si sameLevelsForAll es true)
  const [commonLevels, setCommonLevels] = useState<number>(0)
  // Estado para el checkbox "Same levels for all elevations"
  const [sameLevelsForAll, setSameLevelsForAll] = useState<boolean>(false)

  // Estados para manejar dinámicamente repairTypes
  const [newRepairType, setNewRepairType] = useState<
    Partial<ProjectRepairType>
  >({
    repair_type_id: 0,
    repair_type: '',
    phases: 3,
    price: 0,
    minimum_charge_per_repair: 0,
    minimum_charge_per_drop: 0,
    unit_to_charge: '',
    status: 'active',
  })
  const [editingIndex, setEditingIndex] = useState<number | null>(null) // Índice del repairType que se está editando

  // Estados para manejar dinámicamente technicians
  const [newTechnician, setNewTechnician] = useState<
    Partial<TechnicianAssignment>
  >({
    technician_id: 0,
    technician_first_name: '',
    technician_last_name: '',
    technician_avatar: '',
  })

  const [editingTechnicianIndex, setEditingTechnicianIndex] = useState<
    number | null
  >(null)

  // Zustand stores
  const { repairTypeList } = useRepairTypeStore()

  // Manejador para agregar una elevation
  const handleAddElevation = () => {
    if (elevations.length > 20) {
      toast.error('Maximum 20 elevations allowed', {
        duration: 3000,
        position: 'bottom-right',
        style: {
          background: 'red',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
        },
      })
      return
    }
    if (
      !newElevation.name ||
      newElevation.drops! <= 0 ||
      (newElevation.levels! <= 0 && !sameLevelsForAll)
    ) {
      toast.error('Please fill in all elevation fields with valid values', {
        duration: 3000,
        position: 'bottom-right',
        style: {
          background: 'red',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
        },
      })
      return
    }

    const elevationToAdd: Elevation = {
      name: newElevation.name!,
      drops: newElevation.drops!,
      levels: sameLevelsForAll ? commonLevels : newElevation.levels!,
    }

    setElevations([...elevations, elevationToAdd])
    setNewElevation({ name: '', drops: 0, levels: 0 }) // Resetear el formulario de elevation
  }

  // Manejador para eliminar una elevation
  const handleRemoveElevation = (index: number) => {
    setElevations(elevations.filter((_, i) => i !== index))
  }

  // Manejador para el checkbox
  const handleSameLevelsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    setSameLevelsForAll(isChecked)

    if (isChecked) {
      // Si se marca "same levels", aplicamos el valor común a todas las elevations existentes
      setElevations(
        elevations.map((elevation) => ({ ...elevation, levels: commonLevels }))
      )
      setNewElevation({ ...newElevation, levels: commonLevels })
    }
  }

  // Manejador para actualizar el valor común de levels
  const handleCommonLevelsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    setCommonLevels(value)

    if (sameLevelsForAll) {
      // Actualizamos todas las elevations existentes y el formulario de nueva elevation
      setElevations(
        elevations.map((elevation) => ({ ...elevation, levels: value }))
      )
      setNewElevation({ ...newElevation, levels: value })
    }
  }

  // Manejador para seleccionar un tipo de reparación
  const handleRepairTypeChange = (repairID: string) => {
    const selectedRepairType = repairTypeList.find(
      (repairType) => repairType.id === Number(repairID)
    )
    if (selectedRepairType) {
      setNewRepairType({
        ...newRepairType,
        repair_type_id: selectedRepairType.id,
        repair_type: selectedRepairType.type,
        unit_to_charge: selectedRepairType.unit_to_charge,
      })
    }
  }

  // Manejador para agregar o actualizar un tipo de reparación
  const handleAddOrUpdateRepairType = () => {
    if (
      !newRepairType.repair_type_id ||
      newRepairType.phases! < 3 ||
      newRepairType.phases! > 10 ||
      newRepairType.price! <= 0
    ) {
      toast.error('Please fill in all repair type fields with valid values', {
        duration: 3000,
        position: 'bottom-right',
        style: {
          background: 'red',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
        },
      })
      return
    }

    const repairTypeToAdd: ProjectRepairType = {
      repair_type_id: newRepairType.repair_type_id!,
      repair_type: newRepairType.repair_type!,
      phases: newRepairType.phases!,
      price: newRepairType.price!,
      unit_to_charge: newRepairType.unit_to_charge!,
      minimum_charge_per_repair: newRepairType.minimum_charge_per_repair!,
      minimum_charge_per_drop: newRepairType.minimum_charge_per_drop!,
      status: newRepairType.status!,
    }

    if (editingIndex !== null) {
      // Modo edición: actualizamos el elemento existente
      const updatedRepairTypes = [...repairTypes]
      updatedRepairTypes[editingIndex] = repairTypeToAdd
      setRepairTypes(updatedRepairTypes)
      setEditingIndex(null) // Salimos del modo edición
    } else {
      // Modo agregar: añadimos un nuevo elemento
      setRepairTypes([...repairTypes, repairTypeToAdd])
    }

    // Reseteamos el formulario
    setNewRepairType({
      repair_type_id: 0,
      repair_type: '',
      phases: 3,
      price: 0,
      minimum_charge_per_repair: 0,
      minimum_charge_per_drop: 0,
      unit_to_charge: '',
      status: 'active',
    })
  }

  // Manejador para eliminar un tipo de reparación
  const handleRemoveRepairType = (index: number) => {
    setRepairTypes(repairTypes.filter((_, i) => i !== index))
  }

  // Manejador para editar un tipo de reparación
  const handleEditRepairType = (index: number) => {
    setEditingIndex(index)
    setNewRepairType({ ...repairTypes[index] })
  }

  // Manejador para cancelar la edición
  const handleCancelEditRepairType = () => {
    setEditingIndex(null)
    setNewRepairType({
      repair_type_id: 0,
      repair_type: '',
      phases: 3,
      price: 0,
      minimum_charge_per_repair: 0,
      minimum_charge_per_drop: 0,
      unit_to_charge: '',
      status: 'active',
    })
  }

  // Manejador para seleccionar un técnico
  const handleTechnicianChange = (technicianIDStringed: string) => {
    const selectedId = Number(technicianIDStringed)
    const selectedTechnician = techniciansList.find(
      (tech) => tech.id === selectedId
    )

    if (selectedTechnician) {
      setNewTechnician({
        technician_id: selectedId,
        technician_first_name: selectedTechnician.first_name,
        technician_last_name: selectedTechnician.last_name,
        technician_avatar: selectedTechnician.avatar,
      })
    }
  }

  // Manejador para agregar o actualizar un técnico
  const handleAddOrUpdateTechnician = () => {
    if (!newTechnician.technician_id) {
      toast.error('Please select a technician', {
        duration: 5000,
        position: 'bottom-right',
        style: {
          background: 'red',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
        },
      })
      return
    }

    const technicianToAdd: TechnicianAssignment = {
      technician_id: newTechnician.technician_id!,
      technician_first_name: newTechnician.technician_first_name!,
      technician_last_name: newTechnician.technician_last_name!,
      technician_avatar: newTechnician.technician_avatar!,
    }

    if (editingTechnicianIndex !== null) {
      const updatedTechnicians = [...technicians]
      updatedTechnicians[editingTechnicianIndex] = technicianToAdd
      setTechnicians(updatedTechnicians)
      setEditingTechnicianIndex(null)
    } else {
      setTechnicians([...technicians, technicianToAdd])
    }

    setNewTechnician({
      technician_id: 0,
      technician_first_name: '',
      technician_last_name: '',
      technician_avatar: '',
    })
  }

  // Manejador para eliminar un técnico
  const handleRemoveTechnician = (index: number) => {
    setTechnicians(technicians.filter((_, i) => i !== index))
  }

  // Manejador para editar un técnico
  const handleEditTechnician = (index: number) => {
    setEditingTechnicianIndex(index)
    setNewTechnician({ ...technicians[index] })
  }

  // Manejador para cancelar la edición de un técnico
  const handleCancelEditTechnician = () => {
    setEditingTechnicianIndex(null)
    setNewTechnician({
      technician_id: 0,
      technician_first_name: '',
      technician_last_name: '',
      technician_avatar: '',
    })
  }

  // Manejador para enviar el formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!accessToken) {
      toast.error('You`re not logged in', {
        description: 'You must be logged in to create a project',
        duration: 5000,
        position: 'bottom-right',
        style: {
          background: 'red',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
        },
      })
      setIsSubmitting(false)
      return
    }
    if (client_name === '') {
      toast.error('Client is required', {
        description: 'Please select a client',
        duration: 5000,
        position: 'bottom-right',
        style: {
          background: 'red',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
        },
      })
      setIsSubmitting(false)
      return
    }

    if (elevations.length < 1) {
      toast.error('Elevations are required', {
        description: 'At least 1 elevation is required',
        duration: 5000,
        position: 'bottom-right',
        style: {
          background: 'red',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
        },
      })
      setIsSubmitting(false)
      return
    }

    if (sameLevelsForAll && commonLevels <= 0) {
      toast.error('Invalid number of levels', {
        description: 'Please enter a valid number of levels for all elevations',
        duration: 5000,
        position: 'bottom-right',
        style: {
          background: 'red',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
        },
      })
      setIsSubmitting(false)
      return
    }

    try {
      if (projectData) {
        // 🔧 MODO EDICIÓN - Usar API en lugar de Zustand
        console.log('Updating project via API:', projectData.id)

        const result = await updateProjectViaAPI(
          projectData.id,
          {
            name: projectName,
            client_name: client_name,
            client_id: clientList.find((client) => client.name === client_name)!
              .id,
            status,
            elevations: elevations || [],
            repair_types: repairTypes || [],
            technicians: technicians || [],
          },
          accessToken
        )

        if (!result.success) {
          toast.error(result.error || 'Failed to update project', {
            duration: 5000,
            position: 'bottom-right',
            style: {
              background: 'red',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '16px',
            },
          })
          setIsSubmitting(false)
          return
        }

        toast.success('Project updated successfully', {
          description: `"${projectName}" has been updated`,
          duration: 3000,
          position: 'bottom-right',
          style: {
            background: 'green',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '16px',
          },
        })
      } else {
        // Modo creación - usar el nuevo endpoint
        const result = await createProjectViaAPI(
          {
            name: projectName,
            client_name: client_name,
            client_id: clientList.find((client) => client.name === client_name)!
              .id,
            status,
            elevations,
            repair_types: repairTypes,
            technicians,
            created_by_user_id: userId || 0,
            created_by_user_name: fullName || 'Unknown User',
          },
          accessToken
        ) // Usar token del usuario actual

        if (!result.success) {
          toast.error(result.error || 'Failed to create project', {
            duration: 5000,
            position: 'bottom-right',
            style: {
              background: 'red',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '16px',
            },
          })
          setIsSubmitting(false)
          return
        }

        toast.success('Project created successfully', {
          duration: 5000,
          position: 'bottom-right',
          style: {
            background: 'green',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '16px',
          },
        })
      }
    } catch (error) {
      console.error('Error submitting project:', error)
      toast.error('Failed to submit project', {
        description: `Error: ${error}`,
        duration: 5000,
        position: 'bottom-right',
        style: {
          background: 'red',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
        },
      })
    } finally {
      resetFormData()
      setIsSubmitting(false)
      setTimeout(() => {
        onClose()
      }, 200)
    }
  }

  const resetFormData = () => {
    setProjectName('')
    setclient_name('')
    setStatus(PROJECT_STATUS['in-progress'])
    setElevations([])
    setRepairTypes([])
    setTechnicians([])
    setSameLevelsForAll(false)
    setCommonLevels(0)
    setEditingTechnicianIndex(null)
    setNewTechnician({
      technician_id: 0,
      technician_first_name: '',
      technician_last_name: '',
      technician_avatar: '',
    })
    setEditingTechnicianIndex(null)
  }

  useEffect(() => {
    if (projectData) {
      setProjectName(projectData.name)
      setclient_name(projectData.client_name)
      setStatus(projectData.status)
      setElevations(projectData.elevations)
      setRepairTypes(projectData.repair_types)
      setTechnicians(projectData.technicians)
    } else {
      resetFormData()
    }
  }, [projectData])

  return (
    <div
      className={`relative w-full max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 
        h-[90vh] sm:h-[95vh] mx-auto overflow-y-auto rounded-lg border bg-white 
        p-3 sm:p-4 md:p-6 shadow-lg`}
    >
      <Button
        type="button"
        onClick={onClose}
        className="absolute top-2 right-2 sm:top-4 sm:right-4 md:top-6 md:right-6 
          w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-neutral-900 text-white 
          hover:bg-neutral-600 rounded-md p-0 z-10"
        disabled={isSubmitting}
      >
        <XIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 stroke-2" />
      </Button>

      <h2 className="mb-4 sm:mb-6 text-center text-lg sm:text-xl md:text-2xl font-semibold pr-8">
        {projectData ? 'Edit Project' : 'Create New Project'}
      </h2>

      <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
        {/* Project Data Section */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-semibold border-b pb-2">
            Project Information
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-sm font-medium">Project Name</Label>
              <Input
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                disabled={isSubmitting}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="client" className="text-sm font-medium">
                Client
              </Label>
              <Select
                name="client"
                value={client_name}
                onValueChange={(e) => setclient_name(e as string)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clientList.map((client) => (
                    <SelectItem key={client.id} value={client.name}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Status</Label>
            <Select
              value={status}
              onValueChange={(e) => setStatus(e as ProjectData['status'])}
              disabled={isSubmitting}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Elevations Section */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-semibold border-b pb-2">
            Elevations
            <span className="text-sm font-normal text-muted-foreground ml-2">
              (1 min - 20 max)
            </span>
          </h3>

          {/* Same levels checkbox and input */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Input
                id="sameLevels"
                type="checkbox"
                checked={sameLevelsForAll}
                onChange={
                  elevations.length === 0 ? handleSameLevelsChange : () => {}
                }
                className="h-4 w-4"
                disabled={elevations.length > 0 || isSubmitting}
              />
              <Label htmlFor="sameLevels" className="text-sm">
                Same levels for all elevations
              </Label>
            </div>

            {sameLevelsForAll && (
              <div className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">
                  Common Levels:
                </Label>
                <Input
                  type="number"
                  value={commonLevels || ''}
                  onChange={
                    elevations.length === 0
                      ? handleCommonLevelsChange
                      : () => {}
                  }
                  placeholder="Levels"
                  min="1"
                  className="w-20"
                  disabled={elevations.length > 0 || isSubmitting}
                />
              </div>
            )}
          </div>

          {/* Existing elevations */}
          {elevations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Current Elevations:</h4>
              <div className="space-y-2">
                {elevations.map((elevation, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg bg-white"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <span className="font-medium">{elevation.name}</span>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{elevation.drops} drops</span>
                        <span>{elevation.levels} levels</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => handleRemoveElevation(index)}
                      className="bg-red-500 text-white hover:bg-red-600 text-xs px-2 py-1"
                      disabled={isSubmitting}
                    >
                      <Trash2Icon className="h-3 w-3 sm:mr-1" />
                      <span className="hidden sm:inline">Remove</span>
                    </Button>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
                <span>Total Elevations: {elevations.length}</span>
                <span>
                  Total Drops:{' '}
                  {elevations.reduce((total, e) => total + e.drops, 0)}
                </span>
                {sameLevelsForAll && (
                  <span>Levels per Elevation: {commonLevels}</span>
                )}
              </div>
            </div>
          )}

          {/* Add new elevation */}
          {elevations.length < 20 && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="text-sm font-medium mb-3">Add New Elevation:</h4>
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="elevationName" className="text-sm">
                    Elevation Name
                  </Label>
                  <Input
                    name="elevationName"
                    type="text"
                    value={newElevation.name}
                    onChange={(e) =>
                      setNewElevation({
                        ...newElevation,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g., North, Street Name..."
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="drops" className="text-sm">
                    Drops
                  </Label>
                  <Input
                    name="drops"
                    type="number"
                    value={newElevation.drops || ''}
                    onChange={(e) =>
                      setNewElevation({
                        ...newElevation,
                        drops: Number(e.target.value),
                      })
                    }
                    placeholder="8"
                    min="1"
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="levels" className="text-sm">
                    Levels
                  </Label>
                  <Input
                    type="number"
                    name="levels"
                    value={newElevation.levels || commonLevels || ''}
                    onChange={(e) =>
                      setNewElevation({
                        ...newElevation,
                        levels: Number(e.target.value),
                      })
                    }
                    disabled={
                      (sameLevelsForAll && commonLevels !== 0) || isSubmitting
                    }
                    placeholder="5"
                    min="1"
                    className="mt-1"
                  />
                </div>
              </div>
              <Button
                type="button"
                onClick={handleAddElevation}
                className="bg-green-600 hover:bg-green-500 text-white mt-3 w-full sm:w-auto"
                disabled={isSubmitting}
              >
                Add Elevation
              </Button>
            </div>
          )}
        </div>

        {/* Repair Types Section */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-semibold border-b pb-2">
            Repair Types
          </h3>

          {/* Existing repair types */}
          {repairTypes.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Current Repair Types:</h4>
              {repairTypes.map((rt, index) => (
                <div key={index} className="p-3 border rounded-lg bg-white">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-semibold">
                          {rt.repair_type}
                        </Badge>
                        <span className="text-sm">
                          {
                            repairTypeList.find(
                              (r) => r.id === rt.repair_type_id
                            )?.variation
                          }
                          {repairTypeList.find(
                            (r) => r.id === rt.repair_type_id
                          )?.unit_measure?.default_values?.depth && (
                            <span className="text-muted-foreground">
                              {' '}
                              (
                              {
                                repairTypeList.find(
                                  (r) => r.id === rt.repair_type_id
                                )?.unit_measure?.default_values?.depth
                              }{' '}
                              mm)
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span>{rt.phases} phases</span>
                        <span>
                          ${rt.price} ({rt.unit_to_charge})
                        </span>
                        <span>MC/R: {rt.minimum_charge_per_repair}</span>
                        <span>MC/D: {rt.minimum_charge_per_drop}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => handleEditRepairType(index)}
                        className="bg-blue-500 text-white hover:bg-blue-600 text-xs px-2 py-1"
                        disabled={isSubmitting}
                      >
                        <Pencil className="h-3 w-3 sm:mr-1" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleRemoveRepairType(index)}
                        className="bg-red-500 text-white hover:bg-red-600 text-xs px-2 py-1"
                        disabled={isSubmitting}
                      >
                        <Trash2Icon className="h-3 w-3 sm:mr-1" />
                        <span className="hidden sm:inline">Remove</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add new repair type */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <h4 className="text-sm font-medium mb-3">
              {editingIndex !== null
                ? 'Edit Repair Type:'
                : 'Add New Repair Type:'}
            </h4>

            <div className="space-y-4">
              {/* First row */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="sm:col-span-2 lg:col-span-1">
                  <Label htmlFor="repairType" className="text-sm">
                    Repair Type
                  </Label>
                  <Select
                    name="repairType"
                    value={`${newRepairType.repair_type_id}`}
                    onValueChange={(e) => handleRepairTypeChange(e)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select repair type" />
                    </SelectTrigger>
                    <SelectContent>
                      {repairTypeList
                        .filter((r) => r.status === 'active')
                        .map((repair) => (
                          <SelectItem
                            key={repair.id}
                            value={`${repair.id}`}
                            disabled={repairTypes
                              .map((rt) => rt.repair_type_id)
                              .includes(repair.id)}
                          >
                            {repair.variation} ({repair.type})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="phases" className="text-sm">
                    Phases (3-10)
                  </Label>
                  <Input
                    id="phases"
                    type="number"
                    value={newRepairType.phases || ''}
                    onChange={(e) =>
                      setNewRepairType({
                        ...newRepairType,
                        phases: Number(e.target.value),
                      })
                    }
                    placeholder="3"
                    min="3"
                    max="10"
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="price" className="text-sm">
                    Price{' '}
                    {newRepairType.unit_to_charge &&
                      `(/${newRepairType.unit_to_charge})`}
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={newRepairType.price || ''}
                    onChange={(e) =>
                      setNewRepairType({
                        ...newRepairType,
                        price: Number(e.target.value),
                      })
                    }
                    placeholder="100"
                    min="0"
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Second row */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="minChargePerRepair" className="text-sm">
                    Min Charge per Repair{' '}
                    {newRepairType.unit_to_charge &&
                      `(/${newRepairType.unit_to_charge})`}
                  </Label>
                  <Input
                    id="minChargePerRepair"
                    type="number"
                    value={newRepairType.minimum_charge_per_repair || ''}
                    onChange={(e) =>
                      setNewRepairType({
                        ...newRepairType,
                        minimum_charge_per_repair: Number(e.target.value),
                      })
                    }
                    placeholder="1"
                    min="0"
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="minChargePerDrop" className="text-sm">
                    Min Charge per Drop{' '}
                    {newRepairType.unit_to_charge &&
                      `(/${newRepairType.unit_to_charge})`}
                  </Label>
                  <Input
                    id="minChargePerDrop"
                    type="number"
                    value={newRepairType.minimum_charge_per_drop || ''}
                    onChange={(e) =>
                      setNewRepairType({
                        ...newRepairType,
                        minimum_charge_per_drop: Number(e.target.value),
                      })
                    }
                    placeholder="1"
                    min="0"
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  onClick={handleAddOrUpdateRepairType}
                  className="bg-green-600 hover:bg-green-500 text-white flex-1 sm:flex-none"
                  disabled={isSubmitting}
                >
                  {editingIndex !== null ? 'Update' : 'Add'} Repair Type
                </Button>
                {editingIndex !== null && (
                  <Button
                    type="button"
                    onClick={handleCancelEditRepairType}
                    className="bg-gray-500 text-white hover:bg-gray-600 flex-1 sm:flex-none"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Technicians Section */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-semibold border-b pb-2">
            Technicians
          </h3>

          {/* Existing technicians */}
          {technicians.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Assigned Technicians:</h4>
              {technicians.map((tech, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg bg-white"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                      <AvatarImage src={tech.technician_avatar} />
                      <AvatarFallback className="bg-orange-100 text-orange-800 text-xs sm:text-sm">
                        {tech.technician_first_name.charAt(0)}
                        {tech.technician_last_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm sm:text-base">
                        {tech.technician_first_name} {tech.technician_last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ID: {tech.technician_id}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => handleEditTechnician(index)}
                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1"
                      disabled={isSubmitting}
                    >
                      <Pencil className="h-3 w-3 sm:mr-1" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleRemoveTechnician(index)}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1"
                      disabled={isSubmitting}
                    >
                      <Trash2Icon className="h-3 w-3 sm:mr-1" />
                      <span className="hidden sm:inline">Remove</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add new technician */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <h4 className="text-sm font-medium mb-3">
              {editingTechnicianIndex !== null
                ? 'Edit Technician:'
                : 'Add New Technician:'}
            </h4>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Label htmlFor="technician" className="text-sm">
                  Select Technician
                </Label>
                <Select
                  name="technician"
                  value={
                    newTechnician.technician_id !== 0
                      ? `${newTechnician.technician_id}`
                      : ''
                  }
                  onValueChange={(e) => handleTechnicianChange(e)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Technician" />
                  </SelectTrigger>
                  <SelectContent>
                    {techniciansList.map((tech) => (
                      <SelectItem
                        key={tech.id}
                        value={`${tech.id}`}
                        disabled={technicians
                          .map((tech) => tech.technician_id)
                          .includes(tech.id)}
                      >
                        {tech.first_name} {tech.last_name} (ID: {tech.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                <Button
                  type="button"
                  onClick={handleAddOrUpdateTechnician}
                  className="bg-green-600 hover:bg-green-500 text-white"
                  disabled={isSubmitting}
                >
                  {editingTechnicianIndex !== null ? 'Update' : 'Add'}{' '}
                  Technician
                </Button>
                {editingTechnicianIndex !== null && (
                  <Button
                    type="button"
                    onClick={handleCancelEditTechnician}
                    className="bg-gray-500 text-white hover:bg-gray-600"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            className="bg-green-600 text-white hover:bg-green-500 flex-1 sm:flex-none order-2 sm:order-1"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{projectData ? 'Updating...' : 'Creating...'}</span>
              </div>
            ) : (
              <span>{projectData ? 'Update Project' : 'Create Project'}</span>
            )}
          </Button>
          <Button
            type="button"
            className="bg-neutral-900 text-white hover:bg-neutral-700 flex-1 sm:flex-none order-1 sm:order-2"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Close
          </Button>
        </div>
      </form>
    </div>
  )
}

// // src/components/pages/manager/projects-page.tsx

// 'use client'

// import { useEffect, useState, useMemo } from 'react'
// import { useRepairTypeStore } from '@/stores/repair-type-store'
// import { useCurrentUser } from '@/stores/user-store'
// import { toast } from 'sonner'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'
// import {
//   FolderPlus,
//   Edit,
//   XIcon,
//   Trash2Icon,
//   Pencil,
//   Trash2,
//   MessageSquareWarning,
//   Eye,
// } from 'lucide-react'
// import {
//   PROJECT_STATUS,
//   Elevation,
//   ProjectData,
//   ProjectRepairType,
//   TechnicianAssignment,
// } from '@/types/project-types'
// import { Separator } from '@/components/ui/separator'
// import { UserType } from '@/types/user-types'
// import { Label } from '@/components/ui/label'
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// import {
//   ProjectsFilter,
//   ProjectFilterOptions,
// } from '@/components/projects-filter'
// import {
//   createProjectViaAPI,
//   deleteProjectViaAPI,
//   updateProjectViaAPI,
// } from '@/lib/api/projects'
// import { useProjectsList } from '@/hooks/use-projects-list'

// const clientList = [
//   { id: 1, name: 'ABC Corporation' },
//   { id: 2, name: 'XYZ Industries' },
//   { id: 3, name: 'DEF Enterprises' },
//   { id: 4, name: 'GHI Holdings' },
//   { id: 5, name: 'JKL Enterprises' },
// ]

// const techniciansList: UserType[] = [
//   {
//     id: 1,
//     first_name: 'John',
//     last_name: 'Doe',
//     email: 'oT0Y4@example.com',
//     role: 'technician',
//     created_at: '2023-01-15',
//     status: 'active',
//     avatar: 'https://avatar.iran.liara.run/public/42',
//   },
//   {
//     id: 2,
//     first_name: 'Jane',
//     last_name: 'Smith',
//     email: 'jane.smith@example.com',
//     role: 'technician',
//     created_at: '2023-02-20',
//     status: 'active',
//     avatar: 'https://avatar.iran.liara.run/public/15',
//   },
//   {
//     id: 3,
//     first_name: 'Robert',
//     last_name: 'Johnson',
//     email: 'robert.johnson@example.com',
//     role: 'technician',
//     created_at: '2023-03-10',
//     status: 'active',
//     avatar: 'https://avatar.iran.liara.run/public/42',
//   },
// ]

// export default function ManagerProjectsPage() {
//   const [actionSelected, setActionSelected] = useState<
//     'close' | 'new' | 'edit' | 'view'
//   >('close')
//   const [selectedProject, setSelectedProject] = useState<ProjectData | null>(
//     null
//   )
//   const [messageAdvice, setMessageAdvice] = useState<'delete' | null>(null)
//   const [filters, setFilters] = useState<ProjectFilterOptions>({
//     status: 'all',
//     client: 'all',
//     searchTerm: '',
//     sortBy: 'date',
//     sortOrder: 'desc',
//   })

//   // Zustand stores
//   const { accessToken } = useCurrentUser()

//   // Usar el hook simplificado
//   const {
//     projects: projectsList,
//     pagination,
//     isLoading,
//     error,
//     refetch,
//     setPage,
//     currentPage,
//     totalPages,
//   } = useProjectsList(20)

//   // Obtener clientes únicos de los proyectos
//   // const uniqueClients = useMemo(
//   //   () => [...new Set(projectsList.map((p) => p.client_name))],
//   //   [projectsList]
//   // )

//   // Filtrar y ordenar los proyectos
//   const filteredAndSortedProjects = useMemo(() => {
//     let filtered = [...projectsList]

//     // Aplicar filtro de búsqueda
//     if (filters.searchTerm) {
//       const searchLower = filters.searchTerm.toLowerCase()
//       filtered = filtered.filter((project) => {
//         const projectName = project.name.toLowerCase()
//         const clientName = project.client_name.toLowerCase()
//         const createdBy = project.created_by_user_name?.toLowerCase() || ''
//         const repairTypes =
//           project.repair_types
//             ?.map((rt) => rt.repair_type.toLowerCase())
//             .join(' ') || ''

//         return (
//           projectName.includes(searchLower) ||
//           clientName.includes(searchLower) ||
//           createdBy.includes(searchLower) ||
//           repairTypes.includes(searchLower) ||
//           project.id.toString().includes(searchLower)
//         )
//       })
//     }

//     // Aplicar filtro de estado
//     if (filters.status && filters.status !== 'all') {
//       filtered = filtered.filter((project) => project.status === filters.status)
//     }

//     // Aplicar filtro de cliente
//     if (filters.client && filters.client !== 'all') {
//       filtered = filtered.filter(
//         (project) => project.client_name === filters.client
//       )
//     }

//     // Ordenar los resultados
//     if (filters.sortBy) {
//       filtered.sort((a, b) => {
//         let comparison = 0

//         switch (filters.sortBy) {
//           case 'date':
//             comparison =
//               new Date(a.created_at).getTime() -
//               new Date(b.created_at).getTime()
//             break
//           case 'id':
//             comparison = a.id - b.id
//             break
//           case 'name':
//             comparison = a.name.localeCompare(b.name)
//             break
//           case 'client':
//             comparison = a.client_name.localeCompare(b.client_name)
//             break
//           case 'status':
//             const statusOrder = {
//               [PROJECT_STATUS.pending]: 1,
//               [PROJECT_STATUS['in-progress']]: 2,
//               [PROJECT_STATUS.completed]: 3,
//             }
//             comparison = statusOrder[a.status] - statusOrder[b.status]
//             break
//           default:
//             comparison = 0
//         }

//         return filters.sortOrder === 'asc' ? comparison : -comparison
//       })
//     }

//     return filtered
//   }, [projectsList, filters])

//   const handleFilter = (newFilters: ProjectFilterOptions) => {
//     setFilters(newFilters)
//   }

//   const handleSort = ({
//     sortBy,
//     sortOrder,
//   }: {
//     sortBy: ProjectFilterOptions['sortBy']
//     sortOrder: ProjectFilterOptions['sortOrder']
//   }) => {
//     setFilters((prev) => ({
//       ...prev,
//       sortBy,
//       sortOrder,
//     }))
//   }

//   const handleDeleteProject = async (projectId: number) => {
//     if (!accessToken) {
//       toast.error('Authentication Error', {
//         description: 'You must be logged in to delete projects',
//         duration: 5000,
//         position: 'bottom-right',
//       })
//       return
//     }

//     try {
//       const result = await deleteProjectViaAPI(projectId, accessToken)

//       if (result.success) {
//         toast.success('Project deleted', {
//           description: 'Project has been deleted successfully',
//           duration: 3000,
//           position: 'bottom-right',
//           style: {
//             background: '#10B981',
//             color: '#fff',
//             fontWeight: 'bold',
//             fontSize: '16px',
//           },
//         })
//         await refetch()
//       } else {
//         toast.error('Delete failed', {
//           description: result.error || 'Failed to delete project',
//           duration: 5000,
//           position: 'bottom-right',
//           style: {
//             background: '#EF4444',
//             color: '#fff',
//             fontWeight: 'bold',
//             fontSize: '16px',
//           },
//         })
//       }
//     } catch (error) {
//       console.error('Unexpected error:', error)
//       toast.error('Unexpected error', {
//         description: 'Error' + error,
//         duration: 5000,
//         position: 'bottom-right',
//         style: {
//           background: '#EF4444',
//           color: '#fff',
//           fontWeight: 'bold',
//           fontSize: '16px',
//         },
//       })
//     } finally {
//       setMessageAdvice(null)
//       setSelectedProject(null)
//     }
//   }

//   const handleProjectChange = async () => {
//     await refetch()
//   }

//   return (
//     <div className="relative flex flex-col gap-8">
//       <div className="rounded-lg border bg-white p-6 shadow-sm">
//         <div className="mb-4 flex items-center justify-between">
//           <h2 className="text-xl font-semibold">
//             Projects
//             {filteredAndSortedProjects.length !== projectsList.length && (
//               <span className="ml-2 text-sm font-normal text-muted-foreground">
//                 (Showing {filteredAndSortedProjects.length} of{' '}
//                 {projectsList.length})
//               </span>
//             )}
//           </h2>
//           <Button
//             className="bg-green-600 text-white hover:bg-green-500"
//             onClick={() => {
//               setSelectedProject(null)
//               setActionSelected('new')
//             }}
//           >
//             <FolderPlus className="mr-2 h-4 w-4" />
//             Create Project
//           </Button>
//         </div>

//         <ProjectsFilter
//           onFilter={handleFilter}
//           onSort={handleSort}
//           // clients={uniqueClients}
//         />

//         {/* Loading state */}
//         {isLoading && (
//           <div className="flex justify-center items-center py-8">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
//             <span className="ml-2 text-gray-600">Loading projects...</span>
//           </div>
//         )}

//         {/* Error state */}
//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//             <p className="font-medium">Error loading projects:</p>
//             <p>{error}</p>
//             <Button
//               onClick={refetch}
//               className="mt-2 bg-red-600 text-white hover:bg-red-700"
//               size="sm"
//             >
//               Retry
//             </Button>
//           </div>
//         )}

//         {/* Projects table */}
//         {!isLoading && !error && (
//           <>
//             <div className="overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>ID</TableHead>
//                     <TableHead>Project Name</TableHead>
//                     <TableHead>Created by</TableHead>
//                     <TableHead>Client</TableHead>
//                     <TableHead>Repairs</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Created at</TableHead>
//                     <TableHead>Updated at</TableHead>
//                     <TableHead>Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {filteredAndSortedProjects.length === 0 ? (
//                     <TableRow>
//                       <TableCell
//                         colSpan={9}
//                         className="text-center py-8 text-gray-500"
//                       >
//                         {projectsList.length === 0
//                           ? 'No projects found. Create your first project!'
//                           : 'No projects found matching the current filters'}
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     filteredAndSortedProjects.map((project) => (
//                       <TableRow key={project?.id}>
//                         <TableCell className="font-medium">
//                           {project?.id}
//                         </TableCell>
//                         <TableCell className="font-medium">
//                           {project?.name}
//                         </TableCell>
//                         <TableCell>{project?.created_by_user_name}</TableCell>
//                         <TableCell>{project?.client_name}</TableCell>
//                         <TableCell>
//                           {project?.repair_types?.map((repair) => (
//                             <span
//                               key={`${project.id}-${repair.repair_type}`}
//                               className="mx-1 px-2 py-0.5 bg-neutral-500 text-white rounded-md"
//                             >
//                               {repair.repair_type}
//                             </span>
//                           ))}
//                         </TableCell>
//                         <TableCell>
//                           <span
//                             className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
//                               project.status === PROJECT_STATUS['completed']
//                                 ? 'bg-green-100 text-green-800'
//                                 : project.status ===
//                                   PROJECT_STATUS['in-progress']
//                                 ? 'bg-blue-100 text-blue-800'
//                                 : 'bg-yellow-100 text-yellow-800'
//                             }`}
//                           >
//                             {project.status}
//                           </span>
//                         </TableCell>
//                         <TableCell>
//                           {project?.created_at.split('T')[0]}
//                         </TableCell>
//                         <TableCell>
//                           {project?.updated_at.split('T')[0]}
//                         </TableCell>
//                         <TableCell className="flex gap-2">
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             className="text-green-600 hover:bg-green-100 hover:text-green-700"
//                             onClick={() => {
//                               setSelectedProject(project)
//                               setActionSelected('view')
//                             }}
//                           >
//                             <Eye className="mr-2 h-4 w-4" />
//                             View
//                           </Button>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             className="text-blue-500 hover:bg-blue-100 hover:text-blue-600"
//                             onClick={() => {
//                               setSelectedProject(project)
//                               setActionSelected('edit')
//                             }}
//                             disabled={
//                               project.status === PROJECT_STATUS['completed']
//                             }
//                           >
//                             <Edit className="mr-2 h-4 w-4" />
//                             Edit
//                           </Button>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             className="text-red-500 hover:bg-red-100 hover:text-red-600"
//                             onClick={() => {
//                               setMessageAdvice('delete')
//                               setSelectedProject(project)
//                             }}
//                           >
//                             <Trash2 className="mr-2 h-4 w-4" />
//                             Delete
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
//             </div>

//             {/* Pagination - Solo mostrar para todos los proyectos, no los filtrados */}
//             {pagination &&
//               pagination.totalPages > 1 &&
//               filteredAndSortedProjects.length === projectsList.length && (
//                 <div className="flex items-center justify-between mt-4">
//                   <div className="text-sm text-gray-700">
//                     Showing {(currentPage - 1) * (pagination.limit || 20) + 1}{' '}
//                     to{' '}
//                     {Math.min(
//                       currentPage * (pagination.limit || 20),
//                       pagination.total
//                     )}{' '}
//                     of {pagination.total} projects
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
//           </>
//         )}
//       </div>

//       {/* Modal de confirmación de eliminación */}
//       <div
//         className={`${
//           messageAdvice !== null
//             ? ' translate-y-0 scale-100 '
//             : ' translate-y-[200%] scale-50 '
//         } fixed top-0 left-0 z-50 w-screen h-screen bg-black/50 flex items-center justify-center transition-all duration-300 ease-in-out`}
//       >
//         {messageAdvice === 'delete' && (
//           <div className="w-2/3 max-w-[500px] flex flex-col gap-4 bg-white p-6 shadow-sm rounded-lg">
//             <MessageSquareWarning className="h-12 w-12 text-red-500" />
//             <p className="text-lg font-medium">
//               Are you sure you want to delete this project?
//             </p>
//             <p className="text-sm text-gray-500">
//               This action cannot be undone. If you delete this project, all
//               associated data will also be deleted permanently.
//             </p>
//             <div className="bg-red-50 border border-red-200 rounded-md p-3">
//               <p className="text-sm font-medium text-gray-700">
//                 Project ID:{' '}
//                 <span className="font-bold text-red-600">
//                   {selectedProject?.id}
//                 </span>
//               </p>
//               <p className="text-sm font-medium text-gray-700">
//                 Project Name:{' '}
//                 <span className="font-bold text-red-600">
//                   {selectedProject?.name}
//                 </span>
//               </p>
//               <p className="text-sm font-medium text-gray-700">
//                 Client:{' '}
//                 <span className="font-bold text-red-600">
//                   {selectedProject?.client_name}
//                 </span>
//               </p>
//             </div>
//             <div className="flex gap-3">
//               <Button
//                 onClick={() => setMessageAdvice(null)}
//                 variant="outline"
//                 className="flex-1"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 variant="destructive"
//                 className="flex-1 bg-red-500 text-white hover:bg-red-600"
//                 onClick={() => handleDeleteProject(selectedProject?.id || 0)}
//               >
//                 <Trash2 className="mr-2 h-4 w-4" />
//                 Delete Project
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Modales de crear/editar y ver */}
//       <div
//         className={`${
//           actionSelected === 'new' || actionSelected === 'edit'
//             ? ' translate-y-0 scale-100 bg-black/50 '
//             : ' translate-y-[200%] scale-50 bg-black/0 '
//         } fixed top-0 left-0 z-50 w-screen h-screen  flex items-center justify-center transition-all duration-300 ease-in-out`}
//       >
//         <ProjectForm
//           projectData={selectedProject || undefined}
//           onClose={() => {
//             setActionSelected('close')
//             handleProjectChange()
//           }}
//         />
//       </div>

//       <div
//         className={`${
//           actionSelected === 'view'
//             ? ' translate-y-0 scale-100 '
//             : ' translate-y-[200%] scale-50 '
//         } fixed top-0 left-0 z-50 w-screen h-screen bg-black/50 flex items-center justify-center transition-all duration-300 ease-in-out`}
//       >
//         <ProjectDataModal
//           projectData={selectedProject}
//           onClose={() => setActionSelected('close')}
//         />
//       </div>
//     </div>
//   )
// }

// const ProjectForm = ({
//   projectData,
//   onClose,
// }: {
//   projectData?: ProjectData
//   onClose: () => void
// }) => {
//   const { userId, accessToken, fullName } = useCurrentUser()
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   // Project Data
//   const [projectName, setProjectName] = useState<ProjectData['name']>('')
//   const [client_name, setclient_name] = useState<ProjectData['client_name']>('')
//   const [elevations, setElevations] = useState<Elevation[]>([])
//   const [repairTypes, setRepairTypes] = useState<ProjectData['repair_types']>(
//     []
//   )
//   const [technicians, setTechnicians] = useState<ProjectData['technicians']>([])
//   const [status, setStatus] = useState<ProjectData['status']>('pending')
//   const [newElevation, setNewElevation] = useState<Elevation>({
//     name: '',
//     drops: 0,
//     levels: 0,
//   })

//   // Estado para el valor común de levels (si sameLevelsForAll es true)
//   const [commonLevels, setCommonLevels] = useState<number>(0)
//   // Estado para el checkbox "Same levels for all elevations"
//   const [sameLevelsForAll, setSameLevelsForAll] = useState<boolean>(false)

//   // Estados para manejar dinámicamente repairTypes
//   const [newRepairType, setNewRepairType] = useState<
//     Partial<ProjectRepairType>
//   >({
//     repair_type_id: 0,
//     repair_type: '',
//     phases: 3,
//     price: 0,
//     minimum_charge_per_repair: 0,
//     minimum_charge_per_drop: 0,
//     unit_to_charge: '',
//     status: 'active',
//   })
//   const [editingIndex, setEditingIndex] = useState<number | null>(null) // Índice del repairType que se está editando

//   // Estados para manejar dinámicamente technicians
//   const [newTechnician, setNewTechnician] = useState<
//     Partial<TechnicianAssignment>
//   >({
//     technician_id: 0,
//     technician_first_name: '',
//     technician_last_name: '',
//     technician_avatar: '',
//   })

//   const [editingTechnicianIndex, setEditingTechnicianIndex] = useState<
//     number | null
//   >(null)

//   // Zustand stores
//   // const { updateProject } = useProjectsListStore()
//   const { repairTypeList } = useRepairTypeStore()
//   //const { technicians: technicianList } = useTechniciansStore()

//   // Manejador para agregar una elevation
//   const handleAddElevation = () => {
//     if (elevations.length > 20) {
//       toast.error('Maximum 20 elevations allowed', {
//         duration: 3000,
//         position: 'bottom-right',
//         style: {
//           background: 'red',
//           color: '#fff',
//           fontWeight: 'bold',
//           fontSize: '16px',
//         },
//       })
//       return
//     }
//     if (
//       !newElevation.name ||
//       newElevation.drops! <= 0 ||
//       (newElevation.levels! <= 0 && !sameLevelsForAll)
//     ) {
//       toast.error('Please fill in all elevation fields with valid values', {
//         duration: 3000,
//         position: 'bottom-right',
//         style: {
//           background: 'red',
//           color: '#fff',
//           fontWeight: 'bold',
//           fontSize: '16px',
//         },
//       })
//       return
//     }

//     const elevationToAdd: Elevation = {
//       name: newElevation.name!,
//       drops: newElevation.drops!,
//       levels: sameLevelsForAll ? commonLevels : newElevation.levels!,
//     }

//     setElevations([...elevations, elevationToAdd])
//     setNewElevation({ name: '', drops: 0, levels: 0 }) // Resetear el formulario de elevation
//   }

//   // Manejador para eliminar una elevation
//   const handleRemoveElevation = (index: number) => {
//     setElevations(elevations.filter((_, i) => i !== index))
//   }

//   // Manejador para el checkbox
//   const handleSameLevelsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const isChecked = e.target.checked
//     setSameLevelsForAll(isChecked)

//     if (isChecked) {
//       // Si se marca "same levels", aplicamos el valor común a todas las elevations existentes
//       setElevations(
//         elevations.map((elevation) => ({ ...elevation, levels: commonLevels }))
//       )
//       setNewElevation({ ...newElevation, levels: commonLevels })
//     }
//   }

//   // Manejador para actualizar el valor común de levels
//   const handleCommonLevelsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = Number(e.target.value)
//     setCommonLevels(value)

//     if (sameLevelsForAll) {
//       // Actualizamos todas las elevations existentes y el formulario de nueva elevation
//       setElevations(
//         elevations.map((elevation) => ({ ...elevation, levels: value }))
//       )
//       setNewElevation({ ...newElevation, levels: value })
//     }
//   }

//   // Manejador para seleccionar un tipo de reparación
//   const handleRepairTypeChange = (repairID: string) => {
//     const selectedRepairType = repairTypeList.find(
//       (repairType) => repairType.id === Number(repairID)
//     )
//     if (selectedRepairType) {
//       setNewRepairType({
//         ...newRepairType,
//         repair_type_id: selectedRepairType.id,
//         repair_type: selectedRepairType.type,
//         unit_to_charge: selectedRepairType.unit_to_charge,
//       })
//     }
//   }

//   // Manejador para agregar o actualizar un tipo de reparación
//   const handleAddOrUpdateRepairType = () => {
//     if (
//       !newRepairType.repair_type_id ||
//       newRepairType.phases! < 3 ||
//       newRepairType.phases! > 10 ||
//       newRepairType.price! <= 0
//     ) {
//       toast.error('Please fill in all repair type fields with valid values', {
//         duration: 3000,
//         position: 'bottom-right',
//         style: {
//           background: 'red',
//           color: '#fff',
//           fontWeight: 'bold',
//           fontSize: '16px',
//         },
//       })
//       return
//     }

//     const repairTypeToAdd: ProjectRepairType = {
//       repair_type_id: newRepairType.repair_type_id!,
//       repair_type: newRepairType.repair_type!,
//       phases: newRepairType.phases!,
//       price: newRepairType.price!,
//       unit_to_charge: newRepairType.unit_to_charge!,
//       minimum_charge_per_repair: newRepairType.minimum_charge_per_repair!,
//       minimum_charge_per_drop: newRepairType.minimum_charge_per_drop!,
//       status: newRepairType.status!,
//     }

//     if (editingIndex !== null) {
//       // Modo edición: actualizamos el elemento existente
//       const updatedRepairTypes = [...repairTypes]
//       updatedRepairTypes[editingIndex] = repairTypeToAdd
//       setRepairTypes(updatedRepairTypes)
//       setEditingIndex(null) // Salimos del modo edición
//     } else {
//       // Modo agregar: añadimos un nuevo elemento
//       setRepairTypes([...repairTypes, repairTypeToAdd])
//     }

//     // Reseteamos el formulario
//     setNewRepairType({
//       repair_type_id: 0,
//       repair_type: '',
//       phases: 3,
//       price: 0,
//       minimum_charge_per_repair: 0,
//       minimum_charge_per_drop: 0,
//       unit_to_charge: '',
//       status: 'active',
//     })
//   }

//   // Manejador para eliminar un tipo de reparación
//   const handleRemoveRepairType = (index: number) => {
//     setRepairTypes(repairTypes.filter((_, i) => i !== index))
//   }

//   // Manejador para editar un tipo de reparación
//   const handleEditRepairType = (index: number) => {
//     setEditingIndex(index)
//     setNewRepairType({ ...repairTypes[index] })
//   }

//   // Manejador para cancelar la edición
//   const handleCancelEditRepairType = () => {
//     setEditingIndex(null)
//     setNewRepairType({
//       repair_type_id: 0,
//       repair_type: '',
//       phases: 3,
//       price: 0,
//       minimum_charge_per_repair: 0,
//       minimum_charge_per_drop: 0,
//       unit_to_charge: '',
//       status: 'active',
//     })
//   }

//   // Manejador para seleccionar un técnico
//   const handleTechnicianChange = (technicianIDStringed: string) => {
//     const selectedId = Number(technicianIDStringed)
//     const selectedTechnician = techniciansList.find(
//       (tech) => tech.id === selectedId
//     )

//     if (selectedTechnician) {
//       setNewTechnician({
//         technician_id: selectedId,
//         technician_first_name: selectedTechnician.first_name,
//         technician_last_name: selectedTechnician.last_name,
//         technician_avatar: selectedTechnician.avatar,
//       })
//     }
//   }
//   {
//     /* Manejador para agregar un técnico */
//   }

//   // Manejador para agregar o actualizar un técnico
//   const handleAddOrUpdateTechnician = () => {
//     if (!newTechnician.technician_id) {
//       toast.error('Please select a technician', {
//         duration: 5000,
//         position: 'bottom-right',
//         style: {
//           background: 'red',
//           color: '#fff',
//           fontWeight: 'bold',
//           fontSize: '16px',
//         },
//       })
//       return
//     }

//     const technicianToAdd: TechnicianAssignment = {
//       technician_id: newTechnician.technician_id!,
//       technician_first_name: newTechnician.technician_first_name!,
//       technician_last_name: newTechnician.technician_last_name!,
//       technician_avatar: newTechnician.technician_avatar!,
//     }

//     if (editingTechnicianIndex !== null) {
//       const updatedTechnicians = [...technicians]
//       updatedTechnicians[editingTechnicianIndex] = technicianToAdd
//       setTechnicians(updatedTechnicians)
//       setEditingTechnicianIndex(null)
//     } else {
//       setTechnicians([...technicians, technicianToAdd])
//     }

//     setNewTechnician({
//       technician_id: 0,
//       technician_first_name: '',
//       technician_last_name: '',
//       technician_avatar: '',
//     })
//   }

//   // Manejador para eliminar un técnico
//   const handleRemoveTechnician = (index: number) => {
//     setTechnicians(technicians.filter((_, i) => i !== index))
//   }

//   // Manejador para editar un técnico
//   const handleEditTechnician = (index: number) => {
//     setEditingTechnicianIndex(index)
//     setNewTechnician({ ...technicians[index] })
//   }

//   // Manejador para cancelar la edición de un técnico
//   const handleCancelEditTechnician = () => {
//     setEditingTechnicianIndex(null)
//     setNewTechnician({
//       technician_id: 0,
//       technician_first_name: '',
//       technician_last_name: '',
//       technician_avatar: '',
//     })
//   }

//   // Manejador para enviar el formulario
//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault()
//     setIsSubmitting(true)

//     if (!accessToken) {
//       toast.error('You`re not logged in', {
//         description: 'You must be logged in to create a project',
//         duration: 5000,
//         position: 'bottom-right',
//         style: {
//           background: 'red',
//           color: '#fff',
//           fontWeight: 'bold',
//           fontSize: '16px',
//         },
//       })
//       setIsSubmitting(false)
//       return
//     }
//     if (client_name === '') {
//       toast.error('Client is required', {
//         description: 'Please select a client',
//         duration: 5000,
//         position: 'bottom-right',
//         style: {
//           background: 'red',
//           color: '#fff',
//           fontWeight: 'bold',
//           fontSize: '16px',
//         },
//       })
//       setIsSubmitting(false)
//       return
//     }

//     if (elevations.length < 1) {
//       toast.error('Elevations are required', {
//         description: 'At least 1 elevation is required',
//         duration: 5000,
//         position: 'bottom-right',
//         style: {
//           background: 'red',
//           color: '#fff',
//           fontWeight: 'bold',
//           fontSize: '16px',
//         },
//       })
//       setIsSubmitting(false)
//       return
//     }

//     if (sameLevelsForAll && commonLevels <= 0) {
//       toast.error('Invalid number of levels', {
//         description: 'Please enter a valid number of levels for all elevations',
//         duration: 5000,
//         position: 'bottom-right',
//         style: {
//           background: 'red',
//           color: '#fff',
//           fontWeight: 'bold',
//           fontSize: '16px',
//         },
//       })
//       setIsSubmitting(false)
//       return
//     }

//     try {
//       if (projectData) {
//         // // Modo edicion - Usando Zustand por ahora
//         // const updatedProject: ProjectData = {
//         //   id: projectData.id,
//         //   name: projectName,
//         //   client_name,
//         //   client_id: clientList.find((client) => client.name === client_name)!
//         //     .id,
//         //   elevations: elevations || [],
//         //   repair_types: repairTypes,
//         //   technicians,
//         //   //googleDriveUrl,
//         //   status,
//         //   created_by_user_name: projectData.created_by_user_name,
//         //   created_by_user_id: projectData.created_by_user_id,
//         //   created_at: projectData.created_at,
//         //   updated_at: Date.now().toLocaleString('en-NZ'),
//         // }
//         // updateProject(updatedProject) // usando Zustand actualmente
//         // 🔧 MODO EDICIÓN - Usar API en lugar de Zustand
//         console.log('Updating project via API:', projectData.id)

//         const result = await updateProjectViaAPI(
//           projectData.id,
//           {
//             name: projectName,
//             client_name: client_name,
//             client_id: clientList.find((client) => client.name === client_name)!
//               .id,
//             status,
//             elevations: elevations || [],
//             repair_types: repairTypes || [],
//             technicians: technicians || [],
//           },
//           accessToken
//         )

//         if (!result.success) {
//           toast.error(result.error || 'Failed to update project', {
//             duration: 5000,
//             position: 'bottom-right',
//             style: {
//               background: 'red',
//               color: '#fff',
//               fontWeight: 'bold',
//               fontSize: '16px',
//             },
//           })
//           setIsSubmitting(false)
//           return
//         }

//         toast.success('Project updated successfully', {
//           description: `"${projectName}" has been updated`,
//           duration: 3000,
//           position: 'bottom-right',
//           style: {
//             background: 'green',
//             color: '#fff',
//             fontWeight: 'bold',
//             fontSize: '16px',
//           },
//         })
//       } else {
//         // Modo creación - usar el nuevo endpoint
//         const result = await createProjectViaAPI(
//           {
//             name: projectName,
//             client_name: client_name,
//             client_id: clientList.find((client) => client.name === client_name)!
//               .id,
//             status,
//             elevations,
//             repair_types: repairTypes,
//             technicians,
//             created_by_user_id: userId || 0,
//             created_by_user_name: fullName || 'Unknown User',
//           },
//           accessToken
//         ) // Usar token del usuario actual

//         if (!result.success) {
//           toast.error(result.error || 'Failed to create project', {
//             duration: 5000,
//             position: 'bottom-right',
//             style: {
//               background: 'red',
//               color: '#fff',
//               fontWeight: 'bold',
//               fontSize: '16px',
//             },
//           })
//           setIsSubmitting(false)
//           return
//         }

//         toast.success('Project created successfully', {
//           duration: 5000,
//           position: 'bottom-right',
//           style: {
//             background: 'green',
//             color: '#fff',
//             fontWeight: 'bold',
//             fontSize: '16px',
//           },
//         })
//       }
//     } catch (error) {
//       console.error('Error submitting project:', error)
//       toast.error('Failed to submit project', {
//         description: `Error: ${error}`,
//         duration: 5000,
//         position: 'bottom-right',
//         style: {
//           background: 'red',
//           color: '#fff',
//           fontWeight: 'bold',
//           fontSize: '16px',
//         },
//       })
//     } finally {
//       resetFormData()
//       setIsSubmitting(false)
//       setTimeout(() => {
//         onClose()
//       }, 200)
//     }
//   }

//   const resetFormData = () => {
//     setProjectName('')
//     setclient_name('')
//     setStatus(PROJECT_STATUS['in-progress'])
//     setElevations([])
//     setRepairTypes([])
//     setTechnicians([])
//     setSameLevelsForAll(false)
//     setCommonLevels(0)
//     setEditingTechnicianIndex(null)
//     setNewTechnician({
//       technician_id: 0,
//       technician_first_name: '',
//       technician_last_name: '',
//       technician_avatar: '',
//     })
//     setEditingTechnicianIndex(null)
//   }

//   useEffect(() => {
//     if (projectData) {
//       setProjectName(projectData.name)
//       setclient_name(projectData.client_name)
//       setStatus(projectData.status)
//       setElevations(projectData.elevations)
//       setRepairTypes(projectData.repair_types)
//       setTechnicians(projectData.technicians)
//       // setGoogleDriveUrl(projectData.googleDriveUrl)
//     } else {
//       resetFormData()
//     }
//   }, [projectData])

//   return (
//     <div
//       className={`relative w-[95%] max-w-screen-lg h-[90%] mx-auto overflow-y-scroll rounded-lg border bg-white p-6 shadow-sm`}
//     >
//       <Button
//         type="button"
//         onClick={onClose}
//         className="absolute top-6 right-6 w-8 h-8 bg-neutral-900 text-white hover:bg-neutral-600 rounded-md"
//       >
//         <XIcon className="h-6 w-6 stroke-3" />
//       </Button>
//       <h2 className="mb-4 text-center text-xl font-semibold">
//         {projectData ? 'Edit Project' : 'Create a new Project'}
//       </h2>

//       <form className=" grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
//         <h3 className=" col-span-2 mb-0 text-lg font-semibold">Project Data</h3>
//         <div>
//           <Label>Project Name</Label>
//           <Input
//             placeholder="Enter project name"
//             value={projectName}
//             onChange={(e) => setProjectName(e.target.value)}
//           />
//         </div>
//         {/* Client Project */}
//         <div>
//           <Label htmlFor="client">Client</Label>
//           <Select
//             name="client"
//             value={client_name}
//             onValueChange={(e) => {
//               setclient_name(e as string)
//             }}
//           >
//             <SelectTrigger>
//               <SelectValue placeholder="Select client" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value={clientList[0].name}>
//                 {clientList[0].name}
//               </SelectItem>
//               <SelectItem value={clientList[1].name}>
//                 {clientList[1].name}
//               </SelectItem>
//               <SelectItem value={clientList[2].name}>
//                 {clientList[2].name}
//               </SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Status Project */}
//         <div className=" col-span-2">
//           <Label>Status</Label>
//           <Select
//             defaultValue={'pending'}
//             value={status}
//             onValueChange={(e) => {
//               setStatus(e as ProjectData['status'])
//             }}
//           >
//             <SelectTrigger>
//               <SelectValue placeholder="Select status" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="pending" defaultChecked>
//                 Pending
//               </SelectItem>
//               <SelectItem value="in-progress">In Progress</SelectItem>
//               <SelectItem value="completed">Completed</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         <Separator className=" w-full col-span-2 mt-4" />
//         <h3 className=" col-span-2 mb-1 text-lg font-semibold">Parameters</h3>

//         {/* Elevations */}
//         <div className=" col-span-2">
//           <h3 className="text-lg font-medium">Elevations (1 min - 20 max)</h3>
//           <p className="text-sm text-muted-foreground">
//             Add elevations to the project
//           </p>

//           <div className="col-span-2 h-20 flex items-center justify-between">
//             {/* Checkbox para "Same levels for all elevations" */}
//             <div className="flex items-center space-x-2 mb-4">
//               <Input
//                 id="sameLevels"
//                 type="checkbox"
//                 checked={sameLevelsForAll}
//                 onChange={
//                   elevations.length === 0 ? handleSameLevelsChange : () => {}
//                 }
//                 className="h-4 w-4"
//               />
//               <Label htmlFor="sameLevels">Same levels for all elevations</Label>
//             </div>
//             {/* Campo para el valor común de levels (si el checkbox está marcado) */}
//             {sameLevelsForAll && (
//               <div className="mb-4">
//                 <Label>Common Levels for All Elevations</Label>
//                 <Input
//                   type="number"
//                   value={commonLevels || ''}
//                   onChange={
//                     elevations.length === 0
//                       ? handleCommonLevelsChange
//                       : () => {}
//                   }
//                   placeholder="Levels (e.g., 7)"
//                   min="1"
//                   className={`${
//                     elevations.length === 0
//                       ? ' pointer-events-auto '
//                       : ' pointer-events-none '
//                   } `}
//                 />
//               </div>
//             )}
//           </div>

//           {/* Elevations list */}
//           <div className="space-y-2">
//             {elevations.map((elevation, index) => (
//               <div key={index} className="flex space-x-2 items-center">
//                 <div className="flex items-center gap-6 border p-2 rounded">
//                   <span className=" font-bold">{elevation.name}</span>
//                   <span>{elevation.drops} drops</span>
//                   <span>{elevation.levels} levels</span>
//                 </div>
//                 <Button
//                   type="button"
//                   onClick={() => handleRemoveElevation(index)}
//                   className="flex items-center gap-2 bg-red-500 text-white hover:bg-red-600 rounded"
//                 >
//                   <Trash2Icon className="h-4 w-4" />
//                   Remove
//                 </Button>
//               </div>
//             ))}
//           </div>
//           {elevations.length < 6 && (
//             <div className="flex items-end space-x-2 mt-2">
//               <div className=" w-full">
//                 <Label htmlFor="elevationName">Elevation Name</Label>
//                 <Input
//                   name="elevationName"
//                   type="text"
//                   value={newElevation.name}
//                   onChange={(e) =>
//                     setNewElevation({
//                       ...newElevation,
//                       name: e.target.value,
//                     })
//                   }
//                   placeholder="(e.g., North, Street Name...)"
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="drops">Drops</Label>
//                 <Input
//                   name="drops"
//                   type="number"
//                   value={newElevation.drops || ''}
//                   onChange={(e) =>
//                     setNewElevation({
//                       ...newElevation,
//                       drops: Number(e.target.value),
//                     })
//                   }
//                   placeholder="8"
//                   min="1"
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="levels">Levels</Label>
//                 <Input
//                   type="number"
//                   name="levels"
//                   value={newElevation.levels || commonLevels || ''}
//                   onChange={(e) =>
//                     setNewElevation({
//                       ...newElevation,
//                       levels: Number(e.target.value),
//                     })
//                   }
//                   disabled={sameLevelsForAll && commonLevels !== 0}
//                   placeholder="5"
//                   min="1"
//                 />
//               </div>
//               <Button
//                 type="button"
//                 onClick={handleAddElevation}
//                 className="bg-green-600 hover:bg-green-500 focus:outline-blue-500 text-white px-4 py-2 rounded"
//               >
//                 Add Elevation
//               </Button>
//             </div>
//           )}
//           <div className=" w-full my-4 flex items-center gap-10">
//             <p className=" text-sm text-muted-foreground">
//               Elevations: {elevations.length}
//             </p>
//             <p className=" text-sm text-muted-foreground">
//               Total Drops: {elevations.reduce((total, e) => total + e.drops, 0)}
//             </p>
//             {sameLevelsForAll && (
//               <p className=" text-sm text-muted-foreground">
//                 Levels by Elevation: {commonLevels}
//               </p>
//             )}
//           </div>
//         </div>

//         <Separator className=" w-full col-span-2 mt-4" />

//         {/* Reparations list */}
//         <div className=" col-span-2">
//           <h3 className=" col-span-2 mb-1 text-lg font-semibold">
//             Reparation Types
//           </h3>

//           {/* Lista de repairTypes existentes */}
//           <div className="space-y-2">
//             {repairTypes &&
//               repairTypes.map((rt, index) => (
//                 <div
//                   key={index}
//                   className=" p-2 flex items-center justify-between border rounded-lg"
//                 >
//                   <div className=" flex items-center gap-2">
//                     <div className=" flex items-center gap-2">
//                       <span className="  bg-neutral-700 text-white font-semibold px-2 py-1 border rounded-md">
//                         {rt.repair_type}
//                       </span>
//                       <span>
//                         {
//                           repairTypeList.find((r) => r.id === rt.repair_type_id)
//                             ?.variation
//                         }{' '}
//                         {repairTypeList.find((r) => r.id === rt.repair_type_id)
//                           ?.unit_measure?.default_values?.depth ? (
//                           <span>
//                             (
//                             {
//                               repairTypeList.find(
//                                 (r) => r.id === rt.repair_type_id
//                               )?.unit_measure?.default_values?.depth
//                             }{' '}
//                             mm)
//                           </span>
//                         ) : null}
//                       </span>
//                     </div>
//                     <Separator
//                       orientation="vertical"
//                       className="w-0.5 h-6 bg-neutral-300"
//                     />

//                     <div className=" flex items-center gap-2">
//                       <span>{rt.phases} phases</span>
//                       <Separator
//                         orientation="vertical"
//                         className="w-0.5 h-6 bg-neutral-300"
//                       />
//                       <span>
//                         ${rt.price} ({rt.unit_to_charge})
//                       </span>
//                     </div>
//                     <Separator
//                       orientation="vertical"
//                       className="w-0.5 h-6 bg-neutral-300"
//                     />
//                     <span
//                       className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
//                         rt.status === PROJECT_STATUS['completed']
//                           ? 'bg-green-100 text-green-800'
//                           : rt.status === PROJECT_STATUS['in-progress']
//                           ? 'bg-blue-100 text-blue-800'
//                           : 'bg-yellow-100 text-yellow-800'
//                       }`}
//                     >
//                       {rt.status}
//                     </span>
//                   </div>

//                   <div className=" flex items-center gap-2">
//                     <Button
//                       type="button"
//                       onClick={() => handleEditRepairType(index)}
//                       className="flex items-center gap-1 bg-blue-500 text-white hover:bg-blue-600 text-xs rounded"
//                     >
//                       <Pencil className="h-3 w-3" />
//                       Edit
//                     </Button>
//                     <Button
//                       type="button"
//                       onClick={() => handleRemoveRepairType(index)}
//                       className="flex items-center gap-2 bg-red-500 text-white hover:bg-red-600 rounded"
//                     >
//                       <Trash2Icon className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </div>
//               ))}
//           </div>

//           {/* Formulario para agregar un nuevo repairType */}
//           <div className="flex flex-col gap-4 mt-8 p-2 border rounded-lg">
//             <div className="flex items-end gap-4">
//               <div className="w-2/3 text-black">
//                 <Label htmlFor="repairType">Repair Type</Label>
//                 <Select
//                   name="repairType"
//                   value={`${newRepairType.repair_type_id}`}
//                   onValueChange={(e) => handleRepairTypeChange(e)}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select repair type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {repairTypeList
//                       .filter((r) => r.status === 'active')
//                       .map((repair) => (
//                         <SelectItem
//                           key={repair.id}
//                           value={`${repair.id}`}
//                           disabled={repairTypes
//                             .map((rt) => rt.repair_type_id)
//                             .includes(repair.id)}
//                         >
//                           {repair.variation} ({repair.type})
//                         </SelectItem>
//                       ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Status Repair Selector */}
//               {/* <div className=" w-1/3">
//                 <Label htmlFor="repairStatus">Status</Label>
//                 <Select
//                   name="repairStatus"
//                   value={newRepairType.status || ''}
//                   onValueChange={(e) => {
//                     // setStatus(e as RepairStatusType)
//                     setNewRepairType({
//                       ...newRepairType,
//                       status: e as RepairStatusType,
//                     })
//                   }}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select status" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {REPAIR_STATUS_OPTIONS.map((status) => (
//                       <SelectItem key={status} value={status}>
//                         {status}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div> */}

//               <div className=" space-x-2 ">
//                 <Label htmlFor="phases">Phases (3-10):</Label>
//                 <Input
//                   id="phases"
//                   type="number"
//                   value={newRepairType.phases || ''}
//                   onChange={(e) =>
//                     setNewRepairType({
//                       ...newRepairType,
//                       phases: Number(e.target.value),
//                     })
//                   }
//                   placeholder="Phases (3-10)"
//                   min="3"
//                   max="10"
//                   className=" w-28"
//                 />
//               </div>
//               <div className="">
//                 <Label htmlFor="price">Price:</Label>
//                 <div className="flex items-center gap-2">
//                   <Input
//                     id="price"
//                     type="number"
//                     value={newRepairType.price || ''}
//                     onChange={(e) =>
//                       setNewRepairType({
//                         ...newRepairType,
//                         price: Number(e.target.value),
//                       })
//                     }
//                     placeholder="Price"
//                     min="0"
//                   />
//                   {newRepairType.unit_to_charge && (
//                     <span>/{newRepairType.unit_to_charge}</span>
//                   )}
//                 </div>
//               </div>
//             </div>
//             <div className=" flex justify-between">
//               {/* Minimum Charge per Repair */}
//               <div className="">
//                 <Label htmlFor="minChargePerRepair">
//                   Min Charge per Repair:
//                 </Label>
//                 <div className="flex items-center gap-2">
//                   <Input
//                     id="minChargePerRepair"
//                     type="number"
//                     value={newRepairType.minimum_charge_per_repair || ''}
//                     onChange={(e) =>
//                       setNewRepairType({
//                         ...newRepairType,
//                         minimum_charge_per_repair: Number(e.target.value),
//                       })
//                     }
//                     placeholder="MC/R"
//                     min="1"
//                   />
//                   {newRepairType.unit_to_charge && (
//                     <span>/{newRepairType.unit_to_charge}</span>
//                   )}
//                 </div>
//               </div>
//               {/* Minimum Charge per Drop */}
//               <div className="">
//                 <Label htmlFor="minChargePerDrop">Min Charge per Drop:</Label>
//                 <div className="flex items-center gap-2">
//                   <Input
//                     id="minChargePerDrop"
//                     type="number"
//                     value={newRepairType.minimum_charge_per_drop || ''}
//                     onChange={(e) =>
//                       setNewRepairType({
//                         ...newRepairType,
//                         minimum_charge_per_drop: Number(e.target.value),
//                       })
//                     }
//                     placeholder="MC/D"
//                     min="1"
//                   />
//                   {newRepairType.unit_to_charge && (
//                     <span>/{newRepairType.unit_to_charge}</span>
//                   )}
//                 </div>
//               </div>

//               <Button
//                 type="button"
//                 onClick={handleAddOrUpdateRepairType}
//                 className="bg-green-600 hover:bg-green-500 focus:outline-blue-500 text-white px-4 py-2 rounded"
//               >
//                 {editingIndex !== null ? 'Update' : 'Add'} Repair Type
//               </Button>
//               {editingIndex !== null && (
//                 <Button
//                   type="button"
//                   onClick={handleCancelEditRepairType}
//                   className="bg-gray-500 text-white px-4 py-2 rounded"
//                 >
//                   Cancel
//                 </Button>
//               )}
//             </div>
//           </div>
//         </div>

//         <Separator className=" w-full col-span-2 mt-4" />

//         {/* Technicians */}
//         <div className=" col-span-2">
//           <h3 className=" col-span-2 mb-1 text-lg font-semibold">
//             Technicians
//           </h3>

//           {/* Lista de technicians existentes */}
//           <div className="space-y-2">
//             {technicians &&
//               technicians.map((tech, index) => (
//                 <div
//                   key={index}
//                   className="flex space-x-2 items-center justify-between p-2 border rounded-lg"
//                 >
//                   <div className=" flex items-center gap-2">
//                     <Avatar>
//                       <AvatarImage src={tech.technician_avatar} />
//                       <AvatarFallback className="bg-orange-100 text-orange-800">
//                         {tech.technician_first_name.charAt(0)}
//                         {tech.technician_last_name.charAt(0)}
//                       </AvatarFallback>
//                     </Avatar>
//                     <span className=" ">
//                       {tech.technician_first_name} {tech.technician_last_name}{' '}
//                       (ID: {tech.technician_id})
//                     </span>
//                   </div>
//                   <div className=" flex items-center gap-2">
//                     <Button
//                       type="button"
//                       onClick={() => handleEditTechnician(index)}
//                       className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-xs text-white rounded"
//                     >
//                       <Pencil className="h-3 w-3" />
//                       Edit
//                     </Button>
//                     <Button
//                       type="button"
//                       onClick={() => handleRemoveTechnician(index)}
//                       className="bg-red-500 hover:bg-red-600 text-white rounded"
//                     >
//                       <Trash2Icon className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </div>
//               ))}
//           </div>

//           {/* Formulario para agregar/editar un técnico */}
//           <div className="flex items-end gap-4 mt-2">
//             <div className="w-full ">
//               <Label htmlFor="technician">Add New Technician</Label>
//               <Select
//                 name="technician"
//                 value={
//                   newTechnician.technician_id !== 0
//                     ? `${newTechnician.technician_id}`
//                     : ''
//                 }
//                 onValueChange={(e) => handleTechnicianChange(e)}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select Technician" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {techniciansList.map((tech) => (
//                     <SelectItem
//                       key={tech.id}
//                       value={`${tech.id}`}
//                       disabled={technicians
//                         .map((tech) => tech.technician_id)
//                         .includes(tech.id)}
//                     >
//                       {tech.first_name} {tech.last_name} (ID: {tech.id})
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <Button
//               type="button"
//               onClick={handleAddOrUpdateTechnician}
//               className="bg-green-600 hover:bg-green-500 focus:outline-blue-500 text-white px-4 py-2 rounded"
//             >
//               {editingTechnicianIndex !== null ? 'Update' : 'Add'} Technician
//             </Button>
//             {editingTechnicianIndex !== null && (
//               <Button
//                 type="button"
//                 onClick={handleCancelEditTechnician}
//                 className="bg-gray-500 text-white px-4 py-2 rounded"
//               >
//                 Cancel
//               </Button>
//             )}
//           </div>
//         </div>

//         <Separator className=" w-full col-span-2 mt-4" />
//         <div className="space-x-2 sm:col-span-2">
//           <Button
//             className="mt-4 bg-green-600 text-white hover:bg-green-500"
//             type="submit"
//             disabled={isSubmitting}
//           >
//             {isSubmitting ? (
//               <>
//                 <span className="mr-2">Creating...</span>
//                 {/* Puedes agregar un spinner aquí */}
//                 <span className=" w-14 h-14 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
//               </>
//             ) : projectData ? (
//               'Update Project'
//             ) : (
//               'Create Project'
//             )}
//           </Button>
//           <Button
//             type="button"
//             className="mt-4 bg-neutral-900 text-white hover:bg-neutral-700"
//             onClick={onClose}
//             disabled={isSubmitting}
//           >
//             Close
//           </Button>
//         </div>
//       </form>
//     </div>
//   )
// }

const ProjectDataModal = ({
  projectData,
  onClose,
}: {
  projectData?: ProjectData | null
  onClose: () => void
}) => {
  const { repairTypeList } = useRepairTypeStore()

  if (!projectData) return null

  return (
    <div
      className={`relative w-full max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 
        h-[90vh] sm:h-[95vh] mx-auto overflow-y-auto rounded-lg border bg-white 
        p-3 sm:p-4 md:p-6 shadow-lg`}
    >
      <Button
        type="button"
        onClick={onClose}
        className="absolute top-2 right-2 sm:top-4 sm:right-4 md:top-6 md:right-6 
          w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-neutral-900 text-white 
          hover:bg-neutral-600 rounded-md p-0 z-10"
      >
        <XIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 stroke-2" />
      </Button>

      <h2 className="mb-4 sm:mb-6 text-center text-lg sm:text-xl md:text-2xl font-semibold pr-8">
        Project Data
      </h2>

      <div className="space-y-4 sm:space-y-6">
        {/* Project Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          {/* Project Name */}
          <div className="flex-1">
            <Label className="text-xs sm:text-sm">Project Name</Label>
            <h3 className="text-base sm:text-lg md:text-xl font-semibold break-words">
              {projectData?.name}
            </h3>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 
                text-xs font-medium mt-1 ${
                  projectData?.status === PROJECT_STATUS['completed']
                    ? 'bg-green-100 text-green-800'
                    : projectData?.status === PROJECT_STATUS['in-progress']
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
            >
              {projectData?.status}
            </span>
          </div>

          {/* Client Project */}
          <div className="flex-1 sm:text-right">
            <Label className="text-xs sm:text-sm">Client</Label>
            <p className="text-base sm:text-lg md:text-xl font-semibold break-words">
              {projectData?.client_name}
            </p>
          </div>
        </div>

        {/* Created & Updated Information */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 
          p-3 sm:p-4 bg-gray-50 rounded-lg"
        >
          <div>
            <Label className="text-xs sm:text-sm font-medium">Created By</Label>
            <p className="text-sm sm:text-base break-words">
              {projectData?.created_by_user_name}
            </p>
            <p className="text-xs text-muted-foreground">
              ID: {projectData?.created_by_user_id}
            </p>
          </div>

          <div>
            <Label className="text-xs sm:text-sm font-medium">Created At</Label>
            <p className="text-sm sm:text-base">
              {new Date(projectData?.created_at || '').toLocaleDateString(
                'en-US',
                {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                }
              )}
            </p>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <Label className="text-xs sm:text-sm font-medium">
              Last Updated
            </Label>
            <p className="text-sm sm:text-base">
              {projectData?.updated_at.split('T')[0] || 'Date Unknown'}
            </p>
          </div>
        </div>

        <Separator className="w-full" />

        {/* Elevations */}
        <div>
          <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">
            Elevations
            <span className="text-xs sm:text-sm text-muted-foreground ml-2">
              (1 min - 6 max)
            </span>
          </h3>

          {projectData && projectData?.elevations && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {projectData?.elevations.map((elevation, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-3 sm:p-4 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="space-y-1 sm:space-y-2">
                      <h4 className="font-bold text-sm sm:text-base break-words">
                        {elevation.name}
                      </h4>
                      <div className="flex flex-col xs:flex-row xs:gap-4 gap-1 text-xs sm:text-sm text-muted-foreground">
                        <span>{elevation.drops} drops</span>
                        <span>{elevation.levels} levels</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
                <div className="flex flex-col xs:flex-row xs:gap-6 gap-2 text-xs sm:text-sm text-blue-700">
                  <span className="font-medium">
                    Elevations: {projectData?.elevations?.length}
                  </span>
                  <span className="font-medium">
                    Total Drops:{' '}
                    {projectData?.elevations?.reduce(
                      (total, e) => total + e.drops,
                      0
                    )}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <Separator className="w-full" />

        {/* Repair Types */}
        <div>
          <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">
            Repair Types
          </h3>

          <div className="space-y-3 sm:space-y-4">
            {projectData?.repair_types &&
              projectData?.repair_types?.length > 0 &&
              projectData?.repair_types?.map((rt, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 sm:p-4 bg-white hover:bg-gray-50 transition-colors"
                >
                  {/* Header with type and status */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full w-2 h-2 sm:w-3 sm:h-3 ${
                          rt.status === 'active'
                            ? 'bg-green-400'
                            : 'bg-yellow-400'
                        }`}
                      ></span>
                      <span
                        className="bg-neutral-700 text-white font-semibold px-2 py-1 
                        rounded-md text-xs sm:text-sm"
                      >
                        {rt.repair_type}
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm text-muted-foreground">
                      <span className="font-medium">
                        {
                          repairTypeList.find((r) => r.id === rt.repair_type_id)
                            ?.variation
                        }
                      </span>
                      {repairTypeList.find((r) => r.id === rt.repair_type_id)
                        ?.unit_measure?.default_values?.depth && (
                        <span className="ml-1">
                          (
                          {
                            repairTypeList.find(
                              (r) => r.id === rt.repair_type_id
                            )?.unit_measure?.default_values?.depth
                          }{' '}
                          mm)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details grid */}
                  <div
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 
                    text-xs sm:text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Phases</span>
                      <span className="font-medium">{rt.phases}</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-medium">${rt.price}</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Unit</span>
                      <span className="font-medium">{rt.unit_to_charge}</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-muted-foreground">MC/R</span>
                      <span className="font-medium">
                        {rt.minimum_charge_per_repair}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-muted-foreground">MC/D</span>
                      <span className="font-medium">
                        {rt.minimum_charge_per_drop}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <Separator className="w-full" />

        {/* Technicians */}
        <div>
          <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">
            Technicians
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {projectData?.technicians &&
              projectData?.technicians?.length > 0 &&
              projectData?.technicians?.map((tech, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 sm:p-4 border rounded-lg 
                    bg-white hover:bg-gray-50 transition-colors"
                >
                  <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                    <AvatarImage src={tech.technician_avatar} />
                    <AvatarFallback className="bg-orange-100 text-orange-800 text-xs sm:text-sm">
                      {tech.technician_first_name.charAt(0)}
                      {tech.technician_last_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">
                      {tech.technician_first_name} {tech.technician_last_name}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      ID: {tech.technician_id}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <Separator className="w-full" />

        {/* Close Button */}
        <div className="flex justify-center sm:justify-end pt-2">
          <Button
            type="button"
            className="w-full sm:w-auto bg-neutral-900 text-white hover:bg-neutral-700 
              px-6 py-2 sm:px-8 sm:py-3"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

{
  /* Old ProjectDataModal component without responsive */
}
// const ProjectDataModal = ({
//   projectData,
//   onClose,
// }: {
//   projectData?: ProjectData | null
//   onClose: () => void
// }) => {
//   const { repairTypeList } = useRepairTypeStore()

//   if (!projectData) return null

//   return (
//     <div
//       className={`relative w-full max-w-screen-lg h-[95%] mx-auto overflow-y-scroll rounded-lg border bg-white p-6 shadow-sm`}
//     >
//       <Button
//         type="button"
//         onClick={onClose}
//         className="absolute top-6 right-6 w-8 h-8 bg-neutral-900 text-white hover:bg-neutral-600 rounded-md"
//       >
//         <XIcon className="h-6 w-6 stroke-3" />
//       </Button>
//       <h2 className="mb-4 text-center text-xl font-semibold">Project Data</h2>
//       <div className="grid gap-4 grid-cols-2">
//         <div className="col-span-2 flex items-center justify-between">
//           {/* Project Name */}
//           <div>
//             <Label>Project Name</Label>
//             <h3 className="text-lg font-semibold">{projectData?.name}</h3>
//             <span
//               className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
//                 projectData?.status === PROJECT_STATUS['completed']
//                   ? 'bg-green-100 text-green-800'
//                   : projectData?.status === PROJECT_STATUS['in-progress']
//                   ? 'bg-blue-100 text-blue-800'
//                   : 'bg-yellow-100 text-yellow-800'
//               }`}
//             >
//               {projectData?.status}
//             </span>
//           </div>

//           {/* Client Project */}
//           <div>
//             <Label>Client</Label>
//             <p className="text-lg font-semibold">{projectData?.client_name}</p>
//           </div>
//         </div>

//         {/* Created & Updated */}
//         <div className="col-span-2 grid grid-cols-2">
//           <div>
//             <Label>Created By</Label>
//             <p>
//               {projectData?.created_by_user_name} (ID:{' '}
//               {projectData?.created_by_user_id})
//             </p>
//           </div>

//           <div>
//             <Label>Created At</Label>
//             <p>
//               {new Date(projectData?.created_at || '').toLocaleDateString(
//                 'en-US',
//                 {
//                   day: 'numeric',
//                   month: 'long',
//                   year: 'numeric',
//                 }
//               )}
//             </p>
//           </div>

//           <div className=" mt-4 sm:mt-0">
//             <Label>Last Updated</Label>
//             <p>{projectData?.updated_at.split('T')[0] || 'Date Unknown'}</p>
//           </div>
//         </div>

//         <Separator className=" w-full col-span-2 mt-4" />

//         {/* Elevations */}
//         <div className=" col-span-2">
//           <h3 className="text-lg font-medium">Elevations (1 min - 6 max)</h3>

//           {/* Elevations list */}
//           {projectData && projectData?.elevations && (
//             <>
//               <div className="flex flex-wrap gap-4 ">
//                 {projectData?.elevations.map((elevation, index) => (
//                   <div key={index} className="flex space-x-2 items-center">
//                     <div className="flex items-center gap-6 border p-2 rounded">
//                       <span className=" font-bold">{elevation.name}</span>
//                       <span>{elevation.drops} drops</span>
//                       <span>{elevation.levels} levels</span>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <div className=" w-full mt-6 mb-0 flex items-center gap-10">
//                 <p className=" text-sm text-muted-foreground">
//                   Elevations: {projectData?.elevations?.length}
//                 </p>
//                 <p className=" text-sm text-muted-foreground">
//                   Total Drops:{' '}
//                   {projectData?.elevations?.reduce(
//                     (total, e) => total + e.drops,
//                     0
//                   )}
//                 </p>
//               </div>
//             </>
//           )}
//         </div>

//         <Separator className=" w-full col-span-2 mt-4" />

//         {/* Reparations list */}
//         <div className=" col-span-2">
//           <h3 className=" col-span-2 mb-1 text-lg font-semibold">
//             Reparation Types
//           </h3>

//           {/* Lista de repairTypes existentes */}
//           <div className="space-y-2">
//             {projectData?.repair_types &&
//               projectData?.repair_types?.length > 0 &&
//               projectData?.repair_types?.map((rt, index) => (
//                 <div
//                   key={index}
//                   className=" p-2 grid grid-cols-2 gap-4 border rounded-lg"
//                 >
//                   <div className=" grid grid-cols-2 gap-2">
//                     <div className="col-span-1 flex gap-2 items-center">
//                       <span
//                         className={`  rounded-full size-3 -mr-2 ${
//                           rt.status === 'active'
//                             ? 'bg-green-400'
//                             : 'bg-yellow-400'
//                         }`}
//                       ></span>
//                       <span className="  bg-neutral-700 text-white font-semibold px-2 py-1 border rounded-md">
//                         {rt.repair_type}
//                       </span>
//                     </div>

//                     <span>
//                       {
//                         repairTypeList.find((r) => r.id === rt.repair_type_id)
//                           ?.variation
//                       }{' '}
//                       {repairTypeList.find((r) => r.id === rt.repair_type_id)
//                         ?.unit_measure?.default_values?.depth ? (
//                         <span>
//                           (
//                           {
//                             repairTypeList.find(
//                               (r) => r.id === rt.repair_type_id
//                             )?.unit_measure?.default_values?.depth
//                           }{' '}
//                           mm)
//                         </span>
//                       ) : null}
//                     </span>
//                   </div>
//                   <Separator
//                     orientation="vertical"
//                     className="w-0.5 h-6 bg-neutral-300"
//                   />
//                   <div className=" flex items-center gap-2">
//                     <span>{rt.phases} phases</span>
//                     <Separator
//                       orientation="vertical"
//                       className="w-0.5 h-6 bg-neutral-300"
//                     />
//                     <span>
//                       ${rt.price} ({rt.unit_to_charge})
//                     </span>
//                     <Separator
//                       orientation="vertical"
//                       className="w-0.5 h-6 bg-neutral-300"
//                     />
//                     <span>MC/R: {rt.minimum_charge_per_repair}</span>
//                     <Separator
//                       orientation="vertical"
//                       className="w-0.5 h-6 bg-neutral-300"
//                     />
//                     <span>MC/D: {rt.minimum_charge_per_drop}</span>
//                   </div>

//                   {/* <Separator
//                     orientation="vertical"
//                     className="w-0.5 h-6 bg-neutral-300"
//                   />
//                   <span
//                     className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
//                       rt.status === 'active'
//                         ? 'bg-green-100 text-green-800'
//                         : 'bg-yellow-100 text-yellow-800'
//                     }`}
//                   >
//                     {rt.status}
//                   </span> */}
//                 </div>
//               ))}
//           </div>
//         </div>

//         <Separator className=" w-full col-span-2 mt-4" />

//         {/* Technicians */}
//         <div className=" col-span-2">
//           <h3 className=" col-span-2 mb-1 text-lg font-semibold">
//             Technicians
//           </h3>

//           {/* Lista de technicians existentes */}
//           <div className="space-y-2">
//             {projectData?.technicians &&
//               projectData?.technicians?.length > 0 &&
//               projectData?.technicians?.map((tech, index) => (
//                 <div
//                   key={index}
//                   className="flex space-x-2 items-center justify-between p-2 border rounded-lg"
//                 >
//                   <div className=" flex items-center gap-2">
//                     <Avatar>
//                       <AvatarImage src={tech.technician_avatar} />
//                       <AvatarFallback className="bg-orange-100 text-orange-800">
//                         {tech.technician_first_name.charAt(0)}
//                         {tech.technician_last_name.charAt(0)}
//                       </AvatarFallback>
//                     </Avatar>
//                     <span className=" ">
//                       {tech.technician_first_name} {tech.technician_last_name}{' '}
//                       (ID: {tech.technician_id})
//                     </span>
//                   </div>
//                 </div>
//               ))}
//           </div>
//         </div>

//         <Separator className=" w-full col-span-2 mt-4" />

//         <div className="space-x-2 sm:col-span-2">
//           <Button
//             type="button"
//             className="mt-4 bg-neutral-900 text-white hover:bg-neutral-700"
//             onClick={onClose}
//           >
//             Close
//           </Button>
//         </div>
//       </div>
//     </div>
//   )
// }
