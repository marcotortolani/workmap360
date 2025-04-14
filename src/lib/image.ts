// lib/image.ts
export async function addWatermark(
  imageFile: File,
  watermarkText: string
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      // Configurar el canvas con las dimensiones de la imagen
      canvas.width = img.width
      canvas.height = img.height

      // Dibujar la imagen original
      ctx?.drawImage(img, 0, 0)

      // Configurar la marca de agua
      ctx!.font = '20px Arial'
      ctx!.fillStyle = 'rgba(255, 255, 255, 0.7)' // Blanco semi-transparente
      ctx!.textBaseline = 'bottom'
      ctx!.fillText(watermarkText, 10, img.height - 10) // Esquina inferior izquierda

      // Convertir a Blob (WebP)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to create Blob'))
        },
        'image/webp',
        0.8 // Calidad de compresión
      )
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(imageFile)
  })
}
