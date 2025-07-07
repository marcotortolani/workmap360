'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { Upload, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AvatarUploadProps {
  initialImage?: string
  onImageChange?: (image: string | null) => void
}

export function AvatarUpload({
  initialImage,
  onImageChange,
}: AvatarUploadProps) {
  const [image, setImage] = useState<string | null>(initialImage || null)

  // Actualizar el estado interno cuando cambie initialImage
  useEffect(() => {
    setImage(initialImage || null)
  }, [initialImage])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        setImage(imageUrl)
        onImageChange?.(imageUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImage(null)
    onImageChange?.(null)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={image || ''} alt="User avatar" />
          <AvatarFallback className="bg-orange-100 text-orange-800 text-xl">
            AA
          </AvatarFallback>
        </Avatar>
        {image && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
            onClick={handleRemoveImage}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      <div className="flex items-center justify-center">
        <label className="flex cursor-pointer items-center gap-2 rounded-md bg-orange-50 px-3 py-2 text-sm font-medium text-orange-600 hover:bg-orange-100">
          <Upload className="h-4 w-4" />
          Upload Avatar
          <Input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleImageChange}
          />
        </label>
      </div>
    </div>
  )
}
