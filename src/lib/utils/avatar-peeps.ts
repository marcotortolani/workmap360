// lib/utils/avatar-peeps.ts

/**
 * 🎨 GENERADOR DE AVATARES OPEN PEEPS ALEATORIOS
 *
 * Esta función genera avatares Open Peeps completamente aleatorios
 * manteniendo consistencia en dimensiones y estilo facial
 */

// 🎭 OPCIONES ESTÉTICAS PARA RANDOMIZACIÓN
const PEEPS_OPTIONS = {
  // Tipos de accesorios válidos para Open Peeps
  accessories: ['round', 'square', 'vintage', 'wayfarer'],

  // Probabilidad de accesorios (30% de tener accesorios, 70% sin accesorios)
  accessoriesProbability: 30, // Porcentaje de probabilidad

  // Colores de fondo atractivos (sin blanco)
  backgroundColor: [
    'f8f9fa', // Gris muy claro
    'e3f2fd', // Azul muy claro
    'f3e5f5', // Púrpura muy claro
    'e8f5e8', // Verde muy claro
    'fff8e1', // Amarillo muy claro
    'fce4ec', // Rosa muy claro
    'e0f2f1', // Turquesa muy claro
    'fff3e0', // Naranja muy claro
    'f1f8e9', // Verde lima muy claro
    'e8eaf6', // Índigo muy claro
    'fafafa', // Gris neutral
    'f5f5f5', // Gris perla
    'eceff1', // Azul gris claro
    'efefef', // Gris cálido
    'f7f7f7', // Gris suave
    // Colores pastel más vibrantes
    'e1f5fe', // Cian claro
    'f9fbe7', // Lima claro
    'fff9c4', // Amarillo pastel
    'ffecb3', // Ámbar claro
    'ffe0b2', // Naranja pastel
    'ffcdd2', // Rojo pastel
    'd1c4e9', // Púrpura pastel
    'c8e6c9', // Verde pastel
    'b3e5fc', // Azul cielo pastel
    'dcedc8', // Verde claro pastel
  ],

  // Colores de cabello
  hairColor: [
    '2c1b18', // Marrón oscuro
    '724133', // Marrón medio
    'b58143', // Marrón claro
    'd6b370', // Rubio oscuro
    'e6ca93', // Rubio claro
    'f7dc6f', // Rubio muy claro
    'a0522d', // Auburn
    '8b4513', // Castaño
    '000000', // Negro
    '696969', // Gris
    'dcdcdc', // Plateado
  ],

  // Colores de ropa
  clothingColor: [
    '3498db', // Azul
    '2ecc71', // Verde
    'e74c3c', // Rojo
    'f39c12', // Naranja
    '9b59b6', // Púrpura
    '1abc9c', // Turquesa
    'e67e22', // Naranja oscuro
    '34495e', // Azul gris
    'e91e63', // Rosa
    '795548', // Marrón
    '607d8b', // Azul gris claro
    '8bc34a', // Verde claro
    'ff5722', // Naranja profundo
    '673ab7', // Púrpura profundo
  ],

  // Estilos de cabello
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

  // Expresiones faciales
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

  // Tipos de ojos
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

  // Colores de piel
  skinColor: [
    'f8d25c', // Amarillo claro
    'fdbcb4', // Rosa claro
    'ecad80', // Beige
    'd08b5b', // Marrón claro
    'ae5d29', // Marrón medio
    '614335', // Marrón oscuro
  ],
}

/**
 * 🎲 Genera un avatar Open Peeps completamente aleatorio
 *
 * @param size - Tamaño del avatar (default: 200)
 * @param seed - Semilla opcional para reproducibilidad (si no se proporciona, es totalmente random)
 * @returns URL del avatar PNG generado
 */
