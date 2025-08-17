// src/utils/elevation-utils.ts

import { Elevation } from '@/types/project-types'

export interface DropRange {
  min: number
  max: number
  elevation: string
  totalDropsInElevation: number
}

export interface ElevationInfo {
  name: string
  drops: number
  levels: number
  dropRange: { min: number; max: number }
}

/**
 * Calcula el rango de drops para una elevation específica
 */
export const getDropRangeForElevation = (
  elevationName: string,
  elevations: Elevation[]
): DropRange | null => {
  if (!elevations || elevations.length === 0 || !elevationName) {
    return null
  }

  let accumulatedDrops = 0

  for (const elevation of elevations) {
    const min = accumulatedDrops + 1
    const max = accumulatedDrops + elevation.drops

    if (elevation.name === elevationName) {
      return {
        min,
        max,
        elevation: elevation.name,
        totalDropsInElevation: elevation.drops,
      }
    }

    accumulatedDrops += elevation.drops
  }

  return null
}

/**
 * Obtiene información completa de todas las elevations con sus rangos
 */
export const getAllElevationsWithRanges = (
  elevations: Elevation[]
): ElevationInfo[] => {
  if (!elevations || elevations.length === 0) {
    return []
  }

  let accumulatedDrops = 0

  return elevations.map((elevation) => {
    const min = accumulatedDrops + 1
    const max = accumulatedDrops + elevation.drops

    accumulatedDrops += elevation.drops

    return {
      name: elevation.name,
      drops: elevation.drops,
      levels: elevation.levels,
      dropRange: { min, max },
    }
  })
}

/**
 * Encuentra la elevation basada en un número de drop
 */
export const getElevationByDropNumber = (
  dropNumber: number,
  elevations: Elevation[]
): { elevation: Elevation; range: DropRange } | null => {
  if (!elevations || elevations.length === 0 || dropNumber < 1) {
    return null
  }

  let accumulatedDrops = 0

  for (const elevation of elevations) {
    const min = accumulatedDrops + 1
    const max = accumulatedDrops + elevation.drops

    if (dropNumber >= min && dropNumber <= max) {
      return {
        elevation,
        range: {
          min,
          max,
          elevation: elevation.name,
          totalDropsInElevation: elevation.drops,
        },
      }
    }

    accumulatedDrops += elevation.drops
  }

  return null
}

/**
 * Valida si un drop number está dentro del rango válido para una elevation
 */
export const isValidDropForElevation = (
  dropNumber: number,
  elevationName: string,
  elevations: Elevation[]
): boolean => {
  const range = getDropRangeForElevation(elevationName, elevations)
  if (!range) return false

  return dropNumber >= range.min && dropNumber <= range.max
}

/**
 * Obtiene el total de drops en todo el proyecto
 */
export const getTotalProjectDrops = (elevations: Elevation[]): number => {
  return elevations.reduce((total, elevation) => total + elevation.drops, 0)
}

/**
 * Obtiene el máximo de levels en todo el proyecto
 */
export const getMaxProjectLevels = (elevations: Elevation[]): number => {
  return elevations.reduce(
    (max, elevation) => Math.max(max, elevation.levels),
    0
  )
}
