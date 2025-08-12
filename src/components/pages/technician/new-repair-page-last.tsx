// src/components/pages/technician/new-repair-page.tsx

'use client'

import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { useProjectsList } from '@/hooks/use-projects-list'
import { useRepairsList } from '@/hooks/use-repairs-list'
import { getRepairStatus } from '@/lib/utils'
import { CheckCircle2, Loader2, Info } from 'lucide-react'
import { RepairData } from '@/types/repair-type'
import {
  Elevation,
  ProjectData,
  ProjectRepairType,
} from '@/types/project-types'
import RepairPhaseForm from './repair-phase-form'

// Schema de validación para la selección de parámetros
const parameterSelectionSchema = z.object({
  project_id: z.number().min(1, 'Please select a project'),
  drop: z.number().min(1, 'Drop must be at least 1'),
  level: z.number().min(1, 'Level must be at least 1'),
  repair_type: z.string().min(1, 'Please select a repair type'),
  repair_index: z.number().min(1, 'Repair index must be at least 1'),
})

type ParameterFormData = z.infer<typeof parameterSelectionSchema>

// Helper function to determine the current phase and phase number
const determineCurrentPhase = (
  repair: RepairData | null,
  totalPhases: number
) => {
  if (!repair) {
    return { phase: 'survey', phaseNumber: 1 }
  }

  const { phases } = repair

  // If no survey, start with survey
  if (!phases.survey) {
    return { phase: 'survey', phaseNumber: 1 }
  }

  // Calculate progress phases needed (total - 2, because we have survey and finish)
  const progressPhasesNeeded = Math.max(0, totalPhases - 2)
  const currentProgressCount = phases.progress?.length || 0

  // If we need progress phases and haven't completed them all
  if (progressPhasesNeeded > 0 && currentProgressCount < progressPhasesNeeded) {
    return {
      phase: 'progress',
      phaseNumber: currentProgressCount + 1,
    }
  }

  // If no finish phase and we've completed all progress phases (or no progress needed)
  if (!phases.finish) {
    return { phase: 'finish', phaseNumber: 1 }
  }

  // All phases completed
  return null
}

// Helper function to get phase status for display
const getPhaseStatus = (repair: RepairData | null, totalPhases: number) => {
  if (!repair) return null

  const { phases } = repair
  const progressPhasesNeeded = Math.max(0, totalPhases - 2)
  const currentProgressCount = phases.progress?.length || 0

  return {
    survey: !!phases.survey,
    progress: currentProgressCount,
    progressNeeded: progressPhasesNeeded,
    finish: !!phases.finish,
    isComplete:
      !!phases.survey &&
      currentProgressCount >= progressPhasesNeeded &&
      !!phases.finish,
  }
}

