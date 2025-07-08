'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, Upload } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { createFormSchema } from '@/lib/schemas/new-repair-form-schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useProjectsListStore } from '@/stores/projects-list-store'
import { useRepairsDataStore } from '@/stores/repairs-data-store'
import { getRepairStatus } from "@/lib/utils"

type FormData = z.infer<ReturnType<typeof createFormSchema>>

export default function TechnicianNewRepairPage() {
  const { projectsList } = useProjectsListStore()
  const {
    repairsDataList,
    // addRepair,
    // updateRepair
  } = useRepairsDataStore()

  // Referencias para validación
  const maxDropsRef = useRef<number | undefined>(undefined)
  const maxLevelsRef = useRef<number | undefined>(undefined)
  const [statusRepairPhases, setStatusRepairPhases] = useState<
    'S' | `P${number}` | 'F' | null
  >(null)

  console.log('status repair phases: ', statusRepairPhases)

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

  console.log('repair index: ', repair_index)

  // Calcular valores máximos
  const maxDrops = elevation
    ? projectsList
        .find((project) => project.id === project_id)
        ?.elevations.find((elev) => elev.name === elevation)?.drops
    : undefined

  const maxLevels = elevation
    ? projectsList
        .find((project) => project.id === project_id)
        ?.elevations.find((elev) => elev.name === elevation)?.levels
    : undefined

  const phases = projectsList
    .find((project) => project.id === project_id)
    ?.repair_types.find((rt) => rt.repair_type === repair_type)?.phases

  // Actualizar referencias
  useEffect(() => {
    maxDropsRef.current = maxDrops
    maxLevelsRef.current = maxLevels
  }, [maxDrops, maxLevels])

  // Reiniciar campos dependientes
  useEffect(() => {
    setValue('elevation', '')
    setValue('drop', 1)
    setValue('level', 1)
    setValue('repair_type', '')
    setValue('repair_index', 1)
    setValue('progress_image', [])
  }, [project_id, setValue])

  useEffect(() => {
    setValue('drop', 1)
    setValue('level', 1)
    setValue('repair_type', '')
    setValue('repair_index', 1)
    setValue('progress_image', [])
  }, [elevation, setValue])

  // Filtrar reparaciones existentes
  const matchingRepairs = repairsDataList.filter(
    (repair) =>
      repair.project_id === project_id &&
      repair.elevation_name === elevation &&
      repair.drop === drop &&
      repair.level === level &&
      repair.phases.survey?.repair_type === repair_type
  )

  // Calcular el próximo repair_index
  const nextRepairIndex =
    matchingRepairs.length > 0
      ? Math.max(...matchingRepairs.map((r) => r.repair_index)) + 1
      : 1

  console.log('nextRepairIndex', nextRepairIndex)

  // Estado para manejar la creación de una nueva reparación
  const [isNewRepair, setIsNewRepair] = useState<boolean | null>(null)

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data)

    // addRepair(data)
    // updateRepair(data)
    reset()
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="w-full lg:w-1/2 rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">New Repair</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="sm:col-span-4">
              <label className="mb-2 block text-sm font-medium">Project</label>
              <Select
                value={project_id === 0 ? '' : project_id.toString()}
                onValueChange={(value) =>
                  setValue('project_id', parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projectsList.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
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

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Elevation
              </label>
              <Select
                value={elevation}
                onValueChange={(value) => setValue('elevation', value)}
                disabled={!project_id}
              >
                <SelectTrigger className="disabled:border-neutral-400 disabled:bg-neutral-300">
                  <SelectValue placeholder="Select elevation" />
                </SelectTrigger>
                <SelectContent>
                  {projectsList
                    .find((project) => project.id === project_id)
                    ?.elevations.map((elevation) => (
                      <SelectItem key={elevation.name} value={elevation.name}>
                        {elevation.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.elevation && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.elevation.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Drop{' '}
                {elevation && <span>(min: 1 - max: {maxDrops || 'N/A'})</span>}
              </label>
              <Input
                type="number"
                placeholder="Enter drop"
                disabled={!elevation}
                {...register('drop', { valueAsNumber: true })}
                max={maxDrops}
                min={1}
                step={1}
                className="disabled:border-neutral-400 disabled:bg-neutral-300"
              />
              {errors.drop && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.drop.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Level{' '}
                {elevation && <span>(min: 1 - max: {maxLevels || 'N/A'})</span>}
              </label>
              <Input
                type="number"
                placeholder="Enter level"
                disabled={!elevation}
                {...register('level', { valueAsNumber: true })}
                max={maxLevels}
                min={1}
                step={1}
                className="disabled:border-neutral-400 disabled:bg-neutral-300"
              />
              {errors.level && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.level.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Repair Type
              </label>
              <Select
                value={repair_type}
                onValueChange={(value) => setValue('repair_type', value)}
                disabled={
                  !project_id || elevation.length === 0 || !drop || !level
                }
              >
                <SelectTrigger className="disabled:border-neutral-400 disabled:bg-neutral-300">
                  <SelectValue placeholder="Select repair type" />
                </SelectTrigger>
                <SelectContent>
                  {projectsList
                    .find((project) => project.id === project_id)
                    ?.repair_types.map((repair_type) => (
                      <SelectItem
                        key={repair_type.repair_type_id}
                        value={repair_type.repair_type}
                      >
                        {repair_type.repair_type}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.repair_type && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.repair_type.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Repair Index
              </label>
              <Select
                value={watch('repair_index')?.toString()}
                onValueChange={(value) => {
                  if (value === nextRepairIndex.toString()) {
                    setIsNewRepair(true)
                    setValue('repair_index', nextRepairIndex)
                    setStatusRepairPhases('S')
                  } else {
                    setIsNewRepair(false)
                    setValue('repair_index', parseInt(value))
                  }
                }}
                disabled={!repair_type}
              >
                <SelectTrigger className="disabled:border-neutral-400 disabled:bg-neutral-300">
                  <SelectValue placeholder="Select repair index" />
                </SelectTrigger>
                <SelectContent>
                  {matchingRepairs.map((repair) => (
                    <SelectItem
                      key={repair.id}
                      value={repair.repair_index.toString()}
                    >
                      Repair #{repair.repair_index} ({getRepairStatus(repair)})
                    </SelectItem>
                  ))}
                  <SelectItem value={nextRepairIndex.toString()}>
                    Create new repair (Index: {nextRepairIndex})
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.repair_index && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.repair_index.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {isNewRepair && (
              <div className="sm:col-span-3">
                <h3 className="mb-2 block text-sm font-medium">
                  Repair #{nextRepairIndex}
                </h3>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Survey Image
              </label>
              <div className="mt-1 flex flex-col gap-2">
                <div className="flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer rounded-md bg-white font-medium text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 hover:text-orange-400">
                        <span>Upload a file</span>
                        <Input
                          type="file"
                          className="sr-only"
                          onChange={() =>
                            setValue('survey_image', 'uploaded', {
                              shouldValidate: true,
                            })
                          }
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center justify-center"
                  onClick={() =>
                    setValue('survey_image', 'camera', { shouldValidate: true })
                  }
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Use Camera
                </Button>
              </div>
              {errors.survey_image && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.survey_image.message}
                </p>
              )}
            </div>

            {new Array(phases ? phases - 2 : 0).fill(0).map((_, index) => (
              <div key={index}>
                <label className="mb-2 block text-sm font-medium">
                  Progress {index + 1} Image
                </label>
                <div className="mt-1 flex flex-col gap-2">
                  <div className="flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-md bg-white font-medium text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 hover:text-orange-400">
                          <span>Upload a file</span>
                          <Input
                            type="file"
                            className="sr-only"
                            onChange={() => {
                              const currentImages = watch('progress_image') || []
                              setValue(
                                'progress_image',
                                [...currentImages, 'uploaded'],
                                { shouldValidate: true }
                              )
                            }}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center justify-center"
                    onClick={() => {
                      const currentImages = watch('progress_image') || []
                      setValue('progress_image', [...currentImages, 'camera'], {
                        shouldValidate: true,
                      })
                    }}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Use Camera
                  </Button>
                </div>
                {errors.progress_image && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.progress_image.message}
                  </p>
                )}
              </div>
            ))}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Finish Image
              </label>
              <div className="mt-1 flex flex-col gap-2">
                <div className="flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer rounded-md bg-white font-medium text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 hover:text-orange-400">
                        <span>Upload a file</span>
                        <Input
                          type="file"
                          className="sr-only"
                          onChange={() =>
                            setValue('finish_image', 'uploaded', {
                              shouldValidate: true,
                            })
                          }
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center justify-center"
                  onClick={() =>
                    setValue('finish_image', 'camera', { shouldValidate: true })
                  }
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Use Camera
                </Button>
              </div>
              {errors.finish_image && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.finish_image.message}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-500 text-white hover:bg-orange-400 disabled:bg-gray-300"
            disabled={!isValid}
          >
            Submit Repair
          </Button>
        </form>
      </div>
    </div>
  )
}

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
// import { RepairData, repair_type } from '@/types/repair-type'
// import { ProjectData } from '@/types/project-types'

// type ImageOrigin = 'camera' | 'uploaded'

// type FormData = {
//   project_id: string
//   elevation: string
//   drop: string
//   level: string
//   repair_type: string
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
//   const [repair_typeselected, setrepair_typeselected] =
//     useState<repair_type['type']>('')
//   const [repair_indexSelected, setrepair_indexSelected] =
//     useState<RepairData['repair_index']>(1)

//   const [formData, setFormData] = useState<FormData>({
//     project_id: '',
//     elevation: '',
//     drop: '',
//     level: '',
//     repair_type: '',
//     survey_image: null,
//     progress_image: null,
//     finish_image: null,
//   })

//   const isFormComplete =
//     formData.project_id &&
//     formData.elevation &&
//     formData.drop &&
//     formData.level &&
//     formData.repair_type &&
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
//                 value={formData.repair_type}
//                 onValueChange={(value) =>
//                   setFormData({ ...formData, repair_type: value })
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
//       project_id: 0,
//       elevation: '',
//       drop: 1,
//       level: 1,
//       repair_type: '',
//       survey_image: '',
//       progress_image: [],
//       finish_image: '',
//     },
//     mode: 'onChange',
//   })

//   const project_id = watch('project_id')
//   const elevation = watch('elevation')
//   const repair_typeselected = watch('repair_type')

//   const phases = projectsList
//     .find((project) => project.id === project_id)
//     ?.repair_types.find(
//       (repair_type) => repair_type.repair_type === repair_typeselected
//     )?.phases

//   // console.log(
//   //   projectsList
//   //     .find((project) => project.id === project_id)
//   //     ?.repair_types.find(
//   //       (repair_type) => repair_type.repair_type === repair_typeselected
//   //     )?.phases
//   // )

//   // Calcular el valor máximo de drop
//   const maxDrops = elevation
//     ? projectsList
//         .find((project) => project.id === project_id)
//         ?.elevations.find((elev) => elev.name === elevation)?.drops
//     : undefined

//   // Calcular el valor máximo de level
//   const maxLevels = elevation
//     ? projectsList
//         .find((project) => project.id === project_id)
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
//   }, [project_id, setValue])

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
//                 value={project_id.toString() === '0' ? '' : project_id.toString()}
//                 onValueChange={(value) =>
//                   setValue('project_id', parseInt(value))
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
//                 value={watch('repair_type')}
//                 onValueChange={(value) => setValue('repair_type', value)}
//                 disabled={!project_id}
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
//             {/* List of existing Repairs by repair_index, clickeable to select repair and to continue process */}
//             <div></div>

//             {/* Create new Repair using repair_index = 1 if no existing repairs, else create new repair_index with incremental repair_index */}
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