export function generateRandomPeepsAvatar(
  size: number = 200,
  seed?: string
): string {
  // 🎲 Función helper para selección aleatoria
  const randomChoice = <T>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)]
  }

  // 🎨 Generar características aleatorias
  const randomFeatures = {
    // Accesorios (con probabilidad reducida)
    accessories:
      Math.random() * 100 < PEEPS_OPTIONS.accessoriesProbability
        ? randomChoice(PEEPS_OPTIONS.accessories)
        : undefined, // undefined = sin accesorios

    // Color de fondo aleatorio
    backgroundColor: randomChoice(PEEPS_OPTIONS.backgroundColor),

    // Color de cabello aleatorio
    hairColor: randomChoice(PEEPS_OPTIONS.hairColor),

    // Estilo de cabello aleatorio
    hair: randomChoice(PEEPS_OPTIONS.hair),

    // Color de ropa aleatorio
    clothingColor: randomChoice(PEEPS_OPTIONS.clothingColor),

    // Expresión facial aleatoria
    mouth: randomChoice(PEEPS_OPTIONS.mouth),

    // Ojos aleatorios
    eyes: randomChoice(PEEPS_OPTIONS.eyes),

    // Color de piel aleatorio
    skinColor: randomChoice(PEEPS_OPTIONS.skinColor),
  }

  // 🔧 Construir parámetros de la URL
  const params = new URLSearchParams({
    // Semilla (para reproducibilidad o totalmente random)
    seed: seed || `${Date.now()}-${Math.random().toString(36).substring(7)}`,

    // Dimensiones fijas
    size: size.toString(),

    // Fondo aleatorio en lugar de transparente
    backgroundColor: randomFeatures.backgroundColor,

    // Características aleatorias
    hairColor: randomFeatures.hairColor,
    hair: randomFeatures.hair,
    clothingColor: randomFeatures.clothingColor,
    mouth: randomFeatures.mouth,
    eyes: randomFeatures.eyes,
    skinColor: randomFeatures.skinColor,
  })

  // Solo agregar accesorios si se generaron
  if (randomFeatures.accessories) {
    params.append('accessories', randomFeatures.accessories)
    params.append('accessoriesColor', '000000')
  }

  // 🎭 URL base de DiceBear Open Peeps
  const baseUrl = 'https://api.dicebear.com/7.x/open-peeps/png'

  return `${baseUrl}?${params.toString()}`
}

/**
 * 🎨 Genera múltiples avatares aleatorios para selección
 *
 * @param count - Número de avatares a generar (default: 6)
 * @param size - Tamaño de cada avatar (default: 200)
 * @returns Array de URLs de avatares
 */
export function generatePeepsAvatarOptions(
  count: number = 6,
  size: number = 200
): string[] {
  const avatars: string[] = []

  for (let i = 0; i < count; i++) {
    avatars.push(generateRandomPeepsAvatar(size))
  }

  return avatars
}

/**
 * 🎯 Genera avatar Peeps basado en iniciales (para consistencia por usuario)
 *
 * @param initials - Iniciales del usuario
 * @param size - Tamaño del avatar (default: 200)
 * @returns URL del avatar PNG
 */
