// src/components/repair-detail-modal.tsx

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import {
  Calendar,
  User,
  // MapPin,
  Wrench,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  // MessageSquare,
  Download,
  ZoomIn,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  RepairData,
  RepairDataStatusType,
  SurveyPhase,
  ProgressPhase,
  FinishPhase,
} from '@/types/repair-type'
import { getRepairType, getRepairStatus } from '@/lib/utils'
import Image from 'next/image'

interface RepairDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  repair: RepairData | null
  onStatusUpdate?: (params: {
    repairId: number
    status: RepairDataStatusType
  }) => void
  canEditStatus?: boolean // Para controlar si se puede editar el estado
}

// Componente para mostrar imágenes con modal de zoom
function ImageViewer({ images, title }: { images: string[]; title: string }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  if (!images || images.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic">
        No images uploaded
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {images.map((imageUrl, index) => (
          <div
            key={index}
            className="relative group cursor-pointer rounded-lg overflow-hidden border"
            onClick={() => setSelectedImage(imageUrl)}
          >
            <Image
              src={imageUrl}
              alt={`${title} ${index + 1}`}
              width={300}
              height={200}
              className="w-full aspect-video object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>

      {/* Modal para imagen ampliada */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex flex-col items-center">
              <Image
                src={selectedImage}
                alt={title}
                width={800}
                height={600}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.open(selectedImage, '_blank')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedImage(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

// Componente para mostrar información de fase
function PhaseInfo({
  title,
  phase,
  isCompleted,
}: {
  title: string
  phase: SurveyPhase | ProgressPhase | FinishPhase | null | undefined
  isCompleted: boolean
}) {
  console.log('is completed', isCompleted)

  if (!phase) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <h4 className="font-medium text-gray-600">{title}</h4>
          <Badge variant="secondary">Pending</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Phase not completed yet</p>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded-lg bg-white">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="w-4 h-4 text-green-600" />
        <h4 className="font-medium">{title}</h4>
        <Badge variant="default" className="bg-green-100 text-green-800">
          Completed
        </Badge>
      </div>

      <div className="space-y-3">
        {/* Información del usuario y fecha */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>{phase.created_by_user_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>
              {new Date(phase.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Información específica del tipo de fase */}
        {'repair_type' in phase && (
          <div className="flex items-center gap-2 text-sm">
            <Wrench className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{phase.repair_type}</span>
          </div>
        )}

        {/* Mediciones */}
        {'measurements' in phase &&
          phase.measurements &&
          Object.keys(phase.measurements).length > 0 && (
            <div>
              <Label className="text-sm font-medium">Measurements:</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {Object.entries(phase.measurements).map(([key, value]) => (
                  <Badge key={key} variant="outline">
                    {key}: {value}
                  </Badge>
                ))}
              </div>
            </div>
          )}

        {/* Comentarios */}
        {phase.comments && (
          <div>
            <Label className="text-sm font-medium">Comments:</Label>
            <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
              {phase.comments}
            </div>
          </div>
        )}

        {/* Imágenes */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ImageIcon className="w-4 h-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Images:</Label>
          </div>
          {'photos' in phase && phase.photos ? (
            <ImageViewer images={phase.photos} title={title} />
          ) : 'photo' in phase && phase.photo ? (
            <ImageViewer images={[phase.photo]} title={title} />
          ) : (
            <div className="text-sm text-muted-foreground italic">
              No images uploaded
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function RepairDetailModal({
  open,
  onOpenChange,
  repair,
  onStatusUpdate,
  canEditStatus = false,
}: RepairDetailModalProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState<RepairDataStatusType>('pending')
  const [statusComments, setStatusComments] = useState('')

  if (!repair) return null

  const repairCode = `D${repair.drop}.L${repair.level}.${getRepairType(
    repair.phases
  )}.${repair.repair_index}`

  const handleStatusUpdate = async () => {
    if (onStatusUpdate && repair) {
      setIsUpdatingStatus(true)
      try {
        await onStatusUpdate({
          repairId: repair.id,
          status: newStatus,
        })
        onOpenChange(false)
      } catch (error) {
        console.error('Error updating status:', error)
      } finally {
        setIsUpdatingStatus(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Repair Details - {repairCode}</span>
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4" />
            </Button> */}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Repair ID</Label>
                <p className="text-lg font-semibold">#{repair.id}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Repair Code</Label>
                <p className="text-lg font-mono font-semibold">{repairCode}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="mt-1">
                  <Badge
                    variant={
                      repair.status === 'approved'
                        ? 'default'
                        : repair.status === 'pending'
                        ? 'secondary'
                        : 'destructive'
                    }
                    className="text-sm"
                  >
                    {getRepairStatus(repair)}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Project</Label>
                <p className="text-lg">{repair.project_name}</p>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <Label className="text-sm font-medium">Elevation</Label>
                  <p>{repair.elevation_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Drop</Label>
                  <p>{repair.drop}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Level</Label>
                  <p>{repair.level}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Created By</Label>
                <p>{repair.created_by_user_name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(repair.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Fases del repair */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Repair Phases</h3>

            {/* Survey Phase */}
            <PhaseInfo
              title="Survey Phase"
              phase={repair.phases.survey}
              isCompleted={!!repair.phases.survey}
            />

            {/* Progress Phases */}
            {repair.phases.progress && repair.phases.progress.length > 0 && (
              <div className="space-y-3">
                {repair.phases.progress.map((progressPhase, index) => (
                  <PhaseInfo
                    key={index}
                    title={`Progress Phase ${index + 1}`}
                    phase={progressPhase}
                    isCompleted={true}
                  />
                ))}
              </div>
            )}

            {/* Finish Phase */}
            <PhaseInfo
              title="Finish Phase"
              phase={repair.phases.finish}
              isCompleted={!!repair.phases.finish}
            />
          </div>

          {/* Actualización de estado (solo para managers/admins) */}
          {canEditStatus && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Update Status</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status-select">New Status</Label>
                    <Select
                      value={newStatus}
                      onValueChange={(value) =>
                        setNewStatus(value as RepairDataStatusType)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status-comments">Comments (Optional)</Label>
                    <Textarea
                      id="status-comments"
                      placeholder="Add comments about this status change..."
                      value={statusComments}
                      onChange={(e) => setStatusComments(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleStatusUpdate}
                  disabled={isUpdatingStatus || newStatus === repair.status}
                  className="w-full"
                >
                  {isUpdatingStatus
                    ? 'Updating...'
                    : `Update Status to ${newStatus}`}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// // src/components/repair-detail-modal.tsx

// 'use client'

// import { useState } from 'react'
// import {
//   X,
//   Calendar,
//   User,
//   // MapPin,
//   Camera,
//   Check,
//   AlertCircle,
//   Clock,
//   Ruler,
// } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import { Badge } from '@/components/ui/badge'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// // import { Separator } from '@/components/ui/separator'
// import {
//   RepairData,
//   RepairDataStatusType,
//   RepairPhase,
// } from '@/types/repair-type'
// import { getRepairType } from '@/lib/utils'
// import Image from 'next/image'

// interface RepairDetailModalProps {
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   repair: RepairData
//   onStatusUpdate: (data: {
//     repairId: number
//     status: RepairDataStatusType
//   }) => void
// }

// export function RepairDetailModal({
//   open,
//   onOpenChange,
//   repair,
//   onStatusUpdate,
// }: RepairDetailModalProps) {
//   const [status, setStatus] = useState<RepairDataStatusType>(repair.status)
//   const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)

//   const handleStatusChange = (newStatus: RepairDataStatusType) => {
//     setStatus(newStatus)
//     onStatusUpdate({ repairId: repair.id, status: newStatus })
//   }

//   const getStatusIcon = (status: RepairDataStatusType) => {
//     switch (status) {
//       case 'approved':
//         return <Check className="h-4 w-4" />
//       case 'pending':
//         return <Clock className="h-4 w-4" />
//       case 'rejected':
//         return <AlertCircle className="h-4 w-4" />
//       default:
//         return null
//     }
//   }

//   const getStatusColor = (status: RepairDataStatusType) => {
//     switch (status) {
//       case 'approved':
//         return 'bg-green-100 text-green-800'
//       case 'pending':
//         return 'bg-yellow-100 text-yellow-800'
//       case 'rejected':
//         return 'bg-red-100 text-red-800'
//       default:
//         return 'bg-gray-100 text-gray-800'
//     }
//   }

//   const getPhaseStatus = (phaseData: RepairPhase) => {
//     return phaseData?.created_at?.length > 0 ? 'completed' : 'pending'
//   }

//   const formatDate = (dateString: string) => {
//     if (!dateString) return 'No date'
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     })
//   }

//   const renderMeasurements = (
//     measurements: Record<string, number> | null | undefined
//   ) => {
//     if (!measurements || Object.keys(measurements).length === 0) {
//       return <span className="text-muted-foreground">No measurements</span>
//     }

//     return (
//       <div className="flex flex-wrap gap-2">
//         {Object.entries(measurements).map(([key, value]) => (
//           <Badge
//             key={key}
//             variant="outline"
//             className="flex items-center gap-1"
//           >
//             <Ruler className="h-3 w-3" />
//             {key}: {value}
//           </Badge>
//         ))}
//       </div>
//     )
//   }

//   return (
//     <>
//       <Dialog open={open} onOpenChange={onOpenChange}>
//         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle className="flex items-center justify-between">
//               <span>Repair Details - #{repair.id}</span>
//               <Badge className={getStatusColor(status)}>
//                 {getStatusIcon(status)}
//                 <span className="ml-1">{status}</span>
//               </Badge>
//             </DialogTitle>
//           </DialogHeader>

//           <div className="space-y-6">
//             {/* Basic Information */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-lg">Basic Information</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm text-muted-foreground">Repair Code</p>
//                     <p className="font-medium">
//                       D{repair.drop}.L{repair.level}.
//                       {getRepairType(repair.phases)}.{repair.repair_index}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-muted-foreground">Type</p>
//                     <Badge variant="secondary">
//                       {getRepairType(repair.phases)}
//                     </Badge>
//                   </div>
//                   <div>
//                     <p className="text-sm text-muted-foreground">Project</p>
//                     <p className="font-medium">{repair.project_name}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-muted-foreground">Elevation</p>
//                     <p className="font-medium">{repair.elevation_name}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-muted-foreground">Drop</p>
//                     <p className="font-medium">{repair.drop}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-muted-foreground">Level</p>
//                     <p className="font-medium">{repair.level}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-muted-foreground">Created</p>
//                     <p className="font-medium">
//                       {formatDate(repair.created_at)}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-muted-foreground">
//                       Last Updated
//                     </p>
//                     <p className="font-medium">
//                       {formatDate(repair.updated_at)}
//                     </p>
//                   </div>
//                   {repair.created_by_user_name && (
//                     <div>
//                       <p className="text-sm text-muted-foreground">
//                         Created By
//                       </p>
//                       <p className="font-medium flex items-center gap-2">
//                         <User className="h-4 w-4" />
//                         {repair.created_by_user_name}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Status Update */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-lg">Status Management</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="flex items-center gap-4">
//                   <Select value={status} onValueChange={handleStatusChange}>
//                     <SelectTrigger className="w-[200px]">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="pending">Pending</SelectItem>
//                       <SelectItem value="approved">Approved</SelectItem>
//                       <SelectItem value="rejected">Rejected</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <p className="text-sm text-muted-foreground">
//                     Update the status of this repair
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Phases Information */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-lg">Repair Phases</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <Tabs defaultValue="survey" className="w-full">
//                   <TabsList className="grid grid-cols-3 w-full">
//                     <TabsTrigger value="survey">
//                       Survey{' '}
//                       {getPhaseStatus(repair.phases.survey as RepairPhase ) === 'completed' &&
//                         '✓'}
//                     </TabsTrigger>
//                     <TabsTrigger value="progress">
//                       Progress{' '}
//                       {repair.phases.progress?.some(
//                         (p) => p.created_at?.length > 0
//                       ) && '✓'}
//                     </TabsTrigger>
//                     <TabsTrigger value="finish">
//                       Finish{' '}
//                       {getPhaseStatus(repair.phases.finish as RepairPhase) === 'completed' &&
//                         '✓'}
//                     </TabsTrigger>
//                   </TabsList>

//                   {/* Survey Tab */}
//                   <TabsContent value="survey" className="space-y-4">
//                     {repair.phases.survey ? (
//                       <>
//                         <div className="grid grid-cols-2 gap-4">
//                           <div>
//                             <p className="text-sm text-muted-foreground">
//                               Date
//                             </p>
//                             <p className="font-medium flex items-center gap-2">
//                               <Calendar className="h-4 w-4" />
//                               {formatDate(repair.phases.survey.created_at)}
//                             </p>
//                           </div>
//                           <div>
//                             <p className="text-sm text-muted-foreground">
//                               Created By
//                             </p>
//                             <p className="font-medium flex items-center gap-2">
//                               <User className="h-4 w-4" />
//                               {repair.phases.survey.created_by_user_name ||
//                                 'Unknown'}
//                             </p>
//                           </div>
//                         </div>

//                         {repair.phases.survey.repair_type && (
//                           <div>
//                             <p className="text-sm text-muted-foreground">
//                               Repair Type
//                             </p>
//                             <p className="font-medium">
//                               {repair.phases.survey.repair_type}
//                             </p>
//                           </div>
//                         )}

//                         <div>
//                           <p className="text-sm text-muted-foreground mb-2">
//                             Measurements
//                           </p>
//                           {renderMeasurements(
//                             repair.phases.survey.measurements
//                           )}
//                         </div>

//                         {repair.phases.survey.comments && (
//                           <div>
//                             <p className="text-sm text-muted-foreground">
//                               Comments
//                             </p>
//                             <p className="mt-1">
//                               {repair.phases.survey.comments}
//                             </p>
//                           </div>
//                         )}

//                         {repair.phases.survey.photos &&
//                           repair.phases.survey.photos.length > 0 && (
//                             <div>
//                               <p className="text-sm text-muted-foreground mb-2">
//                                 Photos ({repair.phases.survey.photos.length})
//                               </p>
//                               <div className="grid grid-cols-4 gap-2">
//                                 {repair.phases.survey.photos.map(
//                                   (photo, index) => (
//                                     <div
//                                       key={index}
//                                       className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
//                                       onClick={() => setSelectedPhoto(photo)}
//                                     >
//                                       <Image
//                                         src={photo}
//                                         alt={`Survey photo ${index + 1}`}
//                                         className="w-full h-full object-cover"
//                                       />
//                                       <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
//                                         <Camera className="h-6 w-6 text-white" />
//                                       </div>
//                                     </div>
//                                   )
//                                 )}
//                               </div>
//                             </div>
//                           )}
//                       </>
//                     ) : (
//                       <p className="text-muted-foreground">
//                         No survey data available
//                       </p>
//                     )}
//                   </TabsContent>

//                   {/* Progress Tab */}
//                   <TabsContent value="progress" className="space-y-4">
//                     {repair.phases.progress &&
//                     repair.phases.progress.length > 0 ? (
//                       repair.phases.progress.map((progress, index) => (
//                         <Card key={index}>
//                           <CardHeader>
//                             <CardTitle className="text-base">
//                               Progress Phase {index + 1}
//                             </CardTitle>
//                           </CardHeader>
//                           <CardContent className="space-y-4">
//                             <div className="grid grid-cols-2 gap-4">
//                               <div>
//                                 <p className="text-sm text-muted-foreground">
//                                   Date
//                                 </p>
//                                 <p className="font-medium flex items-center gap-2">
//                                   <Calendar className="h-4 w-4" />
//                                   {formatDate(progress.created_at)}
//                                 </p>
//                               </div>
//                               <div>
//                                 <p className="text-sm text-muted-foreground">
//                                   Created By
//                                 </p>
//                                 <p className="font-medium flex items-center gap-2">
//                                   <User className="h-4 w-4" />
//                                   {progress.created_by_user_name || 'Unknown'}
//                                 </p>
//                               </div>
//                             </div>

//                             {progress.repair_type && (
//                               <div>
//                                 <p className="text-sm text-muted-foreground">
//                                   Repair Type
//                                 </p>
//                                 <p className="font-medium">
//                                   {progress.repair_type}
//                                 </p>
//                               </div>
//                             )}

//                             <div>
//                               <p className="text-sm text-muted-foreground mb-2">
//                                 Measurements
//                               </p>
//                               {renderMeasurements(progress.measurements)}
//                             </div>

//                             {progress.comments && (
//                               <div>
//                                 <p className="text-sm text-muted-foreground">
//                                   Comments
//                                 </p>
//                                 <p className="mt-1">{progress.comments}</p>
//                               </div>
//                             )}

//                             {progress.photo && (
//                               <div>
//                                 <p className="text-sm text-muted-foreground mb-2">
//                                   Photo
//                                 </p>
//                                 <div
//                                   className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
//                                   onClick={() =>
//                                     setSelectedPhoto(progress.photo)
//                                   }
//                                 >
//                                   <Image
//                                     src={progress.photo}
//                                     alt={`Progress ${index + 1} photo`}
//                                     className="w-full h-full object-cover"
//                                   />
//                                   <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
//                                     <Camera className="h-6 w-6 text-white" />
//                                   </div>
//                                 </div>
//                               </div>
//                             )}
//                           </CardContent>
//                         </Card>
//                       ))
//                     ) : (
//                       <p className="text-muted-foreground">
//                         No progress data available
//                       </p>
//                     )}
//                   </TabsContent>

//                   {/* Finish Tab */}
//                   <TabsContent value="finish" className="space-y-4">
//                     {repair.phases.finish ? (
//                       <>
//                         <div className="grid grid-cols-2 gap-4">
//                           <div>
//                             <p className="text-sm text-muted-foreground">
//                               Date
//                             </p>
//                             <p className="font-medium flex items-center gap-2">
//                               <Calendar className="h-4 w-4" />
//                               {formatDate(repair.phases.finish.created_at)}
//                             </p>
//                           </div>
//                           <div>
//                             <p className="text-sm text-muted-foreground">
//                               Created By
//                             </p>
//                             <p className="font-medium flex items-center gap-2">
//                               <User className="h-4 w-4" />
//                               {repair.phases.finish.created_by_user_name ||
//                                 'Unknown'}
//                             </p>
//                           </div>
//                         </div>

//                         {repair.phases.finish.comments && (
//                           <div>
//                             <p className="text-sm text-muted-foreground">
//                               Comments
//                             </p>
//                             <p className="mt-1">
//                               {repair.phases.finish.comments}
//                             </p>
//                           </div>
//                         )}

//                         {repair.phases.finish.photos &&
//                           repair.phases.finish.photos.length > 0 && (
//                             <div>
//                               <p className="text-sm text-muted-foreground mb-2">
//                                 Photos ({repair.phases.finish.photos.length})
//                               </p>
//                               <div className="grid grid-cols-4 gap-2">
//                                 {repair.phases.finish.photos.map(
//                                   (photo, index) => (
//                                     <div
//                                       key={index}
//                                       className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
//                                       onClick={() => setSelectedPhoto(photo)}
//                                     >
//                                       <Image
//                                         src={photo}
//                                         alt={`Finish photo ${index + 1}`}
//                                         className="w-full h-full object-cover"
//                                       />
//                                       <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
//                                         <Camera className="h-6 w-6 text-white" />
//                                       </div>
//                                     </div>
//                                   )
//                                 )}
//                               </div>
//                             </div>
//                           )}
//                       </>
//                     ) : (
//                       <p className="text-muted-foreground">
//                         No finish data available
//                       </p>
//                     )}
//                   </TabsContent>
//                 </Tabs>
//               </CardContent>
//             </Card>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Photo Viewer Modal */}
//       {selectedPhoto && (
//         <Dialog open={true} onOpenChange={() => setSelectedPhoto(null)}>
//           <DialogContent className="max-w-4xl">
//             <div className="relative">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="absolute right-0 top-0 z-10"
//                 onClick={() => setSelectedPhoto(null)}
//               >
//                 <X className="h-4 w-4" />
//               </Button>
//               <Image
//                 src={selectedPhoto}
//                 alt="Repair photo"
//                 className="w-full h-auto rounded-lg"
//               />
//             </div>
//           </DialogContent>
//         </Dialog>
//       )}
//     </>
//   )
// }

// // 'use client'

// // import { useState } from 'react'
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogHeader,
// //   DialogTitle,
// // } from '@/components/ui/dialog'
// // import { Button } from '@/components/ui/button'
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from '@/components/ui/select'
// // import { Label } from '@/components/ui/label'

// // import { RepairDataStatusType, RepairData } from '@/types/repair-type'

// // import { getRepairType } from '@/lib/utils'

// // interface RepairDetailModalProps {
// //   open: boolean
// //   onOpenChange: (open: boolean) => void
// //   repair: RepairData
// //   onStatusUpdate?: ({
// //     repairId,
// //     status,
// //   }: {
// //     repairId: number
// //     status: RepairDataStatusType
// //   }) => void
// // }

// // export function RepairDetailModal({
// //   open,
// //   onOpenChange,
// //   repair,
// //   onStatusUpdate,
// // }: RepairDetailModalProps) {
// //   const [status, setStatus] = useState(repair.status)

// //   const handleStatusUpdate = () => {
// //     onStatusUpdate?.({ repairId: repair.id, status })
// //     onOpenChange(false)
// //   }

// //   return (
// //     <Dialog open={open} onOpenChange={onOpenChange}>
// //       <DialogContent className="sm:max-w-md">
// //         <DialogHeader>
// //           <DialogTitle className="text-xl font-bold">
// //             Repair {repair.id}
// //           </DialogTitle>
// //         </DialogHeader>

// //         <div className="grid gap-4 py-4">
// //           <div className="grid grid-cols-2 gap-4">
// //             <div>
// //               <Label className="text-sm font-medium text-gray-500">
// //                 Project ID
// //               </Label>
// //               <p className="font-medium">{repair.project_id}</p>
// //             </div>
// //             {/* <div>
// //               <Label className="text-sm font-medium text-gray-500">Date</Label>
// //               <p className="font-medium">{repair.timestamp}</p>
// //             </div> */}
// //             <div>
// //               <Label className="text-sm font-medium text-gray-500">Drop</Label>
// //               <p className="font-medium">{repair.drop}</p>
// //             </div>
// //             <div>
// //               <Label className="text-sm font-medium text-gray-500">Level</Label>
// //               <p className="font-medium">{repair.level}</p>
// //             </div>
// //             <div>
// //               <Label className="text-sm font-medium text-gray-500">
// //                 Repair Type
// //               </Label>
// //               <p className="font-medium">{getRepairType(repair.phases)}</p>
// //             </div>
// //           </div>

// //           <div className="mt-4">
// //             <Label htmlFor="status" className="text-sm font-medium">
// //               Status
// //             </Label>
// //             <Select
// //               value={status}
// //               onValueChange={(status: RepairDataStatusType) =>
// //                 setStatus(status)
// //               }
// //             >
// //               <SelectTrigger id="status" className="mt-1">
// //                 <SelectValue placeholder="Select status" />
// //               </SelectTrigger>
// //               <SelectContent>
// //                 <SelectItem value="Pending">Pending</SelectItem>
// //                 <SelectItem value="Approved">Approved</SelectItem>
// //                 <SelectItem value="Rejected">Rejected</SelectItem>
// //               </SelectContent>
// //             </Select>
// //           </div>
// //           {/* photos Slider */}
// //           <div>
// //             {/* <div>
// //               <Label className="text-sm font-medium text-gray-500">
// //                 Technician
// //               </Label>
// //               <p className="font-medium">{repair.technician}</p>
// //             </div> */}
// //           </div>
// //         </div>

// //         <div className="flex justify-end">
// //           <Button
// //             onClick={handleStatusUpdate}
// //             className="bg-orange-500 text-white hover:bg-orange-400"
// //           >
// //             Update Status
// //           </Button>
// //         </div>
// //       </DialogContent>
// //     </Dialog>
// //   )
// // }
