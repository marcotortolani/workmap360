/* eslint-disable @next/next/no-img-element */
// src/components/repair-phase-form.tsx

'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useCurrentUser } from '@/stores/user-store'
import CustomImageUpload from '@/components/custom-image-upload'
import { CheckCircle2, Loader2, Info, Plus, X, Camera } from 'lucide-react'
import { RepairData, ProgressPhase, RepairType } from '@/types/repair-type'
import { REPAIR_TYPE_LIST } from '@/data/repair-type-list'
import { createRepairViaAPI, updateRepairViaAPI } from '@/lib/api/repairs'

interface ImageUploadData {
  url: string
  publicId: string
  fileName: string
  phase: string
}

interface ProcessedImage {
  file: File
  previewUrl: string
  fileName: string
  id: string
}

interface MeasurementField {
  key: string
  label: string
  required: boolean
  defaultValue?: number
  placeholder?: string
}

interface RepairPhaseFormProps {
  // Datos de la reparación (requeridos)
  projectId: number
  projectName: string
  elevationName: string
  drop: number
  level: number
  repairType: string
  repairIndex: number

  // Configuración de fases
  totalPhases: number

  // Reparación existente (opcional)
  existingRepair?: RepairData | null

  // Callbacks
  onSuccess?: () => void
  onCancel?: () => void

  // Configuración opcional
  folderName?: string
  disabled?: boolean
}

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

