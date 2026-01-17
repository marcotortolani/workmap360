// src/components/pages/technician/new-repair-page.tsx

'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
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
import { Button } from '@/components/ui/button'
import { useProjectsList } from '@/hooks/use-projects-list'
import { useRepairsByLocation } from '@/hooks/use-repairs-by-location'
import { fetchWithCSRF } from '@/hooks/use-csrf-token'

// import { useRepairsDataStore } from '@/stores/repairs-data-store'
import { useCurrentUser } from '@/stores/user-store'
import CustomImageUpload from '@/components/custom-image-upload'
import { getRepairStatus } from '@/lib/utils'
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
  Plus,
  X,
  Camera,
  Trash2,
} from 'lucide-react'
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
  // ✅ Cambiar a usar el hook específico por ubicación
  const {
    repairs: locationRepairs,
    isLoading: locationRepairsLoading,
    fetchRepairsByLocation,
    clearRepairs,
    // total: totalLocationRepairs,
  } = useRepairsByLocation()

  const { userId, fullName, accessToken } = useCurrentUser()

  // Referencias para validación
  const maxDropsRef = useRef<number | undefined>(undefined)
  const maxLevelsRef = useRef<number | undefined>(undefined)

  // Estados
  const [projectSelected, setProjectSelected] = useState<ProjectData | null>(
    null
  )
  const [dropSelected, setDropSelected] = useState<number>(1)
  const [levelSelected, setLevelSelected] = useState<number>(1)

  const [currentPhase, setCurrentPhase] = useState<
    'survey' | 'progress' | 'finish' | null
  >(null)
  const [selectedRepair, setSelectedRepair] = useState<RepairData | null>(null)
  const [selectValueRepair, setSelectValueRepair] = useState<string>('')
  const [progressPhaseNumber, setProgressPhaseNumber] = useState<number>(1)
  const [folderName, setFolderName] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [measurements, setMeasurements] = useState<Record<string, number>>({})
  const [measurementsModified, setMeasurementsModified] = useState(false)

  const [comments, setComments] = useState<string>('')

  // Estados para múltiples imágenes
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([])
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)

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
      // elevation: '',
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
  // const elevation = watch('elevation')
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

  // const maxLevels = selectedProject
  //   ? selectedProject?.elevations.reduce((acc: number, elev: Elevation) => {
  //       return Math.max(acc, elev.levels)
  //     }, 0)
  //   : undefined

  const maxLevels = selectedProject?.elevations
    ? selectedProject?.elevations.find(
        (elev: Elevation) =>
          elev.name ===
          getElevationNameByDrop(drop, selectedProject?.elevations)
      )?.levels
    : undefined

  const phases = projectRepairType?.phases || 3

  // Verificar si la fase actual permite múltiples fotos
  const allowsMultiplePhotos =
    currentPhase === 'survey' || currentPhase === 'finish'
  const maxPhotos = allowsMultiplePhotos ? 3 : 1

  useEffect(() => {
    if (drop) {
      setDropSelected(drop)
    }
    if (level) {
      setLevelSelected(level)
    }
  }, [drop, level])

  // Actualizar referencias
  useEffect(() => {
    maxDropsRef.current = maxDrops
    maxLevelsRef.current = maxLevels
  }, [maxDrops, maxLevels])

  // Reiniciar campos dependientes cuando cambia el proyecto
  useEffect(() => {
    // setValue('elevation', '')
    setValue('drop', 1)
    setValue('level', 1)
    setValue('repair_type', '')
    setValue('repair_index', 1)
    setValue('progress_image', [])
    setMeasurements({})
    setComments('')
    setProcessedImages([])
    setShowImageUpload(false)
    setSelectedRepair(null)
    setSelectValueRepair('') // ← NUEVO
    setCurrentPhase(null)
  }, [project_id, setValue])

  // Reset cuando cambia ubicación o tipo de reparación
  useEffect(() => {
    setSelectValueRepair('') // ← NUEVO
    setSelectedRepair(null)
    setCurrentPhase(null)
    setProgressPhaseNumber(1)

    setMeasurements({})
    setMeasurementsModified(false)
    setComments('')
    setProcessedImages([])
    setShowImageUpload(false)
  }, [project_id, drop, level, repair_type])

  // Reiniciar campos cuando cambia la elevación
  // useEffect(() => {
  //   setValue('drop', 1)
  //   setValue('level', 1)
  //   setValue('repair_type', '')
  //   setValue('repair_index', 1)
  //   setValue('progress_image', [])
  //   setMeasurements({})
  //   setProcessedImages([])
  //   setShowImageUpload(false)
  // }, [elevation, setValue])

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

  // ✅ Efecto para cargar repairs cuando cambian project, drop, level o repair_type
  useEffect(() => {
    if (project_id && drop && level) {
      // console.log('Loading repairs for location:', {
      //   project_id,
      //   drop,
      //   level,
      //   repair_type,
      // })

      // Si hay repair_type seleccionado, filtrarlo también
      if (repair_type) {
        fetchRepairsByLocation(project_id, drop, level, repair_type)
      } else {
        // Si no hay repair_type, obtener todos los repairs en esa ubicación
        fetchRepairsByLocation(project_id, drop, level)
      }
    } else {
      // Limpiar repairs si no hay ubicación completa
      clearRepairs()
    }
  }, [
    project_id,
    drop,
    level,
    repair_type,
    fetchRepairsByLocation,
    clearRepairs,
  ])

  // ✅ Usar locationRepairs en lugar de repairs para filtering
  const matchingRepairs = useMemo(() => {
    if (!repair_type) return locationRepairs

    // Si hay repair_type, filtrar los repairs que ya vienen filtrados del backend
    return locationRepairs.filter(
      (repair) => repair.phases.survey?.repair_type === repair_type
    )
  }, [locationRepairs, repair_type])

  // ✅ Calcular el próximo repairIndex basado en los repairs de esta ubicación
  const nextRepairIndex = useMemo(() => {
    if (matchingRepairs.length === 0) return 1
    return Math.max(...matchingRepairs.map((r) => r.repair_index)) + 1
  }, [matchingRepairs])

  // Filtrar reparaciones existentes con useMemo
  // const matchingRepairs = useMemo(() => {
  //   return repairs.filter(
  //     (repair) =>
  //       repair.project_id === project_id &&
  //       // repair.elevation_name === elevation &&
  //       repair.drop === drop &&
  //       repair.level === level &&
  //       repair.phases.survey?.repair_type === repair_type
  //   )
  // }, [repairs, project_id, drop, level, repair_type])

  // const matchingRepairs = repairs.filter(
  //   (repair) =>
  //     repair.project_id === project_id &&
  //     // repair.elevation_name === elevation &&
  //     repair.drop === drop &&
  //     repair.level === level &&
  //     repair.phases.survey?.repair_type === repair_type
  // )

  // Calcular el próximo repairIndex
  // const nextRepairIndex =
  //   matchingRepairs.length > 0
  //     ? Math.max(...matchingRepairs.map((r) => r.repair_index)) + 1
  //     : 1

  // Generar campos de medición dinámicos
  // ✅ Generar campos de medición dinámicos - ACTUALIZADO
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
            placeholder: unit_measure.default_values?.depth
              ? `Default: ${unit_measure.default_values?.depth} mm`
              : 'Enter depth in mm',
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
            placeholder: unit_measure.default_values?.thickness
              ? `Default: ${unit_measure.default_values?.thickness} mm`
              : 'Enter thickness in mm',
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
            placeholder: unit_measure.default_values?.thickness
              ? `Default: ${unit_measure.default_values?.thickness} mm`
              : 'Enter thickness in mm',
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

  // Compare measurements with previous measurements
  const hasMeasurementsChanged = useCallback(() => {
    if (!selectedRepair?.phases.survey?.measurements) return false

    if (!measurements) return false
    if (currentPhase === 'survey' || currentPhase === 'finish') return false

    // si el selected repair tiene mas de un progress, entonces utilizar la ultima medicion del ultimo progress
    if (
      selectedRepair.phases?.progress &&
      selectedRepair.phases?.progress?.length >= 1
    ) {
      const lastProgress =
        selectedRepair.phases?.progress?.[
          selectedRepair.phases.progress.length - 1
        ]

      const lastMeasurements = lastProgress?.measurements || {}

      return Object.keys(lastMeasurements).some((key) => {
        const lastValue = lastMeasurements[key] || 0
        const currentValue = measurements[key] || 0
        return Math.abs(lastValue - currentValue) > 0.001 // Considerar diferencias mínimas como iguales
      })
    }

    const surveyMeasurements = selectedRepair.phases.survey.measurements

    return Object.keys(surveyMeasurements).some((key) => {
      const surveyValue = surveyMeasurements[key] || 0
      const currentValue = measurements[key] || 0
      return Math.abs(surveyValue - currentValue) > 0.001 // Considerar diferencias mínimas como iguales
    })
  }, [selectedRepair, measurements, currentPhase])

  // Función para obtener el valor a mostrar en cada input
  const getInputValue = useCallback(
    (fieldKey: string) => {
      if (currentPhase === 'survey') {
        // En survey, siempre usar el estado measurements
        return measurements[fieldKey] || 0
      }

      if (currentPhase === 'progress') {
        if (measurementsModified) {
          // Si se han modificado, usar los nuevos valores
          return measurements[fieldKey] || 0
        } else {
          // Si no se han modificado, usar los valores del survey
          if (selectedRepair?.phases?.progress?.length) {
            return (
              selectedRepair?.phases.progress[
                selectedRepair?.phases.progress.length - 1
              ]?.measurements?.[fieldKey] || 0
            )
          } else {
            return selectedRepair?.phases.survey?.measurements?.[fieldKey] || 0
          }
        }
      }

      // Para finish u otras fases
      return measurements[fieldKey] || 0
    },
    [currentPhase, measurements, measurementsModified, selectedRepair]
  )

  useEffect(() => {
    if (currentPhase === 'survey' || !selectedRepair) {
      setMeasurementsModified(false)
      return
    }

    if (
      currentPhase === 'progress' &&
      selectedRepair?.phases?.progress &&
      selectedRepair?.phases?.progress?.length >= 1
    ) {
      const lastProgress =
        selectedRepair.phases?.progress?.[
          selectedRepair.phases?.progress?.length - 1
        ]
      setMeasurements(lastProgress.measurements || {})
      setMeasurementsModified(false)
    }

    if (
      currentPhase === 'progress' &&
      !selectedRepair?.phases?.progress &&
      selectedRepair?.phases.survey?.measurements
    ) {
      // Al entrar en progress, inicializar con valores del survey
      const surveyMeasurements = selectedRepair.phases.survey.measurements
      setMeasurements(surveyMeasurements)
      setMeasurementsModified(false)
    }

    if (currentPhase === 'finish') {
      const lastProgress =
        selectedRepair?.phases?.progress?.[
          selectedRepair?.phases?.progress?.length - 1
        ]
      setMeasurements(lastProgress?.measurements || {})
      setMeasurementsModified(false)
    }
  }, [currentPhase, selectedRepair])

  // ✅ Función para limpiar todo el formulario
  const handleClearForm = () => {
    // Limpiar formulario
    reset({
      project_id: 0,
      drop: 1,
      level: 1,
      repair_type: '',
      repair_index: 1,
      survey_image: '',
      progress_image: [],
      finish_image: '',
    })

    // Limpiar estados
    setProjectSelected(null)
    setDropSelected(1)
    setLevelSelected(1)
    setSelectedRepair(null)
    setSelectValueRepair('')
    setCurrentPhase(null)
    setMeasurements({})
    setComments('')
    setProcessedImages([])
    setShowImageUpload(false)
    setFolderName('')

    // Limpiar datos guardados
    clearRepairs()
  }

  // Función para manejar cambios en los inputs
  const handleMeasurementChange = (fieldKey: string, value: number) => {
    setMeasurements((prev) => ({
      ...prev,
      [fieldKey]: value,
    }))

    // Marcar como modificado si estamos en progress
    if (currentPhase === 'progress') {
      setMeasurementsModified(true)
    }
  }

  // Calcular el valor convertido para mostrar
  // const getConvertedValue = () => {
  //   if (!selectedRepairType || !selectedRepairType.conversion) return null

  //   try {
  //     // Para tipos que no tienen conversión (como 'each'), no mostrar valor convertido
  //     if (selectedRepairType.unit_measure.type === 'each' && !selectedRepairType.conversion) {
  //       return null
  //     }

  //     const value = selectedRepairType.conversion.conversion_factor(measurements)
  //     return {
  //       value: value.toFixed(3),
  //       unit: selectedRepairType.unit_to_charge,
  //     }
  //   } catch (error) {
  //     console.error('Error calculating conversion:', error)
  //     toast.error('Error calculating conversion', {
  //       description: 'Error: ' + error,
  //       duration: 5000,
  //       style: {
  //         background: '#FF0000',
  //         color: '#FFFFFF',
  //         fontWeight: 'bold',
  //       },
  //     })
  //     return null
  //   }
  // }

  // Manejar selección de reparación
  const handleRepairSelection = (value: string) => {
    setSelectValueRepair(value)

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

      // Determinar la fase actual basada en el estado de la reparación y total de fases
      if (repair) {
        const phaseInfo = determineCurrentPhase(repair, phases)
        if (phaseInfo) {
          setCurrentPhase(phaseInfo.phase as 'survey' | 'progress' | 'finish')
          setProgressPhaseNumber(phaseInfo.phaseNumber)
        } else {
          setCurrentPhase(null) // Reparación completa
        }
      }
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
        const signResponse = await fetchWithCSRF('/api/images/signed-upload', {
          method: 'POST',
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
      toast.error('User information not found', {
        duration: 5000,
        position: 'bottom-right',
        style: { backgroundColor: 'red', color: 'white', fontSize: '14px' },
      })
      return
    }

    if (processedImages.length === 0) {
      toast.error('Please add at least one image before submitting', {
        duration: 5000,
        position: 'bottom-right',
        style: { backgroundColor: 'red', color: 'white', fontSize: '14px' },
      })
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
            photos: imageUrls,
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
          selectedRepair.id,
          { phases: updatedPhases },
          accessToken
        )
        if (!result.success) {
          toast.error('Failed to update repair', {
            description: result.error || 'Failed to update repair',
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
        toast.success('Repair updated', {
          description: 'Repair has been updated successfully',
          duration: 3000,
          position: 'bottom-right',
          style: {
            background: '#10B981',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '16px',
          },
        })
      } else {
        // Crear nueva reparación
        const newRepairData = {
          project_id: project_id,
          project_name: selectedProject?.name || '',
          elevation_name: getElevationNameByDrop(
            drop,
            selectedProject?.elevations || []
          ),
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
      reset({
        project_id: projectSelected?.id || 0,
        drop: dropSelected || 1,
        level: levelSelected || 1,
        repair_type: '',
        repair_index: 1,
      })
      clearRepairs()
      setMeasurements({})
      setComments('')
      setCurrentPhase(null)
      setSelectedRepair(null)
      setProcessedImages([])
      setShowImageUpload(false)
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

  // Mantener el submit original como fallback (opcional)
  const onSubmit = async (data: FormData) => {
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
  // ✅ Generar string de mediciones basado en el tipo de reparación - ACTUALIZADO
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

  const getLatestMeasurementsString = () => {
    if (!selectedRepairType) return ''

    const { unit_measure } = selectedRepairType

    // obtener el valor de las mediciones del ultimo progress de la repair elegida
    const repair = locationRepairs.find((r) => r.id === selectedRepair?.id)

    let measurements

    if (repair?.phases?.progress && repair?.phases?.progress?.length >= 1) {
      const progress = repair?.phases.progress
      const latestProgress = progress?.[progress.length - 1]
      measurements = latestProgress?.measurements || {}
    } else {
      measurements = repair?.phases.survey?.measurements || {}
    }

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
    const measurementsStr =
      currentPhase === 'progress' && !measurementsModified
        ? getLatestMeasurementsString()
        : getMeasurementsString()
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

  // ✅ Función para validar que todos los campos de medición requeridos estén completos - ACTUALIZADA
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

  if (projectsLoading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-8 p-1 sm:p-2 md:p-8">
      <Card className="w-full lg:max-w-4xl">
        <CardHeader className="relative px-2 md:px-4">
          <CardTitle>New Repair Entry</CardTitle>

          {/* ✅ Botones de acción en la esquina superior derecha */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearForm}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Form
            </Button>
          </div>
        </CardHeader>
        <CardContent className=" px-2 md:px-4">
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
                    setProjectSelected(project || null)
                    setFolderName(project?.name || '')
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project: ProjectData) => (
                      <SelectItem
                        key={`Project-${project.id}`}
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
              {/* Elevation */}
              {/* <div className="md:col-span-2">
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
              </div> */}

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
                  step={1}
                  disabled={!project_id}
                  {...register('drop', {
                    valueAsNumber: true,
                    required: true,
                    min: 1,
                    max: maxDrops,
                  })}
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
                  step={1}
                  disabled={!project_id}
                  {...register('level', {
                    valueAsNumber: true,
                    required: true,
                    min: 1,
                    max: maxLevels,
                  })}
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
                      (rt: ProjectRepairType, index) => (
                        <SelectItem
                          key={`RepairType${rt.repair_type_id}-${index}`}
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
                <div className=" mb-2 flex items-center gap-2">
                  <Label>Index Repair Selection</Label>
                  {locationRepairsLoading && (
                    <Loader2 className=" w-4 h-4 animate-spin" />
                  )}
                </div>
                <Select
                  value={selectValueRepair}
                  onValueChange={handleRepairSelection}
                  disabled={!repair_type}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select or create repair" />
                  </SelectTrigger>
                  <SelectContent>
                    {repair_type &&
                      matchingRepairs.map((repair, index) => {
                        //const phaseStatus = getPhaseStatus(repair, phases)
                        const nextPhaseInfo = determineCurrentPhase(
                          repair,
                          phases
                        )

                        return (
                          <SelectItem
                            // key={`${project_id}-${repair.id}-${repair.repair_index}-${repair.drop}-${repair.level}-${repair.status}`}
                            key={`${repair.id}-${repair.created_at || index}`}
                            value={repair.repair_index.toString()}
                          >
                            <div className="flex items-center gap-2">
                              <span>Index #{repair.repair_index}</span>
                              <Badge variant={'approved'}>
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
                              {/* {phaseStatus?.isComplete && (
                              <Badge
                                variant="default"
                                className="text-xs bg-green-600"
                              >
                                Complete
                              </Badge>
                            )} */}
                            </div>
                          </SelectItem>
                        )
                      })}
                    <SelectItem value="new">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        New repair (Index: {nextRepairIndex})
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

            {/* Phase Information */}
            {currentPhase && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      {getCurrentPhaseName()} Phase
                    </h3>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-sm">
                        {selectedRepair
                          ? 'Updating Existing Repair'
                          : 'Creating New Repair'}
                      </Badge>
                      <Badge variant="secondary" className="text-sm">
                        Phase{' '}
                        {currentPhase === 'survey'
                          ? '1'
                          : currentPhase === 'finish'
                          ? phases
                          : progressPhaseNumber + 1}{' '}
                        of {phases}
                      </Badge>
                      {allowsMultiplePhotos && (
                        <Badge
                          variant="default"
                          className="text-sm bg-purple-600"
                        >
                          Max {maxPhotos} Photos
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Phase Progress Visual */}
                  {selectedRepair && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm font-medium mb-2">
                        Phase Progress:
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        {/* Survey */}
                        <div
                          className={`flex items-center gap-1 px-2 py-1 rounded ${
                            selectedRepair.phases.survey
                              ? 'bg-green-100 text-green-800'
                              : currentPhase === 'survey'
                              ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {selectedRepair.phases.survey
                            ? '✓'
                            : currentPhase === 'survey'
                            ? '●'
                            : '○'}{' '}
                          Survey
                        </div>

                        {/* Progress phases */}
                        {Array.from(
                          { length: Math.max(0, phases - 2) },
                          (_, i) => {
                            const progressIndex = i + 1
                            const isCompleted =
                              (selectedRepair.phases.progress?.length || 0) >=
                              progressIndex
                            const isCurrent =
                              currentPhase === 'progress' &&
                              progressPhaseNumber === progressIndex

                            return (
                              <div
                                key={`P-${progressIndex}`}
                                className={`flex items-center gap-1 px-2 py-1 rounded ${
                                  isCompleted
                                    ? 'bg-green-100 text-green-800'
                                    : isCurrent
                                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                                    : 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                {isCompleted ? '✓' : isCurrent ? '●' : '○'} P
                                {progressIndex}
                              </div>
                            )
                          }
                        )}

                        {/* Finish */}
                        <div
                          className={`flex items-center gap-1 px-2 py-1 rounded ${
                            selectedRepair.phases.finish
                              ? 'bg-green-100 text-green-800'
                              : currentPhase === 'finish'
                              ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {selectedRepair.phases.finish
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
                  <div className="bg-muted p-3 rounded-md flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-4">
                    <p className="text-sm font-medium">Repair Code:</p>
                    <p className="text-lg font-mono">{getFullRepairCode()}</p>
                    {/* {getMeasurementsString() && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Format: D{drop}.L{level}.{repair_type}.{repair_index}.
                        {getMeasurementsString()}.{getPhaseCode()}
                      </p>
                    )} */}
                  </div>

                  {/* Repair Type Information */}
                  {/* {selectedRepairType && (
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
                  )} */}

                  {/* Dynamic Measurements Input */}
                  {selectedRepairType && getCurrentPhaseName() !== 'Finish' && (
                    <div>
                      <Label>Measurements</Label>

                      {/* ✅ Mostrar indicador si estamos en progress y usando valores del survey */}
                      {currentPhase === 'progress' && !measurementsModified && (
                        <div className="mb-2 p-2 bg-blue-50 rounded-md border border-blue-200">
                          <p className="text-xs text-blue-700">
                            📋 Using latest measurements. Modify any value to
                            update.
                          </p>
                        </div>
                      )}

                      <div className="grid gap-3 md:grid-cols-3 mt-2">
                        {getMeasurementFields().map((field, index) => (
                          <div key={`Measurement-${field.key}-${index}`}>
                            <Label className="text-sm">
                              {field.label}
                              {field.required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                              {/* ✅ Indicador visual si el valor viene del survey */}
                              {currentPhase === 'progress' &&
                                !measurementsModified && (
                                  <span className="text-blue-500 ml-1 text-xs">
                                    (latest)
                                  </span>
                                )}
                            </Label>
                            <Input
                              type="number"
                              step="1"
                              placeholder={field.placeholder}
                              value={getInputValue(field.key) || ''}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0
                                handleMeasurementChange(field.key, value)
                              }}
                              disabled={isSubmitting}
                              className={
                                currentPhase === 'progress' &&
                                !measurementsModified
                                  ? 'border-blue-300 bg-blue-50' // Visual feedback que viene del survey
                                  : ''
                              }
                            />
                            {/* ✅ Mostrar valor original del survey si estamos en progress y se ha modificado */}
                            {currentPhase === 'progress' &&
                              measurementsModified &&
                              !selectedRepair?.phases?.progress &&
                              selectedRepair?.phases.survey?.measurements?.[
                                field.key
                              ] && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Survey value:{' '}
                                  {
                                    selectedRepair.phases.survey.measurements[
                                      field.key
                                    ]
                                  }
                                </p>
                              )}
                            {/* ✅ Mostrar valor original del survey si estamos en progress y se ha modificado */}
                            {currentPhase === 'progress' &&
                              measurementsModified &&
                              selectedRepair?.phases?.progress &&
                              selectedRepair?.phases?.progress?.length >= 1 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Latest value:{' '}
                                  {
                                    selectedRepair?.phases?.progress?.[
                                      selectedRepair?.phases?.progress?.length -
                                        1
                                    ]?.measurements?.[field.key]
                                  }
                                </p>
                              )}
                          </div>
                        ))}
                      </div>

                      {/* Converted Value Display */}
                      {/* {(() => {
                        const converted = getConvertedValue()
                        
                        // Solo mostrar para tipos que tienen conversión
                        const showConversion = selectedRepairType?.conversion && 
                          selectedRepairType.unit_measure.type !== 'each'
                        
                        return (
                          converted && showConversion && (
                            <div className="mt-3 p-2 bg-green-50 rounded-md border border-green-200">
                              <p className="text-sm text-green-800">
                                <span className="font-medium">
                                  Converted Value:
                                </span>{' '}
                                {converted.value} {converted.unit}
                                
                                // Indicar si el cálculo está basado en valores del survey
                                {currentPhase === 'progress' &&
                                  !measurementsModified && (
                                    <span className="text-blue-600 ml-2 text-xs">
                                      (based on Survey measurements)
                                    </span>
                                  )}
                              </p>
                              
                              // Mostrar la fórmula de conversión para tipos complejos
                              {(selectedRepairType.unit_measure.type === 'area_thickness' || 
                                selectedRepairType.unit_measure.type === 'length_thickness') && (
                                <p className="text-xs text-green-600 mt-1">
                                  Formula: {selectedRepairType.unit_measure.value} → {selectedRepairType.unit_to_charge}
                                </p>
                              )}
                            </div>
                          )
                        )
                      })()} */}
                    </div>
                  )}

                  {/* Comments */}
                  {hasMeasurementsChanged() && (
                    <div>
                      <Label>
                        Comments{' '}
                        {currentPhase === 'progress' &&
                          hasMeasurementsChanged() && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                      </Label>
                      <Textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Add any relevant comments about this repair phase..."
                        rows={3}
                        disabled={isSubmitting}
                        required={
                          currentPhase === 'progress' &&
                          hasMeasurementsChanged()
                        }
                      />
                    </div>
                  )}

                  {/* Image Management Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">
                        {getCurrentPhaseName()} Images ({processedImages.length}
                        /{maxPhotos})
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
                            disabled={!validateMeasurements() || isSubmitting}
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
                          <div
                            key={`Processed-Image-${image.id}`}
                            className="relative"
                          >
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
                              disabled={isSubmitting}
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
                            repair_type,
                            repair_index,
                            measures:
                              currentPhase === 'finish'
                                ? getLatestMeasurementsString()
                                : getMeasurementsString(),
                            phase: getPhaseCode(),
                          }}
                          // folderName={selectedProject?.name || folderName}
                          userName={fullName || 'Unknown'}
                          projectName={projectSelected?.name || 'Unknown'}
                          onImageProcessed={handleImageProcessed}
                          disabled={
                            !validateMeasurements() ||
                            isSubmitting ||
                            (hasMeasurementsChanged() &&
                              comments.length === 0 &&
                              currentPhase !== 'finish')
                          }
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
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Submit Button */}
                    {processedImages.length > 0 && (
                      <div className="pt-4">
                        <Button
                          type="button"
                          onClick={handleSubmitRepairData}
                          disabled={
                            isSubmitting ||
                            processedImages.length === 0 ||
                            !validateMeasurements()
                          }
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
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
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* No phase available message */}
            {repair_type && repair_index && !currentPhase && selectedRepair && (
              <div className="bg-muted p-4 rounded-md">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">
                      This repair has been completed.
                    </p>
                    <p className="text-sm">All {phases} phases are finished.</p>
                    {(() => {
                      const phaseStatus = getPhaseStatus(selectedRepair, phases)
                      return (
                        phaseStatus && (
                          <div className="mt-2 text-xs">
                            <span>Completed: Survey ✓</span>
                            {phaseStatus.progress > 0 && (
                              <span>
                                , Progress P1-P{phaseStatus.progress} ✓
                              </span>
                            )}
                            <span>, Finish ✓</span>
                          </div>
                        )
                      )
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Info Message about multi-photo functionality */}
            {currentPhase && allowsMultiplePhotos && (
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
            {currentPhase && (
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <div className="flex items-center gap-2 text-blue-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="text-sm">
                    <strong>Workflow:</strong> Process your images first, then
                    submit all data together. Images will be uploaded to
                    Cloudinary before saving the repair data.
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
