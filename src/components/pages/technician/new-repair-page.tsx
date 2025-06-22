// src/components/pages/technician/new-repair-page.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
//import { CldImage, CldUploadWidget } from 'next-cloudinary'
//import { Camera, Upload } from 'lucide-react'
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
import { RepairData } from '@/types/repair-type'
import CustomImageUpload from '@/components/custom-image-upload'

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
  const [folderName, setFolderName] = useState<string>('')

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
      projectId: 0,
      elevation: '',
      drop: 1,
      level: 1,
      repairType: '',
      repairIndex: 1,
      surveyImage: '',
      progressImage: [],
      finishImage: '',
    },
    mode: 'onChange',
  })

  const projectId = watch('projectId')
  const elevation = watch('elevation')
  const drop = watch('drop')
  const level = watch('level')
  const repairType = watch('repairType')
  const repairIndex = watch('repairIndex')

  console.log('repair index: ', repairIndex)

  // Calcular valores máximos
  const maxDrops = elevation
    ? projectsList
        .find((project) => project.id === projectId)
        ?.elevations.find((elev) => elev.name === elevation)?.drops
    : undefined

  const maxLevels = elevation
    ? projectsList
        .find((project) => project.id === projectId)
        ?.elevations.find((elev) => elev.name === elevation)?.levels
    : undefined

  const phases = projectsList
    .find((project) => project.id === projectId)
    ?.repairTypes.find((rt) => rt.repairType === repairType)?.phases

  console.log('phases new repair: ', phases)

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
    setValue('repairType', '')
    setValue('repairIndex', 1)
    setValue('progressImage', [])
  }, [projectId, setValue])

  useEffect(() => {
    setValue('drop', 1)
    setValue('level', 1)
    setValue('repairType', '')
    setValue('repairIndex', 1)
    setValue('progressImage', [])
  }, [elevation, setValue])

  // Filtrar reparaciones existentes
  const matchingRepairs = repairsDataList.filter(
    (repair) =>
      repair.projectId === projectId &&
      repair.elevationName === elevation &&
      repair.drop === drop &&
      repair.level === level &&
      repair.phases.survey.repairType === repairType
  )

  // Calcular el próximo repairIndex
  const nextRepairIndex =
    matchingRepairs.length > 0
      ? Math.max(...matchingRepairs.map((r) => r.repairIndex)) + 1
      : 1

  console.log('nextRepairIndex', nextRepairIndex)

  // Estado para manejar la creación de una nueva reparación
  const [isNewRepair, setIsNewRepair] = useState<boolean | null>(null)

  // Determinar el estado de una reparación
  const getRepairStatus = (repair: RepairData) => {
    if (repair.phases.finish.createdAt > 0) return 'finish'
    if (repair.phases.progress.some((p) => p.createdAt > 0)) return 'progress'
    if (repair.phases.survey.createdAt > 0) return 'survey'
    return 'pending'
  }

  // const handleFileName = () => {
  //   if (!drop || !level || !repairType || !repairIndex) return
  //   const name = `D${drop}.L${level}.${repairType}.${repairIndex}.100x100x40.S`
  //   console.log('filename: ', name)

  //   setFileName(name)
  // }

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data)

    // addRepair(data)
    // updateRepair(data)
    reset()
  }

  return (
    <div className="w-full flex flex-col gap-8 p-2 md:p-8 bg-sky-500">
      <div className="w-full lg:max-w-3xl rounded-lg border bg-neutral-100 p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">New Repair</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="sm:col-span-4">
              <label className="mb-2 block text-sm font-medium">Project</label>
              <Select
                value={projectId === 0 ? '' : projectId.toString()}
                onValueChange={(value) => {
                  setValue('projectId', parseInt(value))
                  setFolderName(
                    projectsList.find((p) => p.id === parseInt(value))?.name ||
                      ''
                  )
                }}
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
              {errors.projectId && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.projectId.message}
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
                disabled={!projectId}
              >
                <SelectTrigger className="disabled:border-neutral-400 disabled:bg-neutral-300">
                  <SelectValue placeholder="Select elevation" />
                </SelectTrigger>
                <SelectContent>
                  {projectsList
                    .find((project) => project.id === projectId)
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
                value={repairType}
                onValueChange={(value) => setValue('repairType', value)}
                disabled={
                  !projectId || elevation.length === 0 || !drop || !level
                }
              >
                <SelectTrigger className="disabled:border-neutral-400 disabled:bg-neutral-300">
                  <SelectValue placeholder="Select repair type" />
                </SelectTrigger>
                <SelectContent>
                  {projectsList
                    .find((project) => project.id === projectId)
                    ?.repairTypes.map((repairType) => (
                      <SelectItem
                        key={repairType.repairTypeId}
                        value={repairType.repairType}
                      >
                        {repairType.repairType}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.repairType && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.repairType.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Repair Index
              </label>
              <Select
                value={watch('repairIndex')?.toString()}
                onValueChange={(value) => {
                  if (value === nextRepairIndex.toString()) {
                    setIsNewRepair(true)
                    setValue('repairIndex', nextRepairIndex)
                    setStatusRepairPhases('S')
                  } else {
                    setIsNewRepair(false)
                    setValue('repairIndex', parseInt(value))
                  }
                }}
                disabled={!repairType}
              >
                <SelectTrigger className="disabled:border-neutral-400 disabled:bg-neutral-300">
                  <SelectValue placeholder="Select repair index" />
                </SelectTrigger>
                <SelectContent>
                  {matchingRepairs.map((repair) => (
                    <SelectItem
                      key={repair.id}
                      value={repair.repairIndex.toString()}
                    >
                      Repair #{repair.repairIndex} ({getRepairStatus(repair)})
                    </SelectItem>
                  ))}
                  <SelectItem value={nextRepairIndex.toString()}>
                    Create new repair (Index: {nextRepairIndex})
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.repairIndex && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.repairIndex.message}
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

            {/* <div>
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
                            setValue('surveyImage', 'uploaded', {
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
                    setValue('surveyImage', 'camera', { shouldValidate: true })
                  }
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Use Camera
                </Button>
              </div>
              {errors.surveyImage && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.surveyImage.message}
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
                              const currentImages = watch('progressImage') || []
                              setValue(
                                'progressImage',
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
                      const currentImages = watch('progressImage') || []
                      setValue('progressImage', [...currentImages, 'camera'], {
                        shouldValidate: true,
                      })
                    }}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Use Camera
                  </Button>
                </div>
                {errors.progressImage && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.progressImage.message}
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
                            setValue('finishImage', 'uploaded', {
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
                    setValue('finishImage', 'camera', { shouldValidate: true })
                  }
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Use Camera
                </Button>
              </div>
              {errors.finishImage && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.finishImage.message}
                </p>
              )}
            </div> */}
            <div className=" col-span-3">
              <CustomImageUpload
                fieldName="surveyImage"
                fileNameData={{
                  drop,
                  level,
                  repairType,
                  repairIndex,
                  measures: '100x100x40',
                  phase: 'S',
                }}
                folderName={folderName}
                userName="John Doe"
                onUploadSuccess={(imageData) => {
                  // save data on supabase
                  console.log('success upload: ', imageData)
                }}
              />
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

      {/* Testing */}
      {/* <div>
        <CustomImageUpload
          fieldName="progressImage"
          fileNameData={{
            drop: 15,
            level: 14,
            repairType: 'CR',
            repairIndex: 1,
            measures: '100x100x40',
            phase: 'P2',
          }}
          folderName={'sample'}
          userName="John Doe (id: 1)"
          onUploadSuccess={(imageData) => {
            console.log('success upload: ', imageData)
          }}
        />
      </div> */}
    </div>
  )
}

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
//   surveyImage: ImageOrigin | null
//   progressImage: ImageOrigin | null
//   finishImage: ImageOrigin | null
// }

// export default function TechnicianNewRepairPage() {
//   const { projectsList } = useProjectsListStore()

//   console.log('projectsList: ', projectsList)
//   const [projectSelected, setProjectSelected] = useState<ProjectData | null>(
//     null
//   )
//   const [elevationSelected, setElevationSelected] =
//     useState<RepairData['elevationName']>('')
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
//     surveyImage: null,
//     progressImage: null,
//     finishImage: null,
//   })

//   const isFormComplete =
//     formData.projectId &&
//     formData.elevation &&
//     formData.drop &&
//     formData.level &&
//     formData.repairType &&
//     formData.surveyImage &&
//     formData.progressImage &&
//     formData.finishImage

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
//                               surveyImage: 'uploaded',
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
//                     setFormData({ ...formData, surveyImage: 'camera' })
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
//                               progressImage: 'uploaded',
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
//                     setFormData({ ...formData, progressImage: 'camera' })
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
//                               finishImage: 'uploaded',
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
//                     setFormData({ ...formData, finishImage: 'camera' })
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
//       surveyImage: '',
//       progressImage: [],
//       finishImage: '',
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
//                         key={repairType.repairTypeId}
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
//                             setValue('surveyImage', 'uploaded', {
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
//                     setValue('surveyImage', 'camera', { shouldValidate: true })
//                   }
//                 >
//                   <Camera className="mr-2 h-4 w-4" />
//                   Use Camera
//                 </Button>
//               </div>
//               {errors.surveyImage && (
//                 <p className="mt-1 text-sm text-red-500">
//                   {errors.surveyImage.message}
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
//                               setValue('progressImage', 'uploaded', {
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
//                       setValue('progressImage', 'camera', {
//                         shouldValidate: true,
//                       })
//                     }
//                   >
//                     <Camera className="mr-2 h-4 w-4" />
//                     Use Camera
//                   </Button>
//                 </div>
//                 {errors.progressImage && (
//                   <p className="mt-1 text-sm text-red-500">
//                     {errors.progressImage.message}
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
//                             setValue('finishImage', 'uploaded', {
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
//                     setValue('finishImage', 'camera', { shouldValidate: true })
//                   }
//                 >
//                   <Camera className="mr-2 h-4 w-4" />
//                   Use Camera
//                 </Button>
//               </div>
//               {errors.finishImage && (
//                 <p className="mt-1 text-sm text-red-500">
//                   {errors.finishImage.message}
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