export function generatePeepsAvatarFromInitials(
  initials: string,
  size: number = 200
): string {
  // Usar las iniciales como semilla para consistencia
  const seed = initials.toLowerCase().replace(/[^a-z]/g, '')

  // Generar hash simple de las iniciales para características consistentes
  const hashCode = (str: string): number => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convertir a 32bit integer
    }
    return Math.abs(hash)
  }

  const hash = hashCode(seed)

  // Seleccionar características basadas en hash para consistencia
  const features = {
    accessories:
      Math.random() * 100 < PEEPS_OPTIONS.accessoriesProbability
        ? PEEPS_OPTIONS.accessories[hash % PEEPS_OPTIONS.accessories.length]
        : undefined,
    // Color de fondo consistente basado en hash
    backgroundColor:
      PEEPS_OPTIONS.backgroundColor[
        hash % PEEPS_OPTIONS.backgroundColor.length
      ],
    hairColor: PEEPS_OPTIONS.hairColor[hash % PEEPS_OPTIONS.hairColor.length],
    hair: PEEPS_OPTIONS.hair[(hash + 1) % PEEPS_OPTIONS.hair.length],
    clothingColor:
      PEEPS_OPTIONS.clothingColor[
        (hash + 2) % PEEPS_OPTIONS.clothingColor.length
      ],
    mouth: PEEPS_OPTIONS.mouth[(hash + 3) % PEEPS_OPTIONS.mouth.length],
    eyes: PEEPS_OPTIONS.eyes[(hash + 4) % PEEPS_OPTIONS.eyes.length],
    skinColor:
      PEEPS_OPTIONS.skinColor[(hash + 5) % PEEPS_OPTIONS.skinColor.length],
  }

  const params = new URLSearchParams({
    seed: seed,
    size: size.toString(),
    backgroundColor: features.backgroundColor, // Usar fondo consistente
    hairColor: features.hairColor,
    hair: features.hair,
    clothingColor: features.clothingColor,
    mouth: features.mouth,
    eyes: features.eyes,
    skinColor: features.skinColor,
  })

  // Solo agregar accesorios si se generaron
  if (features.accessories) {
    params.append('accessories', features.accessories)
    params.append('accessoriesColor', '000000')
  }

  return `https://api.dicebear.com/7.x/open-peeps/png?${params.toString()}`
}

/**
 * 🎪 Genera un avatar Peeps con características específicas
 *
 * @param options - Opciones específicas para el avatar
 * @param size - Tamaño del avatar (default: 200)
 * @returns URL del avatar PNG
 */
export function generateCustomPeepsAvatar(
  options: {
    mood?: 'happy' | 'sad' | 'surprised' | 'neutral'
    style?: 'casual' | 'professional' | 'fun'
    accessories?: boolean
    backgroundColor?: string // Opción para fondo personalizado
  } = {},
  size: number = 200
): string {
  const {
    mood = 'neutral',
    style = 'casual',
    accessories = Math.random() > 0.7,
    backgroundColor, // Si no se especifica, será aleatorio
  } = options

  // Mapear mood a características faciales
  const moodMapping = {
    happy: { mouth: 'smile', eyes: 'default' },
    sad: { mouth: 'sad', eyes: 'cry' },
    surprised: { mouth: 'scream', eyes: 'surprised' },
    neutral: { mouth: 'default', eyes: 'default' },
  }

  // Mapear style a colores de ropa
  const styleMapping = {
    casual: ['3498db', '2ecc71', 'f39c12', 'e74c3c'],
    professional: ['34495e', '2c3e50', '7f8c8d', '95a5a6'],
    fun: ['e91e63', '9b59b6', 'ff5722', '8bc34a'],
  }

  const selectedFeatures = moodMapping[mood]
  const clothingColors = styleMapping[style]

  const params = new URLSearchParams({
    seed: `custom-${Date.now()}`,
    size: size.toString(),
    // Usar fondo personalizado o aleatorio
    backgroundColor:
      backgroundColor || randomChoice(PEEPS_OPTIONS.backgroundColor),
    hairColor: randomChoice(PEEPS_OPTIONS.hairColor),
    hair: randomChoice(PEEPS_OPTIONS.hair),
    clothingColor: randomChoice(clothingColors),
    mouth: selectedFeatures.mouth,
    eyes: selectedFeatures.eyes,
    skinColor: randomChoice(PEEPS_OPTIONS.skinColor),
  })

  // Solo agregar accesorios si se requieren
  if (accessories) {
    params.append('accessories', randomChoice(PEEPS_OPTIONS.accessories))
    params.append('accessoriesColor', '000000')
  }

  return `https://api.dicebear.com/7.x/open-peeps/png?${params.toString()}`
}

// 🎲 Helper function para selección aleatoria (reutilizable)
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

// 🎯 Exportar para fácil uso
export const PeepsAvatarGenerator = {
  random: generateRandomPeepsAvatar,
  fromInitials: generatePeepsAvatarFromInitials,
  multiple: generatePeepsAvatarOptions,
  custom: generateCustomPeepsAvatar,
}
