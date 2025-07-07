// src/components/pages/manager/projects-page.tsx

'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRepairTypeStore } from '@/stores/repair-type-store'
import { useCurrentUser } from '@/stores/user-store'
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
  FolderPlus,
  Edit,
  XIcon,
  Trash2Icon,
  Pencil,
  Trash2,
  MessageSquareWarning,
  Eye,
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

export default function ManagerProjectsPage() {
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

  // Obtener clientes únicos de los proyectos
  // const uniqueClients = useMemo(
  //   () => [...new Set(projectsList.map((p) => p.client_name))],
  //   [projectsList]
  // )

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

  return (
    <div className="relative flex flex-col gap-8">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Projects
            {filteredAndSortedProjects.length !== projectsList.length && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                (Showing {filteredAndSortedProjects.length} of{' '}
                {projectsList.length})
              </span>
            )}
          </h2>
          <Button
            className="bg-green-600 text-white hover:bg-green-500"
            onClick={() => {
              setSelectedProject(null)
              setActionSelected('new')
            }}
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>

        <ProjectsFilter
          onFilter={handleFilter}
          onSort={handleSort}
          // clients={uniqueClients}
        />

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2 text-gray-600">Loading projects...</span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-medium">Error loading projects:</p>
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

        {/* Projects table */}
        {!isLoading && !error && (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Created by</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Repairs</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created at</TableHead>
                    <TableHead>Updated at</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedProjects.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center py-8 text-gray-500"
                      >
                        {projectsList.length === 0
                          ? 'No projects found. Create your first project!'
                          : 'No projects found matching the current filters'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedProjects.map((project) => (
                      <TableRow key={project?.id}>
                        <TableCell className="font-medium">
                          {project?.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {project?.name}
                        </TableCell>
                        <TableCell>{project?.created_by_user_name}</TableCell>
                        <TableCell>{project?.client_name}</TableCell>
                        <TableCell>
                          {project?.repair_types?.map((repair) => (
                            <span
                              key={`${project.id}-${repair.repair_type}`}
                              className="mx-1 px-2 py-0.5 bg-neutral-500 text-white rounded-md"
                            >
                              {repair.repair_type}
                            </span>
                          ))}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              project.status === PROJECT_STATUS['completed']
                                ? 'bg-green-100 text-green-800'
                                : project.status ===
                                  PROJECT_STATUS['in-progress']
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {project.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {project?.created_at.split('T')[0]}
                        </TableCell>
                        <TableCell>
                          {project?.updated_at.split('T')[0]}
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:bg-green-100 hover:text-green-700"
                            onClick={() => {
                              setSelectedProject(project)
                              setActionSelected('view')
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-500 hover:bg-blue-100 hover:text-blue-600"
                            onClick={() => {
                              setSelectedProject(project)
                              setActionSelected('edit')
                            }}
                            disabled={
                              project.status === PROJECT_STATUS['completed']
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:bg-red-100 hover:text-red-600"
                            onClick={() => {
                              setMessageAdvice('delete')
                              setSelectedProject(project)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination - Solo mostrar para todos los proyectos, no los filtrados */}
            {pagination &&
              pagination.totalPages > 1 &&
              filteredAndSortedProjects.length === projectsList.length && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-700">
                    Showing {(currentPage - 1) * (pagination.limit || 20) + 1}{' '}
                    to{' '}
                    {Math.min(
                      currentPage * (pagination.limit || 20),
                      pagination.total
                    )}{' '}
                    of {pagination.total} projects
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

      {/* Modal de confirmación de eliminación */}
      <div
        className={`${
          messageAdvice !== null
            ? ' translate-y-0 scale-100 '
            : ' translate-y-[200%] scale-50 '
        } fixed top-0 left-0 z-50 w-screen h-screen bg-black/50 flex items-center justify-center transition-all duration-300 ease-in-out`}
      >
        {messageAdvice === 'delete' && (
          <div className="w-2/3 max-w-[500px] flex flex-col gap-4 bg-white p-6 shadow-sm rounded-lg">
            <MessageSquareWarning className="h-12 w-12 text-red-500" />
            <p className="text-lg font-medium">
              Are you sure you want to delete this project?
            </p>
            <p className="text-sm text-gray-500">
              This action cannot be undone. If you delete this project, all
              associated data will also be deleted permanently.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm font-medium text-gray-700">
                Project ID:{' '}
                <span className="font-bold text-red-600">
                  {selectedProject?.id}
                </span>
              </p>
              <p className="text-sm font-medium text-gray-700">
                Project Name:{' '}
                <span className="font-bold text-red-600">
                  {selectedProject?.name}
                </span>
              </p>
              <p className="text-sm font-medium text-gray-700">
                Client:{' '}
                <span className="font-bold text-red-600">
                  {selectedProject?.client_name}
                </span>
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setMessageAdvice(null)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 bg-red-500 text-white hover:bg-red-600"
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
        } fixed top-0 left-0 z-50 w-screen h-screen  flex items-center justify-center transition-all duration-300 ease-in-out`}
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
        } fixed top-0 left-0 z-50 w-screen h-screen bg-black/50 flex items-center justify-center transition-all duration-300 ease-in-out`}
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
  // const { updateProject } = useProjectsListStore()
  const { repairTypeList } = useRepairTypeStore()
  //const { technicians: technicianList } = useTechniciansStore()

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
  {
    /* Manejador para agregar un técnico */
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
        // // Modo edicion - Usando Zustand por ahora
        // const updatedProject: ProjectData = {
        //   id: projectData.id,
        //   name: projectName,
        //   client_name,
        //   client_id: clientList.find((client) => client.name === client_name)!
        //     .id,
        //   elevations: elevations || [],
        //   repair_types: repairTypes,
        //   technicians,
        //   //googleDriveUrl,
        //   status,
        //   created_by_user_name: projectData.created_by_user_name,
        //   created_by_user_id: projectData.created_by_user_id,
        //   created_at: projectData.created_at,
        //   updated_at: Date.now().toLocaleString('en-NZ'),
        // }
        // updateProject(updatedProject) // usando Zustand actualmente
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
      // setGoogleDriveUrl(projectData.googleDriveUrl)
    } else {
      resetFormData()
    }
  }, [projectData])

  return (
    <div
      className={`relative w-[95%] max-w-screen-lg h-[95%] mx-auto overflow-y-scroll rounded-lg border bg-white p-6 shadow-sm`}
    >
      <Button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 w-fit bg-neutral-900 text-white hover:bg-neutral-600 rounded-md"
      >
        <XIcon className="h-6 w-6 stroke-3" />
      </Button>
      <h2 className="mb-4 text-center text-xl font-semibold">
        {projectData ? 'Edit Project' : 'Create a new Project'}
      </h2>

      <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        <h3 className=" col-span-2 mb-0 text-lg font-semibold">Project Data</h3>
        <div>
          <Label>Project Name</Label>
          <Input
            placeholder="Enter project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>
        {/* Client Project */}
        <div>
          <Label htmlFor="client">Client</Label>
          <Select
            name="client"
            value={client_name}
            onValueChange={(e) => {
              setclient_name(e as string)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={clientList[0].name}>
                {clientList[0].name}
              </SelectItem>
              <SelectItem value={clientList[1].name}>
                {clientList[1].name}
              </SelectItem>
              <SelectItem value={clientList[2].name}>
                {clientList[2].name}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Project */}
        <div className=" col-span-2">
          <Label>Status</Label>
          <Select
            defaultValue={'pending'}
            value={status}
            onValueChange={(e) => {
              setStatus(e as ProjectData['status'])
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending" defaultChecked>
                Pending
              </SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator className=" w-full col-span-2 mt-4" />
        <h3 className=" col-span-2 mb-1 text-lg font-semibold">Parameters</h3>

        {/* Elevations */}
        <div className=" col-span-2">
          <h3 className="text-lg font-medium">Elevations (1 min - 20 max)</h3>
          <p className="text-sm text-muted-foreground">
            Add elevations to the project
          </p>

          <div className="col-span-2 h-20 flex items-center justify-between">
            {/* Checkbox para "Same levels for all elevations" */}
            <div className="flex items-center space-x-2 mb-4">
              <Input
                id="sameLevels"
                type="checkbox"
                checked={sameLevelsForAll}
                onChange={
                  elevations.length === 0 ? handleSameLevelsChange : () => {}
                }
                className="h-4 w-4"
              />
              <Label htmlFor="sameLevels">Same levels for all elevations</Label>
            </div>
            {/* Campo para el valor común de levels (si el checkbox está marcado) */}
            {sameLevelsForAll && (
              <div className="mb-4">
                <Label>Common Levels for All Elevations</Label>
                <Input
                  type="number"
                  value={commonLevels || ''}
                  onChange={
                    elevations.length === 0
                      ? handleCommonLevelsChange
                      : () => {}
                  }
                  placeholder="Levels (e.g., 7)"
                  min="1"
                  className={`${
                    elevations.length === 0
                      ? ' pointer-events-auto '
                      : ' pointer-events-none '
                  } `}
                />
              </div>
            )}
          </div>

          {/* Elevations list */}
          <div className="space-y-2">
            {elevations.map((elevation, index) => (
              <div key={index} className="flex space-x-2 items-center">
                <div className="flex items-center gap-6 border p-2 rounded">
                  <span className=" font-bold">{elevation.name}</span>
                  <span>{elevation.drops} drops</span>
                  <span>{elevation.levels} levels</span>
                </div>
                <Button
                  type="button"
                  onClick={() => handleRemoveElevation(index)}
                  className="flex items-center gap-2 bg-red-500 text-white hover:bg-red-600 rounded"
                >
                  <Trash2Icon className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            ))}
          </div>
          {elevations.length < 6 && (
            <div className="flex items-end space-x-2 mt-2">
              <div className=" w-full">
                <Label htmlFor="elevationName">Elevation Name</Label>
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
                  placeholder="(e.g., North, Street Name...)"
                />
              </div>
              <div>
                <Label htmlFor="drops">Drops</Label>
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
                />
              </div>
              <div>
                <Label htmlFor="levels">Levels</Label>
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
                  disabled={sameLevelsForAll && commonLevels !== 0}
                  placeholder="5"
                  min="1"
                />
              </div>
              <Button
                type="button"
                onClick={handleAddElevation}
                className="bg-green-600 hover:bg-green-500 focus:outline-blue-500 text-white px-4 py-2 rounded"
              >
                Add Elevation
              </Button>
            </div>
          )}
          <div className=" w-full my-4 flex items-center gap-10">
            <p className=" text-sm text-muted-foreground">
              Elevations: {elevations.length}
            </p>
            <p className=" text-sm text-muted-foreground">
              Total Drops: {elevations.reduce((total, e) => total + e.drops, 0)}
            </p>
            {sameLevelsForAll && (
              <p className=" text-sm text-muted-foreground">
                Levels by Elevation: {commonLevels}
              </p>
            )}
          </div>
        </div>

        <Separator className=" w-full col-span-2 mt-4" />

        {/* Reparations list */}
        <div className=" col-span-2">
          <h3 className=" col-span-2 mb-1 text-lg font-semibold">
            Reparation Types
          </h3>

          {/* Lista de repairTypes existentes */}
          <div className="space-y-2">
            {repairTypes &&
              repairTypes.map((rt, index) => (
                <div
                  key={index}
                  className=" p-2 flex items-center justify-between border rounded-lg"
                >
                  <div className=" flex items-center gap-2">
                    <div className=" flex items-center gap-2">
                      <span className="  bg-neutral-700 text-white font-semibold px-2 py-1 border rounded-md">
                        {rt.repair_type}
                      </span>
                      <span>
                        {
                          repairTypeList.find((r) => r.id === rt.repair_type_id)
                            ?.variation
                        }{' '}
                        {repairTypeList.find((r) => r.id === rt.repair_type_id)
                          ?.unit_measure?.default_values?.depth ? (
                          <span>
                            (
                            {
                              repairTypeList.find(
                                (r) => r.id === rt.repair_type_id
                              )?.unit_measure?.default_values?.depth
                            }{' '}
                            mm)
                          </span>
                        ) : null}
                      </span>
                    </div>
                    <Separator
                      orientation="vertical"
                      className="w-0.5 h-6 bg-neutral-300"
                    />

                    <div className=" flex items-center gap-2">
                      <span>{rt.phases} phases</span>
                      <Separator
                        orientation="vertical"
                        className="w-0.5 h-6 bg-neutral-300"
                      />
                      <span>
                        ${rt.price} ({rt.unit_to_charge})
                      </span>
                    </div>
                    <Separator
                      orientation="vertical"
                      className="w-0.5 h-6 bg-neutral-300"
                    />
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        rt.status === PROJECT_STATUS['completed']
                          ? 'bg-green-100 text-green-800'
                          : rt.status === PROJECT_STATUS['in-progress']
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {rt.status}
                    </span>
                  </div>

                  <div className=" flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={() => handleEditRepairType(index)}
                      className="flex items-center gap-1 bg-blue-500 text-white hover:bg-blue-600 text-xs rounded"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleRemoveRepairType(index)}
                      className="flex items-center gap-2 bg-red-500 text-white hover:bg-red-600 rounded"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>

          {/* Formulario para agregar un nuevo repairType */}
          <div className="flex flex-col gap-4 mt-8 p-2 border rounded-lg">
            <div className="flex items-end gap-4">
              <div className="w-2/3 text-black">
                <Label htmlFor="repairType">Repair Type</Label>
                <Select
                  name="repairType"
                  value={`${newRepairType.repair_type_id}`}
                  onValueChange={(e) => handleRepairTypeChange(e)}
                >
                  <SelectTrigger>
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

              {/* Status Repair Selector */}
              {/* <div className=" w-1/3">
                <Label htmlFor="repairStatus">Status</Label>
                <Select
                  name="repairStatus"
                  value={newRepairType.status || ''}
                  onValueChange={(e) => {
                    // setStatus(e as RepairStatusType)
                    setNewRepairType({
                      ...newRepairType,
                      status: e as RepairStatusType,
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPAIR_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}

              <div className=" space-x-2 ">
                <Label htmlFor="phases">Phases (3-10):</Label>
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
                  placeholder="Phases (3-10)"
                  min="3"
                  max="10"
                  className=" w-28"
                />
              </div>
              <div className="">
                <Label htmlFor="price">Price:</Label>
                <div className="flex items-center gap-2">
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
                    placeholder="Price"
                    min="0"
                  />
                  {newRepairType.unit_to_charge && (
                    <span>/{newRepairType.unit_to_charge}</span>
                  )}
                </div>
              </div>
            </div>
            <div className=" flex justify-between">
              {/* Minimum Charge per Repair */}
              <div className="">
                <Label htmlFor="minChargePerRepair">
                  Min Charge per Repair:
                </Label>
                <div className="flex items-center gap-2">
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
                    placeholder="MC/R"
                    min="1"
                  />
                  {newRepairType.unit_to_charge && (
                    <span>/{newRepairType.unit_to_charge}</span>
                  )}
                </div>
              </div>
              {/* Minimum Charge per Drop */}
              <div className="">
                <Label htmlFor="minChargePerDrop">Min Charge per Drop:</Label>
                <div className="flex items-center gap-2">
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
                    placeholder="MC/D"
                    min="1"
                  />
                  {newRepairType.unit_to_charge && (
                    <span>/{newRepairType.unit_to_charge}</span>
                  )}
                </div>
              </div>

              <Button
                type="button"
                onClick={handleAddOrUpdateRepairType}
                className="bg-green-600 hover:bg-green-500 focus:outline-blue-500 text-white px-4 py-2 rounded"
              >
                {editingIndex !== null ? 'Update' : 'Add'} Repair Type
              </Button>
              {editingIndex !== null && (
                <Button
                  type="button"
                  onClick={handleCancelEditRepairType}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>

        <Separator className=" w-full col-span-2 mt-4" />

        {/* Technicians */}
        <div className=" col-span-2">
          <h3 className=" col-span-2 mb-1 text-lg font-semibold">
            Technicians
          </h3>

          {/* Lista de technicians existentes */}
          <div className="space-y-2">
            {technicians &&
              technicians.map((tech, index) => (
                <div
                  key={index}
                  className="flex space-x-2 items-center justify-between p-2 border rounded-lg"
                >
                  <div className=" flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={tech.technician_avatar} />
                      <AvatarFallback className="bg-orange-100 text-orange-800">
                        {tech.technician_first_name.charAt(0)}
                        {tech.technician_last_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className=" ">
                      {tech.technician_first_name} {tech.technician_last_name}{' '}
                      (ID: {tech.technician_id})
                    </span>
                  </div>
                  <div className=" flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={() => handleEditTechnician(index)}
                      className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-xs text-white rounded"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleRemoveTechnician(index)}
                      className="bg-red-500 hover:bg-red-600 text-white rounded"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>

          {/* Formulario para agregar/editar un técnico */}
          <div className="flex items-end gap-4 mt-2">
            <div className="w-full ">
              <Label htmlFor="technician">Add New Technician</Label>
              <Select
                name="technician"
                value={
                  newTechnician.technician_id !== 0
                    ? `${newTechnician.technician_id}`
                    : ''
                }
                onValueChange={(e) => handleTechnicianChange(e)}
              >
                <SelectTrigger>
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
            <Button
              type="button"
              onClick={handleAddOrUpdateTechnician}
              className="bg-green-600 hover:bg-green-500 focus:outline-blue-500 text-white px-4 py-2 rounded"
            >
              {editingTechnicianIndex !== null ? 'Update' : 'Add'} Technician
            </Button>
            {editingTechnicianIndex !== null && (
              <Button
                type="button"
                onClick={handleCancelEditTechnician}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>

        <Separator className=" w-full col-span-2 mt-4" />
        <div className="space-x-2 sm:col-span-2">
          <Button
            className="mt-4 bg-green-600 text-white hover:bg-green-500"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2">Creating...</span>
                {/* Puedes agregar un spinner aquí */}
                <span className=" w-14 h-14 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              </>
            ) : projectData ? (
              'Update Project'
            ) : (
              'Create Project'
            )}
          </Button>
          <Button
            type="button"
            className="mt-4 bg-neutral-900 text-white hover:bg-neutral-700"
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
      className={`relative w-2/5 h-[95%] mx-auto overflow-y-scroll rounded-lg border bg-white p-6 shadow-sm`}
    >
      <Button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 w-fit bg-neutral-900 text-white hover:bg-neutral-600 rounded-md"
      >
        <XIcon className="h-6 w-6 stroke-3" />
      </Button>
      <h2 className="mb-4 text-center text-xl font-semibold">Project Data</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="col-span-2 flex items-center justify-between">
          {/* Project Name */}
          <div>
            <Label>Project Name</Label>
            <h3 className="text-lg font-semibold">{projectData?.name}</h3>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
          <div>
            <Label>Client</Label>
            <p className="text-lg font-semibold">{projectData?.client_name}</p>
          </div>
        </div>

        {/* Created & Updated */}
        <div className="col-span-2 flex items-start justify-between">
          <div>
            <Label>Created By</Label>
            <p>
              {projectData?.created_by_user_name} (ID:{' '}
              {projectData?.created_by_user_id})
            </p>
          </div>
          <div>
            <Label>Created At</Label>
            <p>
              {new Date(projectData?.created_at || '').toLocaleDateString(
                'en-US',
                {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }
              )}
            </p>
          </div>
          <div>
            <Label>Last Updated</Label>
            <p>{projectData?.updated_at.split('T')[0] || 'Date Unknown'}</p>
          </div>
        </div>

        <Separator className=" w-full col-span-2 mt-4" />

        {/* Elevations */}
        <div className=" col-span-2">
          <h3 className="text-lg font-medium">Elevations (1 min - 6 max)</h3>

          {/* Elevations list */}
          {projectData && projectData?.elevations && (
            <>
              <div className="flex flex-wrap gap-4 ">
                {projectData?.elevations.map((elevation, index) => (
                  <div key={index} className="flex space-x-2 items-center">
                    <div className="flex items-center gap-6 border p-2 rounded">
                      <span className=" font-bold">{elevation.name}</span>
                      <span>{elevation.drops} drops</span>
                      <span>{elevation.levels} levels</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className=" w-full mt-6 mb-0 flex items-center gap-10">
                <p className=" text-sm text-muted-foreground">
                  Elevations: {projectData?.elevations?.length}
                </p>
                <p className=" text-sm text-muted-foreground">
                  Total Drops:{' '}
                  {projectData?.elevations?.reduce(
                    (total, e) => total + e.drops,
                    0
                  )}
                </p>
              </div>
            </>
          )}
        </div>

        <Separator className=" w-full col-span-2 mt-4" />

        {/* Reparations list */}
        <div className=" col-span-2">
          <h3 className=" col-span-2 mb-1 text-lg font-semibold">
            Reparation Types
          </h3>

          {/* Lista de repairTypes existentes */}
          <div className="space-y-2">
            {projectData?.repair_types &&
              projectData?.repair_types?.length > 0 &&
              projectData?.repair_types?.map((rt, index) => (
                <div
                  key={index}
                  className=" p-2 flex items-center gap-4 border rounded-lg"
                >
                  <span
                    className={`inline-flex items-center rounded-full size-3 -mr-2 ${
                      rt.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
                    }`}
                  ></span>
                  <div className=" flex items-center gap-2">
                    <span className="  bg-neutral-700 text-white font-semibold px-2 py-1 border rounded-md">
                      {rt.repair_type}
                    </span>
                    <span>
                      {
                        repairTypeList.find((r) => r.id === rt.repair_type_id)
                          ?.variation
                      }{' '}
                      {repairTypeList.find((r) => r.id === rt.repair_type_id)
                        ?.unit_measure?.default_values?.depth ? (
                        <span>
                          (
                          {
                            repairTypeList.find(
                              (r) => r.id === rt.repair_type_id
                            )?.unit_measure?.default_values?.depth
                          }{' '}
                          mm)
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <Separator
                    orientation="vertical"
                    className="w-0.5 h-6 bg-neutral-300"
                  />
                  <div className=" flex items-center gap-2">
                    <span>{rt.phases} phases</span>
                    <Separator
                      orientation="vertical"
                      className="w-0.5 h-6 bg-neutral-300"
                    />
                    <span>
                      ${rt.price} ({rt.unit_to_charge})
                    </span>
                    <Separator
                      orientation="vertical"
                      className="w-0.5 h-6 bg-neutral-300"
                    />
                    <span>MC/R: {rt.minimum_charge_per_repair}</span>
                    <Separator
                      orientation="vertical"
                      className="w-0.5 h-6 bg-neutral-300"
                    />
                    <span>MC/D: {rt.minimum_charge_per_drop}</span>
                  </div>

                  {/* <Separator
                    orientation="vertical"
                    className="w-0.5 h-6 bg-neutral-300"
                  />
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      rt.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {rt.status}
                  </span> */}
                </div>
              ))}
          </div>
        </div>

        <Separator className=" w-full col-span-2 mt-4" />

        {/* Technicians */}
        <div className=" col-span-2">
          <h3 className=" col-span-2 mb-1 text-lg font-semibold">
            Technicians
          </h3>

          {/* Lista de technicians existentes */}
          <div className="space-y-2">
            {projectData?.technicians &&
              projectData?.technicians?.length > 0 &&
              projectData?.technicians?.map((tech, index) => (
                <div
                  key={index}
                  className="flex space-x-2 items-center justify-between p-2 border rounded-lg"
                >
                  <div className=" flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={tech.technician_avatar} />
                      <AvatarFallback className="bg-orange-100 text-orange-800">
                        {tech.technician_first_name.charAt(0)}
                        {tech.technician_last_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className=" ">
                      {tech.technician_first_name} {tech.technician_last_name}{' '}
                      (ID: {tech.technician_id})
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <Separator className=" w-full col-span-2 mt-4" />

        <div className="space-x-2 sm:col-span-2">
          <Button
            type="button"
            className="mt-4 bg-neutral-900 text-white hover:bg-neutral-700"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
