'use client'

import { useEffect, useState } from 'react'
import { useRepairTypeStore } from '@/stores/repair-type-store'
import { useProjectsListStore } from '@/stores/projects-list-store'
// import { useToast } from '@/hooks/use-toast'
// import { ToastAction } from '@/components/ui/toast'
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
  RepairStatusType,
  REPAIR_STATUS_OPTIONS,
} from '@/types/project-types'
import { Separator } from '@/components/ui/separator'
import { TechnicianType } from '@/types/roles-types'

import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ProjectsFilter } from '@/components/projects-filter'
import Link from 'next/link'

const clientList = [
  { id: 1, name: 'ABC Corporation' },
  { id: 2, name: 'XYZ Industries' },
  { id: 3, name: 'DEF Enterprises' },
  { id: 4, name: 'GHI Holdings' },
  { id: 5, name: 'JKL Enterprises' },
]

const techniciansList: TechnicianType[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'oT0Y4@example.com',
    role: 'Admin',
    createdDate: '2023-01-15',
    status: 'active',
    avatar: 'https://avatar.iran.liara.run/public/42',
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    role: 'Manager',
    createdDate: '2023-02-20',
    status: 'active',
    avatar: 'https://avatar.iran.liara.run/public/15',
  },
  {
    id: 3,
    firstName: 'Robert',
    lastName: 'Johnson',
    email: 'robert.johnson@example.com',
    role: 'Technician',
    createdDate: '2023-03-10',
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
  // Zustand stores
  const { projectsList, deleteProject } = useProjectsListStore()

  return (
    <div className=" relative flex flex-col gap-8">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Projects</h2>
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

        <ProjectsFilter onFilter={() => {}} onSort={() => {}} />

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project ID</TableHead>
                <TableHead>Project Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Total Drops</TableHead>
                <TableHead>Elevations</TableHead>
                <TableHead>Repairs</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created at</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectsList.map((project) => (
                <TableRow key={project?.id}>
                  <TableCell className="font-medium">{project?.id}</TableCell>
                  <TableCell className="font-medium">{project?.name}</TableCell>
                  <TableCell>{project?.clientName}</TableCell>
                  <TableCell>
                    {project?.elevations
                      ?.map((elevation) => elevation.drops)
                      ?.reduce((a, b) => a + b, 0)}
                  </TableCell>
                  {/* Elevations amount */}
                  <TableCell>{project?.elevations?.length}</TableCell>
                  {/* Repairs type */}
                  <TableCell>
                    {project?.repairTypes?.map((repair) => (
                      <span
                        key={`${project.id}-${repair.repairType}`}
                        className="mx-1 px-2 py-0.5 bg-neutral-500 text-white rounded-md"
                      >
                        {repair.repairType}
                      </span>
                    ))}
                  </TableCell>
                  {/* Status */}
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        project.status === PROJECT_STATUS['completed']
                          ? 'bg-green-100 text-green-800'
                          : project.status === PROJECT_STATUS['in-progress']
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {project.status}
                    </span>
                  </TableCell>
                  {/* Created At */}
                  <TableCell>
                    {new Date(project?.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </TableCell>
                  {/* Actions (View - Edit - Delete)*/}
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
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

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
              associated data will also be deleted.
            </p>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Project ID:{' '}
                <span className="font-bold">{selectedProject?.id}</span>
              </p>
              <p className="text-sm font-medium text-gray-500">
                Project Name:{' '}
                <span className="font-bold">{selectedProject?.name}</span>
              </p>
            </div>
            <Button onClick={() => setMessageAdvice(null)} variant="outline">
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-500 text-white hover:bg-red-400"
              onClick={() => {
                deleteProject(selectedProject?.id || 0)
                setMessageAdvice(null)
              }}
            >
              Confirm
            </Button>
          </div>
        )}
      </div>

      <div
        className={`${
          actionSelected === 'new' || actionSelected === 'edit'
            ? ' translate-y-0 scale-100 '
            : ' translate-y-[200%] scale-50 '
        } fixed top-0 left-0 z-50 w-screen h-screen bg-black/50 flex items-center justify-center transition-all duration-300 ease-in-out`}
      >
        <ProjectForm
          projectData={selectedProject || undefined}
          onClose={() => setActionSelected('close')}
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
  // Project Data
  const [projectName, setProjectName] = useState<ProjectData['name']>('')
  const [clientName, setClientName] = useState<ProjectData['clientName']>('')
  const [elevations, setElevations] = useState<Elevation[]>([])
  const [repairTypes, setRepairTypes] = useState<ProjectData['repairTypes']>([])
  const [technicians, setTechnicians] = useState<ProjectData['technicians']>([])
  const [googleDriveUrl, setGoogleDriveUrl] =
    useState<ProjectData['googleDriveUrl']>('')
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
    repairTypeId: 0,
    repairType: '',
    phases: 3,
    price: 0,
    unitToCharge: '',
    status: 'active',
  })
  const [editingIndex, setEditingIndex] = useState<number | null>(null) // Índice del repairType que se está editando

  // Estados para manejar dinámicamente technicians
  const [newTechnician, setNewTechnician] = useState<
    Partial<TechnicianAssignment>
  >({
    technicianId: 0,
    technicianFirstName: '',
    technicianLastName: '',
    technicianAvatar: '',
  })

  const [editingTechnicianIndex, setEditingTechnicianIndex] = useState<
    number | null
  >(null)

  // Zustand stores
  const { projectsList, addProject, updateProject } = useProjectsListStore()
  const { repairTypeList } = useRepairTypeStore()
  //const { technicians: technicianList } = useTechniciansStore()

  // Manejador para agregar una elevation
  const handleAddElevation = () => {
    if (elevations.length >= 6) {
      alert('Maximum 6 elevations allowed')
      return
    }
    if (
      !newElevation.name ||
      newElevation.drops! <= 0 ||
      (newElevation.levels! <= 0 && !sameLevelsForAll)
    ) {
      alert('Please fill in all elevation fields with valid values')
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
        repairTypeId: selectedRepairType.id,
        repairType: selectedRepairType.type,
        unitToCharge: selectedRepairType.unitToCharge,
      })
    }
  }

  // Manejador para agregar o actualizar un tipo de reparación
  const handleAddOrUpdateRepairType = () => {
    if (
      !newRepairType.repairTypeId ||
      newRepairType.phases! < 3 ||
      newRepairType.phases! > 10 ||
      newRepairType.price! <= 0
    ) {
      alert('Please fill in all repair type fields with valid values')
      return
    }

    const repairTypeToAdd: ProjectRepairType = {
      repairTypeId: newRepairType.repairTypeId!,
      repairType: newRepairType.repairType!,
      phases: newRepairType.phases!,
      price: newRepairType.price!,
      unitToCharge: newRepairType.unitToCharge!,
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
      repairTypeId: 0,
      repairType: '',
      phases: 3,
      price: 0,
      unitToCharge: '',
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
      repairTypeId: 0,
      repairType: '',
      phases: 3,
      price: 0,
      unitToCharge: '',
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
        technicianId: selectedId,
        technicianFirstName: selectedTechnician.firstName,
        technicianLastName: selectedTechnician.lastName,
        technicianAvatar: selectedTechnician.avatar,
      })
    }
  }
  {
    /* Manejador para agregar un técnico */
  }

  // Manejador para agregar o actualizar un técnico
  const handleAddOrUpdateTechnician = () => {
    if (!newTechnician.technicianId) {
      alert('Please select a technician')
      return
    }

    const technicianToAdd: TechnicianAssignment = {
      technicianId: newTechnician.technicianId!,
      technicianFirstName: newTechnician.technicianFirstName!,
      technicianLastName: newTechnician.technicianLastName!,
      technicianAvatar: newTechnician.technicianAvatar!,
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
      technicianId: 0,
      technicianFirstName: '',
      technicianLastName: '',
      technicianAvatar: '',
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
      technicianId: 0,
      technicianFirstName: '',
      technicianLastName: '',
      technicianAvatar: '',
    })
  }

  // Manejador para enviar el formulario
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (elevations.length < 1) {
      alert('At least 1 elevation is required')
      return
    }

    if (sameLevelsForAll && commonLevels <= 0) {
      alert('Please enter a valid number of levels for all elevations')
      return
    }

    if (projectData) {
      const updatedProject: ProjectData = {
        id: projectData.id,
        name: projectName,
        clientName,
        clientId: clientList.find((client) => client.name === clientName)!.id,
        elevations,
        repairTypes,
        technicians,
        googleDriveUrl,
        status,
        createdByUserName: projectData.createdByUserName,
        createdByUserId: projectData.createdByUserId,
        createdAt: projectData.createdAt,
        updatedAt: Date.now(),
      }
      updateProject(updatedProject)
    } else {
      const newProject: ProjectData = {
        id: Number(projectsList.length + 1),
        name: projectName,
        clientName,
        clientId: clientList.find((client) => client.name === clientName)!.id,
        elevations,
        repairTypes,
        technicians,
        googleDriveUrl,
        status,
        createdByUserName: 'John Doe',
        createdByUserId: 123,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      addProject(newProject)
    }

    setTimeout(() => {
      onClose()
    }, 200)
  }

  useEffect(() => {
    if (projectData) {
      setProjectName(projectData.name)
      setClientName(projectData.clientName)
      setStatus(projectData.status)
      setElevations(projectData.elevations)
      setRepairTypes(projectData.repairTypes)
      setTechnicians(projectData.technicians)
      setGoogleDriveUrl(projectData.googleDriveUrl)
    } else {
      setProjectName('')
      setClientName('')
      setStatus(PROJECT_STATUS['in-progress'])
      setElevations([])
      setRepairTypes([])
      setTechnicians([])
      setGoogleDriveUrl('')
      setSameLevelsForAll(false)
      setCommonLevels(0)
      setEditingTechnicianIndex(null)
      setNewTechnician({
        technicianId: 0,
        technicianFirstName: '',
        technicianLastName: '',
        technicianAvatar: '',
      })
      setEditingTechnicianIndex(null)
    }
  }, [projectData])

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
      <h2 className="mb-4 text-center text-xl font-semibold">
        Create a new Project
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
            value={clientName}
            onValueChange={(e) => {
              setClientName(e as string)
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
          <h3 className="text-lg font-medium">Elevations (1 min - 6 max)</h3>
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
            {repairTypes.map((rt, index) => (
              <div
                key={index}
                className=" p-2 flex items-center justify-between border rounded-lg"
              >
                <div className=" flex items-center gap-2">
                  <div className=" flex items-center gap-2">
                    <span className="  bg-neutral-700 text-white font-semibold px-2 py-1 border rounded-md">
                      {rt.repairType}
                    </span>
                    <span>
                      {
                        repairTypeList.find((r) => r.id === rt.repairTypeId)
                          ?.variation
                      }{' '}
                      {repairTypeList.find((r) => r.id === rt.repairTypeId)
                        ?.unitMeasure?.defaultValues?.depth ? (
                        <span>
                          (
                          {
                            repairTypeList.find((r) => r.id === rt.repairTypeId)
                              ?.unitMeasure?.defaultValues?.depth
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
                      ${rt.price} ({rt.unitToCharge})
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
                  value={`${newRepairType.repairTypeId}`}
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
                            .map((rt) => rt.repairTypeId)
                            .includes(repair.id)}
                        >
                          {repair.variation} ({repair.type})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className=" w-1/3">
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
                    {/* <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress" defaultChecked>
                      In Progress
                    </SelectItem>
                    <SelectItem value="completed">Completed</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>

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
            </div>
            <div className=" flex justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="price">Price:</Label>
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
                {newRepairType.unitToCharge && (
                  <span>/{newRepairType.unitToCharge}</span>
                )}
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
            {technicians.map((tech, index) => (
              <div
                key={index}
                className="flex space-x-2 items-center justify-between p-2 border rounded-lg"
              >
                <div className=" flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={tech.technicianAvatar} />
                    <AvatarFallback className="bg-orange-100 text-orange-800">
                      {tech.technicianFirstName.charAt(0)}
                      {tech.technicianLastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className=" ">
                    {tech.technicianFirstName} {tech.technicianLastName} (ID:{' '}
                    {tech.technicianId})
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
                  newTechnician.technicianId !== 0
                    ? `${newTechnician.technicianId}`
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
                        .map((tech) => tech.technicianId)
                        .includes(tech.id)}
                    >
                      {tech.firstName} {tech.lastName} (ID: {tech.id})
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

        {/* Google Drive URL */}
        <div>
          <label className="block text-sm font-medium">Google Drive URL</label>
          <input
            type="text"
            value={googleDriveUrl}
            onChange={(e) => setGoogleDriveUrl(e.target.value)}
            placeholder="https://drive.google.com/folder/xyz"
            required
            className="border rounded p-2 w-full"
          />
        </div>

        <div className="space-x-2 sm:col-span-2">
          <Button
            className="mt-4 bg-green-600 text-white hover:bg-green-500"
            type="submit"
          >
            {projectData ? 'Update Project' : 'Create Project'}
          </Button>
          <Button
            type="button"
            className="mt-4 bg-neutral-900 text-white hover:bg-neutral-700"
            onClick={onClose}
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
            <p className="text-lg font-semibold">{projectData?.clientName}</p>
          </div>
        </div>

        {/* Created & Updated */}
        <div className="col-span-2 flex items-start justify-between">
          <div>
            <Label>Created By</Label>
            <p>
              {projectData?.createdByUserName} (ID:{' '}
              {projectData?.createdByUserId})
            </p>
          </div>
          <div>
            <Label>Created At</Label>
            <p>
              {new Date(projectData?.createdAt || '').toLocaleDateString(
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
            <p>
              {new Date(projectData?.updatedAt || '').toLocaleDateString(
                'en-US',
                {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true,
                }
              )}
            </p>
          </div>
        </div>

        <Separator className=" w-full col-span-2 mt-4" />

        {/* Elevations */}
        <div className=" col-span-2">
          <h3 className="text-lg font-medium">Elevations (1 min - 6 max)</h3>

          {/* Elevations list */}
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
        </div>

        <Separator className=" w-full col-span-2 mt-4" />

        {/* Reparations list */}
        <div className=" col-span-2">
          <h3 className=" col-span-2 mb-1 text-lg font-semibold">
            Reparation Types
          </h3>

          {/* Lista de repairTypes existentes */}
          <div className="space-y-2">
            {projectData?.repairTypes &&
              projectData?.repairTypes?.length > 0 &&
              projectData?.repairTypes?.map((rt, index) => (
                <div
                  key={index}
                  className=" p-2 flex items-center gap-4 border rounded-lg"
                >
                  <div className=" flex items-center gap-2">
                    <span className="  bg-neutral-700 text-white font-semibold px-2 py-1 border rounded-md">
                      {rt.repairType}
                    </span>
                    <span>
                      {
                        repairTypeList.find((r) => r.id === rt.repairTypeId)
                          ?.variation
                      }{' '}
                      {repairTypeList.find((r) => r.id === rt.repairTypeId)
                        ?.unitMeasure?.defaultValues?.depth ? (
                        <span>
                          (
                          {
                            repairTypeList.find((r) => r.id === rt.repairTypeId)
                              ?.unitMeasure?.defaultValues?.depth
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
                      ${rt.price} ({rt.unitToCharge})
                    </span>
                  </div>
                  <Separator
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
                  </span>
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
                      <AvatarImage src={tech.technicianAvatar} />
                      <AvatarFallback className="bg-orange-100 text-orange-800">
                        {tech.technicianFirstName.charAt(0)}
                        {tech.technicianLastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className=" ">
                      {tech.technicianFirstName} {tech.technicianLastName} (ID:{' '}
                      {tech.technicianId})
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <Separator className=" w-full col-span-2 mt-4" />

        {/* Google Drive URL */}
        <div>
          <label className="block text-sm font-medium">Google Drive URL</label>
          <Link
            href={projectData?.googleDriveUrl || ''}
            className=" text-sky-600 hover:underline hover:text-sky-500"
          >
            {projectData?.googleDriveUrl || 'No URL provided'}
          </Link>
        </div>

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
