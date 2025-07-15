/* eslint-disable @next/next/no-img-element */
// src/components/ui/avatar-customizer.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Shuffle, Check, X } from 'lucide-react'

// Opciones de personalización (copiadas de tu avatar-peeps.ts)
const CUSTOMIZATION_OPTIONS = {
  accessories: ['none', 'round', 'square', 'vintage', 'wayfarer'],
  backgroundColor: [
    'f8f9fa',
    'e3f2fd',
    'f3e5f5',
    'e8f5e8',
    'fff8e1',
    'fce4ec',
    'e0f2f1',
    'fff3e0',
    'f1f8e9',
    'e8eaf6',
    'fafafa',
    'f5f5f5',
    'eceff1',
    'efefef',
    'f7f7f7',
    'e1f5fe',
    'f9fbe7',
    'fff9c4',
    'ffecb3',
    'ffe0b2',
    'ffcdd2',
    'd1c4e9',
    'c8e6c9',
    'b3e5fc',
    'dcedc8',
  ],
  hairColor: [
    '2c1b18',
    '724133',
    'b58143',
    'd6b370',
    'e6ca93',
    'f7dc6f',
    'a0522d',
    '8b4513',
    '000000',
    '696969',
    'dcdcdc',
  ],
  clothingColor: [
    '3498db',
    '2ecc71',
    'e74c3c',
    'f39c12',
    '9b59b6',
    '1abc9c',
    'e67e22',
    '34495e',
    'e91e63',
    '795548',
    '607d8b',
    '8bc34a',
    'ff5722',
    '673ab7',
  ],
  hair: [
    'long01',
    'long02',
    'long03',
    'long04',
    'long05',
    'long06',
    'long07',
    'long08',
    'long09',
    'long10',
    'long11',
    'long12',
    'long13',
    'long14',
    'long15',
    'short01',
    'short02',
    'short03',
    'short04',
    'short05',
    'short06',
    'short07',
    'short08',
    'short09',
    'short10',
    'short11',
    'short12',
    'short13',
    'short14',
    'short15',
  ],
  mouth: [
    'concerned',
    'default',
    'disbelief',
    'eating',
    'grimace',
    'sad',
    'scream',
    'serious',
    'smile',
    'tongue',
  ],
  eyes: [
    'default',
    'closed',
    'cry',
    'cute',
    'hearts',
    'side',
    'squint',
    'surprised',
    'wink',
    'winkWacky',
  ],
  skinColor: ['f8d25c', 'fdbcb4', 'ecad80', 'd08b5b', 'ae5d29', '614335'],
}

// Nombres más amigables para las opciones
const FRIENDLY_NAMES = {
  accessories: {
    none: 'Sin accesorios',
    round: 'Redondos',
    square: 'Cuadrados',
    vintage: 'Vintage',
    wayfarer: 'Wayfarer',
  },
  hair: {
    long01: 'Largo 1',
    long02: 'Largo 2',
    long03: 'Largo 3',
    long04: 'Largo 4',
    long05: 'Largo 5',
    long06: 'Largo 6',
    long07: 'Largo 7',
    long08: 'Largo 8',
    long09: 'Largo 9',
    long10: 'Largo 10',
    long11: 'Largo 11',
    long12: 'Largo 12',
    long13: 'Largo 13',
    long14: 'Largo 14',
    long15: 'Largo 15',
    short01: 'Corto 1',
    short02: 'Corto 2',
    short03: 'Corto 3',
    short04: 'Corto 4',
    short05: 'Corto 5',
    short06: 'Corto 6',
    short07: 'Corto 7',
    short08: 'Corto 8',
    short09: 'Corto 9',
    short10: 'Corto 10',
    short11: 'Corto 11',
    short12: 'Corto 12',
    short13: 'Corto 13',
    short14: 'Corto 14',
    short15: 'Corto 15',
  },
  mouth: {
    concerned: 'Preocupado',
    default: 'Normal',
    disbelief: 'Incredulidad',
    eating: 'Comiendo',
    grimace: 'Mueca',
    sad: 'Triste',
    scream: 'Gritando',
    serious: 'Serio',
    smile: 'Sonriendo',
    tongue: 'Lengua afuera',
  },
  eyes: {
    default: 'Normal',
    closed: 'Cerrados',
    cry: 'Llorando',
    cute: 'Tiernos',
    hearts: 'Corazones',
    side: 'De lado',
    squint: 'Entrecerrados',
    surprised: 'Sorprendidos',
    wink: 'Guiño',
    winkWacky: 'Guiño loco',
  },
}