export default function RepairPhaseForm({
  projectId,
  projectName,
  elevationName,
  drop,
  level,
  repairType,
  repairIndex,
  totalPhases,
  existingRepair = null,
  onSuccess,
  onCancel,
  folderName = '',
  disabled = false,
}: RepairPhaseFormProps) {
  const { userId, fullName, accessToken } = useCurrentUser()

  // Estados
  const [currentPhase, setCurrentPhase] = useState<
    'survey' | 'progress' | 'finish' | null
  >(null)
  const [progressPhaseNumber, setProgressPhaseNumber] = useState<number>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [measurements, setMeasurements] = useState<Record<string, number>>({})
  const [comments, setComments] = useState<string>('')

  // Estados para múltiples imágenes
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([])
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)

  // Obtener tipo de reparación seleccionado desde REPAIR_TYPE_LIST
  const selectedRepairType = REPAIR_TYPE_LIST.find(
    (rt: RepairType) => rt.type === repairType && rt.status === 'active'
  )

  // Verificar si la fase actual permite múltiples fotos
  const allowsMultiplePhotos =
    currentPhase === 'survey' || currentPhase === 'finish'
  const maxPhotos = allowsMultiplePhotos ? 3 : 1

  // Determinar fase actual al cargar el componente
  useEffect(() => {
    const phaseInfo = determineCurrentPhase(existingRepair, totalPhases)
    if (phaseInfo) {
      setCurrentPhase(phaseInfo.phase as 'survey' | 'progress' | 'finish')
      setProgressPhaseNumber(phaseInfo.phaseNumber)
    } else {
      setCurrentPhase(null) // Reparación completa
    }
  }, [existingRepair, totalPhases])

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

  // Limpiar imágenes al cambiar de fase
  useEffect(() => {
    setProcessedImages([])
    setShowImageUpload(false)
  }, [currentPhase])

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

      case 'area_thickness': // ✅ NUEVO
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
            key: 'thickness',
            label: 'Thickness (mm)',
            required: false,
            defaultValue: unit_measure.default_values?.thickness,
            placeholder: `Default: ${
              unit_measure.default_values?.thickness || 'N/A'
            } mm`,
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

      case 'length_thickness': // ✅ NUEVO
        fields.push(
          {
            key: 'length',
            label: 'Length (mm)',
            required: true,
            placeholder: 'Enter length in mm',
          },
          {
            key: 'thickness',
            label: 'Thickness (mm)',
            required: false,
            defaultValue: unit_measure.default_values?.thickness,
            placeholder: `Default: ${
              unit_measure.default_values?.thickness || 'N/A'
            } mm`,
          }
        )
        break

      case 'each': // ✅ CAMBIADO de 'unit' a 'each'
        fields.push({
          key: 'each',
          label: 'Quantity',
          required: true,
          placeholder: 'Enter quantity',
        })
        break

      default:
        console.warn(`Unknown unit measure type: ${unit_measure.type}`)
        break
    }

    return fields
  }

  // Calcular el valor convertido para mostrar
  const getConvertedValue = () => {
    if (!selectedRepairType || !selectedRepairType.conversion) return null

    try {
      // Para tipos que no tienen conversión (como 'each'), no mostrar valor convertido
      if (
        selectedRepairType.unit_measure.type === 'each' &&
        !selectedRepairType.conversion
      ) {
        return null
      }

      const value =
        selectedRepairType.conversion.conversion_factor(measurements)
      return {
        value: value.toFixed(3),
        unit: selectedRepairType.unit_to_charge,
      }
    } catch (error) {
      console.error('Error calculating conversion:', error)
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

  // Manejar cuando se procesa una imagen en el CustomImageUpload
  const handleImageProcessed = (processedImage: ProcessedImage) => {
    setProcessedImages((prev) => [...prev, processedImage])
    setShowImageUpload(false)
  }

  // Remover una imagen procesada
  const removeProcessedImage = (imageId: string) => {
    setProcessedImages((prev) => prev.filter((img) => img.id !== imageId))
  }

  // Función para subir múltiples imágenes a Cloudinary
  const uploadImagesToCloudinary = async (
    images: ProcessedImage[]
  ): Promise<ImageUploadData[]> => {
    const uploadPromises = images.map(async (image, index) => {
      const sanitizeFolderName = (name: string) => {
        return name
          .replace(/[^a-zA-Z0-9-]/g, '-')
          .replace(/^-+|-+$/g, '')
          .substring(0, 255)
      }

      // Para múltiples fotos, agregar un sufijo al nombre del archivo
      const baseFileName = image.fileName
      const fileName =
        images.length > 1 ? `${baseFileName}_${index + 1}` : baseFileName

      try {
        // Obtener firma para la subida
        const signResponse = await fetch('/api/images/signed-upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            public_id: fileName.trim(),
            folder: sanitizeFolderName(folderName),
          }),
        })

        if (!signResponse.ok) {
          const errorData = await signResponse.json()
          throw new Error(errorData.error || 'Error getting signature')
        }

        const signData = await signResponse.json()

        // Subir a Cloudinary
        const formData = new FormData()
        formData.append('file', image.file)
        formData.append('api_key', signData.apiKey)
        formData.append('timestamp', signData.timestamp.toString())
        formData.append('signature', signData.signature)
        formData.append('public_id', signData.public_id)
        formData.append('asset_folder', signData.asset_folder)

        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        )

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text()
          throw new Error(`Error uploading image ${index + 1}: ${errorText}`)
        }

        const uploadResult = await uploadResponse.json()

        return {
          publicId: uploadResult.public_id,
          url: uploadResult.secure_url,
          fileName: uploadResult.original_filename,
          phase: uploadResult.asset_folder,
        }
      } catch (error) {
        console.error(`Error uploading image ${index + 1}:`, error)
        throw error
      }
    })

    return Promise.all(uploadPromises)
  }

  // Función para enviar los datos de la reparación
  const handleSubmitRepairData = async () => {
    if (!userId || !fullName || !accessToken) {
      toast.error('User information not found')
      return
    }

    if (processedImages.length === 0) {
      toast.error('Please add at least one image before submitting')
      return
    }

    setIsSubmitting(true)
    setIsUploadingImages(true)

    try {
      // 1. Subir todas las imágenes a Cloudinary
      const uploadedImages = await uploadImagesToCloudinary(processedImages)

      setIsUploadingImages(false)

      // 2. Preparar datos para la reparación
      const timestamp = new Date().toISOString()
      const imageUrls = uploadedImages.map((img) => img.url)

      if (existingRepair) {
        // Actualizar reparación existente
        const updatedPhases = { ...existingRepair.phases }

        if (currentPhase === 'survey') {
          updatedPhases.survey = {
            created_by_user_name: fullName,
            created_by_user_id: userId,
            created_at: timestamp,
            repair_type: repairType,
            repair_type_id: selectedRepairType?.id || 0,
            measurements: measurements,
            photos: imageUrls,
            comments: comments,
          }
        } else if (currentPhase === 'progress') {
          const newProgress: ProgressPhase = {
            created_by_user_name: fullName,
            created_by_user_id: userId,
            created_at: timestamp,
            repair_type: repairType,
            repair_type_id: selectedRepairType?.id || 0,
            measurements: measurements,
            photo: imageUrls[0], // Progress solo usa una foto
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
            photos: imageUrls,
            comments: comments,
          }
        }

        // Llamar al API para actualizar la reparación
        const result = await updateRepairViaAPI(
          existingRepair.id,
          { phases: updatedPhases },
          accessToken
        )
        console.log('Update Repair Result:', result)
      } else {
        // Crear nueva reparación
        const newRepairData = {
          project_id: projectId,
          project_name: projectName,
          elevation_name: elevationName,
          drop: drop,
          level: level,
          repair_index: repairIndex,
          phases: {
            survey: {
              created_by_user_name: fullName,
              created_by_user_id: userId,
              created_at: timestamp,
              repair_type: repairType,
              repair_type_id: selectedRepairType?.id || 0,
              measurements: measurements,
              photos: imageUrls,
              comments: comments,
            },
          },
        }

        // Llamar al API para crear la reparación
        const result = await createRepairViaAPI(newRepairData, accessToken)
        console.log('Create Repair Result:', result)
      }

      toast.success(
        `${
          currentPhase === 'survey'
            ? 'Survey'
            : currentPhase === 'progress'
            ? 'Progress'
            : 'Finish'
        } phase completed successfully!`,
        {
          duration: 5000,
          position: 'bottom-right',
          style: {
            background: '#4CAF50',
            color: '#FFFFFF',
            fontWeight: 'bold',
          },
        }
      )

      // Resetear formulario
      setMeasurements({})
      setComments('')
      setProcessedImages([])
      setShowImageUpload(false)

      // Llamar callback de éxito
      onSuccess?.()
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
      setIsUploadingImages(false)
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
        const width = measurements.width || 0
        const height = measurements.height || 0
        const depth =
          measurements.depth || unit_measure.default_values?.depth || 0
        return `${width}x${height}x${depth}`

      case 'area':
        const areaWidth = measurements.width || 0
        const areaHeight = measurements.height || 0
        return `${areaWidth}x${areaHeight}`

      case 'area_thickness': // ✅ NUEVO
        const areaThickWidth = measurements.width || 0
        const areaThickHeight = measurements.height || 0
        const thickness =
          measurements.thickness || unit_measure.default_values?.thickness || 0
        return `${areaThickWidth}x${areaThickHeight}x${thickness}`

      case 'length':
        const length = measurements.length || 0
        return `${length}`

      case 'length_thickness': // ✅ NUEVO
        const lengthThickLength = measurements.length || 0
        const lengthThickness =
          measurements.thickness || unit_measure.default_values?.thickness || 0
        return `${lengthThickLength}x${lengthThickness}`

      case 'each': // ✅ CAMBIADO de 'unit' a 'each'
        const count = measurements.each || 0
        return `${count}`

      default:
        console.warn(
          `Unknown unit measure type for measurements string: ${unit_measure.type}`
        )
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
      !repairType ||
      !repairIndex ||
      !measurementsStr ||
      !phaseCode
    ) {
      return `D${drop}.L${level}.${repairType}.${repairIndex}`
    }

    return `D${drop}.L${level}.${repairType}.${repairIndex}.${measurementsStr}.${phaseCode}`
  }

  // Función para validar que todos los campos de medición requeridos estén completos
  const validateMeasurements = (): boolean => {
    if (!selectedRepairType) return false
    if (getCurrentPhaseName() === 'Finish') return true

    const { unit_measure } = selectedRepairType

    switch (unit_measure.type) {
      case 'volume':
        const width = measurements.width || 0
        const height = measurements.height || 0
        const depth =
          measurements.depth || unit_measure.default_values?.depth || 0
        return width > 0 && height > 0 && depth > 0

      case 'area':
        const areaWidth = measurements.width || 0
        const areaHeight = measurements.height || 0
        return areaWidth > 0 && areaHeight > 0

      case 'area_thickness': // ✅ NUEVO
        const areaThickWidth = measurements.width || 0
        const areaThickHeight = measurements.height || 0
        const thickness =
          measurements.thickness || unit_measure.default_values?.thickness || 0
        return areaThickWidth > 0 && areaThickHeight > 0 && thickness > 0

      case 'length':
        const length = measurements.length || 0
        return length > 0

      case 'length_thickness': // ✅ NUEVO
        const lengthThickLength = measurements.length || 0
        const lengthThickness =
          measurements.thickness || unit_measure.default_values?.thickness || 0
        return lengthThickLength > 0 && lengthThickness > 0

      case 'each': // ✅ CAMBIADO de 'unit' a 'each'
        const count = measurements.each || 0
        return count > 0

      default:
        console.warn(
          `Unknown unit measure type for validation: ${unit_measure.type}`
        )
        return false
    }
  }

  // Si no hay fase actual (reparación completa)
  if (!currentPhase) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium">This repair has been completed.</p>
              <p className="text-sm">All {totalPhases} phases are finished.</p>
              {(() => {
                const phaseStatus = getPhaseStatus(existingRepair, totalPhases)
                return (
                  phaseStatus && (
                    <div className="mt-2 text-xs">
                      <span>Completed: Survey ✓</span>
                      {phaseStatus.progress > 0 && (
                        <span>, Progress P1-P{phaseStatus.progress} ✓</span>
                      )}
                      <span>, Finish ✓</span>
                    </div>
                  )
                )
              })()}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{getCurrentPhaseName()} Phase</span>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-sm">
              {existingRepair
                ? 'Updating Existing Repair'
                : 'Creating New Repair'}
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Phase{' '}
              {currentPhase === 'survey'
                ? '1'
                : currentPhase === 'finish'
                ? totalPhases
                : progressPhaseNumber + 1}{' '}
              of {totalPhases}
            </Badge>
            {allowsMultiplePhotos && (
              <Badge variant="default" className="text-sm bg-purple-600">
                Max {maxPhotos} Photos
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Phase Progress Visual */}
        {existingRepair && (
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm font-medium mb-2">Phase Progress:</p>
            <div className="flex items-center gap-2 text-xs">
              {/* Survey */}
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded ${
                  existingRepair.phases.survey
                    ? 'bg-green-100 text-green-800'
                    : currentPhase === 'survey'
                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {existingRepair.phases.survey
                  ? '✓'
                  : currentPhase === 'survey'
                  ? '●'
                  : '○'}{' '}
                Survey
              </div>

              {/* Progress phases */}
              {Array.from({ length: Math.max(0, totalPhases - 2) }, (_, i) => {
                const progressIndex = i + 1
                const isCompleted =
                  (existingRepair.phases.progress?.length || 0) >= progressIndex
                const isCurrent =
                  currentPhase === 'progress' &&
                  progressPhaseNumber === progressIndex

                return (
                  <div
                    key={progressIndex}
                    className={`flex items-center gap-1 px-2 py-1 rounded ${
                      isCompleted
                        ? 'bg-green-100 text-green-800'
                        : isCurrent
                        ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {isCompleted ? '✓' : isCurrent ? '●' : '○'} P{progressIndex}
                  </div>
                )
              })}

              {/* Finish */}
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded ${
                  existingRepair.phases.finish
                    ? 'bg-green-100 text-green-800'
                    : currentPhase === 'finish'
                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {existingRepair.phases.finish
                  ? '✓'
                  : currentPhase === 'finish'
                  ? '●'
                  : '○'}{' '}
                Finish
              </div>
            </div>
          </div>
        )}

        {/* Repair Code Display */}
        <div className="bg-muted p-3 rounded-md">
          <p className="text-sm font-medium">Repair Code:</p>
          <p className="text-lg font-mono">{getFullRepairCode()}</p>
          {getMeasurementsString() && (
            <p className="text-xs text-muted-foreground mt-1">
              Format: D{drop}.L{level}.{repairType}.{repairIndex}.
              {getMeasurementsString()}.{getPhaseCode()}
            </p>
          )}
        </div>

        {/* Repair Type Information */}
        {selectedRepairType && (
          <div className="bg-blue-50 p-3 rounded-md border">
            <p className="text-sm font-medium text-blue-900">
              {selectedRepairType.variation} ({selectedRepairType.type})
            </p>
            <p className="text-xs text-blue-700">
              Unit: {selectedRepairType.unit_measure.value} →{' '}
              {selectedRepairType.unit_to_charge}
            </p>
          </div>
        )}

        {/* Dynamic Measurements Input */}
        {selectedRepairType && getCurrentPhaseName() !== 'Finish' && (
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
                    disabled={!!field.defaultValue || isSubmitting || disabled}
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
                      <span className="font-medium">Converted Value:</span>{' '}
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
            disabled={isSubmitting || disabled}
          />
        </div>

        {/* Image Management Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">
              {getCurrentPhaseName()} Images ({processedImages.length}/
              {maxPhotos})
            </Label>
            {allowsMultiplePhotos &&
              processedImages.length >= 1 &&
              processedImages.length < maxPhotos &&
              !showImageUpload && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImageUpload(true)}
                  disabled={!validateMeasurements() || isSubmitting || disabled}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Photo
                </Button>
              )}
          </div>

          {/* Show existing processed images */}
          {processedImages.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {processedImages.map((image, index) => (
                <div key={image.id} className="relative">
                  <img
                    src={image.previewUrl}
                    alt={`${getCurrentPhaseName()} ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => removeProcessedImage(image.id)}
                    disabled={isSubmitting || disabled}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    Photo {index + 1}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Image upload for single photo phases or when no images yet */}
          {((!allowsMultiplePhotos && processedImages.length === 0) ||
            (allowsMultiplePhotos && processedImages.length === 0) ||
            showImageUpload) && (
            <div className="border rounded-lg p-4">
              <CustomImageUpload
                fieldName={
                  `${currentPhase}_image` as
                    | 'survey_image'
                    | 'progress_image'
                    | 'finish_image'
                }
                fileNameData={{
                  drop,
                  level,
                  repair_type: repairType,
                  repair_index: repairIndex,
                  measures: getMeasurementsString(),
                  phase: getPhaseCode(),
                }}
                userName={fullName || 'Unknown'}
                onImageProcessed={handleImageProcessed}
                disabled={!validateMeasurements() || isSubmitting || disabled}
                allowMultiple={allowsMultiplePhotos}
                maxPhotos={maxPhotos}
                currentCount={processedImages.length}
              />
              {showImageUpload && allowsMultiplePhotos && (
                <div className="mt-2 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowImageUpload(false)}
                    disabled={isSubmitting || disabled}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          {processedImages.length > 0 && (
            <div className="pt-4 flex gap-2">
              <Button
                type="button"
                onClick={handleSubmitRepairData}
                disabled={
                  isSubmitting || processedImages.length === 0 || disabled
                }
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isUploadingImages ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading Images ({processedImages.length})...
                  </>
                ) : isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving Repair Data...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Submit {getCurrentPhaseName()} Phase (
                    {processedImages.length} photo
                    {processedImages.length > 1 ? 's' : ''})
                  </>
                )}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Info Message about multi-photo functionality */}
        {allowsMultiplePhotos && (
          <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
            <div className="flex items-center gap-2 text-purple-700">
              <Info className="h-5 w-5" />
              <div className="text-sm">
                <p className="font-medium">
                  {getCurrentPhaseName()} phase supports up to {maxPhotos}{' '}
                  photos
                </p>
                <p>
                  Add photos one by one, then submit all data together when
                  ready.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* General Info Message */}
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <div className="flex items-center gap-2 text-blue-700">
            <CheckCircle2 className="h-5 w-5" />
            <p className="text-sm">
              <strong>Workflow:</strong> Process your images first, then submit
              all data together. Images will be uploaded to Cloudinary before
              saving the repair data.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
