'use client'

import { useState } from 'react'
import { useRepairListStore } from '@/stores/repair-list-store'
import { useProjectsListStore } from '@/stores/projects-list-store'
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

import { FolderPlus, Edit, XIcon, Trash2Icon, Pencil } from 'lucide-react'
import {
  PROJECT_STATUS,
  Elevation,
  ProjectData,
  ProjectRepairType,
  TechnicianAssignment,
} from '@/types/project-types'
import { Separator } from '@/components/ui/separator'
import { TechnicianType } from '@/types/roles-types'
import Image from 'next/image'

const clientList = [
  { id: 1, name: 'ABC Corporation' },
  { id: 2, name: 'XYZ Industries' },
  { id: 3, name: 'DEF Enterprises' },
  { id: 4, name: 'GHI Holdings' },
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
  const [showCreateForm, setShowCreateForm] = useState(false)
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
  })
  const [editingIndex, setEditingIndex] = useState<number | null>(null) // Índice del repairType que se está editando

  // Estados para manejar dinámicamente technicians
  const [newTechnician, setNewTechnician] = useState<
    Partial<TechnicianAssignment>
  >({
    technicianId: 0,
    technicianName: '',
    technicianAvatar: '',
  })

  const [editingTechnicianIndex, setEditingTechnicianIndex] = useState<
    number | null
  >(null)

  // Zustand stores
  const { projectsList, addProject } = useProjectsListStore()
  const { repairList } = useRepairListStore()
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
  const handleRepairTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value)
    const selectedRepairType = repairList.find(
      (repairType) => repairType.id === selectedId
    )

    if (selectedRepairType) {
      setNewRepairType({
        ...newRepairType,
        repairTypeId: selectedId,
        repairType: selectedRepairType.type,
        unitToCharge: selectedRepairType.unitToCharge,
      })
    }
  }

  // Manejador para agregar un tipo de reparación
  // const handleAddRepairType = () => {
  //   if (
  //     !newRepairType.repairTypeId ||
  //     newRepairType.phases! < 3 ||
  //     newRepairType.phases! > 10 ||
  //     newRepairType.price! <= 0
  //   ) {
  //     alert('Please fill in all repair type fields with valid values')
  //     return
  //   }

  //   const repairTypeToAdd: ProjectRepairType = {
  //     repairTypeId: newRepairType.repairTypeId!,
  //     repairType: newRepairType.repairType!,
  //     phases: newRepairType.phases!,
  //     price: newRepairType.price!,
  //     unitToCharge: newRepairType.unitToCharge!,
  //   }

  //   setRepairTypes([...repairTypes, repairTypeToAdd])
  //   setNewRepairType({
  //     repairTypeId: 0,
  //     repairType: '',
  //     phases: 3,
  //     price: 0,
  //     unitToCharge: '',
  //   })
  // }
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
    })
  }

  // Manejador para seleccionar un técnico
  const handleTechnicianChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value)
    const selectedTechnician = techniciansList.find(
      (tech) => tech.id === selectedId
    )

    if (selectedTechnician) {
      setNewTechnician({
        technicianId: selectedId,
        technicianName:
          selectedTechnician.firstName + ' ' + selectedTechnician.lastName,
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
      technicianName: newTechnician.technicianName!,
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
      technicianName: '',
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
      technicianName: '',
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
      createdBy: 'John Doe',
      createdByUser: 123,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    addProject(newProject)
    alert('Project created successfully!')
  }

  return (
    <div className=" relative flex flex-col gap-8 p-8">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Projects</h2>
          <Button
            className="bg-orange-500 text-white hover:bg-orange-400"
            onClick={() => setShowCreateForm(true)}
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>

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
                  {/* Actions (Edit)*/}
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
      </div>

      <div
        className={`${
          showCreateForm
            ? ' translate-y-0 scale-100 '
            : ' translate-y-[200%] scale-50 '
        } fixed top-0 left-0 z-50 w-screen h-screen bg-black/50 flex items-center justify-center transition-all duration-300 ease-in-out`}
      >
        <div
          className={`relative w-2/5 h-[95%] mx-auto overflow-y-scroll rounded-lg border bg-white p-6 shadow-sm`}
        >
          <button
            type="button"
            onClick={() => setShowCreateForm(false)}
            className="absolute top-6 right-6 bg-neutral-900 text-white hover:bg-neutral-600 rounded-md p-1"
          >
            <XIcon className="h-6 w-6" />
          </button>
          <h2 className="mb-4 text-xl font-semibold">Create Project</h2>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Project Name
              </label>
              <Input
                placeholder="Enter project name"
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Client</label>
              <Select
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
              <label className="mb-2 block text-sm font-medium">Status</label>
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
            <h3 className=" col-span-2 mb-1 text-lg font-semibold">
              Parameters
            </h3>

            {/* Elevations */}
            <div className=" col-span-2">
              <h3 className="text-lg font-medium">
                Elevations (1 min - 6 max)
              </h3>
              <p className="text-sm text-muted-foreground">
                Add elevations to the project
              </p>

              <div className="col-span-2 h-20 flex items-center justify-between">
                {/* Checkbox para "Same levels for all elevations" */}
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    id="sameLevels"
                    type="checkbox"
                    checked={sameLevelsForAll}
                    onChange={handleSameLevelsChange}
                    className="h-4 w-4"
                  />
                  <label className="text-sm font-medium" htmlFor="sameLevels">
                    Same levels for all elevations
                  </label>
                </div>
                {/* Campo para el valor común de levels (si el checkbox está marcado) */}
                {sameLevelsForAll && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium">
                      Common Levels for All Elevations
                    </label>
                    <input
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
                      } border rounded p-2 w-full`}
                    />
                  </div>
                )}
              </div>

              {/* Elevations list */}
              <div className="space-y-2">
                {elevations.map((elevation, index) => (
                  <div key={index} className="flex space-x-2 items-center">
                    <span className="border p-2 rounded">
                      {elevation.name}: {elevation.drops} drops,{' '}
                      {elevation.levels} levels
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveElevation(index)}
                      className="flex items-center gap-2 bg-red-500 text-white px-2 py-1 rounded"
                    >
                      <Trash2Icon className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              {elevations.length < 6 && (
                <div className="flex space-x-2 mt-2">
                  <input
                    type="text"
                    value={newElevation.name}
                    onChange={(e) =>
                      setNewElevation({ ...newElevation, name: e.target.value })
                    }
                    placeholder="Elevation Name (e.g., Norte)"
                    className="border rounded p-2 flex-1"
                  />
                  <input
                    type="number"
                    value={newElevation.drops || ''}
                    onChange={(e) =>
                      setNewElevation({
                        ...newElevation,
                        drops: Number(e.target.value),
                      })
                    }
                    placeholder="Drops"
                    min="1"
                    className="border rounded p-2 w-24"
                  />
                  <input
                    type="number"
                    value={newElevation.levels || commonLevels || ''}
                    onChange={(e) =>
                      setNewElevation({
                        ...newElevation,
                        levels: Number(e.target.value),
                      })
                    }
                    placeholder="Levels"
                    min="1"
                    className="border rounded p-2 w-24"
                  />
                  <button
                    type="button"
                    onClick={handleAddElevation}
                    className="bg-green-600 hover:bg-green-500 focus:outline-blue-500 text-white px-4 py-2 rounded"
                  >
                    Add Elevation
                  </button>
                </div>
              )}
              <div className=" w-full my-4 flex items-center gap-10">
                <p className=" text-sm text-muted-foreground">
                  Elevations: {elevations.length}
                </p>
                <p className=" text-sm text-muted-foreground">
                  Total Drops:{' '}
                  {elevations.reduce((total, e) => total + e.drops, 0)}
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
                    className=" p-2 flex items-center justify-between border rounded"
                  >
                    <div className=" flex items-center gap-2">
                      <div className=" flex items-center gap-2">
                        <span className="  bg-neutral-700 text-white font-semibold px-2 py-1 border rounded-lg">
                          {rt.repairType}
                        </span>
                        <span>
                          {
                            repairList.find((r) => r.id === rt.repairTypeId)
                              ?.variation
                          }{' '}
                          {repairList.find((r) => r.id === rt.repairTypeId)
                            ?.unitMeasure?.defaultValues?.depth ? (
                            <span>
                              (
                              {
                                repairList.find((r) => r.id === rt.repairTypeId)
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
                        <span>
                          ${rt.price} ({rt.unitToCharge})
                        </span>
                      </div>
                    </div>

                    <div className=" flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditRepairType(index)}
                        className="flex items-center gap-1 bg-blue-500 text-white text-xs px-2 py-1 rounded"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveRepairType(index)}
                        className="flex items-center gap-2 bg-red-500 text-white px-2 py-1 rounded"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Formulario para agregar un nuevo repairType */}
              <div className="flex flex-col gap-4 mt-8 p-2 border rounded">
                <div className="flex gap-8">
                  <select
                    value={newRepairType.repairTypeId || ''}
                    onChange={handleRepairTypeChange}
                    className="col-span-1 border rounded p-2 flex-1"
                  >
                    <option value="">Select Repair Type</option>
                    {repairList.map((repairType) => (
                      <option key={repairType.id} value={repairType.id}>
                        {repairType.variation} ({repairType.type})
                      </option>
                    ))}
                  </select>
                  <div className=" space-x-2 ">
                    <label htmlFor="phases">Phases (3-10):</label>
                    <input
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
                      className="border rounded p-2 w-24"
                    />
                  </div>
                </div>
                <div className=" flex justify-between">
                  <div className=" space-x-2 ">
                    <label htmlFor="price">Price:</label>
                    <input
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
                      className="border rounded p-2 w-24"
                    />
                    {newRepairType.unitToCharge && (
                      <span>/{newRepairType.unitToCharge}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddOrUpdateRepairType}
                    className="bg-green-600 hover:bg-green-500 focus:outline-blue-500 text-white px-4 py-2 rounded"
                  >
                    {editingIndex !== null ? 'Update' : 'Add'} Repair Type
                  </button>
                  {editingIndex !== null && (
                    <button
                      type="button"
                      onClick={handleCancelEditRepairType}
                      className="bg-gray-500 text-white px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
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
                    className="flex space-x-2 items-center justify-between p-2 border rounded"
                  >
                    <div className=" flex items-center gap-2">
                      <Image
                        src={tech.technicianAvatar || ''}
                        alt={tech.technicianName}
                        width={50}
                        height={50}
                        className="w-10 h-10 rounded-full"
                      />
                      <span className=" ">
                        {tech.technicianName} (ID: {tech.technicianId})
                      </span>
                    </div>
                    <div className=" flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditTechnician(index)}
                        className="flex items-center gap-2 bg-blue-500 text-xs text-white px-2 py-1 rounded"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveTechnician(index)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Formulario para agregar/editar un técnico */}
              <div className="flex space-x-2 mt-2">
                <select
                  value={newTechnician.technicianId || ''}
                  onChange={handleTechnicianChange}
                  className="border rounded p-2 flex-1"
                >
                  <option value="">Select Technician</option>
                  {techniciansList.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.firstName} {tech.lastName} (ID: {tech.id})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddOrUpdateTechnician}
                  className="bg-green-600 hover:bg-green-500 focus:outline-blue-500 text-white px-4 py-2 rounded"
                >
                  {editingTechnicianIndex !== null ? 'Update' : 'Add'}{' '}
                  Technician
                </button>
                {editingTechnicianIndex !== null && (
                  <button
                    type="button"
                    onClick={handleCancelEditTechnician}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Google Drive URL */}
            <div>
              <label className="block text-sm font-medium">
                Google Drive URL
              </label>
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
                className="mt-4 bg-orange-500 text-white hover:bg-orange-400"
                type="submit"
              >
                Save Project
              </Button>
              <Button
                type="button"
                className="mt-4 bg-neutral-900 text-white hover:bg-neutral-700"
                onClick={() => setShowCreateForm(false)}
              >
                Close
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
