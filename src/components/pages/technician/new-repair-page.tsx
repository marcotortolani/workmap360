// src/components/pages/technician/new-repair-page.tsx

'use client'

import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {  z } from 'zod'
import { toast } from 'sonner'
import { createFormSchema } from '@/lib/schemas/new-repair-form-schema'
//import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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

// import { useRepairsDataStore } from '@/stores/repairs-data-store'
import { useCurrentUser } from '@/stores/user-store'
import CustomImageUpload from '@/components/custom-image-upload'
import { getRepairStatus } from '@/lib/utils'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { RepairData, ProgressPhase, RepairType } from '@/types/repair-type'
import { REPAIR_TYPE_LIST } from '@/data/repair-type-list'
import {
  Elevation,
  ProjectData,
  ProjectRepairType,
} from '@/types/project-types'
import { createRepairViaAPI, updateRepairViaAPI } from '@/lib/api/repairs'

type FormData = z.infer<ReturnType<typeof createFormSchema>>

interface ImageUploadData {
  url: string
  publicId: string
  fileName: string
  phase: string
}

interface MeasurementField {
  key: string
  label: string
  required: boolean
  defaultValue?: number
  placeholder?: string
}

export default function TechnicianNewRepairPage() {
  const { projects, isLoading: projectsLoading } = useProjectsList()
  // const { repairsDataList, addRepair, updateRepair } = useRepairsDataStore()
  const { repairs, isLoading: repairsLoading } = useRepairsList()
  const { userId, fullName, accessToken } = useCurrentUser()

  // Referencias para validación
  const maxDropsRef = useRef<number | undefined>(undefined)
  const maxLevelsRef = useRef<number | undefined>(undefined)

  // Estados
  const [currentPhase, setCurrentPhase] = useState<
    'survey' | 'progress' | 'finish' | null
  >(null)
  const [selectedRepair, setSelectedRepair] = useState<RepairData | null>(null)
  const [progressPhaseNumber, setProgressPhaseNumber] = useState<number>(1)
  const [folderName, setFolderName] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [measurements, setMeasurements] = useState<Record<string, number>>({})
  const [comments, setComments] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(createFormSchema({ maxDropsRef, maxLevelsRef })),
    defaultValues: {
      project_id: 0,
      elevation: '',
      drop: 1,
      level: 1,
      repair_type: '',
      repair_index: 1,
      survey_image: '',
      progress_image: [],
      finish_image: '',
    },
    mode: 'onChange',
  })

  const project_id = watch('project_id')
  const elevation = watch('elevation')
  const drop = watch('drop')
  const level = watch('level')
  const repair_type = watch('repair_type')
  const repair_index = watch('repair_index')

  // Obtener proyecto seleccionado
  const selectedProject = projects.find((p: ProjectData) => p.id === project_id)

  // Obtener tipo de reparación seleccionado desde REPAIR_TYPE_LIST
  const selectedRepairType = REPAIR_TYPE_LIST.find(
    (rt: RepairType) => rt.type === repair_type && rt.status === 'active'
  )

  // Obtener tipo de reparación del proyecto (para obtener phases)
  const projectRepairType = selectedProject?.repair_types.find(
    (rt: ProjectRepairType) => rt.repair_type === repair_type
  )

  // Calcular valores máximos
  const maxDrops = elevation
    ? selectedProject?.elevations.find(
        (elev: Elevation) => elev.name === elevation
      )?.drops
    : undefined

  const maxLevels = elevation
    ? selectedProject?.elevations.find(
        (elev: Elevation) => elev.name === elevation
      )?.levels
    : undefined

  const phases = projectRepairType?.phases || 3

  // Actualizar referencias
  useEffect(() => {
    maxDropsRef.current = maxDrops
    maxLevelsRef.current = maxLevels
  }, [maxDrops, maxLevels])

  // Reiniciar campos dependientes cuando cambia el proyecto
  useEffect(() => {
    setValue('elevation', '')
    setValue('drop', 1)
    setValue('level', 1)
    setValue('repair_type', '')
    setValue('repair_index', 1)
    setValue('progress_image', [])
    setMeasurements({})
    setComments('')
  }, [project_id, setValue])

  // Reiniciar campos cuando cambia la elevación
  useEffect(() => {
    setValue('drop', 1)
    setValue('level', 1)
    setValue('repair_type', '')
    setValue('repair_index', 1)
    setValue('progress_image', [])
    setMeasurements({})
  }, [elevation, setValue])

  // Reiniciar mediciones cuando cambia el tipo de reparación
  useEffect(() => {
    if (selectedRepairType) {
      const newMeasurements: Record<string, number> = {}

      // Inicializar con valores por defecto si los hay
      if (selectedRepairType.unit_measure.default_values) {
        Object.entries(selectedRepairType.unit_measure.default_values).forEach(
          ([key, value]) => {
            newMeasurements[key] = value as number
          }
        )
      }

      // Inicializar otros campos requeridos con 0
      selectedRepairType.unit_measure?.dimensions?.forEach((dimension) => {
        if (!(dimension in newMeasurements)) {
          newMeasurements[dimension] = 0
        }
      })

      setMeasurements(newMeasurements)
    } else {
      setMeasurements({})
    }
  }, [selectedRepairType])

  // Filtrar reparaciones existentes
  const matchingRepairs = repairs.filter(
    (repair) =>
      repair.project_id === project_id &&
      repair.elevation_name === elevation &&
      repair.drop === drop &&
      repair.level === level &&
      repair.phases.survey?.repair_type === repair_type
  )

  // Calcular el próximo repairIndex
  const nextRepairIndex =
    matchingRepairs.length > 0
      ? Math.max(...matchingRepairs.map((r) => r.repair_index)) + 1
      : 1

  // Generar campos de medición dinámicos
  const getMeasurementFields = (): MeasurementField[] => {
    if (!selectedRepairType) return []

    const fields: MeasurementField[] = []
    const { unit_measure } = selectedRepairType

    switch (unit_measure.type) {
      case 'volume':
        fields.push(
          {
            key: 'width',
            label: 'Width (mm)',
            required: true,
            placeholder: 'Enter width in mm',
          },
          {
            key: 'height',
            label: 'Height (mm)',
            required: true,
            placeholder: 'Enter height in mm',
          },
          {
            key: 'depth',
            label: 'Depth (mm)',
            required: false,
            defaultValue: unit_measure.default_values?.depth,
            placeholder: `Default: ${
              unit_measure.default_values?.depth || 'N/A'
            } mm`,
          }
        )
        break

      case 'area':
        fields.push(
          {
            key: 'width',
            label: 'Width (mm)',
            required: true,
            placeholder: 'Enter width in mm',
          },
          {
            key: 'height',
            label: 'Height (mm)',
            required: true,
            placeholder: 'Enter height in mm',
          }
        )
        break

      case 'length':
        fields.push({
          key: 'length',
          label: 'Length (mm)',
          required: true,
          placeholder: 'Enter length in mm',
        })
        break

      case 'unit':
        fields.push({
          key: 'count',
          label: 'Count',
          required: true,
          placeholder: 'Enter quantity',
        })
        break
    }

    return fields
  }

  // Calcular el valor convertido para mostrar
  const getConvertedValue = () => {
    if (!selectedRepairType || !selectedRepairType.conversion) return null

    try {
      const value =
        selectedRepairType.conversion.conversion_factor(measurements)
      return {
        value: value.toFixed(3),
        unit: selectedRepairType.unit_to_charge,
      }
    } catch (error) {
      toast.error('Error calculating conversion', {
        description: 'Error: ' + error,
        duration: 5000,
        style: {
          background: '#FF0000',
          color: '#FFFFFF',
          fontWeight: 'bold',
        },
      })
      return null
    }
  }

  // Manejar selección de reparación
  const handleRepairSelection = (value: string) => {
    if (value === 'new') {
      setValue('repair_index', nextRepairIndex)
      setSelectedRepair(null)
      setCurrentPhase('survey')
      setProgressPhaseNumber(1)
    } else {
      const repairIndex = parseInt(value)
      setValue('repair_index', repairIndex)
      const repair = matchingRepairs.find((r) => r.repair_index === repairIndex)
      setSelectedRepair(repair || null)

      // Determinar la fase actual basada en el estado de la reparación
      if (repair) {
        if (!repair.phases.survey) {
          setCurrentPhase('survey')
        } else if (!repair.phases.finish && repair.phases.progress) {
          const nextProgress = (repair.phases.progress?.length || 0) + 1
          setProgressPhaseNumber(nextProgress)
          setCurrentPhase(nextProgress <= phases - 2 ? 'progress' : 'finish')
        } else if (!repair.phases.finish) {
          setCurrentPhase('progress')
          setProgressPhaseNumber(1)
        } else {
          setCurrentPhase(null) // Reparación completa
        }
      }
    }
  }

  // Nueva función para manejar el éxito de subida de imagen que también sube a Supabase
  const handleImageUploadSuccess = async (imageData: ImageUploadData) => {
    if (!userId || !fullName || !accessToken) {
      toast.error('User information not found')
      return
    }

    setIsSubmitting(true)

    try {
      const timestamp = new Date().toISOString()

      if (selectedRepair) {
        // Actualizar reparación existente
        const updatedPhases = { ...selectedRepair.phases }

        if (currentPhase === 'survey') {
          updatedPhases.survey = {
            created_by_user_name: fullName,
            created_by_user_id: userId,
            created_at: timestamp,
            repair_type: repair_type,
            repair_type_id: selectedRepairType?.id || 0,
            measurements: measurements,
            photos: [imageData.url],
            comments: comments,
          }
        } else if (currentPhase === 'progress') {
          const newProgress: ProgressPhase = {
            created_by_user_name: fullName,
            created_by_user_id: userId,
            created_at: timestamp,
            repair_type: repair_type,
            repair_type_id: selectedRepairType?.id || 0,
            measurements: measurements,
            photo: imageData.url,
            comments: comments,
          }

          updatedPhases.progress = [
            ...(updatedPhases.progress || []),
            newProgress,
          ]
        } else if (currentPhase === 'finish') {
          updatedPhases.finish = {
            created_by_user_name: fullName,
            created_by_user_id: userId,
            created_at: timestamp,
            photos: [imageData.url],
            comments: comments,
          }
        }

        // Llamar al API para actualizar la reparación
        const result = await updateRepairViaAPI(
          selectedRepair.id,
          { phases: updatedPhases },
          accessToken
        )
        console.log('Update Repair Result:', result)

        // Actualizar en el store local
        // if (result.success && result.repair) {
        //   await updateRepair(result.repair)

        //   toast.success('Repair updated successfully', {
        //     duration: 5000,
        //     position: 'bottom-right',
        //     style: {
        //       background: '#4CAF50',
        //       color: '#FFFFFF',
        //       fontWeight: 'bold',
        //     },
        //   })
        // } else {
        //   throw new Error(result.error || 'Failed to update repair')
        // }
      } else {
        // Crear nueva reparación
        const newRepairData = {
          project_id: project_id,
          project_name: selectedProject?.name || '',
          elevation_name: elevation,
          drop: drop,
          level: level,
          repair_index: nextRepairIndex,
          phases: {
            survey: {
              created_by_user_name: fullName,
              created_by_user_id: userId,
              created_at: timestamp,
              repair_type: repair_type,
              repair_type_id: selectedRepairType?.id || 0,
              measurements: measurements,
              photos: [imageData.url],
              comments: comments,
            },
          },
        }

        // Llamar al API para crear la reparación
        const result = await createRepairViaAPI(newRepairData, accessToken)
        console.log('Create Repair Result:', result)

        // Crear el objeto completo para el store local
        // if (result.success && result.repairId) {
        //   const newRepair: RepairData = {
        //     id: result.repairId,
        //     project_id: project_id,
        //     project_name: selectedProject?.name || '',
        //     elevation_name: elevation,
        //     drop: drop,
        //     level: level,
        //     repair_index: nextRepairIndex,
        //     status: 'pending',
        //     phases: newRepairData.phases,
        //     created_by_user_name: fullName,
        //     created_by_user_id: userId,
        //     created_at: timestamp,
        //     updated_at: timestamp,
        //   }

        //   // Actualizar en el store local
        //   await addRepair(newRepair)

        //   toast.success('New repair created successfully', {
        //     duration: 5000,
        //     position: 'bottom-right',
        //     style: {
        //       background: '#4CAF50',
        //       color: '#FFFFFF',
        //       fontWeight: 'bold',
        //     },
        //   })
        // } else {
        //   throw new Error(result.error || 'Failed to create repair')
        // }
      }

      // Resetear formulario
      reset()
      setMeasurements({})
      setComments('')
      setCurrentPhase(null)
      setSelectedRepair(null)
    } catch (error) {
      console.error('Error submitting repair:', error)
      toast.error('Failed to submit repair', {
        description: error instanceof Error ? error.message : 'Unknown error',
        duration: 5000,
        position: 'bottom-right',
        style: {
          background: '#FF0000',
          color: '#FFFFFF',
          fontWeight: 'bold',
        },
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Mantener el submit original como fallback (opcional)
  const onSubmit = async (data: FormData) => {
    // Este método ahora es principalmente para validaciones adicionales
    // El verdadero submit se hace en handleImageUploadSuccess
    console.log('Form submitted:', data)
  }

  // Obtener el nombre de la fase actual
  const getCurrentPhaseName = () => {
    if (currentPhase === 'survey') return 'Survey'
    if (currentPhase === 'progress') return `Progress ${progressPhaseNumber}`
    if (currentPhase === 'finish') return 'Finish'
    return null
  }

  // Obtener el código de fase para el nombre del archivo
  const getPhaseCode = () => {
    if (currentPhase === 'survey') return 'S'
    if (currentPhase === 'progress') return `P${progressPhaseNumber}`
    if (currentPhase === 'finish') return 'F'
    return ''
  }

  // Generar string de mediciones basado en el tipo de reparación
  const getMeasurementsString = () => {
    if (!selectedRepairType || Object.keys(measurements).length === 0) return ''

    const { unit_measure } = selectedRepairType

    switch (unit_measure.type) {
      case 'volume':
        // Para volumen: width x height x depth
        const width = measurements.width || 0
        const height = measurements.height || 0
        const depth =
          measurements.depth || unit_measure.default_values?.depth || 0
        return `${width}x${height}x${depth}`

      case 'area':
        // Para área: width x height
        const areaWidth = measurements.width || 0
        const areaHeight = measurements.height || 0
        return `${areaWidth}x${areaHeight}`

      case 'length':
        // Para longitud: solo length
        const length = measurements.length || 0
        return `${length}`

      case 'unit':
        // Para unidades: solo count
        const count = measurements.count || 0
        return `${count}`

      default:
        return ''
    }
  }

  // Generar el código completo de reparación
  const getFullRepairCode = () => {
    const measurementsStr = getMeasurementsString()
    const phaseCode = getPhaseCode()

    if (
      !drop ||
      !level ||
      !repair_type ||
      !repair_index ||
      !measurementsStr ||
      !phaseCode
    ) {
      return `D${drop}.L${level}.${repair_type}.${repair_index}`
    }

    return `D${drop}.L${level}.${repair_type}.${repair_index}.${measurementsStr}.${phaseCode}`
  }

  // Función para validar que todos los campos de medición requeridos estén completos
  const validateMeasurements = (): boolean => {
    if (!selectedRepairType) return false

    const { unit_measure } = selectedRepairType

    switch (unit_measure.type) {
      case 'volume':
        // Para volumen: width y height son requeridos, depth puede tener valor por defecto
        const width = measurements.width || 0
        const height = measurements.height || 0
        const depth =
          measurements.depth || unit_measure.default_values?.depth || 0
        return width > 0 && height > 0 && depth > 0

      case 'area':
        // Para área: width y height son requeridos
        const areaWidth = measurements.width || 0
        const areaHeight = measurements.height || 0
        return areaWidth > 0 && areaHeight > 0

      case 'length':
        // Para longitud: solo length es requerido
        const length = measurements.length || 0
        return length > 0

      case 'unit':
        // Para unidades: solo count es requerido
        const count = measurements.count || 0
        return count > 0

      default:
        return false
    }
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
      <Card className="w-full lg:max-w-4xl">
        <CardHeader>
          <CardTitle>New Repair Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Project Selection */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label>Project</Label>
                <Select
                  value={project_id === 0 ? '' : project_id.toString()}
                  onValueChange={(value) => {
                    setValue('project_id', parseInt(value))
                    const project = projects.find(
                      (p: ProjectData) => p.id === parseInt(value)
                    )
                    setFolderName(project?.name || '')
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

            {/* Location Selection */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <Label>Elevation</Label>
                <Select
                  value={elevation}
                  onValueChange={(value) => setValue('elevation', value)}
                  disabled={!project_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select elevation" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProject?.elevations?.map(
                      (elevation: Elevation) => (
                        <SelectItem key={elevation.name} value={elevation.name}>
                          {elevation.name}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                {errors.elevation && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.elevation.message}
                  </p>
                )}
              </div>

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
                  disabled={!elevation}
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
                  disabled={!elevation}
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
            </div>

            {/* Repair Type Selection */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Repair Type</Label>
                <Select
                  value={repair_type}
                  onValueChange={(value) => {
                    setValue('repair_type', value)
                    setCurrentPhase(null)
                    setSelectedRepair(null)
                  }}
                  disabled={
                    !project_id ||
                    !elevation ||
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
                          {rt.repair_type}
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
                    {matchingRepairs.map((repair) => (
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
                        </div>
                      </SelectItem>
                    ))}
                    <SelectItem value="new">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Create new repair (Index: {nextRepairIndex})
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Phase Information */}
            {currentPhase && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      {getCurrentPhaseName()} Phase
                    </h3>
                    <Badge variant="outline" className="text-sm">
                      {selectedRepair
                        ? 'Updating Existing Repair'
                        : 'Creating New Repair'}
                    </Badge>
                  </div>

                  {/* Repair Code Display */}
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm font-medium">Repair Code:</p>
                    <p className="text-lg font-mono">{getFullRepairCode()}</p>
                    {getMeasurementsString() && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Format: D{drop}.L{level}.{repair_type}.{repair_index}.
                        {getMeasurementsString()}.{getPhaseCode()}
                      </p>
                    )}
                  </div>

                  {/* Repair Type Information */}
                  {selectedRepairType && (
                    <div className="bg-blue-50 p-3 rounded-md border">
                      <p className="text-sm font-medium text-blue-900">
                        {selectedRepairType.variation} (
                        {selectedRepairType.type})
                      </p>
                      <p className="text-xs text-blue-700">
                        Unit: {selectedRepairType.unit_measure.value} →{' '}
                        {selectedRepairType.unit_to_charge}
                      </p>
                    </div>
                  )}

                  {/* Dynamic Measurements Input */}
                  {selectedRepairType && (
                    <div>
                      <Label>Measurements</Label>
                      <div className="grid gap-3 md:grid-cols-3 mt-2">
                        {getMeasurementFields().map((field) => (
                          <div key={field.key}>
                            <Label className="text-sm">
                              {field.label}
                              {field.required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder={field.placeholder}
                              value={measurements[field.key] || ''}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0
                                setMeasurements((prev) => ({
                                  ...prev,
                                  [field.key]: value,
                                }))
                              }}
                              disabled={!!field.defaultValue || isSubmitting}
                            />
                            {field.defaultValue && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Default value: {field.defaultValue}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Converted Value Display */}
                      {(() => {
                        const converted = getConvertedValue()
                        return (
                          converted && (
                            <div className="mt-3 p-2 bg-green-50 rounded-md border border-green-200">
                              <p className="text-sm text-green-800">
                                <span className="font-medium">
                                  Converted Value:
                                </span>{' '}
                                {converted.value} {converted.unit}
                              </p>
                            </div>
                          )
                        )
                      })()}
                    </div>
                  )}

                  {/* Comments */}
                  <div>
                    <Label>Comments</Label>
                    <Textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Add any relevant comments about this repair phase..."
                      rows={3}
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <Label>Upload {getCurrentPhaseName()} Image</Label>
                    <div className="mt-2">
                      <CustomImageUpload
                        fieldName={`${currentPhase}_image`}
                        fileNameData={{
                          drop,
                          level,
                          repair_type,
                          repair_index,
                          measures: getMeasurementsString(),
                          phase: getPhaseCode(),
                        }}
                        folderName={selectedProject?.name || folderName}
                        userName={fullName || 'Unknown'}
                        onUploadSuccess={handleImageUploadSuccess}
                        disabled={!validateMeasurements() || isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Submitting Status */}
                  {isSubmitting && (
                    <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-md">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">
                        Processing {getCurrentPhaseName()} phase...
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* No phase available message */}
            {repair_type && repair_index && !currentPhase && selectedRepair && (
              <div className="bg-muted p-4 rounded-md">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-5 w-5" />
                  <p>
                    This repair has been completed. All phases are finished.
                  </p>
                </div>
              </div>
            )}

            {/* Info Message - No Submit Button Needed */}
            {currentPhase && (
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <div className="flex items-center gap-2 text-blue-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="text-sm">
                    <strong>Auto-submit enabled:</strong> Your repair will be
                    automatically saved when you successfully upload the{' '}
                    {getCurrentPhaseName()} image.
                  </p>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
