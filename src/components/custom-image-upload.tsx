/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/custom-image-upload.tsx
'use client'

import { useState, useRef } from 'react'
import imageCompression from 'browser-image-compression'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Camera, Upload, X, WebcamIcon } from 'lucide-react'
import { toast } from 'sonner'

// Extender el tipo Navigator para incluir los métodos legacy
interface ExtendedNavigator extends Navigator {
  getUserMedia?: (
    constraints: MediaStreamConstraints,
    successCallback: (stream: MediaStream) => void,
    errorCallback: (error: any) => void
  ) => void
  webkitGetUserMedia?: (
    constraints: MediaStreamConstraints,
    successCallback: (stream: MediaStream) => void,
    errorCallback: (error: any) => void
  ) => void
  mozGetUserMedia?: (
    constraints: MediaStreamConstraints,
    successCallback: (stream: MediaStream) => void,
    errorCallback: (error: any) => void
  ) => void
  msGetUserMedia?: (
    constraints: MediaStreamConstraints,
    successCallback: (stream: MediaStream) => void,
    errorCallback: (error: any) => void
  ) => void
}

interface ProcessedImage {
  file: File
  previewUrl: string
  fileName: string
  id: string
}

interface CustomImageUploadProps {
  onImageProcessed: (image: ProcessedImage) => void
  fieldName: 'survey_image' | 'progress_image' | 'finish_image'
  fileNameData: {
    drop: number
    level: number
    repair_type: string
    repair_index: number
    measures: string
    phase: string
  }
  // folderName: string
  projectName: string
  userName: string
  disabled?: boolean
  allowMultiple?: boolean
  maxPhotos?: number
  currentCount?: number
}

