/* eslint-disable @next/next/no-img-element */
// src/components/ui/avatar-customizer.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shuffle, Check, X } from 'lucide-react'

// Opciones de personalización según la documentación oficial de DiceBear Open Peeps
const CUSTOMIZATION_OPTIONS = {
  accessories: [
    'none',
    'eyepatch',
    'glasses',
    'glasses2',
    'glasses3',
    'glasses4',
    'glasses5',
    'sunglasses',
    'sunglasses2',
  ],
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
  headContrastColor: [
    '2c1b18',
    'e8e1e1',
    'ecdcbf',
    'd6b370',
    'f59797',
    'b58143',
    'a55728',
    '724133',
    '4a312c',
    'c93305',
  ],
  clothingColor: [
    'e78276',
    'ffcf77',
    'fdea6b',
    '78e185',
    '9ddadb',
    '8fa7df',
    'e279c7',
  ],
  head: [
    'afro',
    'bangs',
    'bangs2',
    'bantuKnots',
    'bear',
    'bun',
    'bun2',
    'buns',
    'cornrows',
    'cornrows2',
    'dreads1',
    'dreads2',
    'flatTop',
    'flatTopLong',
    'grayBun',
    'grayMedium',
    'grayShort',
    'hatBeanie',
    'hatHip',
    'hijab',
    'long',
    'longAfro',
    'longBangs',
    'longCurly',
    'medium1',
    'medium2',
    'medium3',
    'mediumBangs',
    'mediumBangs2',
    'mediumBangs3',
    'mediumStraight',
    'mohawk',
    'mohawk2',
    'noHair1',
    'noHair2',
    'noHair3',
    'pomp',
    'shaved1',
    'shaved2',
    'shaved3',
    'short1',
    'short2',
    'short3',
    'short4',
    'short5',
    'turban',
    'twists',
    'twists2',
  ],
  face: [
    'angryWithFang',
    'awe',
    'blank',
    'calm',
    'cheeky',
    'concerned',
    'concernedFear',
    'contempt',
    'cute',
    'cyclops',
    'driven',
    'eatingHappy',
    'explaining',
    'eyesClosed',
    'fear',
    'hectic',
    'lovingGrin1',
    'lovingGrin2',
    'monster',
    'old',
    'rage',
    'serious',
    'smile',
    'smileBig',
    'smileLOL',
    'smileTeethGap',
    'solemn',
    'suspicious',
    'tired',
    'veryAngry',
  ],
  skinColor: ['ffdbb4', 'edb98a', 'd08b5b', 'ae5d29', '694d3d'],
  facialHair: [
    'none',
    'chin',
    'full',
    'full2',
    'full3',
    'full4',
    'goatee1',
    'goatee2',
    'moustache1',
    'moustache2',
    'moustache3',
    'moustache4',
    'moustache5',
    'moustache6',
    'moustache7',
    'moustache8',
    'moustache9',
  ],
  mask: ['none', 'medicalMask', 'respirator'],
}