export default function TechnicianNewRepairPage() {
  const { projects, isLoading: projectsLoading } = useProjectsList()
  const {
    repairs,
    isLoading: repairsLoading,
    refetch: refetchRepairs,
  } = useRepairsList()

  // Referencias para validación
  const maxDropsRef = useRef<number | undefined>(undefined)
  const maxLevelsRef = useRef<number | undefined>(undefined)

  // Estados para controlar qué mostrar
  const [showPhaseForm, setShowPhaseForm] = useState(false)
  const [selectedRepair, setSelectedRepair] = useState<RepairData | null>(null)

  const {
    register,
    // handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ParameterFormData>({
    resolver: zodResolver(parameterSelectionSchema),
    defaultValues: {
      project_id: 0,
      drop: 1,
      level: 1,
      repair_type: '',
      repair_index: 1,
    },
    mode: 'onChange',
  })

  const project_id = watch('project_id')
  const drop = watch('drop')
  const level = watch('level')
  const repair_type = watch('repair_type')
  const repair_index = watch('repair_index')

  // Obtener proyecto seleccionado
  const selectedProject = projects.find((p: ProjectData) => p.id === project_id)

  // Obtener tipo de reparación del proyecto (para obtener phases)
  const projectRepairType = selectedProject?.repair_types.find(
    (rt: ProjectRepairType) => rt.repair_type === repair_type
  )

  // Calcular valores máximos
  const maxDrops = selectedProject
    ? selectedProject?.elevations.reduce((acc: number, elev: Elevation) => {
        acc += elev.drops
        return acc
      }, 0)
    : undefined

  // Calcular el elevationName en base al drop elegido segun dentro del rango de que elevation se encuentra
  const getElevationNameByDrop = (
    dropNumber: number,
    elevations: Elevation[]
  ) => {
    let accumulated = 0

    for (const elevation of elevations) {
      const min = accumulated + 1
      const max = accumulated + elevation.drops

      if (dropNumber >= min && dropNumber <= max) {
        return elevation.name
      }

      accumulated += elevation.drops
    }

    return 'no-data' // Drop fuera de rango
  }

  const maxLevels = selectedProject?.elevations
    ? selectedProject?.elevations.find(
        (elev: Elevation) =>
          elev.name ===
          getElevationNameByDrop(drop, selectedProject?.elevations)
      )?.levels
    : undefined

  const phases = projectRepairType?.phases || 3

  // Actualizar referencias para validación
  useEffect(() => {
    maxDropsRef.current = maxDrops
    maxLevelsRef.current = maxLevels
  }, [maxDrops, maxLevels])

  // Reiniciar campos dependientes cuando cambia el proyecto
  useEffect(() => {
    setValue('drop', 1)
    setValue('level', 1)
    setValue('repair_type', '')
    setValue('repair_index', 1)
    setShowPhaseForm(false)
    setSelectedRepair(null)
  }, [project_id, setValue])

  // Filtrar reparaciones existentes
  const matchingRepairs = repairs.filter(
    (repair) =>
      repair.project_id === project_id &&
      repair.drop === drop &&
      repair.level === level &&
      repair.phases.survey?.repair_type === repair_type
  )

  // Calcular el próximo repairIndex
  const nextRepairIndex =
    matchingRepairs.length > 0
      ? Math.max(...matchingRepairs.map((r) => r.repair_index)) + 1
      : 1

  // Manejar selección de reparación
  const handleRepairSelection = (value: string) => {
    if (value === 'new') {
      setValue('repair_index', nextRepairIndex)
      setSelectedRepair(null)
      setShowPhaseForm(true)
    } else {
      const repairIndex = parseInt(value)
      setValue('repair_index', repairIndex)
      const repair = matchingRepairs.find((r) => r.repair_index === repairIndex)
      setSelectedRepair(repair || null)
      setShowPhaseForm(true)
    }
  }

  // Manejar éxito en el formulario de fase
  const handlePhaseFormSuccess = () => {
    // Refrescar la lista de reparaciones
    refetchRepairs()

    // Ocultar el formulario de fase
    setShowPhaseForm(false)
    setSelectedRepair(null)

    // Opcionalmente, reiniciar el formulario de parámetros
    reset()
  }

  // Manejar cancelación del formulario de fase
  const handlePhaseFormCancel = () => {
    setShowPhaseForm(false)
    setSelectedRepair(null)
  }

  if (projectsLoading || repairsLoading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-8 p-2 md:p-8">
      {/* Formulario de selección de parámetros */}
      <Card className="w-full lg:max-w-4xl">
        <CardHeader>
          <CardTitle>Repair Parameter Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            {/* Project Selection */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label>Project</Label>
                <Select
                  value={project_id === 0 ? '' : project_id.toString()}
                  onValueChange={(value) => {
                    setValue('project_id', parseInt(value))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project: ProjectData) => (
                      <SelectItem
                        key={project.id}
                        value={project.id.toString()}
                      >
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.project_id && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.project_id.message}
                  </p>
                )}
              </div>
            </div>

            {/* Location Selection - Drop & Level */}
            <div className="grid gap-4 md:grid-cols-4">
              {/* Drop */}
              <div>
                <Label>
                  Drop{' '}
                  {maxDrops && (
                    <span className="text-muted-foreground">
                      (max: {maxDrops})
                    </span>
                  )}
                </Label>
                <Input
                  type="number"
                  disabled={!project_id}
                  {...register('drop', { valueAsNumber: true })}
                  max={maxDrops}
                  min={1}
                />
                {errors.drop && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.drop.message}
                  </p>
                )}
              </div>

              {/* Level */}
              <div>
                <Label>
                  Level{' '}
                  {maxLevels && (
                    <span className="text-muted-foreground">
                      (max: {maxLevels})
                    </span>
                  )}
                </Label>
                <Input
                  type="number"
                  disabled={!project_id}
                  {...register('level', { valueAsNumber: true })}
                  max={maxLevels}
                  min={1}
                />
                {errors.level && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.level.message}
                  </p>
                )}
              </div>

              {/* Elevation Display */}
              {selectedProject && drop && (
                <div className="md:col-span-2">
                  <Label>Elevation</Label>
                  <div className="mt-2 p-2 bg-muted rounded-md">
                    <span className="text-sm font-medium">
                      {getElevationNameByDrop(drop, selectedProject.elevations)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Repair Type Selection */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Repair Type</Label>
                <Select
                  value={repair_type}
                  onValueChange={(value) => setValue('repair_type', value)}
                  disabled={
                    !project_id ||
                    !drop ||
                    !level ||
                    !!errors?.drop ||
                    !!errors?.level
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select repair type" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProject?.repair_types.map(
                      (rt: ProjectRepairType) => (
                        <SelectItem
                          key={rt.repair_type_id}
                          value={rt.repair_type}
                        >
                          {rt.repair_type} ({rt.phases} phases)
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                {errors.repair_type && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.repair_type.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Index Repair Selection</Label>
                <Select
                  value={
                    repair_index === nextRepairIndex && !selectedRepair
                      ? ''
                      : repair_index.toString()
                  }
                  onValueChange={handleRepairSelection}
                  disabled={!repair_type}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select or create repair" />
                  </SelectTrigger>
                  <SelectContent>
                    {matchingRepairs.map((repair) => {
                      const phaseStatus = getPhaseStatus(repair, phases)
                      const nextPhaseInfo = determineCurrentPhase(
                        repair,
                        phases
                      )

                      return (
                        <SelectItem
                          key={repair.id}
                          value={repair.repair_index.toString()}
                        >
                          <div className="flex items-center gap-2">
                            <span>Index #{repair.repair_index}</span>
                            <Badge
                              variant={
                                repair.status === 'approved'
                                  ? 'default'
                                  : repair.status === 'pending'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                            >
                              {getRepairStatus(repair)}
                            </Badge>
                            {nextPhaseInfo && (
                              <Badge variant="outline" className="text-xs">
                                Next:{' '}
                                {nextPhaseInfo.phase === 'progress'
                                  ? `P${nextPhaseInfo.phaseNumber}`
                                  : nextPhaseInfo.phase.toUpperCase()}
                              </Badge>
                            )}
                            {phaseStatus?.isComplete && (
                              <Badge
                                variant="default"
                                className="text-xs bg-green-600"
                              >
                                Complete
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      )
                    })}
                    <SelectItem value="new">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Create new repair (Index: {nextRepairIndex})
                        <Badge variant="outline" className="text-xs">
                          Start: Survey
                        </Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Phase Progress Information */}
            {repair_type && phases && (
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">
                    Phase Configuration
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-700">
                      Total Phases:
                    </span>
                    <span className="ml-2">{phases}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">
                      Structure:
                    </span>
                    <span className="ml-2">
                      Survey + {Math.max(0, phases - 2)} Progress + Finish
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">
                      Phase Codes:
                    </span>
                    <span className="ml-2">
                      S
                      {phases > 2 && (
                        <>
                          {Array.from(
                            { length: phases - 2 },
                            (_, i) => `, P${i + 1}`
                          ).join('')}
                        </>
                      )}
                      , F
                    </span>
                  </div>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Separador */}
      {showPhaseForm && <Separator />}

      {/* Formulario de fase de reparación */}
      {showPhaseForm && selectedProject && (
        <RepairPhaseForm
          projectId={project_id}
          projectName={selectedProject.name}
          clientName={selectedProject.client_name}
          elevationName={getElevationNameByDrop(
            drop,
            selectedProject.elevations
          )}
          drop={drop}
          level={level}
          repairType={repair_type}
          repairIndex={repair_index}
          totalPhases={phases}
          existingRepair={selectedRepair}
          onSuccess={handlePhaseFormSuccess}
          onCancel={handlePhaseFormCancel}
          folderName={selectedProject.name}
        />
      )}
    </div>
  )
}
