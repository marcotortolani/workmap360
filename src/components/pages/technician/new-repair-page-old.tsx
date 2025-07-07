// src/components/pages/technician/new-repair-page.tsx

'use client'

import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { createFormSchema } from '@/lib/schemas/new-repair-form-schema'
import { Button } from '@/components/ui/button'
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
import { useRepairsDataStore } from '@/stores/repairs-data-store'
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
  const { repairsDataList, addRepair, updateRepair } = useRepairsDataStore()
  const { userId, fullName } = useCurrentUser()

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
  const [uploadedImages, setUploadedImages] = useState<{
    survey?: ImageUploadData
    progress: ImageUploadData[]
    finish?: ImageUploadData
  }>({ progress: [] })
  const [measurements, setMeasurements] = useState<Record<string, number>>({})
  const [comments, setComments] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
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
    setUploadedImages({ progress: [] })
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
    setUploadedImages({ progress: [] })
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
  const matchingRepairs = repairsDataList.filter(
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

  // Manejar subida exitosa de imagen
  const handleImageUploadSuccess = (imageData: ImageUploadData) => {
    if (currentPhase === 'survey') {
      setUploadedImages((prev) => ({ ...prev, survey: imageData }))
    } else if (currentPhase === 'progress') {
      setUploadedImages((prev) => ({
        ...prev,
        progress: [...prev.progress, imageData],
      }))
    } else if (currentPhase === 'finish') {
      setUploadedImages((prev) => ({ ...prev, finish: imageData }))
    }
  }

  // Enviar formulario
  const onSubmit = async (data: FormData) => {
    if (!userId || !fullName) {
      toast.error('User information not found')
      return
    }
    console.log(data)

    setIsSubmitting(true)

    try {
      const timestamp = new Date().toISOString()

      if (selectedRepair) {
        // Actualizar reparación existente
        const updatedRepair: RepairData = {
          ...selectedRepair,
          updated_at: timestamp,
        }

        if (currentPhase === 'survey' && uploadedImages.survey) {
          updatedRepair.phases.survey = {
            created_by_user_name: fullName,
            created_by_user_id: userId,
            created_at: timestamp,
            repair_type: repair_type,
            repair_type_id: selectedRepairType?.id || 0,
            measurements: measurements,
            photos: [uploadedImages.survey.url],
            comments: comments,
          }
        } else if (
          currentPhase === 'progress' &&
          uploadedImages.progress.length > 0
        ) {
          const newProgress: ProgressPhase = {
            created_by_user_name: fullName,
            created_by_user_id: userId,
            created_at: timestamp,
            repair_type: repair_type,
            repair_type_id: selectedRepairType?.id || 0,
            measurements: measurements,
            photo:
              uploadedImages.progress[uploadedImages.progress.length - 1].url,
            comments: comments,
          }

          updatedRepair.phases.progress = [
            ...(updatedRepair.phases.progress || []),
            newProgress,
          ]
        } else if (currentPhase === 'finish' && uploadedImages.finish) {
          updatedRepair.phases.finish = {
            created_by_user_name: fullName,
            created_by_user_id: userId,
            created_at: timestamp,
            photos: [uploadedImages.finish.url],
            comments: comments,
          }
        }

        await updateRepair(updatedRepair)
        toast.success('Repair updated successfully', {
          duration: 5000,
          position: 'bottom-right',
          style: {
            background: '#4CAF50',
            color: '#FFFFFF',
            fontWeight: 'bold',
          },
        })
      } else {
        // Crear nueva reparación
        if (!uploadedImages.survey) {
          toast.error('Survey image is required for new repair', {
            duration: 5000,
            position: 'bottom-right',
            style: {
              background: '#FF0000',
              color: '#FFFFFF',
              fontWeight: 'bold',
            },
          })
          return
        }

        const newRepair: RepairData = {
          id: Date.now(), // Temporal ID
          project_id: project_id,
          project_name: selectedProject?.name || '',
          elevation_name: elevation,
          drop: drop,
          level: level,
          repair_index: nextRepairIndex,
          status: 'pending',
          phases: {
            survey: {
              created_by_user_name: fullName,
              created_by_user_id: userId,
              created_at: timestamp,
              repair_type: repair_type,
              repair_type_id: selectedRepairType?.id || 0,
              measurements: measurements,
              photos: [uploadedImages.survey.url],
              comments: comments,
            },
          },
          created_by_user_name: fullName,
          created_by_user_id: userId,
          created_at: timestamp,
          updated_at: timestamp,
        }

        await addRepair(newRepair)
        toast.success('New repair created successfully', {
          duration: 5000,
          position: 'bottom-right',
          style: {
            background: '#4CAF50',
            color: '#FFFFFF',
            fontWeight: 'bold',
          },
        })
      }

      // Resetear formulario
      reset()
      setUploadedImages({ progress: [] })
      setMeasurements({})
      setComments('')
      setCurrentPhase(null)
      setSelectedRepair(null)
    } catch (error) {
      console.error('Error submitting repair:', error)
      toast.error('Failed to submit repair',{
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

  if (projectsLoading) {
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
                  onValueChange={(value) => setValue('repair_type', value)}
                  disabled={!project_id || !elevation || !drop || !level}
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
                          <span>Repair #{repair.repair_index}</span>
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
                              disabled={!!field.defaultValue}
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
                        disabled={!validateMeasurements()}
                        // customFileName={getFullRepairCode()}
                      />
                    </div>
                  </div>

                  {/* Upload Status */}
                  {uploadedImages.survey && currentPhase === 'survey' && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm">
                        Survey image uploaded successfully
                      </span>
                    </div>
                  )}
                  {uploadedImages.progress.length > 0 &&
                    currentPhase === 'progress' && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm">
                          {uploadedImages.progress.length} progress image(s)
                          uploaded
                        </span>
                      </div>
                    )}
                  {uploadedImages.finish && currentPhase === 'finish' && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm">
                        Finish image uploaded successfully
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

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={
                !isValid ||
                isSubmitting ||
                !currentPhase ||
                (currentPhase === 'survey' && !uploadedImages.survey) ||
                (currentPhase === 'progress' &&
                  uploadedImages.progress.length === 0) ||
                (currentPhase === 'finish' && !uploadedImages.finish)
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                `Submit ${getCurrentPhaseName() || 'Repair'} Phase`
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// // src/components/pages/technician/new-repair-page.tsx

// 'use client'

// import { useEffect, useRef, useState } from 'react'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { useForm } from 'react-hook-form'
// import { z } from 'zod'
// import { toast } from 'sonner'
// import { createFormSchema } from '@/lib/schemas/new-repair-form-schema'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Textarea } from '@/components/ui/textarea'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import { Separator } from '@/components/ui/separator'
// import { Label } from '@/components/ui/label'
// import { useProjectsList } from '@/hooks/use-projects-list'
// import { useRepairsDataStore } from '@/stores/repairs-data-store'
// import { useCurrentUser } from '@/stores/user-store'
// import CustomImageUpload from '@/components/custom-image-upload'
// import { getRepairStatus } from '@/lib/utils'
// import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
// import { RepairData, ProgressPhase } from '@/types/repair-type'
// import { REPAIR_TYPE_LIST } from '@/data/repair-type-list'

// type FormData = z.infer<ReturnType<typeof createFormSchema>>

// interface ImageUploadData {
//   url: string
//   publicId: string
//   fileName: string
//   phase: string
// }

// interface MeasurementField {
//   key: string
//   label: string
//   required: boolean
//   defaultValue?: number
//   placeholder?: string
// }

// export default function TechnicianNewRepairPage() {
//   const { projects, isLoading: projectsLoading } = useProjectsList()
//   const { repairsDataList, addRepair, updateRepair } = useRepairsDataStore()
//   const { userId, fullName } = useCurrentUser()

//   // Referencias para validación
//   const maxDropsRef = useRef<number | undefined>(undefined)
//   const maxLevelsRef = useRef<number | undefined>(undefined)

//   // Estados
//   const [currentPhase, setCurrentPhase] = useState<
//     'survey' | 'progress' | 'finish' | null
//   >(null)
//   const [selectedRepair, setSelectedRepair] = useState<RepairData | null>(null)
//   const [progressPhaseNumber, setProgressPhaseNumber] = useState<number>(1)
//   const [folderName, setFolderName] = useState<string>('')
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [uploadedImages, setUploadedImages] = useState<{
//     survey?: ImageUploadData
//     progress: ImageUploadData[]
//     finish?: ImageUploadData
//   }>({ progress: [] })
//   const [measurements, setMeasurements] = useState<Record<string, number>>({})
//   const [comments, setComments] = useState<string>('')

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isValid },
//     setValue,
//     watch,
//     reset,
//   } = useForm<FormData>({
//     resolver: zodResolver(createFormSchema({ maxDropsRef, maxLevelsRef })),
//     defaultValues: {
//       project_id: 0,
//       elevation: '',
//       drop: 1,
//       level: 1,
//       repair_type: '',
//       repair_index: 1,
//       survey_image: '',
//       progress_image: [],
//       finish_image: '',
//     },
//     mode: 'onChange',
//   })

//   const project_id = watch('project_id')
//   const elevation = watch('elevation')
//   const drop = watch('drop')
//   const level = watch('level')
//   const repair_type = watch('repair_type')
//   const repair_index = watch('repair_index')

//   // Obtener proyecto seleccionado
//   const selectedProject = projects.find((p) => p.id === project_id)

//   // Obtener tipo de reparación seleccionado desde REPAIR_TYPE_LIST
//   const selectedRepairType = REPAIR_TYPE_LIST.find(
//     (rt) => rt.type === repair_type && rt.status === 'active'
//   )

//   // Obtener tipo de reparación del proyecto (para obtener phases)
//   const projectRepairType = selectedProject?.repair_types.find(
//     (rt) => rt.repair_type === repair_type
//   )

//   // Calcular valores máximos
//   const maxDrops = elevation
//     ? selectedProject?.elevations.find((elev) => elev.name === elevation)?.drops
//     : undefined

//   const maxLevels = elevation
//     ? selectedProject?.elevations.find((elev) => elev.name === elevation)
//         ?.levels
//     : undefined

//   const phases = projectRepairType?.phases || 3

//   // Actualizar referencias
//   useEffect(() => {
//     maxDropsRef.current = maxDrops
//     maxLevelsRef.current = maxLevels
//   }, [maxDrops, maxLevels])

//   // Reiniciar campos dependientes cuando cambia el proyecto
//   useEffect(() => {
//     setValue('elevation', '')
//     setValue('drop', 1)
//     setValue('level', 1)
//     setValue('repair_type', '')
//     setValue('repair_index', 1)
//     setValue('progress_image', [])
//     setUploadedImages({ progress: [] })
//     setMeasurements({})
//     setComments('')
//   }, [project_id, setValue])

//   // Reiniciar campos cuando cambia la elevación
//   useEffect(() => {
//     setValue('drop', 1)
//     setValue('level', 1)
//     setValue('repair_type', '')
//     setValue('repair_index', 1)
//     setValue('progress_image', [])
//     setUploadedImages({ progress: [] })
//     setMeasurements({})
//   }, [elevation, setValue])

//   // Reiniciar mediciones cuando cambia el tipo de reparación
//   useEffect(() => {
//     if (selectedRepairType) {
//       const newMeasurements: Record<string, number> = {}

//       // Inicializar con valores por defecto si los hay
//       if (selectedRepairType.unit_measure.default_values) {
//         Object.entries(selectedRepairType.unit_measure.default_values).forEach(
//           ([key, value]) => {
//             newMeasurements[key] = value as number
//           }
//         )
//       }

//       // Inicializar otros campos requeridos con 0
//       selectedRepairType.unit_measure?.dimensions?.forEach((dimension) => {
//         if (!(dimension in newMeasurements)) {
//           newMeasurements[dimension] = 0
//         }
//       })

//       setMeasurements(newMeasurements)
//     } else {
//       setMeasurements({})
//       console.log('da')
//     }
//   }, [selectedRepairType])

//   // Filtrar reparaciones existentes
//   const matchingRepairs = repairsDataList.filter(
//     (repair) =>
//       repair.project_id === project_id &&
//       repair.elevation_name === elevation &&
//       repair.drop === drop &&
//       repair.level === level &&
//       repair.phases.survey?.repair_type === repair_type
//   )

//   // Calcular el próximo repairIndex
//   const nextRepairIndex =
//     matchingRepairs.length > 0
//       ? Math.max(...matchingRepairs.map((r) => r.repair_index)) + 1
//       : 1

//   // Generar campos de medición dinámicos
//   const getMeasurementFields = (): MeasurementField[] => {
//     if (!selectedRepairType) return []

//     const fields: MeasurementField[] = []
//     const { unit_measure } = selectedRepairType

//     switch (unit_measure.type) {
//       case 'volume':
//         fields.push(
//           {
//             key: 'width',
//             label: 'Width (mm)',
//             required: true,
//             placeholder: 'Enter width in mm',
//           },
//           {
//             key: 'height',
//             label: 'Height (mm)',
//             required: true,
//             placeholder: 'Enter height in mm',
//           },
//           {
//             key: 'depth',
//             label: 'Depth (mm)',
//             required: false,
//             defaultValue: unit_measure.default_values?.depth,
//             placeholder: `Default: ${
//               unit_measure.default_values?.depth || 'N/A'
//             } mm`,
//           }
//         )
//         break

//       case 'area':
//         fields.push(
//           {
//             key: 'width',
//             label: 'Width (mm)',
//             required: true,
//             placeholder: 'Enter width in mm',
//           },
//           {
//             key: 'height',
//             label: 'Height (mm)',
//             required: true,
//             placeholder: 'Enter height in mm',
//           }
//         )
//         break

//       case 'length':
//         fields.push({
//           key: 'length',
//           label: 'Length (mm)',
//           required: true,
//           placeholder: 'Enter length in mm',
//         })
//         break

//       case 'unit':
//         fields.push({
//           key: 'count',
//           label: 'Count',
//           required: true,
//           placeholder: 'Enter quantity',
//         })
//         break
//     }

//     return fields
//   }

//   // Calcular el valor convertido para mostrar
//   const getConvertedValue = () => {
//     if (!selectedRepairType || !selectedRepairType.conversion) return null

//     try {
//       const value =
//         selectedRepairType.conversion.conversion_factor(measurements)
//       return {
//         value: value.toFixed(3),
//         unit: selectedRepairType.unit_to_charge,
//       }
//     } catch (error) {
//       toast.error('Error calculating converted value', {
//         description: "Error: " + error,
//         position: 'bottom-right',
//         style: {
//           background: 'red',
//           color: 'white',
//           padding: '10px',
//           borderRadius: '5px',
//         }

//       })
//       return null
//     }
//   }

//   // Manejar selección de reparación
//   const handleRepairSelection = (value: string) => {
//     if (value === 'new') {
//       setValue('repair_index', nextRepairIndex)
//       setSelectedRepair(null)
//       setCurrentPhase('survey')
//       setProgressPhaseNumber(1)
//     } else {
//       const repairIndex = parseInt(value)
//       setValue('repair_index', repairIndex)
//       const repair = matchingRepairs.find((r) => r.repair_index === repairIndex)
//       setSelectedRepair(repair || null)

//       // Determinar la fase actual basada en el estado de la reparación
//       if (repair) {
//         if (!repair.phases.survey) {
//           setCurrentPhase('survey')
//         } else if (!repair.phases.finish && repair.phases.progress) {
//           const nextProgress = (repair.phases.progress?.length || 0) + 1
//           setProgressPhaseNumber(nextProgress)
//           setCurrentPhase(nextProgress <= phases - 2 ? 'progress' : 'finish')
//         } else if (!repair.phases.finish) {
//           setCurrentPhase('progress')
//           setProgressPhaseNumber(1)
//         } else {
//           setCurrentPhase(null) // Reparación completa
//         }
//       }
//     }
//   }

//   // Manejar subida exitosa de imagen
//   const handleImageUploadSuccess = (imageData: ImageUploadData) => {
//     if (currentPhase === 'survey') {
//       setUploadedImages((prev) => ({ ...prev, survey: imageData }))
//     } else if (currentPhase === 'progress') {
//       setUploadedImages((prev) => ({
//         ...prev,
//         progress: [...prev.progress, imageData],
//       }))
//     } else if (currentPhase === 'finish') {
//       setUploadedImages((prev) => ({ ...prev, finish: imageData }))
//     }
//   }

//   // Enviar formulario
//   const onSubmit = async (data: FormData) => {
//     if (!userId || !fullName) {
//       toast.error('User information not found')
//       return
//     }
//     console.log(data)

//     setIsSubmitting(true)

//     try {
//       const timestamp = new Date().toISOString()

//       if (selectedRepair) {
//         // Actualizar reparación existente
//         const updatedRepair: RepairData = {
//           ...selectedRepair,
//           updated_at: timestamp,
//         }

//         if (currentPhase === 'survey' && uploadedImages.survey) {
//           updatedRepair.phases.survey = {
//             created_by_user_name: fullName,
//             created_by_user_id: userId,
//             created_at: timestamp,
//             repair_type: repair_type,
//             repair_type_id: selectedRepairType?.id || 0,
//             measurements: measurements,
//             photos: [uploadedImages.survey.url],
//             comments: comments,
//           }
//         } else if (
//           currentPhase === 'progress' &&
//           uploadedImages.progress.length > 0
//         ) {
//           const newProgress: ProgressPhase = {
//             created_by_user_name: fullName,
//             created_by_user_id: userId,
//             created_at: timestamp,
//             repair_type: repair_type,
//             repair_type_id: selectedRepairType?.id || 0,
//             measurements: measurements,
//             photo:
//               uploadedImages.progress[uploadedImages.progress.length - 1].url,
//             comments: comments,
//           }

//           updatedRepair.phases.progress = [
//             ...(updatedRepair.phases.progress || []),
//             newProgress,
//           ]
//         } else if (currentPhase === 'finish' && uploadedImages.finish) {
//           updatedRepair.phases.finish = {
//             created_by_user_name: fullName,
//             created_by_user_id: userId,
//             created_at: timestamp,
//             photos: [uploadedImages.finish.url],
//             comments: comments,
//           }
//         }

//         await updateRepair(updatedRepair)
//         toast.success('Repair updated successfully')
//       } else {
//         // Crear nueva reparación
//         if (!uploadedImages.survey) {
//           toast.error('Survey image is required for new repair')
//           return
//         }

//         const newRepair: RepairData = {
//           id: Date.now(), // Temporal ID
//           project_id: project_id,
//           project_name: selectedProject?.name || '',
//           elevation_name: elevation,
//           drop: drop,
//           level: level,
//           repair_index: nextRepairIndex,
//           status: 'pending',
//           phases: {
//             survey: {
//               created_by_user_name: fullName,
//               created_by_user_id: userId,
//               created_at: timestamp,
//               repair_type: repair_type,
//               repair_type_id: selectedRepairType?.id || 0,
//               measurements: measurements,
//               photos: [uploadedImages.survey.url],
//               comments: comments,
//             },
//           },
//           created_by_user_name: fullName,
//           created_by_user_id: userId,
//           created_at: timestamp,
//           updated_at: timestamp,
//         }

//         await addRepair(newRepair)
//         toast.success('New repair created successfully')
//       }

//       // Resetear formulario
//       reset()
//       setUploadedImages({ progress: [] })
//       setMeasurements({})
//       setComments('')
//       setCurrentPhase(null)
//       setSelectedRepair(null)
//     } catch (error) {
//       console.error('Error submitting repair:', error)
//       toast.error('Failed to submit repair')
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   // Obtener el nombre de la fase actual
//   const getCurrentPhaseName = () => {
//     if (currentPhase === 'survey') return 'Survey'
//     if (currentPhase === 'progress') return `Progress ${progressPhaseNumber}`
//     if (currentPhase === 'finish') return 'Finish'
//     return null
//   }

//   // Obtener el código de fase para el nombre del archivo
//   const getPhaseCode = () => {
//     if (currentPhase === 'survey') return 'S'
//     if (currentPhase === 'progress') return `P${progressPhaseNumber}`
//     if (currentPhase === 'finish') return 'F'
//     return ''
//   }

//   if (projectsLoading) {
//     return (
//       <div className="w-full flex justify-center items-center min-h-[400px]">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     )
//   }

//   return (
//     <div className="w-full flex flex-col gap-8 p-2 md:p-8">
//       <Card className="w-full lg:max-w-4xl">
//         <CardHeader>
//           <CardTitle>New Repair Entry</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//             {/* Project Selection */}
//             <div className="grid gap-4 md:grid-cols-2">
//               <div className="md:col-span-2">
//                 <Label>Project</Label>
//                 <Select
//                   value={project_id === 0 ? '' : project_id.toString()}
//                   onValueChange={(value) => {
//                     setValue('project_id', parseInt(value))
//                     const project = projects.find(
//                       (p) => p.id === parseInt(value)
//                     )
//                     setFolderName(project?.name || '')
//                   }}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select project" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {projects.map((project) => (
//                       <SelectItem
//                         key={project.id}
//                         value={project.id.toString()}
//                       >
//                         {project.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 {errors.project_id && (
//                   <p className="mt-1 text-sm text-red-500">
//                     {errors.project_id.message}
//                   </p>
//                 )}
//               </div>
//             </div>

//             {/* Location Selection */}
//             <div className="grid gap-4 md:grid-cols-4">
//               <div className="md:col-span-2">
//                 <Label>Elevation</Label>
//                 <Select
//                   value={elevation}
//                   onValueChange={(value) => setValue('elevation', value)}
//                   disabled={!project_id}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select elevation" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {selectedProject?.elevations.map((elevation) => (
//                       <SelectItem key={elevation.name} value={elevation.name}>
//                         {elevation.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 {errors.elevation && (
//                   <p className="mt-1 text-sm text-red-500">
//                     {errors.elevation.message}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <Label>
//                   Drop{' '}
//                   {maxDrops && (
//                     <span className="text-muted-foreground">
//                       (max: {maxDrops})
//                     </span>
//                   )}
//                 </Label>
//                 <Input
//                   type="number"
//                   disabled={!elevation}
//                   {...register('drop', { valueAsNumber: true })}
//                   max={maxDrops}
//                   min={1}
//                 />
//                 {errors.drop && (
//                   <p className="mt-1 text-sm text-red-500">
//                     {errors.drop.message}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <Label>
//                   Level{' '}
//                   {maxLevels && (
//                     <span className="text-muted-foreground">
//                       (max: {maxLevels})
//                     </span>
//                   )}
//                 </Label>
//                 <Input
//                   type="number"
//                   disabled={!elevation}
//                   {...register('level', { valueAsNumber: true })}
//                   max={maxLevels}
//                   min={1}
//                 />
//                 {errors.level && (
//                   <p className="mt-1 text-sm text-red-500">
//                     {errors.level.message}
//                   </p>
//                 )}
//               </div>
//             </div>

//             {/* Repair Type Selection */}
//             <div className="grid gap-4 md:grid-cols-2">
//               <div>
//                 <Label>Repair Type</Label>
//                 <Select
//                   value={repair_type}
//                   onValueChange={(value) => {
//                     setValue('repair_type', value)
//                   }}
//                   disabled={!project_id || !elevation || !drop || !level}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select repair type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {selectedProject?.repair_types.map((rt) => (
//                       <SelectItem
//                         key={rt.repair_type_id}
//                         value={rt.repair_type}
//                       >
//                         {rt.repair_type}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 {errors.repair_type && (
//                   <p className="mt-1 text-sm text-red-500">
//                     {errors.repair_type.message}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <Label>Index Repair Selection</Label>
//                 <Select
//                   value={
//                     repair_index === nextRepairIndex && !selectedRepair
//                       ? ''
//                       : repair_index.toString()
//                   }
//                   // value={repair_index.toString()}
//                   defaultValue="select-default"
//                   onValueChange={handleRepairSelection}
//                   disabled={!repair_type}
//                 >
//                   <SelectTrigger className=" placeholder:text-red-500">
//                     <SelectValue placeholder="Select or create repair" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="select-default">
//                       Select repair
//                     </SelectItem>
//                     <SelectItem value="new">
//                       <div className="flex items-center gap-2">
//                         <CheckCircle2 className="h-4 w-4 text-green-600" />
//                         Create new repair (Index: {nextRepairIndex})
//                       </div>
//                     </SelectItem>
//                     {matchingRepairs.map((repair) => (
//                       <SelectItem
//                         key={repair.id}
//                         value={repair.repair_index.toString()}
//                       >
//                         <div className="flex items-center gap-2">
//                           <span>Repair #{repair.repair_index}</span>
//                           <Badge
//                             variant={
//                               repair.status === 'approved'
//                                 ? 'default'
//                                 : repair.status === 'pending'
//                                 ? 'secondary'
//                                 : 'destructive'
//                             }
//                           >
//                             {getRepairStatus(repair)}
//                           </Badge>
//                         </div>
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             {/* Phase Information */}
//             {currentPhase && (
//               <>
//                 <Separator />
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <h3 className="text-lg font-semibold">
//                       {getCurrentPhaseName()} Phase
//                     </h3>
//                     <Badge variant="outline" className="text-sm">
//                       {selectedRepair
//                         ? 'Updating Existing Repair'
//                         : 'Creating New Repair'}
//                     </Badge>
//                   </div>

//                   {/* Repair Code Display */}
//                   <div className="bg-muted p-3 rounded-md">
//                     <p className="text-sm font-medium">Repair Code:</p>
//                     <p className="text-lg font-mono">
//                       D{drop}.L{level}.{repair_type}.{repair_index}
//                     </p>
//                   </div>

//                   {/* Repair Type Information */}
//                   {selectedRepairType && (
//                     <div className="bg-blue-50 p-3 rounded-md border">
//                       <p className="text-sm font-medium text-blue-900">
//                         {selectedRepairType.variation} (
//                         {selectedRepairType.type})
//                       </p>
//                       <p className="text-xs text-blue-700">
//                         Unit: {selectedRepairType.unit_measure.value} →{' '}
//                         {selectedRepairType.unit_to_charge}
//                       </p>
//                     </div>
//                   )}

//                   {/* Dynamic Measurements Input */}
//                   {selectedRepairType && (
//                     <div>
//                       <Label>Measurements</Label>
//                       <div className="grid gap-3 md:grid-cols-3 mt-2">
//                         {getMeasurementFields().map((field) => (
//                           <div key={field.key}>
//                             <Label className="text-sm">
//                               {field.label}
//                               {field.required && (
//                                 <span className="text-red-500 ml-1">*</span>
//                               )}
//                             </Label>
//                             <Input
//                               type="number"
//                               step="0.01"
//                               placeholder={field.placeholder}
//                               value={measurements[field.key] || ''}
//                               onChange={(e) => {
//                                 const value = parseFloat(e.target.value) || 0
//                                 setMeasurements((prev) => ({
//                                   ...prev,
//                                   [field.key]: value,
//                                 }))
//                               }}
//                               disabled={!!field.defaultValue}
//                             />
//                             {field.defaultValue && (
//                               <p className="text-xs text-muted-foreground mt-1">
//                                 Default value: {field.defaultValue}
//                               </p>
//                             )}
//                           </div>
//                         ))}
//                       </div>

//                       {/* Converted Value Display */}
//                       {(() => {
//                         const converted = getConvertedValue()
//                         return (
//                           converted && (
//                             <div className="mt-3 p-2 bg-green-50 rounded-md border border-green-200">
//                               <p className="text-sm text-green-800">
//                                 <span className="font-medium">
//                                   Converted Value:
//                                 </span>{' '}
//                                 {converted.value} {converted.unit}
//                               </p>
//                             </div>
//                           )
//                         )
//                       })()}
//                     </div>
//                   )}

//                   {/* Comments */}
//                   <div>
//                     <Label>Comments</Label>
//                     <Textarea
//                       value={comments}
//                       onChange={(e) => setComments(e.target.value)}
//                       placeholder="Add any relevant comments about this repair phase..."
//                       rows={3}
//                     />
//                   </div>

//                   {/* Image Upload */}
//                   <div>
//                     <Label>Upload {getCurrentPhaseName()} Image</Label>
//                     <div className="mt-2">
//                       <CustomImageUpload
//                         fieldName={`${currentPhase}_image`}
//                         fileNameData={{
//                           drop,
//                           level,
//                           repair_type,
//                           repair_index,
//                           measures:
//                             Object.values(measurements).join('x') || '0x0x0',
//                           phase: getPhaseCode(),
//                         }}
//                         folderName={folderName}
//                         userName={fullName || 'Unknown'}
//                         onUploadSuccess={handleImageUploadSuccess}
//                       />
//                     </div>
//                   </div>

//                   {/* Upload Status */}
//                   {uploadedImages.survey && currentPhase === 'survey' && (
//                     <div className="flex items-center gap-2 text-green-600">
//                       <CheckCircle2 className="h-4 w-4" />
//                       <span className="text-sm">
//                         Survey image uploaded successfully
//                       </span>
//                     </div>
//                   )}
//                   {uploadedImages.progress.length > 0 &&
//                     currentPhase === 'progress' && (
//                       <div className="flex items-center gap-2 text-green-600">
//                         <CheckCircle2 className="h-4 w-4" />
//                         <span className="text-sm">
//                           {uploadedImages.progress.length} progress image(s)
//                           uploaded
//                         </span>
//                       </div>
//                     )}
//                   {uploadedImages.finish && currentPhase === 'finish' && (
//                     <div className="flex items-center gap-2 text-green-600">
//                       <CheckCircle2 className="h-4 w-4" />
//                       <span className="text-sm">
//                         Finish image uploaded successfully
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </>
//             )}

//             {/* No phase available message */}
//             {repair_type && repair_index && !currentPhase && selectedRepair && (
//               <div className="bg-muted p-4 rounded-md">
//                 <div className="flex items-center gap-2 text-muted-foreground">
//                   <AlertCircle className="h-5 w-5" />
//                   <p>
//                     This repair has been completed. All phases are finished.
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* Submit Button */}
//             <Button
//               type="submit"
//               className="w-full"
//               disabled={
//                 !isValid ||
//                 isSubmitting ||
//                 !currentPhase ||
//                 (currentPhase === 'survey' && !uploadedImages.survey) ||
//                 (currentPhase === 'progress' &&
//                   uploadedImages.progress.length === 0) ||
//                 (currentPhase === 'finish' && !uploadedImages.finish)
//               }
//             >
//               {isSubmitting ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Submitting...
//                 </>
//               ) : (
//                 `Submit ${getCurrentPhaseName() || 'Repair'} Phase`
//               )}
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

// 'use client'

// import { useEffect, useRef, useState } from 'react'
// //import { CldImage, CldUploadWidget } from 'next-cloudinary'
// //import { Camera, Upload } from 'lucide-react'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { useForm } from 'react-hook-form'
// import { z } from 'zod'
// import { createFormSchema } from '@/lib/schemas/new-repair-form-schema'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'

// import { useProjectsListStore } from '@/stores/projects-list-store'
// import { useRepairsDataStore } from '@/stores/repairs-data-store'
// // import { RepairData } from '@/types/repair-type'
// import CustomImageUpload from '@/components/custom-image-upload'
// import { getRepairStatus } from "@/lib/utils"

// type FormData = z.infer<ReturnType<typeof createFormSchema>>

// export default function TechnicianNewRepairPage() {
//   const { projectsList } = useProjectsListStore()
//   const {
//     repairsDataList,
//     // addRepair,
//     // updateRepair
//   } = useRepairsDataStore()

//   // Referencias para validación
//   const maxDropsRef = useRef<number | undefined>(undefined)
//   const maxLevelsRef = useRef<number | undefined>(undefined)
//   const [statusRepairPhases, setStatusRepairPhases] = useState<
//     'S' | `P${number}` | 'F' | null
//   >(null)
//   const [folderName, setFolderName] = useState<string>('')

//   console.log('status repair phases: ', statusRepairPhases)

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isValid },
//     setValue,
//     watch,
//     reset,
//   } = useForm<FormData>({
//     resolver: zodResolver(createFormSchema({ maxDropsRef, maxLevelsRef })),
//     defaultValues: {
//       project_id: 0,
//       elevation: '',
//       drop: 1,
//       level: 1,
//       repair_type: '',
//       repair_index: 1,
//       survey_image: '',
//       progress_image: [],
//       finish_image: '',
//     },
//     mode: 'onChange',
//   })

//   const project_id = watch('project_id')
//   const elevation = watch('elevation')
//   const drop = watch('drop')
//   const level = watch('level')
//   const repair_type = watch('repair_type')
//   const repair_index = watch('repair_index')

//   console.log('repair index: ', repair_index)

//   // Calcular valores máximos
//   const maxDrops = elevation
//     ? projectsList
//         .find((project) => project.id === project_id)
//         ?.elevations.find((elev) => elev.name === elevation)?.drops
//     : undefined

//   const maxLevels = elevation
//     ? projectsList
//         .find((project) => project.id === project_id)
//         ?.elevations.find((elev) => elev.name === elevation)?.levels
//     : undefined

//   const phases = projectsList
//     .find((project) => project.id === project_id)
//     ?.repair_types.find((rt) => rt.repair_type === repair_type)?.phases

//   console.log('phases new repair: ', phases)

//   // Actualizar referencias
//   useEffect(() => {
//     maxDropsRef.current = maxDrops
//     maxLevelsRef.current = maxLevels
//   }, [maxDrops, maxLevels])

//   // Reiniciar campos dependientes
//   useEffect(() => {
//     setValue('elevation', '')
//     setValue('drop', 1)
//     setValue('level', 1)
//     setValue('repair_type', '')
//     setValue('repair_index', 1)
//     setValue('progress_image', [])
//   }, [project_id, setValue])

//   useEffect(() => {
//     setValue('drop', 1)
//     setValue('level', 1)
//     setValue('repair_type', '')
//     setValue('repair_index', 1)
//     setValue('progress_image', [])
//   }, [elevation, setValue])

//   // Filtrar reparaciones existentes
//   const matchingRepairs = repairsDataList.filter(
//     (repair) =>
//       repair.project_id === project_id &&
//       repair.elevation_name === elevation &&
//       repair.drop === drop &&
//       repair.level === level &&
//       repair.phases.survey?.repair_type === repair_type
//   )

//   // Calcular el próximo repairIndex
//   const nextRepairIndex =
//     matchingRepairs.length > 0
//       ? Math.max(...matchingRepairs.map((r) => r.repair_index)) + 1
//       : 1

//   console.log('nextRepairIndex', nextRepairIndex)

//   // Estado para manejar la creación de una nueva reparación
//   const [isNewRepair, setIsNewRepair] = useState<boolean | null>(null)

//   // Determinar el estado de una reparación
//   // const getRepairStatus = (repair: RepairData) => {
//   //   if (repair.phases.finish.created_at.length > 0) return 'finish'
//   //   if (repair.phases.progress.some((p) => p.created_at > 0)) return 'progress'
//   //   if (repair.phases.survey.created_at > 0) return 'survey'
//   //   return 'pending'
//   // }

//   // const handleFileName = () => {
//   //   if (!drop || !level || !repairType || !repairIndex) return
//   //   const name = `D${drop}.L${level}.${repairType}.${repairIndex}.100x100x40.S`
//   //   console.log('filename: ', name)

//   //   setFileName(name)
//   // }

//   const onSubmit = (data: FormData) => {
//     console.log('Form submitted:', data)

//     // addRepair(data)
//     // updateRepair(data)
//     reset()
//   }

//   return (
//     <div className="w-full flex flex-col gap-8 p-2 md:p-8 ">
//       <div className="w-full lg:max-w-3xl rounded-lg border bg-neutral-100 p-2 md:p-6 shadow-sm">
//         <h2 className="mb-4 text-xl font-semibold">New Repair</h2>
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//           <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
//             <div className="sm:col-span-4">
//               <label className="mb-2 block text-sm font-medium">Project</label>
//               <Select
//                 value={project_id === 0 ? '' : project_id.toString()}
//                 onValueChange={(value) => {
//                   setValue('project_id', parseInt(value))
//                   setFolderName(
//                     projectsList.find((p) => p.id === parseInt(value))?.name ||
//                       ''
//                   )
//                 }}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select project" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {projectsList.map((project) => (
//                     <SelectItem key={project.id} value={project.id.toString()}>
//                       {project.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               {errors.project_id && (
//                 <p className="mt-1 text-sm text-red-500">
//                   {errors.project_id.message}
//                 </p>
//               )}
//             </div>

//             <div className="sm:col-span-2">
//               <label className="mb-2 block text-sm font-medium">
//                 Elevation
//               </label>
//               <Select
//                 value={elevation}
//                 onValueChange={(value) => setValue('elevation', value)}
//                 disabled={!project_id}
//               >
//                 <SelectTrigger className="disabled:border-neutral-400 disabled:bg-neutral-300">
//                   <SelectValue placeholder="Select elevation" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {projectsList
//                     .find((project) => project.id === project_id)
//                     ?.elevations.map((elevation) => (
//                       <SelectItem key={elevation.name} value={elevation.name}>
//                         {elevation.name}
//                       </SelectItem>
//                     ))}
//                 </SelectContent>
//               </Select>
//               {errors.elevation && (
//                 <p className="mt-1 text-sm text-red-500">
//                   {errors.elevation.message}
//                 </p>
//               )}
//             </div>

//             <div>
//               <label className="mb-2 block text-sm font-medium">
//                 Drop{' '}
//                 {elevation && <span>(min: 1 - max: {maxDrops || 'N/A'})</span>}
//               </label>
//               <Input
//                 type="number"
//                 placeholder="Enter drop"
//                 disabled={!elevation}
//                 {...register('drop', { valueAsNumber: true })}
//                 max={maxDrops}
//                 min={1}
//                 step={1}
//                 className="disabled:border-neutral-400 disabled:bg-neutral-300"
//               />
//               {errors.drop && (
//                 <p className="mt-1 text-sm text-red-500">
//                   {errors.drop.message}
//                 </p>
//               )}
//             </div>

//             <div>
//               <label className="mb-2 block text-sm font-medium">
//                 Level{' '}
//                 {elevation && <span>(min: 1 - max: {maxLevels || 'N/A'})</span>}
//               </label>
//               <Input
//                 type="number"
//                 placeholder="Enter level"
//                 disabled={!elevation}
//                 {...register('level', { valueAsNumber: true })}
//                 max={maxLevels}
//                 min={1}
//                 step={1}
//                 className="disabled:border-neutral-400 disabled:bg-neutral-300"
//               />
//               {errors.level && (
//                 <p className="mt-1 text-sm text-red-500">
//                   {errors.level.message}
//                 </p>
//               )}
//             </div>

//             <div className="sm:col-span-2">
//               <label className="mb-2 block text-sm font-medium">
//                 Repair Type
//               </label>
//               <Select
//                 value={repair_type}
//                 onValueChange={(value) => setValue('repair_type', value)}
//                 disabled={
//                   !project_id || elevation.length === 0 || !drop || !level
//                 }
//               >
//                 <SelectTrigger className="disabled:border-neutral-400 disabled:bg-neutral-300">
//                   <SelectValue placeholder="Select repair type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {projectsList
//                     .find((project) => project.id === project_id)
//                     ?.repair_types.map((repair_type) => (
//                       <SelectItem
//                         key={repair_type.repair_type_id}
//                         value={repair_type.repair_type}
//                       >
//                         {repair_type.repair_type}
//                       </SelectItem>
//                     ))}
//                 </SelectContent>
//               </Select>
//               {errors.repair_type && (
//                 <p className="mt-1 text-sm text-red-500">
//                   {errors.repair_type.message}
//                 </p>
//               )}
//             </div>

//             <div className="sm:col-span-2">
//               <label className="mb-2 block text-sm font-medium">
//                 Repair Index
//               </label>
//               <Select
//                 value={watch('repair_index')?.toString()}
//                 onValueChange={(value) => {
//                   if (value === nextRepairIndex.toString()) {
//                     setIsNewRepair(true)
//                     setValue('repair_index', nextRepairIndex)
//                     setStatusRepairPhases('S')
//                   } else {
//                     setIsNewRepair(false)
//                     setValue('repair_index', parseInt(value))
//                   }
//                 }}
//                 disabled={!repair_type}
//               >
//                 <SelectTrigger className="disabled:border-neutral-400 disabled:bg-neutral-300">
//                   <SelectValue placeholder="Select repair index" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {matchingRepairs.map((repair) => (
//                     <SelectItem
//                       key={repair.id}
//                       value={repair.repair_index.toString()}
//                     >
//                       Repair #{repair.repair_index} ({getRepairStatus(repair)})
//                     </SelectItem>
//                   ))}
//                   <SelectItem value={nextRepairIndex.toString()}>
//                     Create new repair (Index: {nextRepairIndex})
//                   </SelectItem>
//                 </SelectContent>
//               </Select>
//               {errors.repair_index && (
//                 <p className="mt-1 text-sm text-red-500">
//                   {errors.repair_index.message}
//                 </p>
//               )}
//             </div>
//           </div>

//           <div className="grid gap-6 sm:grid-cols-3">
//             {isNewRepair && (
//               <div className="sm:col-span-3">
//                 <h3 className="mb-2 block text-sm font-medium">
//                   Repair #{nextRepairIndex}
//                 </h3>
//               </div>
//             )}

//             {/* <div>
//               <label className="mb-2 block text-sm font-medium">
//                 Survey Image
//               </label>
//               <div className="mt-1 flex flex-col gap-2">
//                 <div className="flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5">
//                   <div className="space-y-1 text-center">
//                     <Upload className="mx-auto h-12 w-12 text-gray-400" />
//                     <div className="flex text-sm text-gray-600">
//                       <label className="relative cursor-pointer rounded-md bg-white font-medium text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 hover:text-orange-400">
//                         <span>Upload a file</span>
//                         <Input
//                           type="file"
//                           className="sr-only"
//                           onChange={() =>
//                             setValue('survey_image', 'uploaded', {
//                               shouldValidate: true,
//                             })
//                           }
//                         />
//                       </label>
//                     </div>
//                     <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
//                   </div>
//                 </div>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   className="flex items-center justify-center"
//                   onClick={() =>
//                     setValue('survey_image', 'camera', { shouldValidate: true })
//                   }
//                 >
//                   <Camera className="mr-2 h-4 w-4" />
//                   Use Camera
//                 </Button>
//               </div>
//               {errors.survey_image && (
//                 <p className="mt-1 text-sm text-red-500">
//                   {errors.survey_image.message}
//                 </p>
//               )}
//             </div>

//             {new Array(phases ? phases - 2 : 0).fill(0).map((_, index) => (
//               <div key={index}>
//                 <label className="mb-2 block text-sm font-medium">
//                   Progress {index + 1} Image
//                 </label>
//                 <div className="mt-1 flex flex-col gap-2">
//                   <div className="flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5">
//                     <div className="space-y-1 text-center">
//                       <Upload className="mx-auto h-12 w-12 text-gray-400" />
//                       <div className="flex text-sm text-gray-600">
//                         <label className="relative cursor-pointer rounded-md bg-white font-medium text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 hover:text-orange-400">
//                           <span>Upload a file</span>
//                           <Input
//                             type="file"
//                             className="sr-only"
//                             onChange={() => {
//                               const currentImages = watch('progress_image') || []
//                               setValue(
//                                 'progress_image',
//                                 [...currentImages, 'uploaded'],
//                                 { shouldValidate: true }
//                               )
//                             }}
//                           />
//                         </label>
//                       </div>
//                       <p className="text-xs text-gray-500">
//                         PNG, JPG up to 10MB
//                       </p>
//                     </div>
//                   </div>
//                   <Button
//                     type="button"
//                     variant="outline"
//                     className="flex items-center justify-center"
//                     onClick={() => {
//                       const currentImages = watch('progress_image') || []
//                       setValue('progress_image', [...currentImages, 'camera'], {
//                         shouldValidate: true,
//                       })
//                     }}
//                   >
//                     <Camera className="mr-2 h-4 w-4" />
//                     Use Camera
//                   </Button>
//                 </div>
//                 {errors.progress_image && (
//                   <p className="mt-1 text-sm text-red-500">
//                     {errors.progress_image.message}
//                   </p>
//                 )}
//               </div>
//             ))}

//             <div>
//               <label className="mb-2 block text-sm font-medium">
//                 Finish Image
//               </label>
//               <div className="mt-1 flex flex-col gap-2">
//                 <div className="flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5">
//                   <div className="space-y-1 text-center">
//                     <Upload className="mx-auto h-12 w-12 text-gray-400" />
//                     <div className="flex text-sm text-gray-600">
//                       <label className="relative cursor-pointer rounded-md bg-white font-medium text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 hover:text-orange-400">
//                         <span>Upload a file</span>
//                         <Input
//                           type="file"
//                           className="sr-only"
//                           onChange={() =>
//                             setValue('finish_image', 'uploaded', {
//                               shouldValidate: true,
//                             })
//                           }
//                         />
//                       </label>
//                     </div>
//                     <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
//                   </div>
//                 </div>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   className="flex items-center justify-center"
//                   onClick={() =>
//                     setValue('finish_image', 'camera', { shouldValidate: true })
//                   }
//                 >
//                   <Camera className="mr-2 h-4 w-4" />
//                   Use Camera
//                 </Button>
//               </div>
//               {errors.finish_image && (
//                 <p className="mt-1 text-sm text-red-500">
//                   {errors.finish_image.message}
//                 </p>
//               )}
//             </div> */}
//             <div className=" col-span-3">
//               <CustomImageUpload
//                 fieldName="survey_image"
//                 fileNameData={{
//                   drop,
//                   level,
//                   repair_type,
//                   repair_index,
//                   measures: '100x100x40',
//                   phase: 'S',
//                 }}
//                 folderName={folderName}
//                 userName="John Doe"
//                 onUploadSuccess={(imageData) => {
//                   // save data on supabase
//                   console.log('success upload: ', imageData)
//                 }}
//               />
//             </div>
//           </div>

//           <Button
//             type="submit"
//             className="w-full bg-orange-500 text-white hover:bg-orange-400 disabled:bg-gray-300"
//             disabled={!isValid}
//           >
//             Submit Repair
//           </Button>
//         </form>
//       </div>

//       {/* Testing */}
//       {/* <div>
//         <CustomImageUpload
//           fieldName="progress_image"
//           fileNameData={{
//             drop: 15,
//             level: 14,
//             repairType: 'CR',
//             repairIndex: 1,
//             measures: '100x100x40',
//             phase: 'P2',
//           }}
//           folderName={'sample'}
//           userName="John Doe (id: 1)"
//           onUploadSuccess={(imageData) => {
//             console.log('success upload: ', imageData)
//           }}
//         />
//       </div> */}
//     </div>
//   )
// }

// const CloudUploadImage = () => {
//   return (
//     <CldUploadWidget
//       uploadPreset="signed_upload"
//       options={{
//         maxFiles: 1,
//         sources: ['local', 'camera'],
//         fieldName: 'image',
//         multiple: false,
//         resourceType: 'image',
//         folder: 'sample',
//       }}
//       onUpload={(result) => {
//         console.log(result)
//       }}
//       onOpen={() => {
//         console.log('Widget opened')
//       }}
//       onClose={() => {
//         console.log('Widget closed')
//       }}
//     >
//       {({ open }) => {
//         return (
//           <Button
//             type="button"
//             className="flex items-center justify-center"
//             onClick={() => open()}
//           >
//             <Camera className="mr-2 h-4 w-4" />
//             Use Camera
//           </Button>
//         )
//       }}
//     </CldUploadWidget>
//   )
// }

// const CloudImage = ({ image }: { image: string }) => {
//   return (
//     <CldImage
//       className="h-full w-full"
//       src="cld-sample-2" // Use this sample image or upload your own via the Media Explorer
//       width="500" // Transform the image: auto-crop to square aspect_ratio
//       height="500"
//       crop={{
//         type: 'auto',
//         source: true,
//       }}
//       alt="Sample image"
//     />
//   )
// }

// 'use client'

// import { useState } from 'react'
// import { Camera, Upload } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import { LogoutButton } from '@/components/logout-button'

// import { useProjectsListStore } from '@/stores/projects-list-store'
// import { RepairData, RepairType } from '@/types/repair-type'
// import { ProjectData } from '@/types/project-types'

// type ImageOrigin = 'camera' | 'uploaded'

// type FormData = {
//   projectId: string
//   elevation: string
//   drop: string
//   level: string
//   repairType: string
//   survey_image: ImageOrigin | null
//   progress_image: ImageOrigin | null
//   finish_image: ImageOrigin | null
// }

// export default function TechnicianNewRepairPage() {
//   const { projectsList } = useProjectsListStore()

//   console.log('projectsList: ', projectsList)
//   const [projectSelected, setProjectSelected] = useState<ProjectData | null>(
//     null
//   )
//   const [elevationSelected, setElevationSelected] =
//     useState<RepairData['elevation_name']>('')
//   const [dropSelected, setDropSelected] = useState<RepairData['drop']>(0)
//   const [levelSelected, setLevelSelected] = useState<RepairData['level']>(0)
//   const [repairTypeSelected, setRepairTypeSelected] =
//     useState<RepairType['type']>('')
//   const [repairIndexSelected, setRepairIndexSelected] =
//     useState<RepairData['repairIndex']>(1)

//   const [formData, setFormData] = useState<FormData>({
//     projectId: '',
//     elevation: '',
//     drop: '',
//     level: '',
//     repairType: '',
//     survey_image: null,
//     progress_image: null,
//     finish_image: null,
//   })

//   const isFormComplete =
//     formData.projectId &&
//     formData.elevation &&
//     formData.drop &&
//     formData.level &&
//     formData.repairType &&
//     formData.survey_image &&
//     formData.progress_image &&
//     formData.finish_image

//   return (
//     <div className="flex flex-col gap-8 p-8">
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-bold text-orange-500">
//           Technician Dashboard
//         </h1>
//         <LogoutButton />
//       </div>

//       <div className=" w-full lg:w-1/2  rounded-lg border bg-white p-6 shadow-sm">
//         <h2 className="mb-4 text-xl font-semibold">New Repair</h2>
//         <form className="space-y-6">
//           <div className="grid gap-4 sm:grid-cols-4">
//             <div className="sm:col-span-4">
//               <label className="mb-2 block text-sm font-medium">Project</label>
//               <Select
//                 value={projectSelected?.name || ''}
//                 onValueChange={(value) =>
//                   setProjectSelected(
//                     projectsList?.find((project) => project.name === value) ||
//                       null
//                   )
//                 }
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select project" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {projectsList.map((project) => (
//                     <SelectItem key={project.id} value={project.name}>
//                       {project.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="sm:col-span-2">
//               <label className="mb-2 block text-sm font-medium">
//                 Elevation
//               </label>
//               <Select
//                 value={elevationSelected}
//                 onValueChange={(value) => setElevationSelected(value)}
//                 disabled={!projectSelected}
//               >
//                 <SelectTrigger className=" disabled:border-neutral-400 disabled:bg-neutral-300">
//                   <SelectValue placeholder="Select elevation" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {projectsList
//                     .find((project) => project.id === projectSelected?.id)
//                     ?.elevations.map((elevation) => (
//                       <SelectItem key={elevation.name} value={elevation.name}>
//                         {elevation.name}
//                       </SelectItem>
//                     ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div>
//               <label className="mb-2 block text-sm font-medium">
//                 Drop{' '}
//                 {elevationSelected && (
//                   <span>
//                     (min: 1 - max:
//                     {
//                       projectSelected?.elevations.find(
//                         (elevation) => elevation.name === elevationSelected
//                       )?.drops
//                     }
//                     )
//                   </span>
//                 )}
//               </label>
//               <Input
//                 type="number"
//                 placeholder="Enter drop"
//                 disabled={elevationSelected === ''}
//                 value={dropSelected || ''}
//                 onChange={(e) => {
//                   console.log(
//                     'drop input: ',
//                     parseInt(e.target.value ?? '0', 10)
//                   )

//                   setDropSelected(parseInt(e.target.value ?? '0', 10))
//                 }}
//                 min={1}
//                 max={
//                   projectsList
//                     .find((project) => project.id === projectSelected?.id)
//                     ?.elevations.find(
//                       (elevation) => elevation.name === elevationSelected
//                     )?.drops
//                 }
//                 step={1}
//                 className="disabled:border-neutral-400 disabled:bg-neutral-300"
//               />
//             </div>

//             <div>
//               <label className="mb-2 block text-sm font-medium">Level</label>
//               <Input
//                 type="number"
//                 placeholder="Enter level"
//                 disabled={elevationSelected === ''}
//                 value={levelSelected}
//                 onChange={(e) => setLevelSelected(parseInt(e.target.value, 10))}
//               />
//             </div>

//             <div className="sm:col-span-2">
//               <label className="mb-2 block text-sm font-medium">
//                 Repair Type
//               </label>
//               <Select
//                 value={formData.repairType}
//                 onValueChange={(value) =>
//                   setFormData({ ...formData, repairType: value })
//                 }
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select repair type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="structural">Structural</SelectItem>
//                   <SelectItem value="electrical">Electrical</SelectItem>
//                   <SelectItem value="mechanical">Mechanical</SelectItem>
//                   <SelectItem value="plumbing">Plumbing</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <div className="grid gap-6 sm:grid-cols-3">
//             <div>
//               <label className="mb-2 block text-sm font-medium">
//                 Survey Image
//               </label>
//               <div className="mt-1 flex flex-col gap-2">
//                 <div className="flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5">
//                   <div className="space-y-1 text-center">
//                     <Upload className="mx-auto h-12 w-12 text-gray-400" />
//                     <div className="flex text-sm text-gray-600">
//                       <label className="relative cursor-pointer rounded-md bg-white font-medium text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 hover:text-orange-400">
//                         <span>Upload a file</span>
//                         <Input
//                           type="file"
//                           className="sr-only"
//                           onChange={() =>
//                             setFormData({
//                               ...formData,
//                               survey_image: 'uploaded',
//                             })
//                           }
//                         />
//                       </label>
//                     </div>
//                     <p className="text-xs text-gray-500">
//                       PNG, JPG up to 10MB
//                     </p>
//                   </div>
//                 </div>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   className="flex items-center justify-center"
//                   onClick={() =>
//                     setFormData({ ...formData, survey_image: 'camera' })
//                   }
//                 >
//                   <Camera className="mr-2 h-4 w-4" />
//                   Use Camera
//                 </Button>
//               </div>
//             </div>

//             <div>
//               <label className="mb-2 block text-sm font-medium">
//                 Progress Image
//               </label>
//               <div className="mt-1 flex flex-col gap-2">
//                 <div className="flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5">
//                   <div className="space-y-1 text-center">
//                     <Upload className="mx-auto h-12 w-12 text-gray-400" />
//                     <div className="flex text-sm text-gray-600">
//                       <label className="relative cursor-pointer rounded-md bg-white font-medium text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 hover:text-orange-400">
//                         <span>Upload a file</span>
//                         <Input
//                           type="file"
//                           className="sr-only"
//                           onChange={() =>
//                             setFormData({
//                               ...formData,
//                               progress_image: 'uploaded',
//                             })
//                           }
//                         />
//                       </label>
//                     </div>
//                     <p className="text-xs text-gray-500">
//                       PNG, JPG up to 10MB
//                     </p>
//                   </div>
//                 </div>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   className="flex items-center justify-center"
//                   onClick={() =>
//                     setFormData({ ...formData, progress_image: 'camera' })
//                   }
//                 >
//                   <Camera className="mr-2 h-4 w-4" />
//                   Use Camera
//                 </Button>
//               </div>
//             </div>

//             <div>
//               <label className="mb-2 block text-sm font-medium">
//                 Finish Image
//               </label>
//               <div className="mt-1 flex flex-col gap-2">
//                 <div className="flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5">
//                   <div className="space-y-1 text-center">
//                     <Upload className="mx-auto h-12 w-12 text-gray-400" />
//                     <div className="flex text-sm text-gray-600">
//                       <label className="relative cursor-pointer rounded-md bg-white font-medium text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 hover:text-orange-400">
//                         <span>Upload a file</span>
//                         <Input
//                           type="file"
//                           className="sr-only"
//                           onChange={() =>
//                             setFormData({
//                               ...formData,
//                               finish_image: 'uploaded',
//                             })
//                           }
//                         />
//                       </label>
//                     </div>
//                     <p className="text-xs text-gray-500">
//                       PNG, JPG up to 10MB
//                     </p>
//                   </div>
//                 </div>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   className="flex items-center justify-center"
//                   onClick={() =>
//                     setFormData({ ...formData, finish_image: 'camera' })
//                   }
//                 >
//                   <Camera className="mr-2 h-4 w-4" />
//                   Use Camera
//                 </Button>
//               </div>
//             </div>
//           </div>

//           <Button
//             className="w-full bg-orange-500 text-white hover:bg-orange-400 disabled:bg-gray-300"
//             disabled={!isFormComplete}
//           >
//             Submit Repair
//           </Button>
//         </form>
//       </div>
//     </div>
//   )
// }

// 'use client'

// import { useEffect, useRef } from 'react'
// import { Camera, Upload } from 'lucide-react'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { useForm } from 'react-hook-form'
// import { z } from 'zod'
// import { createFormSchema } from '@/lib/schemas/new-repair-form-schema'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import { LogoutButton } from '@/components/logout-button'
// import { useProjectsListStore } from '@/stores/projects-list-store'
// //import { ProjectData } from '@/types/project-types'

// type FormData = z.infer<ReturnType<typeof createFormSchema>>

// export default function TechnicianNewRepairPage() {
//   const { projectsList } = useProjectsListStore()

//   // Referencia para maxDrops
//   const maxDropsRef = useRef<number | undefined>(undefined)

//   // Referencia para maxLevels
//   const maxLevelsRef = useRef<number | undefined>(undefined)

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isValid },
//     setValue,
//     watch,
//     reset,
//   } = useForm<FormData>({
//     resolver: zodResolver(createFormSchema({ maxDropsRef, maxLevelsRef })),
//     defaultValues: {
//       projectId: 0,
//       elevation: '',
//       drop: 1,
//       level: 1,
//       repairType: '',
//       survey_image: '',
//       progress_image: [],
//       finish_image: '',
//     },
//     mode: 'onChange',
//   })

//   const projectId = watch('projectId')
//   const elevation = watch('elevation')
//   const repairTypeSelected = watch('repairType')

//   const phases = projectsList
//     .find((project) => project.id === projectId)
//     ?.repairTypes.find(
//       (repairType) => repairType.repairType === repairTypeSelected
//     )?.phases

//   // console.log(
//   //   projectsList
//   //     .find((project) => project.id === projectId)
//   //     ?.repairTypes.find(
//   //       (repairType) => repairType.repairType === repairTypeSelected
//   //     )?.phases
//   // )

//   // Calcular el valor máximo de drop
//   const maxDrops = elevation
//     ? projectsList
//         .find((project) => project.id === projectId)
//         ?.elevations.find((elev) => elev.name === elevation)?.drops
//     : undefined

//   // Calcular el valor máximo de level
//   const maxLevels = elevation
//     ? projectsList
//         .find((project) => project.id === projectId)
//         ?.elevations.find((elev) => elev.name === elevation)?.levels
//     : undefined

//   // Actualizar la referencia de maxDrops
//   useEffect(() => {
//     maxDropsRef.current = maxDrops
//     maxLevelsRef.current = maxLevels
//   }, [maxDrops, maxLevels])

//   // Reiniciar elevation y drop cuando cambie el proyecto
//   useEffect(() => {
//     setValue('elevation', '')
//     setValue('drop', 1)
//     setValue('level', 1)
//   }, [projectId, setValue])

//   // Reiniciar drop cuando cambie la elevation
//   useEffect(() => {
//     setValue('drop', 1)
//     setValue('level', 1)
//   }, [elevation, setValue])

//   const onSubmit = (data: FormData) => {
//     console.log('Form submitted:', data)
//     // Aquí puedes enviar los datos a tu API o realizar otras acciones
//     reset()
//   }

//   return (
//     <div className="flex flex-col gap-8 p-8">
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-bold text-orange-500">
//           Technician Dashboard
//         </h1>
//         <LogoutButton />
//       </div>

//       <div className="w-full lg:w-1/2 rounded-lg border bg-white p-6 shadow-sm">
//         <h2 className="mb-4 text-xl font-semibold">New Repair</h2>
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//           <div className="grid gap-4 sm:grid-cols-4">
//             <div className="sm:col-span-4">
//               <label className="mb-2 block text-sm font-medium">Project</label>
//               <Select
//                 value={projectId.toString() === '0' ? '' : projectId.toString()}
//                 onValueChange={(value) =>
//                   setValue('projectId', parseInt(value))
//                 }
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select project" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {projectsList.map((project) => (
//                     <SelectItem key={project.id} value={project.id.toString()}>
//                       {project.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               {errors.projectId && (
//                 <p className="mt-1 text-sm text-red-500">
//                   {errors.projectId.message}
//                 </p>
//               )}
//             </div>

//             <div className="sm:col-span-2">
//               <label className="mb-2 block text-sm font-medium">
//                 Elevation
//               </label>
//               <Select
//                 value={elevation}
//                 onValueChange={(value) => setValue('elevation', value)}
//                 disabled={!projectId}
//               >
//                 <SelectTrigger className="disabled:border-neutral-400 disabled:bg-neutral-300">
//                   <SelectValue placeholder="Select elevation" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {projectsList
//                     .find((project) => project.id === projectId)
//                     ?.elevations.map((elevation) => (
//                       <SelectItem key={elevation.name} value={elevation.name}>
//                         {elevation.name}
//                       </SelectItem>
//                     ))}
//                 </SelectContent>
//               </Select>
//               {errors.elevation && (
//                 <p className="mt-1 text-sm text-red-500">
//                   {errors.elevation.message}
//                 </p>
//               )}
//             </div>

//             <div>
//               <label className="mb-2 block text-sm font-medium">
//                 Drop{' '}
//                 {elevation && <span>(min: 1 - max: {maxDrops || 'N/A'})</span>}
//               </label>
//               <Input
//                 type="number"
//                 placeholder="Enter drop"
//                 disabled={!elevation}
//                 {...register('drop', {
//                   valueAsNumber: true,
//                 })}
//                 max={maxDrops}
//                 min={1}
//                 step={1}
//                 className="disabled:border-neutral-400 disabled:bg-neutral-300"
//               />
//               {errors.drop && (
//                 <p className="mt-1 text-sm text-red-500">
//                   {errors.drop.message}
//                 </p>
//               )}
//             </div>

//             <div>
//               <label className="mb-2 block text-sm font-medium">
//                 Level{' '}
//                 {elevation && <span>(min: 1 - max: {maxLevels || 'N/A'})</span>}
//               </label>
//               <Input
//                 type="number"
//                 placeholder="Enter level"
//                 disabled={!elevation}
//                 {...register('level', {
//                   valueAsNumber: true,
//                 })}
//                 min={1}
//                 step={1}
//                 className="disabled:border-neutral-400 disabled:bg-neutral-300"
//               />
//               {errors.level && (
//                 <p className="mt-1 text-sm text-red-500">
//                   {errors.level.message}
//                 </p>
//               )}
//             </div>

//             <div className="sm:col-span-2">
//               <label className="mb-2 block text-sm font-medium">
//                 Repair Type
//               </label>
//               <Select
//                 value={watch('repairType')}
//                 onValueChange={(value) => setValue('repairType', value)}
//                 disabled={!projectId}
//               >
//                 <SelectTrigger className="disabled:border-neutral-400 disabled:bg-neutral-300">
//                   <SelectValue placeholder="Select repair type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {projectsList
//                     .find((project) => project.id === projectId)
//                     ?.repairTypes.map((repairType) => (
//                       <SelectItem
//                         key={repairType.repair_type_id}
//                         value={repairType.repairType}
//                       >
//                         {repairType.repairType}
//                       </SelectItem>
//                     ))}
//                 </SelectContent>
//               </Select>
//               {errors.repairType && (
//                 <p className="mt-1 text-sm text-red-500">
//                   {errors.repairType.message}
//                 </p>
//               )}
//             </div>
//             {/* List of existing Repairs by repairIndex, clickeable to select repair and to continue process */}
//             <div></div>

//             {/* Create new Repair using repairIndex = 1 if no existing repairs, else create new repairIndex with incremental repairIndex */}
//           </div>

//           <div className="grid gap-6 sm:grid-cols-3">
//             <div>
//               <label className="mb-2 block text-sm font-medium">
//                 Survey Image
//               </label>
//               <div className="mt-1 flex flex-col gap-2">
//                 <div className="flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5">
//                   <div className="space-y-1 text-center">
//                     <Upload className="mx-auto h-12 w-12 text-gray-400" />
//                     <div className="flex text-sm text-gray-600">
//                       <label className="relative cursor-pointer rounded-md bg-white font-medium text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 hover:text-orange-400">
//                         <span>Upload a file</span>
//                         <Input
//                           type="file"
//                           className="sr-only"
//                           onChange={() =>
//                             setValue('survey_image', 'uploaded', {
//                               shouldValidate: true,
//                             })
//                           }
//                         />
//                       </label>
//                     </div>
//                     <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
//                   </div>
//                 </div>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   className="flex items-center justify-center"
//                   onClick={() =>
//                     setValue('survey_image', 'camera', { shouldValidate: true })
//                   }
//                 >
//                   <Camera className="mr-2 h-4 w-4" />
//                   Use Camera
//                 </Button>
//               </div>
//               {errors.survey_image && (
//                 <p className="mt-1 text-sm text-red-500">
//                   {errors.survey_image.message}
//                 </p>
//               )}
//             </div>

//             {new Array(phases && phases - 2).fill(0).map((_, index) => (
//               <div key={index}>
//                 <label className="mb-2 block text-sm font-medium">
//                   Progress {index + 1} Image
//                 </label>
//                 <div className="mt-1 flex flex-col gap-2">
//                   <div className="flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5">
//                     <div className="space-y-1 text-center">
//                       <Upload className="mx-auto h-12 w-12 text-gray-400" />
//                       <div className="flex text-sm text-gray-600">
//                         <label className="relative cursor-pointer rounded-md bg-white font-medium text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 hover:text-orange-400">
//                           <span>Upload a file</span>
//                           <Input
//                             type="file"
//                             className="sr-only"
//                             onChange={() =>
//                               setValue('progress_image', 'uploaded', {
//                                 shouldValidate: true,
//                               })
//                             }
//                           />
//                         </label>
//                       </div>
//                       <p className="text-xs text-gray-500">
//                         PNG, JPG up to 10MB
//                       </p>
//                     </div>
//                   </div>
//                   <Button
//                     type="button"
//                     variant="outline"
//                     className="flex items-center justify-center"
//                     onClick={() =>
//                       setValue('progress_image', 'camera', {
//                         shouldValidate: true,
//                       })
//                     }
//                   >
//                     <Camera className="mr-2 h-4 w-4" />
//                     Use Camera
//                   </Button>
//                 </div>
//                 {errors.progress_image && (
//                   <p className="mt-1 text-sm text-red-500">
//                     {errors.progress_image.message}
//                   </p>
//                 )}
//               </div>
//             ))}

//             <div>
//               <label className="mb-2 block text-sm font-medium">
//                 Finish Image
//               </label>
//               <div className="mt-1 flex flex-col gap-2">
//                 <div className="flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5">
//                   <div className="space-y-1 text-center">
//                     <Upload className="mx-auto h-12 w-12 text-gray-400" />
//                     <div className="flex text-sm text-gray-600">
//                       <label className="relative cursor-pointer rounded-md bg-white font-medium text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 hover:text-orange-400">
//                         <span>Upload a file</span>
//                         <Input
//                           type="file"
//                           className="sr-only"
//                           onChange={() =>
//                             setValue('finish_image', 'uploaded', {
//                               shouldValidate: true,
//                             })
//                           }
//                         />
//                       </label>
//                     </div>
//                     <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
//                   </div>
//                 </div>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   className="flex items-center justify-center"
//                   onClick={() =>
//                     setValue('finish_image', 'camera', { shouldValidate: true })
//                   }
//                 >
//                   <Camera className="mr-2 h-4 w-4" />
//                   Use Camera
//                 </Button>
//               </div>
//               {errors.finish_image && (
//                 <p className="mt-1 text-sm text-red-500">
//                   {errors.finish_image.message}
//                 </p>
//               )}
//             </div>
//           </div>

//           <Button
//             type="submit"
//             className="w-full bg-orange-500 text-white hover:bg-orange-400 disabled:bg-gray-300"
//             disabled={!isValid}
//           >
//             Submit Repair
//           </Button>
//         </form>
//       </div>
//     </div>
//   )
// }
