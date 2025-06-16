'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'

type FallbackImageProps = Omit<ImageProps, 'src'> & {
  src?: string
  fallbackSrc?: string
  alt: string
}

export function FallbackImage({
  src,
  fallbackSrc = '/images/bg-fallback.jpg',
  alt,
  ...props
}: FallbackImageProps) {
  const [imgSrc, setImgSrc] = useState(src)

  return (
    <Image
      {...props}
      src={imgSrc || fallbackSrc}
      alt={alt}
      onError={() => setImgSrc(fallbackSrc)}
    />
  )
}