interface AvatarCustomizerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (avatarUrl: string) => void
  currentAvatar?: string
}

interface AvatarFeatures {
  accessories: string
  backgroundColor: string
  hairColor: string
  hair: string
  clothingColor: string
  mouth: string
  eyes: string
  skinColor: string
}

export default function AvatarCustomizer({
  isOpen,
  onClose,
  onSave,
}: // currentAvatar,
AvatarCustomizerProps) {
  const [features, setFeatures] = useState<AvatarFeatures>({
    accessories: 'none',
    backgroundColor: 'f8f9fa',
    hairColor: '724133',
    hair: 'short01',
    clothingColor: '3498db',
    mouth: 'smile',
    eyes: 'default',
    skinColor: 'ecad80',
  })

  const [previewUrl, setPreviewUrl] = useState('')

  // Generar URL del avatar basado en las características actuales
  const generateAvatarUrl = (currentFeatures: AvatarFeatures): string => {
    // Crear un hash corto basado en las características para evitar URLs muy largas
    const featuresString = Object.values(currentFeatures).join('|')
    const shortHash = Math.abs(
      featuresString.split('').reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0)
        return a & a
      }, 0)
    )
      .toString(36)
      .substring(0, 8)

    const params = new URLSearchParams({
      seed: `c-${shortHash}`, // Semilla más corta
      size: '200',
      backgroundColor: currentFeatures.backgroundColor,
      hairColor: currentFeatures.hairColor,
      hair: currentFeatures.hair,
      clothingColor: currentFeatures.clothingColor,
      mouth: currentFeatures.mouth,
      eyes: currentFeatures.eyes,
      skinColor: currentFeatures.skinColor,
    })

    // Solo agregar accesorios si no es 'none'
    if (currentFeatures.accessories !== 'none') {
      params.append('accessories', currentFeatures.accessories)
      params.append('accessoriesColor', '000000')
    }

    return `https://api.dicebear.com/7.x/open-peeps/png?${params.toString()}`
  }

  // Actualizar preview cuando cambien las características
  useEffect(() => {
    const newUrl = generateAvatarUrl(features)
    setPreviewUrl(newUrl)
  }, [features])

  // Función para actualizar una característica específica
  const updateFeature = (key: keyof AvatarFeatures, value: string) => {
    setFeatures((prev) => ({ ...prev, [key]: value }))
  }
  // Función para randomizar todas las características
  const randomizeAll = () => {
    // const randomChoice = <T>(array: T[]): T => {
    //   return array[Math.floor(Math.random() * array.length)]
    // }

    const randomChoice = (array: string[]) => {
      return array[Math.floor(Math.random() * array.length)]
    }

    setFeatures({
      accessories: randomChoice(CUSTOMIZATION_OPTIONS.accessories),
      backgroundColor: randomChoice(CUSTOMIZATION_OPTIONS.backgroundColor),
      hairColor: randomChoice(CUSTOMIZATION_OPTIONS.hairColor),
      hair: randomChoice(CUSTOMIZATION_OPTIONS.hair),
      clothingColor: randomChoice(CUSTOMIZATION_OPTIONS.clothingColor),
      mouth: randomChoice(CUSTOMIZATION_OPTIONS.mouth),
      eyes: randomChoice(CUSTOMIZATION_OPTIONS.eyes),
      skinColor: randomChoice(CUSTOMIZATION_OPTIONS.skinColor),
    })
  }

  // Componente para selector de colores
  const ColorSelector = ({
    label,
    colors,
    selected,
    onChange,
  }: {
    label: string
    colors: string[]
    selected: string
    onChange: (color: string) => void
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="grid grid-cols-6 gap-2">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              selected === color
                ? 'border-blue-500 scale-110 shadow-md'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            style={{ backgroundColor: `#${color}` }}
            title={`#${color}`}
          />
        ))}
      </div>
    </div>
  )

  // Componente para selector de opciones
  const OptionSelector = ({
    label,
    options,
    selected,
    onChange,
    friendlyNames,
  }: {
    label: string
    options: string[]
    selected: string
    onChange: (option: string) => void
    friendlyNames?: Record<string, string>
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`px-3 py-2 text-xs rounded-md border transition-all ${
              selected === option
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
            }`}
          >
            {friendlyNames?.[option] || option}
          </button>
        ))}
      </div>
    </div>
  )

  if (!isOpen) return null

  return (
    <div className="mt-6 border-t pt-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Personalizar Avatar</h3>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={randomizeAll}
                className="flex items-center gap-2"
              >
                <Shuffle className="w-4 h-4" />
                Aleatorio
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Preview */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <Label className="text-sm font-medium mb-3 block">
                  Preview
                </Label>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 bg-white">
                    {previewUrl && (
                      // <Image
                      //   src={previewUrl}
                      //   alt="Avatar Preview"
                      //   width={128}
                      //   height={128}
                      //   className="w-full h-full object-cover"
                      // />
                      <img
                        src={previewUrl}
                        alt="Avatar Preview"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Error loading avatar:', e)
                          // Fallback a un avatar simple si falla
                          e.currentTarget.src = '/avatar.png'
                        }}
                      />
                    )}
                  </div>
                  <Button
                    type="button"
                    onClick={() => onSave(previewUrl)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Usar este Avatar
                  </Button>
                </div>
              </div>
            </div>

            {/* Customization Options */}
            <div className="lg:col-span-2 space-y-6">
              {/* Fondo */}
              <ColorSelector
                label="Color de Fondo"
                colors={CUSTOMIZATION_OPTIONS.backgroundColor}
                selected={features.backgroundColor}
                onChange={(color) => updateFeature('backgroundColor', color)}
              />

              {/* Color de Piel */}
              <ColorSelector
                label="Color de Piel"
                colors={CUSTOMIZATION_OPTIONS.skinColor}
                selected={features.skinColor}
                onChange={(color) => updateFeature('skinColor', color)}
              />

              {/* Estilo de Cabello */}
              <OptionSelector
                label="Estilo de Cabello"
                options={CUSTOMIZATION_OPTIONS.hair}
                selected={features.hair}
                onChange={(option) => updateFeature('hair', option)}
                friendlyNames={FRIENDLY_NAMES.hair}
              />

              {/* Color de Cabello */}
              <ColorSelector
                label="Color de Cabello"
                colors={CUSTOMIZATION_OPTIONS.hairColor}
                selected={features.hairColor}
                onChange={(color) => updateFeature('hairColor', color)}
              />

              {/* Ojos */}
              <OptionSelector
                label="Estilo de Ojos"
                options={CUSTOMIZATION_OPTIONS.eyes}
                selected={features.eyes}
                onChange={(option) => updateFeature('eyes', option)}
                friendlyNames={FRIENDLY_NAMES.eyes}
              />

              {/* Boca */}
              <OptionSelector
                label="Expresión de Boca"
                options={CUSTOMIZATION_OPTIONS.mouth}
                selected={features.mouth}
                onChange={(option) => updateFeature('mouth', option)}
                friendlyNames={FRIENDLY_NAMES.mouth}
              />

              {/* Color de Ropa */}
              <ColorSelector
                label="Color de Ropa"
                colors={CUSTOMIZATION_OPTIONS.clothingColor}
                selected={features.clothingColor}
                onChange={(color) => updateFeature('clothingColor', color)}
              />

              {/* Accesorios */}
              <OptionSelector
                label="Accesorios"
                options={CUSTOMIZATION_OPTIONS.accessories}
                selected={features.accessories}
                onChange={(option) => updateFeature('accessories', option)}
                friendlyNames={FRIENDLY_NAMES.accessories}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