// Nombres más amigables para las opciones
const FRIENDLY_NAMES = {
  accessories: {
    none: 'No accessories',
    eyepatch: 'Eyepatch',
    glasses: 'Glasses',
    glasses2: 'Glasses 2',
    glasses3: 'Glasses 3',
    glasses4: 'Glasses 4',
    glasses5: 'Glasses 5',
    sunglasses: 'Sunglasses',
    sunglasses2: 'Sunglasses 2',
  },
  head: {
    afro: 'Afro',
    bangs: 'Bangs',
    bangs2: 'Bangs 2',
    bantuKnots: 'Bantu Knots',
    bear: 'Bear',
    bun: 'Bun',
    bun2: 'Bun 2',
    buns: 'Buns',
    cornrows: 'Cornrows',
    cornrows2: 'Cornrows 2',
    dreads1: 'Dreads 1',
    dreads2: 'Dreads 2',
    flatTop: 'Flat Top',
    flatTopLong: 'Flat Top Long',
    grayBun: 'Gray Bun',
    grayMedium: 'Gray Medium',
    grayShort: 'Gray Short',
    hatBeanie: 'Beanie',
    hatHip: 'Hip Hat',
    hijab: 'Hijab',
    long: 'Long',
    longAfro: 'Long Afro',
    longBangs: 'Long Bangs',
    longCurly: 'Long Curly',
    medium1: 'Medium 1',
    medium2: 'Medium 2',
    medium3: 'Medium 3',
    mediumBangs: 'Medium Bangs',
    mediumBangs2: 'Medium Bangs 2',
    mediumBangs3: 'Medium Bangs 3',
    mediumStraight: 'Medium Straight',
    mohawk: 'Mohawk',
    mohawk2: 'Mohawk 2',
    noHair1: 'No Hair 1',
    noHair2: 'No Hair 2',
    noHair3: 'No Hair 3',
    pomp: 'Pompadour',
    shaved1: 'Shaved 1',
    shaved2: 'Shaved 2',
    shaved3: 'Shaved 3',
    short1: 'Short 1',
    short2: 'Short 2',
    short3: 'Short 3',
    short4: 'Short 4',
    short5: 'Short 5',
    turban: 'Turban',
    twists: 'Twists',
    twists2: 'Twists 2',
  },
  face: {
    angryWithFang: 'Angry with Fang',
    awe: 'Awe',
    blank: 'Blank',
    calm: 'Calm',
    cheeky: 'Cheeky',
    concerned: 'Concerned',
    concernedFear: 'Concerned Fear',
    contempt: 'Contempt',
    cute: 'Cute',
    cyclops: 'Cyclops',
    driven: 'Driven',
    eatingHappy: 'Eating Happy',
    explaining: 'Explaining',
    eyesClosed: 'Eyes Closed',
    fear: 'Fear',
    hectic: 'Hectic',
    lovingGrin1: 'Loving Grin 1',
    lovingGrin2: 'Loving Grin 2',
    monster: 'Monster',
    old: 'Old',
    rage: 'Rage',
    serious: 'Serious',
    smile: 'Smile',
    smileBig: 'Big Smile',
    smileLOL: 'LOL Smile',
    smileTeethGap: 'Smile with Gap',
    solemn: 'Solemn',
    suspicious: 'Suspicious',
    tired: 'Tired',
    veryAngry: 'Very Angry',
  },
  facialHair: {
    none: 'No facial hair',
    chin: 'Chin',
    full: 'Full',
    full2: 'Full 2',
    full3: 'Full 3',
    full4: 'Full 4',
    goatee1: 'Goatee 1',
    goatee2: 'Goatee 2',
    moustache1: 'Moustache 1',
    moustache2: 'Moustache 2',
    moustache3: 'Moustache 3',
    moustache4: 'Moustache 4',
    moustache5: 'Moustache 5',
    moustache6: 'Moustache 6',
    moustache7: 'Moustache 7',
    moustache8: 'Moustache 8',
    moustache9: 'Moustache 9',
  },
  mask: {
    none: 'No mask',
    medicalMask: 'Medical Mask',
    respirator: 'Respirator',
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
  headContrastColor: string
  head: string
  clothingColor: string
  face: string
  skinColor: string
  facialHair: string
  mask: string
}

export default function AvatarCustomizer({
  isOpen,
  onClose,
  onSave,
  currentAvatar,
}: AvatarCustomizerProps) {
  const [features, setFeatures] = useState<AvatarFeatures>({
    accessories: 'none',
    backgroundColor: 'f8f9fa',
    headContrastColor: '724133',
    head: 'short1',
    clothingColor: 'e78276',
    face: 'smile',
    skinColor: 'ffdbb4',
    facialHair: 'none',
    mask: 'none',
  })

  const [previewUrl, setPreviewUrl] = useState('')

  // Generar URL del avatar con seed fijo
  const generateAvatarUrl = (currentFeatures: AvatarFeatures): string => {
    // Usar un seed FIJO para que solo cambien los parámetros específicos
    const fixedSeed = 'custom-avatar-base'

    const params = new URLSearchParams()

    // Seed fijo - no cambia nunca
    params.append('seed', fixedSeed)
    params.append('size', '200')

    // Parámetros específicos según la documentación oficial
    params.append('backgroundColor', currentFeatures.backgroundColor)
    params.append('skinColor', currentFeatures.skinColor)
    params.append('head', currentFeatures.head)
    params.append('headContrastColor', currentFeatures.headContrastColor)
    params.append('face', currentFeatures.face)
    params.append('clothingColor', currentFeatures.clothingColor)

    // Accesorios solo si no es 'none'
    if (currentFeatures.accessories && currentFeatures.accessories !== 'none') {
      params.append('accessories', currentFeatures.accessories)
      params.append('accessoriesProbability', '100')
    }

    // Vello facial solo si no es 'none'
    if (currentFeatures.facialHair && currentFeatures.facialHair !== 'none') {
      params.append('facialHair', currentFeatures.facialHair)
      params.append('facialHairProbability', '100')
    }

    // Máscara solo si no es 'none'
    if (currentFeatures.mask && currentFeatures.mask !== 'none') {
      params.append('mask', currentFeatures.mask)
      params.append('maskProbability', '100')
    }

    const finalUrl = `https://api.dicebear.com/9.x/open-peeps/png?${params.toString()}`

    return finalUrl
  }

  // Actualizar preview cuando cambien las características
  useEffect(() => {
    const newUrl = generateAvatarUrl(features)

    setPreviewUrl(newUrl)
  }, [features])

  // Inicializar desde avatar actual si existe
  useEffect(() => {
    if (currentAvatar && isOpen) {
      // Si tienes un avatar actual, podrías intentar parsearlo,
      // pero por simplicidad, mantener valores por defecto
      const newUrl = generateAvatarUrl(features)
      setPreviewUrl(newUrl)
    }
  }, [isOpen, currentAvatar, features])

  // Función para actualizar una característica específica
  const updateFeature = (key: keyof AvatarFeatures, value: string) => {
    setFeatures((prevFeatures) => {
      const newFeatures = {
        ...prevFeatures,
        [key]: value,
      }

      return newFeatures
    })
  }

  // Función helper para selección aleatoria
  const getRandomChoice = <T,>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)]
  }

  // Función para randomizar todas las características
  const randomizeAll = () => {
    const newFeatures: AvatarFeatures = {
      accessories: getRandomChoice(CUSTOMIZATION_OPTIONS.accessories),
      backgroundColor: getRandomChoice(CUSTOMIZATION_OPTIONS.backgroundColor),
      headContrastColor: getRandomChoice(
        CUSTOMIZATION_OPTIONS.headContrastColor
      ),
      head: getRandomChoice(CUSTOMIZATION_OPTIONS.head),
      clothingColor: getRandomChoice(CUSTOMIZATION_OPTIONS.clothingColor),
      face: getRandomChoice(CUSTOMIZATION_OPTIONS.face),
      skinColor: getRandomChoice(CUSTOMIZATION_OPTIONS.skinColor),
      facialHair: getRandomChoice(CUSTOMIZATION_OPTIONS.facialHair),
      mask: getRandomChoice(CUSTOMIZATION_OPTIONS.mask),
    }

    setFeatures(newFeatures)
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
    <div className="relative h-full mt-6 border-t pt-6">
      <Card>
        <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">
            Customize Avatar
          </CardTitle>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={randomizeAll}
              className="flex items-center gap-2"
            >
              <Shuffle className="w-4 h-4" />
              Random
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="relative p-2 lg:p-6">
          <div className="relative h-full grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Preview */}
            <div className="z-20 sticky -top-8 md:relative md:top-0 lg:col-span-1 bg-neutral-100/20 backdrop-blur-xs backdrop-grayscale-25 rounded-lg p-6">
              <div className=" sticky top-0">
                <Label className="text-sm font-medium mb-3 block">
                  Preview
                </Label>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 bg-white">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Avatar Preview"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement

                          // Intentar con una URL más simple como fallback
                          const simpleFallback = `https://api.dicebear.com/9.x/open-peeps/png?seed=fallback-${Math.random()
                            .toString(36)
                            .substring(7)}&size=200&head=${
                            features.head
                          }&skinColor=${features.skinColor}&face=${
                            features.face
                          }`

                          if (target.src !== simpleFallback) {
                            target.src = simpleFallback
                          } else {
                            target.src =
                              'https://api.dicebear.com/9.x/open-peeps/png?seed=default&size=200'
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">
                          Loading...
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    onClick={() => onSave(previewUrl)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Save Avatar
                  </Button>
                </div>
              </div>
            </div>

            {/* Customization Options */}
            <div className="lg:col-span-2 space-y-6 px-1">
              {/* Fondo */}
              <ColorSelector
                label="Background Color"
                colors={CUSTOMIZATION_OPTIONS.backgroundColor}
                selected={features.backgroundColor}
                onChange={(color) => updateFeature('backgroundColor', color)}
              />

              {/* Color de Piel */}
              <ColorSelector
                label="Skin Color"
                colors={CUSTOMIZATION_OPTIONS.skinColor}
                selected={features.skinColor}
                onChange={(color) => updateFeature('skinColor', color)}
              />

              {/* Estilo de Cabeza/Cabello */}
              <OptionSelector
                label="Head/Hair Style"
                options={CUSTOMIZATION_OPTIONS.head}
                selected={features.head}
                onChange={(option) => updateFeature('head', option)}
                friendlyNames={FRIENDLY_NAMES.head}
              />

              {/* Color de Cabello */}
              <ColorSelector
                label="Hair Color"
                colors={CUSTOMIZATION_OPTIONS.headContrastColor}
                selected={features.headContrastColor}
                onChange={(color) => updateFeature('headContrastColor', color)}
              />

              {/* Expresión Facial */}
              <OptionSelector
                label="Face Expression"
                options={CUSTOMIZATION_OPTIONS.face}
                selected={features.face}
                onChange={(option) => updateFeature('face', option)}
                friendlyNames={FRIENDLY_NAMES.face}
              />

              {/* Color de Ropa */}
              <ColorSelector
                label="Clothing Color"
                colors={CUSTOMIZATION_OPTIONS.clothingColor}
                selected={features.clothingColor}
                onChange={(color) => updateFeature('clothingColor', color)}
              />

              {/* Accesorios */}
              <OptionSelector
                label="Accessories"
                options={CUSTOMIZATION_OPTIONS.accessories}
                selected={features.accessories}
                onChange={(option) => updateFeature('accessories', option)}
                friendlyNames={FRIENDLY_NAMES.accessories}
              />

              {/* Vello Facial */}
              <OptionSelector
                label="Facial Hair"
                options={CUSTOMIZATION_OPTIONS.facialHair}
                selected={features.facialHair}
                onChange={(option) => updateFeature('facialHair', option)}
                friendlyNames={FRIENDLY_NAMES.facialHair}
              />

              {/* Máscara */}
              <OptionSelector
                label="Mask"
                options={CUSTOMIZATION_OPTIONS.mask}
                selected={features.mask}
                onChange={(option) => updateFeature('mask', option)}
                friendlyNames={FRIENDLY_NAMES.mask}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// /* eslint-disable react-hooks/exhaustive-deps */
// /* eslint-disable @next/next/no-img-element */
// // src/components/ui/avatar-customizer.tsx

// 'use client'

// import React, { useState, useEffect } from 'react'
// import { Button } from '@/components/ui/button'
// import { Label } from '@/components/ui/label'
// import { Card, CardContent } from '@/components/ui/card'
// import { Shuffle, Check, X } from 'lucide-react'

// // Opciones de personalización
// const CUSTOMIZATION_OPTIONS = {
//   accessories: ['none', 'round', 'square', 'vintage', 'wayfarer'],
//   backgroundColor: [
//     'f8f9fa',
//     'e3f2fd',
//     'f3e5f5',
//     'e8f5e8',
//     'fff8e1',
//     'fce4ec',
//     'e0f2f1',
//     'fff3e0',
//     'f1f8e9',
//     'e8eaf6',
//     'fafafa',
//     'f5f5f5',
//     'eceff1',
//     'efefef',
//     'f7f7f7',
//     'e1f5fe',
//     'f9fbe7',
//     'fff9c4',
//     'ffecb3',
//     'ffe0b2',
//     'ffcdd2',
//     'd1c4e9',
//     'c8e6c9',
//     'b3e5fc',
//     'dcedc8',
//   ],
//   hairColor: [
//     '2c1b18',
//     '724133',
//     'b58143',
//     'd6b370',
//     'e6ca93',
//     'f7dc6f',
//     'a0522d',
//     '8b4513',
//     '000000',
//     '696969',
//     'dcdcdc',
//   ],
//   clothingColor: [
//     '3498db',
//     '2ecc71',
//     'e74c3c',
//     'f39c12',
//     '9b59b6',
//     '1abc9c',
//     'e67e22',
//     '34495e',
//     'e91e63',
//     '795548',
//     '607d8b',
//     '8bc34a',
//     'ff5722',
//     '673ab7',
//   ],
//   hair: [
//     'long01',
//     'long02',
//     'long03',
//     'long04',
//     'long05',
//     'long06',
//     'long07',
//     'long08',
//     'long09',
//     'long10',
//     'long11',
//     'long12',
//     'long13',
//     'long14',
//     'long15',
//     'short01',
//     'short02',
//     'short03',
//     'short04',
//     'short05',
//     'short06',
//     'short07',
//     'short08',
//     'short09',
//     'short10',
//     'short11',
//     'short12',
//     'short13',
//     'short14',
//     'short15',
//   ],
//   mouth: [
//     'concerned',
//     'default',
//     'disbelief',
//     'eating',
//     'grimace',
//     'sad',
//     'scream',
//     'serious',
//     'smile',
//     'tongue',
//   ],
//   eyes: [
//     'default',
//     'closed',
//     'cry',
//     'cute',
//     'hearts',
//     'side',
//     'squint',
//     'surprised',
//     'wink',
//     'winkWacky',
//   ],
//   skinColor: ['f8d25c', 'fdbcb4', 'ecad80', 'd08b5b', 'ae5d29', '614335'],
// }

// // Nombres más amigables para las opciones
// const FRIENDLY_NAMES = {
//   accessories: {
//     none: 'No accessories',
//     round: 'Round',
//     square: 'Square',
//     vintage: 'Vintage',
//     wayfarer: 'Wayfarer',
//   },
//   hair: {
//     long01: 'Long 1',
//     long02: 'Long 2',
//     long03: 'Long 3',
//     long04: 'Long 4',
//     long05: 'Long 5',
//     long06: 'Long 6',
//     long07: 'Long 7',
//     long08: 'Long 8',
//     long09: 'Long 9',
//     long10: 'Long 10',
//     long11: 'Long 11',
//     long12: 'Long 12',
//     long13: 'Long 13',
//     long14: 'Long 14',
//     long15: 'Long 15',
//     short01: 'Short 1',
//     short02: 'Short 2',
//     short03: 'Short 3',
//     short04: 'Short 4',
//     short05: 'Short 5',
//     short06: 'Short 6',
//     short07: 'Short 7',
//     short08: 'Short 8',
//     short09: 'Short 9',
//     short10: 'Short 10',
//     short11: 'Short 11',
//     short12: 'Short 12',
//     short13: 'Short 13',
//     short14: 'Short 14',
//     short15: 'Short 15',
//   },
//   mouth: {
//     concerned: 'Concerned',
//     default: 'Default',
//     disbelief: 'Disbelief',
//     eating: 'Eating',
//     grimace: 'Grimace',
//     sad: 'Sad',
//     scream: 'Scream',
//     serious: 'Serious',
//     smile: 'Smile',
//     tongue: 'Tongue',
//   },
//   eyes: {
//     default: 'Default',
//     closed: 'Closed',
//     cry: 'Cry',
//     cute: 'Cute',
//     hearts: 'Hearts',
//     side: 'Side',
//     squint: 'Squint',
//     surprised: 'Surprised',
//     wink: 'Wink',
//     winkWacky: 'Wink Wacky',
//   },
// }

// interface AvatarCustomizerProps {
//   isOpen: boolean
//   onClose: () => void
//   onSave: (avatarUrl: string) => void
//   currentAvatar?: string
// }

// interface AvatarFeatures {
//   accessories: string
//   backgroundColor: string
//   hairColor: string
//   hair: string
//   clothingColor: string
//   mouth: string
//   eyes: string
//   skinColor: string
// }

// export default function AvatarCustomizer({
//   isOpen,
//   onClose,
//   onSave,
//   currentAvatar,
// }: AvatarCustomizerProps) {
//   const [features, setFeatures] = useState<AvatarFeatures>({
//     accessories: 'none',
//     backgroundColor: 'f8f9fa',
//     hairColor: '724133',
//     hair: 'short01',
//     clothingColor: '3498db',
//     mouth: 'smile',
//     eyes: 'default',
//     skinColor: 'ecad80',
//   })
//   const [previewUrl, setPreviewUrl] = useState('')

//   console.log({ ...features })
//   console.log(previewUrl)

//   // Función mejorada para generar hash único
//   const generateUniqueHash = (features: AvatarFeatures): string => {
//     // Crear timestamp único + características para evitar colisiones
//     const timestamp = Date.now().toString(36)
//     const featuresString = Object.entries(features)
//       .map(([key, value]) => `${key}:${value}`)
//       .join('|')

//     // Hash más robusto
//     let hash = 0
//     const fullString = `${timestamp}-${featuresString}`

//     for (let i = 0; i < fullString.length; i++) {
//       const char = fullString.charCodeAt(i)
//       hash = (hash << 5) - hash + char
//       hash = hash & hash // Convert to 32bit integer
//     }

//     return Math.abs(hash).toString(36).substring(0, 12)
//   }

//   // Generar URL del avatar basado en las características actuales
//   const generateAvatarUrl = (currentFeatures: AvatarFeatures): string => {
//     const uniqueHash = generateUniqueHash(currentFeatures)

//     const params = new URLSearchParams({
//       seed: `custom-${uniqueHash}`,
//       size: '200',
//       backgroundColor: currentFeatures.backgroundColor,
//       hairColor: currentFeatures.hairColor,
//       hair: currentFeatures.hair,
//       clothingColor: currentFeatures.clothingColor,
//       mouth: currentFeatures.mouth,
//       eyes: currentFeatures.eyes,
//       skinColor: currentFeatures.skinColor,
//     })

//     // Solo agregar accesorios si no es 'none'
//     if (currentFeatures.accessories !== 'none') {
//       params.append('accessories', currentFeatures.accessories)
//       params.append('accessoriesColor', '000000')
//     }

//     return `https://api.dicebear.com/9.x/open-peeps/png?${params.toString()}`
//   }

//   // Actualizar preview cuando cambien las características
//   useEffect(() => {
//     const newUrl = generateAvatarUrl(features)
//     setPreviewUrl(newUrl)
//   }, [features])

//   // Inicializar desde avatar actual si existe
//   useEffect(() => {
//     if (currentAvatar && isOpen) {
//       // Si tienes un avatar actual, podrías intentar parsearlo,
//       // pero por simplicidad, mantener valores por defecto
//       const newUrl = generateAvatarUrl(features)
//       setPreviewUrl(newUrl)
//     }
//   }, [isOpen, currentAvatar])

//   // Función para actualizar una característica específica
//   const updateFeature = (key: keyof AvatarFeatures, value: string) => {
//     setFeatures((prev) => ({
//       ...prev,
//       [key]: value,
//     }))
//   }

//   // Función helper para selección aleatoria
//   const getRandomChoice = <T,>(array: T[]): T => {
//     return array[Math.floor(Math.random() * array.length)]
//   }

//   // Función para randomizar todas las características
//   const randomizeAll = () => {
//     const newFeatures: AvatarFeatures = {
//       accessories: getRandomChoice(CUSTOMIZATION_OPTIONS.accessories),
//       backgroundColor: getRandomChoice(CUSTOMIZATION_OPTIONS.backgroundColor),
//       hairColor: getRandomChoice(CUSTOMIZATION_OPTIONS.hairColor),
//       hair: getRandomChoice(CUSTOMIZATION_OPTIONS.hair),
//       clothingColor: getRandomChoice(CUSTOMIZATION_OPTIONS.clothingColor),
//       mouth: getRandomChoice(CUSTOMIZATION_OPTIONS.mouth),
//       eyes: getRandomChoice(CUSTOMIZATION_OPTIONS.eyes),
//       skinColor: getRandomChoice(CUSTOMIZATION_OPTIONS.skinColor),
//     }

//     setFeatures(newFeatures)
//   }

//   // Componente para selector de colores
//   const ColorSelector = ({
//     label,
//     colors,
//     selected,
//     onChange,
//   }: {
//     label: string
//     colors: string[]
//     selected: string
//     onChange: (color: string) => void
//   }) => (
//     <div className="space-y-2">
//       <Label className="text-sm font-medium">{label}</Label>
//       <div className="grid grid-cols-6 gap-2">
//         {colors.map((color) => (
//           <button
//             key={color}
//             type="button"
//             onClick={() => onChange(color)}
//             className={`w-8 h-8 rounded-full border-2 transition-all ${
//               selected === color
//                 ? 'border-blue-500 scale-110 shadow-md'
//                 : 'border-gray-300 hover:border-gray-400'
//             }`}
//             style={{ backgroundColor: `#${color}` }}
//             title={`#${color}`}
//           />
//         ))}
//       </div>
//     </div>
//   )

//   // Componente para selector de opciones
//   const OptionSelector = ({
//     label,
//     options,
//     selected,
//     onChange,
//     friendlyNames,
//   }: {
//     label: string
//     options: string[]
//     selected: string
//     onChange: (option: string) => void
//     friendlyNames?: Record<string, string>
//   }) => (
//     <div className="space-y-2">
//       <Label className="text-sm font-medium">{label}</Label>
//       <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
//         {options.map((option) => (
//           <button
//             key={option}
//             type="button"
//             onClick={() => onChange(option)}
//             className={`px-3 py-2 text-xs rounded-md border transition-all ${
//               selected === option
//                 ? 'bg-blue-500 text-white border-blue-500'
//                 : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
//             }`}
//           >
//             {friendlyNames?.[option] || option}
//           </button>
//         ))}
//       </div>
//     </div>
//   )

//   if (!isOpen) return null

//   return (
//     <div className="mt-6 border-t pt-6">
//       <Card>
//         <CardContent className="p-2 lg:p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h3 className="text-lg font-semibold">Customize Avatar</h3>
//             <div className="flex gap-2">
//               <Button
//                 type="button"
//                 variant="outline"
//                 size="sm"
//                 onClick={randomizeAll}
//                 className="flex items-center gap-2"
//               >
//                 <Shuffle className="w-4 h-4" />
//                 Random
//               </Button>
//               <Button
//                 type="button"
//                 variant="outline"
//                 size="sm"
//                 onClick={onClose}
//               >
//                 <X className="w-4 h-4" />
//               </Button>
//             </div>
//           </div>

//           <div className="z-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
//             {/* Preview */}
//             <div className="z-20 sticky -top-8 lg:col-span-1 bg-neutral-100/20 backdrop-blur-xs backdrop-grayscale-25 rounded-lg p-6">
//               <div className="sticky top-0">
//                 <Label className="text-sm font-medium mb-3 block">
//                   Preview
//                 </Label>
//                 <div className="flex flex-col items-center space-y-4">
//                   <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 bg-white">
//                     {previewUrl && (
//                       <img
//                         src={previewUrl}
//                         alt="Avatar Preview"
//                         width={128}
//                         height={128}
//                         className="w-full h-full object-cover"
//                         onError={(e) => {
//                           console.error('Error loading avatar:', e)
//                           // Fallback a un avatar simple si falla
//                           const target = e.target as HTMLImageElement
//                           target.src =
//                             'https://api.dicebear.com/7.x/open-peeps/png?seed=fallback&size=200'
//                         }}
//                       />
//                     )}
//                   </div>
//                   <Button
//                     type="button"
//                     onClick={() => onSave(previewUrl)}
//                     className="w-full bg-green-500 hover:bg-green-600 text-white"
//                   >
//                     <Check className="w-4 h-4 mr-2" />
//                     Save Avatar
//                   </Button>
//                 </div>
//               </div>
//             </div>

//             {/* Customization Options */}
//             <div className="lg:col-span-2 space-y-6 px-1">
//               {/* Fondo */}
//               <ColorSelector
//                 label="Background Color"
//                 colors={CUSTOMIZATION_OPTIONS.backgroundColor}
//                 selected={features.backgroundColor}
//                 onChange={(color) => updateFeature('backgroundColor', color)}
//               />

//               {/* Color de Piel */}
//               <ColorSelector
//                 label="Skin Color"
//                 colors={CUSTOMIZATION_OPTIONS.skinColor}
//                 selected={features.skinColor}
//                 onChange={(color) => updateFeature('skinColor', color)}
//               />

//               {/* Estilo de Cabello */}
//               <OptionSelector
//                 label="Hair Style"
//                 options={CUSTOMIZATION_OPTIONS.hair}
//                 selected={features.hair}
//                 onChange={(option) => updateFeature('hair', option)}
//                 friendlyNames={FRIENDLY_NAMES.hair}
//               />

//               {/* Color de Cabello */}
//               <ColorSelector
//                 label="Hair Color"
//                 colors={CUSTOMIZATION_OPTIONS.hairColor}
//                 selected={features.hairColor}
//                 onChange={(color) => updateFeature('hairColor', color)}
//               />

//               {/* Ojos */}
//               <OptionSelector
//                 label="Eyes Style"
//                 options={CUSTOMIZATION_OPTIONS.eyes}
//                 selected={features.eyes}
//                 onChange={(option) => updateFeature('eyes', option)}
//                 friendlyNames={FRIENDLY_NAMES.eyes}
//               />

//               {/* Boca */}
//               <OptionSelector
//                 label="Mouth Style"
//                 options={CUSTOMIZATION_OPTIONS.mouth}
//                 selected={features.mouth}
//                 onChange={(option) => updateFeature('mouth', option)}
//                 friendlyNames={FRIENDLY_NAMES.mouth}
//               />

//               {/* Color de Ropa */}
//               <ColorSelector
//                 label="Clothing Color"
//                 colors={CUSTOMIZATION_OPTIONS.clothingColor}
//                 selected={features.clothingColor}
//                 onChange={(color) => updateFeature('clothingColor', color)}
//               />

//               {/* Accesorios */}
//               <OptionSelector
//                 label="Accessories"
//                 options={CUSTOMIZATION_OPTIONS.accessories}
//                 selected={features.accessories}
//                 onChange={(option) => updateFeature('accessories', option)}
//                 friendlyNames={FRIENDLY_NAMES.accessories}
//               />
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

// /* eslint-disable @next/next/no-img-element */
// // src/components/ui/avatar-customizer.tsx

// 'use client'

// import React, { useState, useEffect } from 'react'
// import { Button } from '@/components/ui/button'
// import { Label } from '@/components/ui/label'
// import { Card, CardContent } from '@/components/ui/card'
// import { Shuffle, Check, X } from 'lucide-react'

// // Opciones de personalización (copiadas de tu avatar-peeps.ts)
// const CUSTOMIZATION_OPTIONS = {
//   accessories: ['none', 'round', 'square', 'vintage', 'wayfarer'],
//   backgroundColor: [
//     'f8f9fa',
//     'e3f2fd',
//     'f3e5f5',
//     'e8f5e8',
//     'fff8e1',
//     'fce4ec',
//     'e0f2f1',
//     'fff3e0',
//     'f1f8e9',
//     'e8eaf6',
//     'fafafa',
//     'f5f5f5',
//     'eceff1',
//     'efefef',
//     'f7f7f7',
//     'e1f5fe',
//     'f9fbe7',
//     'fff9c4',
//     'ffecb3',
//     'ffe0b2',
//     'ffcdd2',
//     'd1c4e9',
//     'c8e6c9',
//     'b3e5fc',
//     'dcedc8',
//   ],
//   hairColor: [
//     '2c1b18',
//     '724133',
//     'b58143',
//     'd6b370',
//     'e6ca93',
//     'f7dc6f',
//     'a0522d',
//     '8b4513',
//     '000000',
//     '696969',
//     'dcdcdc',
//   ],
//   clothingColor: [
//     '3498db',
//     '2ecc71',
//     'e74c3c',
//     'f39c12',
//     '9b59b6',
//     '1abc9c',
//     'e67e22',
//     '34495e',
//     'e91e63',
//     '795548',
//     '607d8b',
//     '8bc34a',
//     'ff5722',
//     '673ab7',
//   ],
//   hair: [
//     'long01',
//     'long02',
//     'long03',
//     'long04',
//     'long05',
//     'long06',
//     'long07',
//     'long08',
//     'long09',
//     'long10',
//     'long11',
//     'long12',
//     'long13',
//     'long14',
//     'long15',
//     'short01',
//     'short02',
//     'short03',
//     'short04',
//     'short05',
//     'short06',
//     'short07',
//     'short08',
//     'short09',
//     'short10',
//     'short11',
//     'short12',
//     'short13',
//     'short14',
//     'short15',
//   ],
//   mouth: [
//     'concerned',
//     'default',
//     'disbelief',
//     'eating',
//     'grimace',
//     'sad',
//     'scream',
//     'serious',
//     'smile',
//     'tongue',
//   ],
//   eyes: [
//     'default',
//     'closed',
//     'cry',
//     'cute',
//     'hearts',
//     'side',
//     'squint',
//     'surprised',
//     'wink',
//     'winkWacky',
//   ],
//   skinColor: ['f8d25c', 'fdbcb4', 'ecad80', 'd08b5b', 'ae5d29', '614335'],
// }

// // Nombres más amigables para las opciones
// const FRIENDLY_NAMES = {
//   accessories: {
//     none: 'No accesories',
//     round: 'Round',
//     square: 'Square',
//     vintage: 'Vintage',
//     wayfarer: 'Wayfarer',
//   },
//   hair: {
//     long01: 'Long 1',
//     long02: 'Long 2',
//     long03: 'Long 3',
//     long04: 'Long 4',
//     long05: 'Long 5',
//     long06: 'Long 6',
//     long07: 'Long 7',
//     long08: 'Long 8',
//     long09: 'Long 9',
//     long10: 'Long 10',
//     long11: 'Long 11',
//     long12: 'Long 12',
//     long13: 'Long 13',
//     long14: 'Long 14',
//     long15: 'Long 15',
//     short01: 'Short 1',
//     short02: 'Short 2',
//     short03: 'Short 3',
//     short04: 'Short 4',
//     short05: 'Short 5',
//     short06: 'Short 6',
//     short07: 'Short 7',
//     short08: 'Short 8',
//     short09: 'Short 9',
//     short10: 'Short 10',
//     short11: 'Short 11',
//     short12: 'Short 12',
//     short13: 'Short 13',
//     short14: 'Short 14',
//     short15: 'Short 15',
//   },
//   mouth: {
//     concerned: 'Concerned',
//     default: 'Default',
//     disbelief: 'Disbelief',
//     eating: 'Eating',
//     grimace: 'Grimace',
//     sad: 'Sad',
//     scream: 'Scream',
//     serious: 'Serious',
//     smile: 'Smile',
//     tongue: 'Tongue',
//   },
//   eyes: {
//     default: 'Default',
//     closed: 'Closed',
//     cry: 'Cry',
//     cute: 'Cute',
//     hearts: 'Hearts',
//     side: 'Side',
//     squint: 'Squint',
//     surprised: 'Surprised',
//     wink: 'Wink',
//     winkWacky: 'Wink Wacky',
//   },
// }

// interface AvatarCustomizerProps {
//   isOpen: boolean
//   onClose: () => void
//   onSave: (avatarUrl: string) => void
//   currentAvatar?: string
// }

// interface AvatarFeatures {
//   accessories: string
//   backgroundColor: string
//   hairColor: string
//   hair: string
//   clothingColor: string
//   mouth: string
//   eyes: string
//   skinColor: string
// }

// export default function AvatarCustomizer({
//   isOpen,
//   onClose,
//   onSave,
// }: // currentAvatar,
// AvatarCustomizerProps) {
//   const [features, setFeatures] = useState<AvatarFeatures>({
//     accessories: 'none',
//     backgroundColor: 'f8f9fa',
//     hairColor: '724133',
//     hair: 'short01',
//     clothingColor: '3498db',
//     mouth: 'smile',
//     eyes: 'default',
//     skinColor: 'ecad80',
//   })

//   const [previewUrl, setPreviewUrl] = useState('')

//   // Generar URL del avatar basado en las características actuales
//   const generateAvatarUrl = (currentFeatures: AvatarFeatures): string => {
//     // Crear un hash Short basado en las características para evitar URLs muy largas
//     const featuresString = Object.values(currentFeatures).join('|')
//     const shortHash = Math.abs(
//       featuresString.split('').reduce((a, b) => {
//         a = (a << 5) - a + b.charCodeAt(0)
//         return a & a
//       }, 0)
//     )
//       .toString(36)
//       .substring(0, 8)

//     const params = new URLSearchParams({
//       seed: `c-${shortHash}`, // Semilla más corta
//       size: '200',
//       backgroundColor: currentFeatures.backgroundColor,
//       hairColor: currentFeatures.hairColor,
//       hair: currentFeatures.hair,
//       clothingColor: currentFeatures.clothingColor,
//       mouth: currentFeatures.mouth,
//       eyes: currentFeatures.eyes,
//       skinColor: currentFeatures.skinColor,
//     })

//     // Solo agregar accesorios si no es 'none'
//     if (currentFeatures.accessories !== 'none') {
//       params.append('accessories', currentFeatures.accessories)
//       params.append('accessoriesColor', '000000')
//     }

//     return `https://api.dicebear.com/7.x/open-peeps/png?${params.toString()}`
//   }

//   // Actualizar preview cuando cambien las características
//   useEffect(() => {
//     const newUrl = generateAvatarUrl(features)
//     setPreviewUrl(newUrl)
//   }, [features])

//   // Función para actualizar una característica específica
//   const updateFeature = (key: keyof AvatarFeatures, value: string) => {
//     setFeatures((prev) => ({ ...prev, [key]: value }))
//   }
//   // Función para randomizar todas las características
//   const randomizeAll = () => {
//     // const randomChoice = <T>(array: T[]): T => {
//     //   return array[Math.floor(Math.random() * array.length)]
//     // }

//     const randomChoice = (array: string[]) => {
//       return array[Math.floor(Math.random() * array.length)]
//     }

//     setFeatures({
//       accessories: randomChoice(CUSTOMIZATION_OPTIONS.accessories),
//       backgroundColor: randomChoice(CUSTOMIZATION_OPTIONS.backgroundColor),
//       hairColor: randomChoice(CUSTOMIZATION_OPTIONS.hairColor),
//       hair: randomChoice(CUSTOMIZATION_OPTIONS.hair),
//       clothingColor: randomChoice(CUSTOMIZATION_OPTIONS.clothingColor),
//       mouth: randomChoice(CUSTOMIZATION_OPTIONS.mouth),
//       eyes: randomChoice(CUSTOMIZATION_OPTIONS.eyes),
//       skinColor: randomChoice(CUSTOMIZATION_OPTIONS.skinColor),
//     })
//   }

//   // Componente para selector de colores
//   const ColorSelector = ({
//     label,
//     colors,
//     selected,
//     onChange,
//   }: {
//     label: string
//     colors: string[]
//     selected: string
//     onChange: (color: string) => void
//   }) => (
//     <div className="space-y-2">
//       <Label className="text-sm font-medium">{label}</Label>
//       <div className="grid grid-cols-6 gap-2">
//         {colors.map((color) => (
//           <button
//             key={color}
//             type="button"
//             onClick={() => onChange(color)}
//             className={`w-8 h-8 rounded-full border-2 transition-all ${
//               selected === color
//                 ? 'border-blue-500 scale-110 shadow-md'
//                 : 'border-gray-300 hover:border-gray-400'
//             }`}
//             style={{ backgroundColor: `#${color}` }}
//             title={`#${color}`}
//           />
//         ))}
//       </div>
//     </div>
//   )

//   // Componente para selector de opciones
//   const OptionSelector = ({
//     label,
//     options,
//     selected,
//     onChange,
//     friendlyNames,
//   }: {
//     label: string
//     options: string[]
//     selected: string
//     onChange: (option: string) => void
//     friendlyNames?: Record<string, string>
//   }) => (
//     <div className="space-y-2">
//       <Label className="text-sm font-medium">{label}</Label>
//       <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
//         {options.map((option) => (
//           <button
//             key={option}
//             type="button"
//             onClick={() => onChange(option)}
//             className={`px-3 py-2 text-xs rounded-md border transition-all ${
//               selected === option
//                 ? 'bg-blue-500 text-white border-blue-500'
//                 : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
//             }`}
//           >
//             {friendlyNames?.[option] || option}
//           </button>
//         ))}
//       </div>
//     </div>
//   )

//   if (!isOpen) return null

//   return (
//     <div className="mt-6 border-t pt-6">
//       <Card>
//         <CardContent className="p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h3 className="text-lg font-semibold">Customize Avatar</h3>
//             <div className="flex gap-2">
//               <Button
//                 type="button"
//                 variant="outline"
//                 size="sm"
//                 onClick={randomizeAll}
//                 className="flex items-center gap-2"
//               >
//                 <Shuffle className="w-4 h-4" />
//                 Random
//               </Button>
//               <Button
//                 type="button"
//                 variant="outline"
//                 size="sm"
//                 onClick={onClose}
//               >
//                 <X className="w-4 h-4" />
//               </Button>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             {/* Preview */}
//             <div className="lg:col-span-1">
//               <div className="sticky top-6">
//                 <Label className="text-sm font-medium mb-3 block">
//                   Preview
//                 </Label>
//                 <div className="flex flex-col items-center space-y-4">
//                   <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 bg-white">
//                     {previewUrl && (
//                       <img
//                         src={previewUrl}
//                         alt="Avatar Preview"
//                         width={128}
//                         height={128}
//                         className="w-full h-full object-cover"
//                         onError={(e) => {
//                           console.error('Error loading avatar:', e)
//                           // Fallback a un avatar simple si falla
//                           e.currentTarget.src = '/avatar.png'
//                         }}
//                       />
//                     )}
//                   </div>
//                   <Button
//                     type="button"
//                     onClick={() => onSave(previewUrl)}
//                     className="w-full bg-green-500 hover:bg-green-600 text-white"
//                   >
//                     <Check className="w-4 h-4 mr-2" />
//                     Save
//                   </Button>
//                 </div>
//               </div>
//             </div>

//             {/* Customization Options */}
//             <div className="lg:col-span-2 space-y-6">
//               {/* Fondo */}
//               <ColorSelector
//                 label="Background Color"
//                 colors={CUSTOMIZATION_OPTIONS.backgroundColor}
//                 selected={features.backgroundColor}
//                 onChange={(color) => updateFeature('backgroundColor', color)}
//               />

//               {/* Color de Piel */}
//               <ColorSelector
//                 label="Skin Color"
//                 colors={CUSTOMIZATION_OPTIONS.skinColor}
//                 selected={features.skinColor}
//                 onChange={(color) => updateFeature('skinColor', color)}
//               />

//               {/* Estilo de Cabello */}
//               <OptionSelector
//                 label="Hair Style"
//                 options={CUSTOMIZATION_OPTIONS.hair}
//                 selected={features.hair}
//                 onChange={(option) => updateFeature('hair', option)}
//                 friendlyNames={FRIENDLY_NAMES.hair}
//               />

//               {/* Color de Cabello */}
//               <ColorSelector
//                 label="Hair Color"
//                 colors={CUSTOMIZATION_OPTIONS.hairColor}
//                 selected={features.hairColor}
//                 onChange={(color) => updateFeature('hairColor', color)}
//               />

//               {/* Ojos */}
//               <OptionSelector
//                 label="Eyes Style"
//                 options={CUSTOMIZATION_OPTIONS.eyes}
//                 selected={features.eyes}
//                 onChange={(option) => updateFeature('eyes', option)}
//                 friendlyNames={FRIENDLY_NAMES.eyes}
//               />

//               {/* Boca */}
//               <OptionSelector
//                 label="Mouth Style"
//                 options={CUSTOMIZATION_OPTIONS.mouth}
//                 selected={features.mouth}
//                 onChange={(option) => updateFeature('mouth', option)}
//                 friendlyNames={FRIENDLY_NAMES.mouth}
//               />

//               {/* Color de Ropa */}
//               <ColorSelector
//                 label="Clothing Color"
//                 colors={CUSTOMIZATION_OPTIONS.clothingColor}
//                 selected={features.clothingColor}
//                 onChange={(color) => updateFeature('clothingColor', color)}
//               />

//               {/* Accesorios */}
//               <OptionSelector
//                 label="Accessories"
//                 options={CUSTOMIZATION_OPTIONS.accessories}
//                 selected={features.accessories}
//                 onChange={(option) => updateFeature('accessories', option)}
//                 friendlyNames={FRIENDLY_NAMES.accessories}
//               />
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
