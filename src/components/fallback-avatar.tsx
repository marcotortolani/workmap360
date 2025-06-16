'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import Image, { ImageProps } from 'next/image'

type FallbackAvatarProps = Omit<ImageProps, 'src'> & {
  src?: string
  fallbackInitials?: string
  className?: string
  alt: string
}

export function FallbackAvatar({
  src = '',
  fallbackInitials = 'U',
  className,
  alt,
  ...props
}: FallbackAvatarProps) {
  const [avatarType, setAvatarType] = useState<'initials' | 'image'>('image')

  if (!src || avatarType === 'initials') {
    return (
      <div
        className={cn(
          ' flex h-10 w-10 p-2 items-center justify-center rounded-full bg-sky-200  ',
          className
        )}
        {...props}
      >
        <span className=" font-bold text-sky-800 text-sm uppercase  ">
          {fallbackInitials}
        </span>
      </div>
    )
  }

  return (
    <div
      className={
        (cn('flex h-10 w-10 items-center justify-center rounded-full '),
        className)
      }
      {...props}
    >
      <Image
        src={src as string}
        width={120}
        height={120}
        alt={alt}
        onError={() => setAvatarType('initials')}
      />
    </div>
  )
}
