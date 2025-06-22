/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/custom-image-upload.tsx
'use client'

import { useState, useRef } from 'react'
import imageCompression from 'browser-image-compression'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Camera, Upload, X } from 'lucide-react'

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

interface CustomImageUploadProps {
  onUploadSuccess: (image: {
    id: string
    public_id: string
    url: string
  }) => void
  fieldName: 'surveyImage' | 'progressImage' | 'finishImage'
  fileNameData: {
    drop: number
    level: number
    repairType: string
    repairIndex: number
    measures: string
    phase: string
  }
  folderName: string
  userName: string
}

export default function CustomImageUpload({
  onUploadSuccess,
  fieldName,
  fileNameData,
  folderName,
  userName,
}: CustomImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraSupported, setCameraSupported] = useState(true)
  // const [compressionInfo, setCompressionInfo] = useState<{
  //   originalSize: number
  //   compressedSize: number
  // } | null>(null)

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

      //const compressedSize = compressedFile.size
      // const compressionRatio = (
      //   ((originalSize - compressedSize) / originalSize) *
      //   100
      // ).toFixed(1)

      // console.log(`Compresión completada:`)
      // console.log(
      //   `- Tamaño original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`
      // )
      // console.log(
      //   `- Tamaño comprimido: ${(compressedSize / 1024 / 1024).toFixed(2)} MB`
      // )
      // console.log(`- Reducción: ${compressionRatio}%`)

      // setCompressionInfo({
      //   originalSize,
      //   compressedSize,
      // })

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

  const handleFileName = () => {
    if (!fileNameData) return null
    const { drop, level, repairType, repairIndex, measures, phase } =
      fileNameData

    if (!drop || !level || !repairType || !repairIndex) return
    const name = `D${drop}.L${level}.${repairType}.${repairIndex}.${measures}.${phase}`
    console.log('filename: ', name)

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

  const sanitizeFolderName = (name: string) => {
    return name
      .replace(/[^a-zA-Z0-9-]/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 255)
  }

  const formatDateTime = () => {
    const now = new Date()
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }

    const date = now.toLocaleDateString('en-US', dateOptions)
    const time = now.toLocaleTimeString('en-US', timeOptions)

    return `${date} ${time}`
  }

  // Process image mejorado con compresión avanzada
  const processImage = async (inputFile: File) => {
    setError(null)
    setLoading(true)
    //setCompressionInfo(null)

    try {
      // Validar tipo de archivo
      if (!inputFile.type.startsWith('image/')) {
        throw new Error('Por favor selecciona un archivo de imagen válido')
      }

      console.log(
        `Procesando imagen: ${inputFile.name} (${(
          inputFile.size /
          1024 /
          1024
        ).toFixed(2)} MB)`
      )

      // Comprimir imagen con estrategia avanzada
      const compressedFile = await compressImageAdvanced(inputFile)

      // Crear canvas para watermark
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('No se pudo obtener el contexto del canvas')

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
      const fileNameText = fileName || 'WorkMap'
      const userNameText = userName || 'User Unknown'
      const dateTimeText = formatDateTime()

      // Calcular dimensiones del watermark
      ctx.font = `bold ${fontSize}px Arial`
      const fileNameWidth = ctx.measureText(fileNameText).width
      ctx.font = `${fontSize}px Arial`
      const userNameWidth = ctx.measureText(userNameText).width
      const dateTimeWidth = ctx.measureText(dateTimeText).width

      const maxTextWidth = Math.max(fileNameWidth, userNameWidth, dateTimeWidth)
      const backgroundWidth = maxTextWidth + padding * 2
      const backgroundHeight = lineHeight * 3 + padding * 2

      // Posición optimizada del watermark
      const backgroundX = padding
      const backgroundY = img.height - backgroundHeight - padding

      // Fondo con mejor contraste
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.fillRect(backgroundX, backgroundY, backgroundWidth, backgroundHeight)

      // Texto con mejor legibilidad
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'

      const textX = backgroundX + padding
      let textY = backgroundY + padding

      // Nombre del archivo en negrita
      ctx.font = `bold ${fontSize}px Arial`
      ctx.fillText(fileNameText, textX, textY)
      textY += lineHeight

      // Usuario y fecha en texto normal
      ctx.font = `${fontSize}px Arial`
      ctx.fillText(userNameText, textX, textY)
      textY += lineHeight
      ctx.fillText(dateTimeText, textX, textY)

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

      console.log(
        `Imagen final: ${(watermarkedFile.size / 1024 / 1024).toFixed(2)} MB`
      )
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError('Error procesando la imagen: ' + err.message)
      } else {
        setError('Error procesando la imagen: ' + String(err))
      }
      console.error('Processing error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Upload to Cloudinary
  const handleUpload = async () => {
    const fileName = handleFileName()
    if (!fileName) return

    if (!file || !fileName.trim()) {
      setError('Por favor selecciona un archivo y especifica un nombre')
      return
    }

    setLoading(true)
    setError(null)

    try {
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
        throw new Error(errorData.error || 'Error obteniendo firma')
      }

      const signData = await signResponse.json()

      const formData = new FormData()
      formData.append('file', file)
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
        throw new Error(
          `Error subiendo a Cloudinary: ${uploadResponse.status} - ${errorText}`
        )
      }

      const uploadResult = await uploadResponse.json()

      onUploadSuccess({
        id: uploadResult.public_id,
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      })

      resetComponent()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(String(err))
      }
      console.error('Upload error:', err)
    } finally {
      setLoading(false)
    }
  }

  const resetComponent = () => {
    setFile(null)
    setPreviewUrl(null)
    setError(null)
    //setCompressionInfo(null)
    stopCamera()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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
    fileNameData?.repairType.length > 0 && fileNameData?.repairIndex

  // const formatFileSize = (bytes: number) => {
  //   return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  // }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium capitalize">
          {fieldName.replace(/([A-Z])/g, ' $1').trim()}
        </label>

        {!previewUrl && !showCamera && (
          <>
            <div
              className={`${loading && 'animate-pulse'} ${
                !isFormValid && ' opacity-70 '
              } flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5`}
            >
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    className={` ${
                      !isFormValid ? ' cursor-default ' : ' cursor-pointer '
                    } relative rounded-md bg-white font-medium text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 hover:text-orange-400`}
                  >
                    <span>Subir archivo</span>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      disabled={!isFormValid || loading}
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG hasta 10MB</p>
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
                  disabled={!isFormValid || loading}
                  className="flex items-center justify-center flex-1"
                  onClick={startCamera}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Usar cámara web
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                disabled={!isFormValid || loading}
                className="flex items-center justify-center flex-1"
                onClick={triggerCameraInput}
              >
                <Camera className="mr-2 h-4 w-4" />
                Tomar foto
              </Button>
            </div>
          </>
        )}

        {/* Vista previa con info de compresión */}
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

            {/* Info de compresión */}
            {/* {compressionInfo && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md text-xs">
                <p className="text-green-700">
                  <strong>Compresión exitosa:</strong>
                  {formatFileSize(compressionInfo.originalSize)} →{' '}
                  {formatFileSize(compressionInfo.compressedSize)}
                  <span className="ml-2 text-green-600">
                    (-
                    {(
                      ((compressionInfo.originalSize -
                        compressionInfo.compressedSize) /
                        compressionInfo.originalSize) *
                      100
                    ).toFixed(1)}
                    %)
                  </span>
                </p>
              </div>
            )} */}
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
                Capturar
              </Button>
              <Button type="button" variant="outline" onClick={stopCamera}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {file && (
        <Button
          onClick={handleUpload}
          disabled={loading || !file}
          className="w-full bg-orange-500 text-white hover:bg-orange-400 disabled:bg-gray-300"
        >
          {loading ? 'Subiendo...' : 'Subir imagen'}
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

// 'use client'

// import { useState, useRef } from 'react'
// //import { createClient } from '@supabase/supabase-js'
// import imageCompression from 'browser-image-compression'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Camera, Upload, X } from 'lucide-react'

// // const supabase = createClient(
// //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
// //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// // )

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
//     id: string
//     public_id: string
//     url: string
//   }) => void
//   fieldName: 'surveyImage' | 'progressImage' | 'finishImage'
//   fileNameData: {
//     drop: number
//     level: number
//     repairType: string
//     repairIndex: number
//     measures: string
//     phase: string
//   }
//   folderName: string
//   userName: string
// }

// export default function CustomImageUpload({
//   onUploadSuccess,
//   fieldName,
//   fileNameData,
//   folderName,
//   userName,
// }: CustomImageUploadProps) {
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null)
//   const [file, setFile] = useState<File | null>(null)
//   const [error, setError] = useState<string | null>(null)
//   const [loading, setLoading] = useState(false)
//   const [showCamera, setShowCamera] = useState(false)
//   const [cameraSupported, setCameraSupported] = useState(true)

//   const videoRef = useRef<HTMLVideoElement>(null)
//   const canvasRef = useRef<HTMLCanvasElement>(null)
//   const streamRef = useRef<MediaStream | null>(null)
//   const fileInputRef = useRef<HTMLInputElement>(null)
//   const cameraInputRef = useRef<HTMLInputElement>(null)

//   // Handle file selection
//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const selectedFile = e.target.files[0]
//       await processImage(selectedFile)
//     }
//   }

//   const handleFileName = () => {
//     if (!fileNameData) return null
//     const { drop, level, repairType, repairIndex, measures, phase } =
//       fileNameData

//     if (!drop || !level || !repairType || !repairIndex) return
//     const name = `D${drop}.L${level}.${repairType}.${repairIndex}.${measures}.${phase}`
//     console.log('filename: ', name)

//     return name
//   }

//   // Check camera support
//   const checkCameraSupport = () => {
//     if (typeof window === 'undefined') return false
//     const extendedNavigator = navigator as ExtendedNavigator
//     // Verificar si getUserMedia está disponible
//     const hasGetUserMedia = !!(
//       navigator.mediaDevices?.getUserMedia ||
//       extendedNavigator.getUserMedia ||
//       extendedNavigator.webkitGetUserMedia ||
//       extendedNavigator.mozGetUserMedia ||
//       extendedNavigator.msGetUserMedia
//     )

//     // En iOS Safari, también verificar si estamos en HTTPS
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
//       // Método moderno
//       if (navigator.mediaDevices?.getUserMedia) {
//         navigator.mediaDevices
//           .getUserMedia(constraints)
//           .then(resolve)
//           .catch(reject)
//         return
//       }

//       // Fallbacks para navegadores más antiguos
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

//   // Start camera
//   const startCamera = async () => {
//     // Verificar soporte antes de intentar usar la cámara
//     if (!checkCameraSupport()) {
//       setCameraSupported(false)
//       setError(
//         'La cámara no está disponible. Por favor, usa la opción de subir archivo.'
//       )
//       return
//     }

//     try {
//       setError(null)
//       const constraints = {
//         video: {
//           facingMode: 'environment',
//           width: { ideal: 1920, max: 1920 },
//           height: { ideal: 1080, max: 1080 },
//         },
//       }

//       const stream = await getUserMedia(constraints)
//       streamRef.current = stream
//       setShowCamera(true)

//       // Pequeño delay para asegurar que el video element esté disponible
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

//   // Capture image from camera
//   const captureImage = async () => {
//     if (videoRef.current && canvasRef.current) {
//       const context = canvasRef.current.getContext('2d')
//       if (context) {
//         canvasRef.current.width = videoRef.current.videoWidth
//         canvasRef.current.height = videoRef.current.videoHeight
//         context.drawImage(videoRef.current, 0, 0)

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
//           0.9
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

//   // Función para formatear fecha y hora
//   const formatDateTime = () => {
//     const now = new Date()
//     const dateOptions: Intl.DateTimeFormatOptions = {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
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

//   // Process image (resize and watermark)
//   const processImage = async (inputFile: File) => {
//     setError(null)
//     setLoading(true)

//     try {
//       // Validar tipo de archivo
//       if (!inputFile.type.startsWith('image/')) {
//         throw new Error('Por favor selecciona un archivo de imagen válido')
//       }

//       // Comprimir imagen
//       const options = {
//         maxWidthOrHeight: 1200,
//         maxSizeMB: 2,
//         useWebWorker: true,

//       }
//       const compressedFile = await imageCompression(inputFile, options)

//       // Crear canvas para watermark
//       const canvas = document.createElement('canvas')
//       const ctx = canvas.getContext('2d')
//       if (!ctx) throw new Error('No se pudo obtener el contexto del canvas')

//       // Cargar imagen
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

//       // Configurar watermark
//       const fontSize = Math.max(12, Math.min(img.width / 20, 30))
//       const padding = 20
//       const lineHeight = fontSize * 1.3

//       const fileName = handleFileName()
//       // Textos del watermark
//       const fileNameText = fileName || 'WorkMap'
//       const userNameText = userName || 'Usuario'
//       const dateTimeText = formatDateTime()

//       // Calcular dimensiones del fondo del watermark
//       ctx.font = `${fontSize}px Arial`
//       const fileNameWidth = ctx.measureText(fileNameText).width
//       const userNameWidth = ctx.measureText(userNameText).width
//       const dateTimeWidth = ctx.measureText(dateTimeText).width

//       const maxTextWidth = Math.max(fileNameWidth, userNameWidth, dateTimeWidth)
//       const backgroundWidth = maxTextWidth + padding * 2
//       const backgroundHeight = lineHeight * 3 + padding * 2

//       // Posición del watermark (esquina inferior izquierda)
//       const backgroundX = padding
//       const backgroundY = img.height - backgroundHeight - padding

//       // Dibujar fondo negro translúcido
//       ctx.fillStyle = 'rgba(0, 0, 0, 0.3)' // 30% de opacidad
//       ctx.fillRect(backgroundX, backgroundY, backgroundWidth, backgroundHeight)

//       // Configurar estilo del texto
//       ctx.font = `${fontSize}px Arial`
//       ctx.fillStyle = 'rgba(255, 255, 255, 0.9)' // Texto blanco con 90% opacidad
//       ctx.textAlign = 'left'
//       ctx.textBaseline = 'top'

//       // Dibujar textos
//       const textX = backgroundX + padding
//       let textY = backgroundY + padding

//       // Nombre del archivo
//       ctx.fillText(fileNameText, textX, textY)
//       textY += lineHeight

//       // Nombre del usuario
//       ctx.fillText(userNameText, textX, textY)
//       textY += lineHeight

//       // Fecha y hora
//       ctx.fillText(dateTimeText, textX, textY)

//       // Convertir canvas a file
//       const watermarkedBlob = await new Promise<Blob>((resolve, reject) =>
//         canvas.toBlob(
//           (blob) => {
//             if (blob) resolve(blob)
//             else reject(new Error('No se pudo crear el blob'))
//           },
//           'image/jpeg',
//           0.9
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
//     } catch (err: ErrorConstructor | unknown) {
//       if (err instanceof Error) {
//         setError('Error procesando la imagen: ' + err.message)
//       } else {
//         setError('Error procesando la imagen: ' + String(err))
//       }
//       console.error('Processing error:', err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   console.log('folder name: ', sanitizeFolderName(folderName))

//   // Upload to Cloudinary
//   const handleUpload = async () => {
//     const fileName = handleFileName()
//     if (!fileName) return

//     if (!file || !fileName.trim()) {
//       setError('Por favor selecciona un archivo y especifica un nombre')
//       return
//     }

//     setLoading(true)
//     setError(null)

//     try {
//       // Obtener firma desde tu API
//       const signResponse = await fetch('/api/images/signed-upload', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           public_id: fileName.trim(),
//           folder: sanitizeFolderName(folderName),
//           // Comentar transformaciones por ahora
//           // transformations: {
//           //   width: 1200,
//           //   height: 1200,
//           //   crop: 'limit'
//           // },
//         }),
//       })

//       if (!signResponse.ok) {
//         const errorData = await signResponse.json()
//         throw new Error(errorData.error || 'Error obteniendo firma')
//       }

//       const signData = await signResponse.json()
//       console.log('Sign data received:', signData)

//       // Preparar FormData para Cloudinary
//       const formData = new FormData()
//       formData.append('file', file)
//       formData.append('api_key', signData.apiKey)
//       formData.append('timestamp', signData.timestamp.toString())
//       formData.append('signature', signData.signature)
//       formData.append('public_id', signData.public_id)
//       formData.append('asset_folder', signData.asset_folder)

//       // Comentar transformaciones por ahora
//       // if (signData.width) formData.append('width', signData.width.toString())
//       // if (signData.height) formData.append('height', signData.height.toString())
//       // if (signData.crop) formData.append('crop', signData.crop)

//       // Debug: Log FormData contents
//       console.log('FormData contents:')
//       for (const [key, value] of formData.entries()) {
//         console.log(`${key}:`, value)
//       }

//       // Upload a Cloudinary
//       const uploadResponse = await fetch(
//         `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
//         {
//           method: 'POST',
//           body: formData,
//         }
//       )

//       console.log('Upload response status:', uploadResponse.status)

//       if (!uploadResponse.ok) {
//         const errorText = await uploadResponse.text()
//         console.error('Cloudinary error response:', errorText)
//         throw new Error(
//           `Error subiendo a Cloudinary: ${uploadResponse.status} - ${errorText}`
//         )
//       }

//       const uploadResult = await uploadResponse.json()

//       console.log('Upload result:', uploadResult)

//       // Guardar en Supabase (opcional)
//       // try {
//       //   const {
//       //     data: { session },
//       //   } = await supabase.auth.getSession()

//       //   if (session) {
//       //     const { data, error: insertError } = await supabase
//       //       .from('images')
//       //       .insert({
//       //         user_id: session.user.id,
//       //         public_id: uploadResult.public_id,
//       //         url: uploadResult.secure_url,
//       //         metadata: {
//       //           ...uploadResult,
//       //           custom_filename: fileName,
//       //           field_name: fieldName,
//       //         },
//       //       })
//       //       .select()
//       //       .single()

//       //     if (!insertError && data) {
//       //       onUploadSuccess({
//       //         id: data.id,
//       //         public_id: data.public_id,
//       //         url: data.url,
//       //       })
//       //     }
//       //   }
//       // } catch (supabaseError) {
//       //   console.warn(
//       //     'Error guardando en Supabase, pero imagen subida correctamente:',
//       //     supabaseError
//       //   )
//       //   // Aún así llamar onUploadSuccess con los datos de Cloudinary
//       //   onUploadSuccess({
//       //     id: uploadResult.public_id,
//       //     public_id: uploadResult.public_id,
//       //     url: uploadResult.secure_url,
//       //   })
//       // }

//       onUploadSuccess({
//         id: uploadResult.public_id,
//         public_id: uploadResult.public_id,
//         url: uploadResult.secure_url,
//       })

//       // Limpiar estado
//       resetComponent()
//     } catch (err: ErrorConstructor | unknown) {
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
//     stopCamera()
//     if (fileInputRef.current) {
//       fileInputRef.current.value = ''
//     }
//   }

//   const removeFile = () => {
//     resetComponent()
//   }

//   // Trigger camera input for iOS fallback
//   const triggerCameraInput = () => {
//     if (cameraInputRef.current) {
//       cameraInputRef.current.click()
//     }
//   }

//   const isFormValid =
//     fileNameData?.repairType.length > 0 && fileNameData?.repairIndex

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
//                 !isFormValid && ' opacity-70 '
//               } flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5`}
//             >
//               <div className="space-y-1 text-center">
//                 <Upload className="mx-auto h-12 w-12 text-gray-400" />
//                 <div className="flex text-sm text-gray-600">
//                   <label
//                     className={` ${
//                       !isFormValid ? ' cursor-default ' : ' cursor-pointer '
//                     } relative rounded-md bg-white font-medium text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 hover:text-orange-400`}
//                   >
//                     <span>Subir archivo</span>
//                     <Input
//                       ref={fileInputRef}
//                       type="file"
//                       disabled={!isFormValid || loading}
//                       className="sr-only"
//                       accept="image/*"
//                       onChange={handleFileChange}
//                     />
//                   </label>
//                 </div>
//                 <p className="text-xs text-gray-500">PNG, JPG hasta 10MB</p>
//               </div>
//             </div>

//             {/* Input oculto para cámara iOS */}
//             <input
//               ref={cameraInputRef}
//               type="file"
//               accept="image/*"
//               capture="environment"
//               className="hidden"
//               onChange={handleCameraInput}
//             />

//             <div className="flex gap-2">
//               {/* Botón para cámara web (desktop/Android) */}
//               {cameraSupported && checkCameraSupport() && (
//                 <Button
//                   type="button"
//                   variant="outline"
//                   disabled={!isFormValid || loading}
//                   className="flex items-center justify-center flex-1"
//                   onClick={startCamera}
//                 >
//                   <Camera className="mr-2 h-4 w-4" />
//                   Usar cámara web
//                 </Button>
//               )}

//               {/* Botón para cámara móvil (iOS/Android fallback) */}
//               <Button
//                 type="button"
//                 variant="outline"
//                 disabled={!isFormValid || loading}
//                 className="flex items-center justify-center flex-1"
//                 onClick={triggerCameraInput}
//               >
//                 <Camera className="mr-2 h-4 w-4" />
//                 Tomar foto
//               </Button>
//             </div>
//           </>
//         )}

//         {/* Vista previa */}
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
//                 Capturar
//               </Button>
//               <Button type="button" variant="outline" onClick={stopCamera}>
//                 Cancelar
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Canvas oculto para captura */}
//       <canvas ref={canvasRef} className="hidden" />

//       {/* Botón de subida */}
//       {file && (
//         <Button
//           onClick={handleUpload}
//           disabled={loading || !file}
//           className="w-full bg-orange-500 text-white hover:bg-orange-400 disabled:bg-gray-300"
//         >
//           {loading ? 'Subiendo...' : 'Subir imagen'}
//         </Button>
//       )}

//       {/* Mensajes de error */}
//       {error && (
//         <div className="rounded-md bg-red-50 border border-red-200 p-3">
//           <p className="text-sm text-red-600">{error}</p>
//         </div>
//       )}
//     </div>
//   )
// }