export default function CustomImageUpload({
  onImageProcessed,
  fieldName,
  fileNameData,
  // folderName,
  projectName,
  userName,
  disabled = false,
  allowMultiple = false,
  maxPhotos = 1,
  currentCount = 0,
}: CustomImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraSupported, setCameraSupported] = useState(true)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Función mejorada de compresión con múltiples estrategias
  const compressImageAdvanced = async (file: File): Promise<File> => {
    const originalSize = file.size

    // Estrategia 1: Compresión nativa con Canvas (más rápida)
    const compressWithCanvas = async (
      file: File,
      quality: number = 0.8,
      maxWidth: number = 1200
    ): Promise<File> => {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        const img = new Image()

        img.onload = () => {
          // Calcular nuevas dimensiones manteniendo aspecto
          const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
          const newWidth = img.width * ratio
          const newHeight = img.height * ratio

          canvas.width = newWidth
          canvas.height = newHeight

          // Configurar canvas para mejor calidad
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'

          // Dibujar imagen redimensionada
          ctx.drawImage(img, 0, 0, newWidth, newHeight)

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                })
                resolve(compressedFile)
              } else {
                resolve(file) // Fallback al archivo original
              }
            },
            'image/jpeg',
            quality
          )
        }

        img.src = URL.createObjectURL(file)
      })
    }

    // Estrategia 2: Compresión agresiva para archivos muy grandes
    const aggressiveCompress = async (file: File): Promise<File> => {
      const options = {
        maxWidthOrHeight: 1200,
        maxSizeMB: 1, // Más agresivo
        useWebWorker: true,
        maxIteration: 10, // Más iteraciones para mejor resultado
        initialQuality: 0.7, // Calidad inicial más baja
        alwaysKeepResolution: false,
      }
      return await imageCompression(file, options)
    }

    try {
      let compressedFile: File

      // Decidir estrategia basada en el tamaño del archivo
      if (originalSize > 5 * 1024 * 1024) {
        // > 5MB
        console.log('Archivo muy grande, usando compresión agresiva...')
        compressedFile = await aggressiveCompress(file)
      } else if (originalSize > 2 * 1024 * 1024) {
        // > 2MB
        console.log('Archivo mediano, usando compresión con canvas...')
        compressedFile = await compressWithCanvas(file, 0.75, 1200)
      } else {
        console.log('Archivo pequeño, usando compresión suave...')
        compressedFile = await compressWithCanvas(file, 0.85, 1400)
      }

      // Si la compresión no fue efectiva, intentar con browser-image-compression
      if (compressedFile.size >= originalSize * 0.8) {
        console.log(
          'Compresión no efectiva, usando browser-image-compression...'
        )
        const options = {
          maxWidthOrHeight: 1200,
          maxSizeMB: 1.5,
          useWebWorker: true,
          initialQuality: 0.8,
        }
        compressedFile = await imageCompression(file, options)
      }

      return compressedFile
    } catch (error) {
      console.error('Error en compresión, usando archivo original:', error)
      return file
    }
  }

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      await processImage(selectedFile)
    }
  }

  const handleFileName = (photoIndex?: number) => {
    if (!fileNameData) return null
    const { drop, level, repair_type, repair_index, measures, phase } =
      fileNameData

    if (!drop || !level || !repair_type || !repair_index) return

    let name = `D${drop}.L${level}.${repair_type}.${repair_index}.${measures}.${phase}`

    // Para múltiples fotos, agregar sufijo
    if (allowMultiple && maxPhotos > 1) {
      const imageNumber =
        photoIndex !== undefined ? photoIndex : currentCount + 1
      name += `${imageNumber}`
    }

    return name
  }

  // Check camera support
  const checkCameraSupport = () => {
    if (typeof navigator === 'undefined') return false
    const extendedNavigator = navigator as ExtendedNavigator

    const hasGetUserMedia = !!(
      navigator.mediaDevices?.getUserMedia ||
      extendedNavigator.getUserMedia ||
      extendedNavigator.webkitGetUserMedia ||
      extendedNavigator.mozGetUserMedia ||
      extendedNavigator.msGetUserMedia
    )

    const isSecureContext =
      window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '192.168.1.150'

    return hasGetUserMedia && isSecureContext
  }

  // Polyfill para getUserMedia
  const getUserMedia = (
    constraints: MediaStreamConstraints
  ): Promise<MediaStream> => {
    return new Promise((resolve, reject) => {
      if (navigator.mediaDevices?.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia(constraints)
          .then(resolve)
          .catch(reject)
        return
      }

      if (typeof navigator === 'undefined') return false
      const extendedNavigator = navigator as ExtendedNavigator
      const getUserMediaMethod =
        extendedNavigator.getUserMedia ||
        extendedNavigator.webkitGetUserMedia ||
        extendedNavigator.mozGetUserMedia ||
        extendedNavigator.msGetUserMedia

      if (getUserMediaMethod) {
        getUserMediaMethod.call(navigator, constraints, resolve, reject)
      } else {
        reject(new Error('getUserMedia no está soportado en este navegador'))
      }
    })
  }

  // Handle camera input (for iOS fallback)
  const handleCameraInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      await processImage(selectedFile)
    }
  }

  // Start camera con mejor calidad
  const startCamera = async () => {
    if (!checkCameraSupport()) {
      setCameraSupported(false)
      setError(
        'La cámara no está disponible. Por favor, usa la opción de subir archivo.'
      )
      toast.error('La cámara no está disponible.', {
        position: 'top-center',
        style: {
          background: '#333',
          color: '#fff',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '14px',
        },
      })

      return
    }

    try {
      setError(null)
      // Configuración optimizada para mejor calidad y compresión posterior
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920, max: 2560 }, // Permitir mayor resolución
          height: { ideal: 1080, max: 1440 },
          aspectRatio: { ideal: 16 / 9 },
        },
      }

      const stream = await getUserMedia(constraints)
      streamRef.current = stream
      setShowCamera(true)

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(console.error)
        }
      }, 100)
    } catch (err: any) {
      stopCamera()
      setCameraSupported(false)

      let errorMessage = 'No se pudo acceder a la cámara.'

      if (err.name === 'NotAllowedError') {
        errorMessage =
          'Permiso de cámara denegado. Por favor, permite el acceso a la cámara.'
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No se encontró una cámara disponible.'
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'La cámara no está soportada en este dispositivo.'
      } else if (err.message) {
        errorMessage += ' ' + err.message
      }

      setError(errorMessage + ' Puedes usar la opción de subir archivo.')
      console.error('Camera error:', err)
    }
  }

  // Capture image from camera con mejor calidad
  const captureImage = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        const video = videoRef.current
        canvasRef.current.width = video.videoWidth
        canvasRef.current.height = video.videoHeight

        // Configurar canvas para mejor calidad
        context.imageSmoothingEnabled = true
        context.imageSmoothingQuality = 'high'

        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)

        const fileName = handleFileName()
        canvasRef.current.toBlob(
          async (blob) => {
            if (blob) {
              const file = new File([blob], `${fileName}.jpg`, {
                type: 'image/jpeg',
              })
              await processImage(file)
              stopCamera()
            }
          },
          'image/jpeg',
          0.92 // Mayor calidad inicial para mejor compresión posterior
        )
      }
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setShowCamera(false)
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const formatDateTime = () => {
    const now = new Date()
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }

    const date = now.toLocaleDateString('en-NZ', dateOptions)
    const time = now.toLocaleTimeString('en-NZ', timeOptions)

    return `${date} ${time}`
  }

  // Process image mejorado con compresión avanzada
  const processImage = async (inputFile: File) => {
    setError(null)
    setLoading(true)

    try {
      // Validar tipo de archivo
      if (!inputFile.type.startsWith('image/')) {
        throw new Error('Please select a valid image file.')
      }

      // Comprimir imagen con estrategia avanzada
      const compressedFile = await compressImageAdvanced(inputFile)

      // Crear canvas para watermark
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('It was not possible to get the canvas context')

      // Cargar imagen comprimida
      const img = new Image()
      const imageUrl = URL.createObjectURL(compressedFile)

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = imageUrl
      })

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      // Configurar watermark (optimizado para diferentes tamaños)
      const fontSize = Math.max(14, Math.min(img.width / 25, 32))
      const padding = Math.max(15, Math.min(img.width / 60, 25))
      const lineHeight = fontSize * 1.2

      const fileName = handleFileName()
      const dateTimeText = formatDateTime()
      const projectNameText = 'Project: ' + (projectName || 'Project Unknown')
      const userNameText = 'Photo by: ' + (userName || 'User Unknown')
      const fileNameText = fileName || 'WorkMap'

      // Calcular dimensiones del watermark
      ctx.font = `bold ${fontSize}px Arial`
      const fileNameWidth = ctx.measureText(fileNameText).width
      ctx.font = `${fontSize}px Arial`
      const projectNameWidth = ctx.measureText(projectNameText).width
      const userNameWidth = ctx.measureText(userNameText).width
      const dateTimeWidth = ctx.measureText(dateTimeText).width

      const maxTextWidth = Math.max(fileNameWidth, projectNameWidth, userNameWidth, dateTimeWidth)
      const backgroundWidth = maxTextWidth + padding * 2
      const backgroundHeight = lineHeight * 3 + padding * 2

      // Posición top-left
      const backgroundX = padding
      const backgroundY = padding

      // Fondo con mejor contraste
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.fillRect(backgroundX, backgroundY, backgroundWidth, backgroundHeight)

      // Texto con mejor legibilidad
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'

      const textX = backgroundX + padding
      let textY = backgroundY + padding

      // Orden modificado:
      // fecha/hora primero
      ctx.font = `${fontSize}px Arial`
      ctx.fillText(dateTimeText, textX, textY)
      textY += lineHeight

      // Proyecto segundo
      ctx.fillText(projectNameText, textX, textY)
      textY += lineHeight

      // Usuario tercero
      ctx.fillText(userNameText, textX, textY)
      textY += lineHeight

      // Nombre del archivo último, en negrita
      ctx.font = `bold ${fontSize}px Arial`
      ctx.fillText(fileNameText, textX, textY)

      // Convertir a blob con compresión final
      const watermarkedBlob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('No se pudo crear el blob'))
          },
          'image/jpeg',
          0.88 // Calidad optimizada
        )
      )

      const watermarkedFile = new File([watermarkedBlob], `${fileName}.jpg`, {
        type: 'image/jpeg',
      })

      // Limpiar URL temporal
      URL.revokeObjectURL(imageUrl)

      // Establecer preview y archivo
      setPreviewUrl(URL.createObjectURL(watermarkedFile))
      setFile(watermarkedFile)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError('Error processing the image: ' + err.message)
      } else {
        setError('Error processing the image: ' + String(err))
      }
      console.error('Processing error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Función para confirmar y agregar la imagen procesada
  const handleConfirmImage = () => {
    if (!file) return

    const fileName = handleFileName()
    if (!fileName) return

    const processedImage: ProcessedImage = {
      file: file,
      previewUrl: previewUrl!,
      fileName: fileName,
      id: `${fileName}_${Date.now()}`, // ID único
    }

    onImageProcessed(processedImage)

    // Mostrar mensaje de éxito
    toast.success('Image processed successfully!', {
      duration: 3000,
      position: 'top-center',
      style: {
        background: '#4CAF50',
        color: '#FFFFFF',
        fontWeight: 'bold',
      },
    })

    resetComponent()
  }

  const resetComponent = () => {
    setFile(null)
    setPreviewUrl(null)
    setError(null)
    stopCamera()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = ''
    }
  }

  const removeFile = () => {
    resetComponent()
  }

  const triggerCameraInput = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click()
    }
  }

  const isFormValid =
    fileNameData?.repair_type.length > 0 && fileNameData?.repair_index

  // Verificar si se puede agregar más fotos
  const canAddMorePhotos = currentCount < maxPhotos

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium capitalize">
            {fieldName.replace(/([A-Z])/g, ' $1').trim()}
          </label>
          {allowMultiple && (
            <span className="text-xs text-muted-foreground">
              {currentCount}/{maxPhotos} photos
            </span>
          )}
        </div>

        {!previewUrl && !showCamera && (
          <>
            <div
              className={`${loading && 'animate-pulse'} ${
                (!isFormValid || disabled || !canAddMorePhotos) &&
                ' opacity-70 '
              } flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5`}
            >
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    className={` ${
                      !isFormValid || disabled || !canAddMorePhotos
                        ? ' cursor-default '
                        : ' cursor-pointer '
                    } relative rounded-md bg-white font-medium text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 hover:text-orange-400`}
                  >
                    <span>Upload a file</span>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      disabled={
                        !isFormValid || loading || disabled || !canAddMorePhotos
                      }
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                {!canAddMorePhotos && allowMultiple && (
                  <p className="text-xs text-red-500">Maximum photos reached</p>
                )}
              </div>
            </div>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleCameraInput}
            />

            <div className="flex gap-2">
              {cameraSupported && checkCameraSupport() && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    !isFormValid || loading || disabled || !canAddMorePhotos
                  }
                  className="flex items-center justify-center flex-1"
                  onClick={startCamera}
                >
                  <WebcamIcon className="mr-2 h-4 w-4" />
                  Use camera
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                disabled={
                  !isFormValid || loading || disabled || !canAddMorePhotos
                }
                className="flex items-center justify-center flex-1"
                onClick={triggerCameraInput}
              >
                <Camera className="mr-2 h-4 w-4" />
                Take picture
              </Button>
            </div>
          </>
        )}

        {/* Vista previa */}
        {previewUrl && (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Vista previa"
              className="w-full max-w-sm rounded-md border"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={removeFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Vista de cámara */}
        {showCamera && (
          <div className="space-y-2">
            <video
              ref={videoRef}
              className="w-full max-w-sm rounded-md border"
              autoPlay
              playsInline
              muted
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="default"
                onClick={captureImage}
                disabled={loading}
              >
                Capture
              </Button>
              <Button type="button" variant="outline" onClick={stopCamera}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Botón de confirmación para agregar imagen */}
      {file && (
        <Button
          onClick={handleConfirmImage}
          disabled={loading || !file}
          className="w-full bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-300"
        >
          {loading ? 'Processing...' : 'Add Photo'}
        </Button>
      )}

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}

//TODO Version OK funcionando con carga de 1 imagen por phase

// /* eslint-disable @next/next/no-img-element */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// // src/components/custom-image-upload.tsx
// 'use client'

// import { useState, useRef } from 'react'
// import imageCompression from 'browser-image-compression'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Camera, Upload, X, WebcamIcon } from 'lucide-react'
// import { toast } from 'sonner'

// // Extender el tipo Navigator para incluir los métodos legacy
// interface ExtendedNavigator extends Navigator {
//   getUserMedia?: (
//     constraints: MediaStreamConstraints,
//     successCallback: (stream: MediaStream) => void,
//     errorCallback: (error: any) => void
//   ) => void
//   webkitGetUserMedia?: (
//     constraints: MediaStreamConstraints,
//     successCallback: (stream: MediaStream) => void,
//     errorCallback: (error: any) => void
//   ) => void
//   mozGetUserMedia?: (
//     constraints: MediaStreamConstraints,
//     successCallback: (stream: MediaStream) => void,
//     errorCallback: (error: any) => void
//   ) => void
//   msGetUserMedia?: (
//     constraints: MediaStreamConstraints,
//     successCallback: (stream: MediaStream) => void,
//     errorCallback: (error: any) => void
//   ) => void
// }

// interface CustomImageUploadProps {
//   onUploadSuccess: (image: {
//     url: string
//     publicId: string
//     fileName: string
//     phase: string
//   }) => void
//   fieldName: 'survey_image' | 'progress_image' | 'finish_image'
//   fileNameData: {
//     drop: number
//     level: number
//     repair_type: string
//     repair_index: number
//     measures: string
//     phase: string
//   }
//   folderName: string
//   userName: string
//   disabled?: boolean
// }

// export default function CustomImageUpload({
//   onUploadSuccess,
//   fieldName,
//   fileNameData,
//   folderName,
//   userName,
//   disabled = false,
// }: CustomImageUploadProps) {
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null)
//   const [file, setFile] = useState<File | null>(null)
//   const [error, setError] = useState<string | null>(null)
//   const [loading, setLoading] = useState(false)
//   const [showCamera, setShowCamera] = useState(false)
//   const [cameraSupported, setCameraSupported] = useState(true)
//   // const [compressionInfo, setCompressionInfo] = useState<{
//   //   originalSize: number
//   //   compressedSize: number
//   // } | null>(null)

//   const videoRef = useRef<HTMLVideoElement>(null)
//   const canvasRef = useRef<HTMLCanvasElement>(null)
//   const streamRef = useRef<MediaStream | null>(null)
//   const fileInputRef = useRef<HTMLInputElement>(null)
//   const cameraInputRef = useRef<HTMLInputElement>(null)

//   // Función mejorada de compresión con múltiples estrategias
//   const compressImageAdvanced = async (file: File): Promise<File> => {
//     const originalSize = file.size

//     // Estrategia 1: Compresión nativa con Canvas (más rápida)
//     const compressWithCanvas = async (
//       file: File,
//       quality: number = 0.8,
//       maxWidth: number = 1200
//     ): Promise<File> => {
//       return new Promise((resolve) => {
//         const canvas = document.createElement('canvas')
//         const ctx = canvas.getContext('2d')!
//         const img = new Image()

//         img.onload = () => {
//           // Calcular nuevas dimensiones manteniendo aspecto
//           const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
//           const newWidth = img.width * ratio
//           const newHeight = img.height * ratio

//           canvas.width = newWidth
//           canvas.height = newHeight

//           // Configurar canvas para mejor calidad
//           ctx.imageSmoothingEnabled = true
//           ctx.imageSmoothingQuality = 'high'

//           // Dibujar imagen redimensionada
//           ctx.drawImage(img, 0, 0, newWidth, newHeight)

//           canvas.toBlob(
//             (blob) => {
//               if (blob) {
//                 const compressedFile = new File([blob], file.name, {
//                   type: 'image/jpeg',
//                   lastModified: Date.now(),
//                 })
//                 resolve(compressedFile)
//               } else {
//                 resolve(file) // Fallback al archivo original
//               }
//             },
//             'image/jpeg',
//             quality
//           )
//         }

//         img.src = URL.createObjectURL(file)
//       })
//     }

//     // Estrategia 2: Compresión agresiva para archivos muy grandes
//     const aggressiveCompress = async (file: File): Promise<File> => {
//       const options = {
//         maxWidthOrHeight: 1200,
//         maxSizeMB: 1, // Más agresivo
//         useWebWorker: true,
//         maxIteration: 10, // Más iteraciones para mejor resultado
//         initialQuality: 0.7, // Calidad inicial más baja
//         alwaysKeepResolution: false,
//       }
//       return await imageCompression(file, options)
//     }

//     try {
//       let compressedFile: File

//       // Decidir estrategia basada en el tamaño del archivo
//       if (originalSize > 5 * 1024 * 1024) {
//         // > 5MB
//         console.log('Archivo muy grande, usando compresión agresiva...')
//         compressedFile = await aggressiveCompress(file)
//       } else if (originalSize > 2 * 1024 * 1024) {
//         // > 2MB
//         console.log('Archivo mediano, usando compresión con canvas...')
//         compressedFile = await compressWithCanvas(file, 0.75, 1200)
//       } else {
//         console.log('Archivo pequeño, usando compresión suave...')
//         compressedFile = await compressWithCanvas(file, 0.85, 1400)
//       }

//       // Si la compresión no fue efectiva, intentar con browser-image-compression
//       if (compressedFile.size >= originalSize * 0.8) {
//         console.log(
//           'Compresión no efectiva, usando browser-image-compression...'
//         )
//         const options = {
//           maxWidthOrHeight: 1200,
//           maxSizeMB: 1.5,
//           useWebWorker: true,
//           initialQuality: 0.8,
//         }
//         compressedFile = await imageCompression(file, options)
//       }

//       //const compressedSize = compressedFile.size
//       // const compressionRatio = (
//       //   ((originalSize - compressedSize) / originalSize) *
//       //   100
//       // ).toFixed(1)

//       // console.log(`Compresión completada:`)
//       // console.log(
//       //   `- Tamaño original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`
//       // )
//       // console.log(
//       //   `- Tamaño comprimido: ${(compressedSize / 1024 / 1024).toFixed(2)} MB`
//       // )
//       // console.log(`- Reducción: ${compressionRatio}%`)

//       // setCompressionInfo({
//       //   originalSize,
//       //   compressedSize,
//       // })

//       return compressedFile
//     } catch (error) {
//       console.error('Error en compresión, usando archivo original:', error)
//       return file
//     }
//   }

//   // Handle file selection
//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const selectedFile = e.target.files[0]
//       await processImage(selectedFile)
//     }
//   }

//   const handleFileName = () => {
//     if (!fileNameData) return null
//     const { drop, level, repair_type, repair_index, measures, phase } =
//       fileNameData

//     if (!drop || !level || !repair_type || !repair_index) return
//     const name = `D${drop}.L${level}.${repair_type}.${repair_index}.${measures}.${phase}`
//     return name
//   }

//   // Check camera support
//   const checkCameraSupport = () => {
//     if (typeof navigator === 'undefined') return false
//     const extendedNavigator = navigator as ExtendedNavigator

//     const hasGetUserMedia = !!(
//       navigator.mediaDevices?.getUserMedia ||
//       extendedNavigator.getUserMedia ||
//       extendedNavigator.webkitGetUserMedia ||
//       extendedNavigator.mozGetUserMedia ||
//       extendedNavigator.msGetUserMedia
//     )

//     const isSecureContext =
//       window.location.protocol === 'https:' ||
//       window.location.hostname === 'localhost' ||
//       window.location.hostname === '192.168.1.150'

//     return hasGetUserMedia && isSecureContext
//   }

//   // Polyfill para getUserMedia
//   const getUserMedia = (
//     constraints: MediaStreamConstraints
//   ): Promise<MediaStream> => {
//     return new Promise((resolve, reject) => {
//       if (navigator.mediaDevices?.getUserMedia) {
//         navigator.mediaDevices
//           .getUserMedia(constraints)
//           .then(resolve)
//           .catch(reject)
//         return
//       }

//       if (typeof navigator === 'undefined') return false
//       const extendedNavigator = navigator as ExtendedNavigator
//       const getUserMediaMethod =
//         extendedNavigator.getUserMedia ||
//         extendedNavigator.webkitGetUserMedia ||
//         extendedNavigator.mozGetUserMedia ||
//         extendedNavigator.msGetUserMedia

//       if (getUserMediaMethod) {
//         getUserMediaMethod.call(navigator, constraints, resolve, reject)
//       } else {
//         reject(new Error('getUserMedia no está soportado en este navegador'))
//       }
//     })
//   }

//   // Handle camera input (for iOS fallback)
//   const handleCameraInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const selectedFile = e.target.files[0]
//       await processImage(selectedFile)
//     }
//   }

//   // Start camera con mejor calidad
//   const startCamera = async () => {
//     if (!checkCameraSupport()) {
//       setCameraSupported(false)
//       setError(
//         'La cámara no está disponible. Por favor, usa la opción de subir archivo.'
//       )
//       return
//     }

//     try {
//       setError(null)
//       // Configuración optimizada para mejor calidad y compresión posterior
//       const constraints = {
//         video: {
//           facingMode: 'environment',
//           width: { ideal: 1920, max: 2560 }, // Permitir mayor resolución
//           height: { ideal: 1080, max: 1440 },
//           aspectRatio: { ideal: 16 / 9 },
//         },
//       }

//       const stream = await getUserMedia(constraints)
//       streamRef.current = stream
//       setShowCamera(true)

//       setTimeout(() => {
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream
//           videoRef.current.play().catch(console.error)
//         }
//       }, 100)
//     } catch (err: any) {
//       stopCamera()
//       setCameraSupported(false)

//       let errorMessage = 'No se pudo acceder a la cámara.'

//       if (err.name === 'NotAllowedError') {
//         errorMessage =
//           'Permiso de cámara denegado. Por favor, permite el acceso a la cámara.'
//       } else if (err.name === 'NotFoundError') {
//         errorMessage = 'No se encontró una cámara disponible.'
//       } else if (err.name === 'NotSupportedError') {
//         errorMessage = 'La cámara no está soportada en este dispositivo.'
//       } else if (err.message) {
//         errorMessage += ' ' + err.message
//       }

//       setError(errorMessage + ' Puedes usar la opción de subir archivo.')
//       console.error('Camera error:', err)
//     }
//   }

//   // Capture image from camera con mejor calidad
//   const captureImage = async () => {
//     if (videoRef.current && canvasRef.current) {
//       const context = canvasRef.current.getContext('2d')
//       if (context) {
//         const video = videoRef.current
//         canvasRef.current.width = video.videoWidth
//         canvasRef.current.height = video.videoHeight

//         // Configurar canvas para mejor calidad
//         context.imageSmoothingEnabled = true
//         context.imageSmoothingQuality = 'high'

//         context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)

//         const fileName = handleFileName()
//         canvasRef.current.toBlob(
//           async (blob) => {
//             if (blob) {
//               const file = new File([blob], `${fileName}.jpg`, {
//                 type: 'image/jpeg',
//               })
//               await processImage(file)
//               stopCamera()
//             }
//           },
//           'image/jpeg',
//           0.92 // Mayor calidad inicial para mejor compresión posterior
//         )
//       }
//     }
//   }

//   // Stop camera
//   const stopCamera = () => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((track) => track.stop())
//       streamRef.current = null
//     }
//     setShowCamera(false)
//     if (videoRef.current) {
//       videoRef.current.srcObject = null
//     }
//   }

//   const sanitizeFolderName = (name: string) => {
//     return name
//       .replace(/[^a-zA-Z0-9-]/g, '-')
//       .replace(/^-+|-+$/g, '')
//       .substring(0, 255)
//   }

//   const formatDateTime = () => {
//     const now = new Date()
//     const dateOptions: Intl.DateTimeFormatOptions = {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       weekday: 'long',
//     }
//     const timeOptions: Intl.DateTimeFormatOptions = {
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//       hour12: false,
//     }

//     const date = now.toLocaleDateString('en-US', dateOptions)
//     const time = now.toLocaleTimeString('en-US', timeOptions)

//     return `${date} ${time}`
//   }

//   // Process image mejorado con compresión avanzada
//   const processImage = async (inputFile: File) => {
//     setError(null)
//     setLoading(true)
//     //setCompressionInfo(null)

//     try {
//       // Validar tipo de archivo
//       if (!inputFile.type.startsWith('image/')) {
//         throw new Error('Please select a valid image file.')
//       }

//       // Comprimir imagen con estrategia avanzada
//       const compressedFile = await compressImageAdvanced(inputFile)

//       // Crear canvas para watermark
//       const canvas = document.createElement('canvas')
//       const ctx = canvas.getContext('2d')
//       if (!ctx) throw new Error('It was not possible to get the canvas context')

//       // Cargar imagen comprimida
//       const img = new Image()
//       const imageUrl = URL.createObjectURL(compressedFile)

//       await new Promise((resolve, reject) => {
//         img.onload = resolve
//         img.onerror = reject
//         img.src = imageUrl
//       })

//       canvas.width = img.width
//       canvas.height = img.height
//       ctx.drawImage(img, 0, 0)

//       // Configurar watermark (optimizado para diferentes tamaños)
//       const fontSize = Math.max(14, Math.min(img.width / 25, 32))
//       const padding = Math.max(15, Math.min(img.width / 60, 25))
//       const lineHeight = fontSize * 1.2

//       const fileName = handleFileName()
//       const dateTimeText = formatDateTime()
//       const userNameText = 'Photo by: ' + (userName || 'User Unknown')
//       const fileNameText = fileName || 'WorkMap'

//       // Calcular dimensiones del watermark
//       ctx.font = `bold ${fontSize}px Arial`
//       const fileNameWidth = ctx.measureText(fileNameText).width
//       ctx.font = `${fontSize}px Arial`
//       const userNameWidth = ctx.measureText(userNameText).width
//       const dateTimeWidth = ctx.measureText(dateTimeText).width

//       const maxTextWidth = Math.max(fileNameWidth, userNameWidth, dateTimeWidth)
//       const backgroundWidth = maxTextWidth + padding * 2
//       const backgroundHeight = lineHeight * 3 + padding * 2

//       // Posición bottom-left optimizada del watermark
//       // const backgroundX = padding
//       // const backgroundY = img.height - backgroundHeight - padding

//       // Posición top-left
//       const backgroundX = padding
//       const backgroundY = padding

//       // Fondo con mejor contraste
//       ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
//       ctx.fillRect(backgroundX, backgroundY, backgroundWidth, backgroundHeight)

//       // Texto con mejor legibilidad
//       ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
//       ctx.textAlign = 'left'
//       ctx.textBaseline = 'top'

//       const textX = backgroundX + padding
//       let textY = backgroundY + padding

//       // Orden modificado:
//       // fecha/hora primero
//       ctx.font = `${fontSize}px Arial`
//       ctx.fillText(dateTimeText, textX, textY)
//       textY += lineHeight

//       // Usuario segundo
//       ctx.fillText(userNameText, textX, textY)
//       textY += lineHeight

//       // Nombre del archivo último, en negrita
//       ctx.font = `bold ${fontSize}px Arial`
//       ctx.fillText(fileNameText, textX, textY)

//       // Convertir a blob con compresión final
//       const watermarkedBlob = await new Promise<Blob>((resolve, reject) =>
//         canvas.toBlob(
//           (blob) => {
//             if (blob) resolve(blob)
//             else reject(new Error('No se pudo crear el blob'))
//           },
//           'image/jpeg',
//           0.88 // Calidad optimizada
//         )
//       )

//       const watermarkedFile = new File([watermarkedBlob], `${fileName}.jpg`, {
//         type: 'image/jpeg',
//       })

//       // Limpiar URL temporal
//       URL.revokeObjectURL(imageUrl)

//       // Establecer preview y archivo
//       setPreviewUrl(URL.createObjectURL(watermarkedFile))
//       setFile(watermarkedFile)
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         setError('Error processing the image: ' + err.message)
//       } else {
//         setError('Error processing the image: ' + String(err))
//       }
//       console.error('Processing error:', err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Upload to Cloudinary
//   const handleUpload = async () => {
//     const fileName = handleFileName()
//     if (!fileName) return

//     if (!file || !fileName.trim()) {
//       setError('Please select a file first.')
//       return
//     }

//     setLoading(true)
//     setError(null)

//     try {
//       const signResponse = await fetch('/api/images/signed-upload', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           public_id: fileName.trim(),
//           folder: sanitizeFolderName(folderName),
//         }),
//       })

//       if (!signResponse.ok) {
//         const errorData = await signResponse.json()
//         throw new Error(errorData.error || 'Error getting signature')
//       }

//       const signData = await signResponse.json()

//       const formData = new FormData()
//       formData.append('file', file)
//       formData.append('api_key', signData.apiKey)
//       formData.append('timestamp', signData.timestamp.toString())
//       formData.append('signature', signData.signature)
//       formData.append('public_id', signData.public_id)
//       formData.append('asset_folder', signData.asset_folder)

//       const uploadResponse = await fetch(
//         `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
//         {
//           method: 'POST',
//           body: formData,
//         }
//       )

//       if (!uploadResponse.ok) {
//         const errorText = await uploadResponse.text()
//         toast.error('Error uploading to Cloudinary', {
//           description: 'Error: ' + errorText,
//           duration: 5000,
//           position: 'top-center',
//           icon: '🚨',
//           style: {
//             background: 'red',
//             color: 'white',
//             fontWeight: 'bold',
//           },
//         })
//       }

//       const uploadResult = await uploadResponse.json()

//       onUploadSuccess({
//         publicId: uploadResult.public_id,
//         url: uploadResult.secure_url,
//         fileName: uploadResult.original_filename,
//         phase: uploadResult.asset_folder,
//       })

//       toast.success('Image uploaded successfully', {
//         duration: 5000,
//         position: 'top-center',
//         icon: '✅',
//         style: {
//           background: 'green',
//           color: 'white',
//           fontWeight: 'bold',
//         },
//       })

//       resetComponent()
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         setError(err.message)
//       } else {
//         setError(String(err))
//       }
//       console.error('Upload error:', err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const resetComponent = () => {
//     setFile(null)
//     setPreviewUrl(null)
//     setError(null)
//     //setCompressionInfo(null)
//     stopCamera()
//     if (fileInputRef.current) {
//       fileInputRef.current.value = ''
//     }
//   }

//   const removeFile = () => {
//     resetComponent()
//   }

//   const triggerCameraInput = () => {
//     if (cameraInputRef.current) {
//       cameraInputRef.current.click()
//     }
//   }

//   const isFormValid =
//     fileNameData?.repair_type.length > 0 && fileNameData?.repair_index

//   // const formatFileSize = (bytes: number) => {
//   //   return (bytes / 1024 / 1024).toFixed(2) + ' MB'
//   // }

//   return (
//     <div className="space-y-4">
//       <div className="flex flex-col gap-2">
//         <label className="text-sm font-medium capitalize">
//           {fieldName.replace(/([A-Z])/g, ' $1').trim()}
//         </label>

//         {!previewUrl && !showCamera && (
//           <>
//             <div
//               className={`${loading && 'animate-pulse'} ${
//                 (!isFormValid || disabled) && ' opacity-70 '
//               } flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5`}
//             >
//               <div className="space-y-1 text-center">
//                 <Upload className="mx-auto h-12 w-12 text-gray-400" />
//                 <div className="flex text-sm text-gray-600">
//                   <label
//                     className={` ${
//                       !isFormValid || disabled
//                         ? ' cursor-default '
//                         : ' cursor-pointer '
//                     } relative rounded-md bg-white font-medium text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 hover:text-orange-400`}
//                   >
//                     <span>Upload a file</span>
//                     <Input
//                       ref={fileInputRef}
//                       type="file"
//                       disabled={!isFormValid || loading || disabled}
//                       className="sr-only"
//                       accept="image/*"
//                       onChange={handleFileChange}
//                     />
//                   </label>
//                 </div>
//                 <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
//               </div>
//             </div>

//             <input
//               ref={cameraInputRef}
//               type="file"
//               accept="image/*"
//               capture="environment"
//               className="hidden"
//               onChange={handleCameraInput}
//             />

//             <div className="flex gap-2">
//               {cameraSupported && checkCameraSupport() && (
//                 <Button
//                   type="button"
//                   variant="outline"
//                   disabled={!isFormValid || loading || disabled}
//                   className="flex items-center justify-center flex-1"
//                   onClick={startCamera}
//                 >
//                   <WebcamIcon className="mr-2 h-4 w-4" />
//                   Use camera web
//                 </Button>
//               )}

//               <Button
//                 type="button"
//                 variant="outline"
//                 disabled={!isFormValid || loading || disabled}
//                 className="flex items-center justify-center flex-1"
//                 onClick={triggerCameraInput}
//               >
//                 <Camera className="mr-2 h-4 w-4" />
//                 Take picture
//               </Button>
//             </div>
//           </>
//         )}

//         {/* Vista previa con info de compresión */}
//         {previewUrl && (
//           <div className="relative">
//             <img
//               src={previewUrl}
//               alt="Vista previa"
//               className="w-full max-w-sm rounded-md border"
//             />
//             <Button
//               type="button"
//               variant="destructive"
//               size="sm"
//               className="absolute top-2 right-2"
//               onClick={removeFile}
//             >
//               <X className="h-4 w-4" />
//             </Button>

//             {/* Info de compresión */}
//             {/* {compressionInfo && (
//               <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md text-xs">
//                 <p className="text-green-700">
//                   <strong>Compresión exitosa:</strong>
//                   {formatFileSize(compressionInfo.originalSize)} →{' '}
//                   {formatFileSize(compressionInfo.compressedSize)}
//                   <span className="ml-2 text-green-600">
//                     (-
//                     {(
//                       ((compressionInfo.originalSize -
//                         compressionInfo.compressedSize) /
//                         compressionInfo.originalSize) *
//                       100
//                     ).toFixed(1)}
//                     %)
//                   </span>
//                 </p>
//               </div>
//             )} */}
//           </div>
//         )}

//         {/* Vista de cámara */}
//         {showCamera && (
//           <div className="space-y-2">
//             <video
//               ref={videoRef}
//               className="w-full max-w-sm rounded-md border"
//               autoPlay
//               playsInline
//               muted
//             />
//             <div className="flex gap-2">
//               <Button
//                 type="button"
//                 variant="default"
//                 onClick={captureImage}
//                 disabled={loading}
//               >
//                 Capture
//               </Button>
//               <Button type="button" variant="outline" onClick={stopCamera}>
//                 Cancel
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>

//       <canvas ref={canvasRef} className="hidden" />

//       {file && (
//         <Button
//           onClick={handleUpload}
//           disabled={loading || !file}
//           className="w-full bg-orange-500 text-white hover:bg-orange-400 disabled:bg-gray-300"
//         >
//           {loading ? 'Saving...' : 'Save Data'}
//         </Button>
//       )}

//       {error && (
//         <div className="rounded-md bg-red-50 border border-red-200 p-3">
//           <p className="text-sm text-red-600">{error}</p>
//         </div>
//       )}
//     </div>
//   )
// }
