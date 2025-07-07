import { RepairData } from '@/types/repair-type'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// utils/repair-phases.ts
export function getRepairPhases(phases: number): string[] {
  if (phases < 3 || phases > 10) {
    throw new Error('Phases must be between 3 and 10')
  }

  const basePhases = ['survey', 'progress', 'finish']
  if (phases === 3) {
    return basePhases
  }

  // Si phases > 3, expandimos "progress" en múltiples fases
  const progressPhasesCount = phases - 2 // Restamos survey y finish
  const progressPhases = Array.from({ length: progressPhasesCount }, (_, i) =>
    i === 0 ? 'progress' : `progress-${i}`
  )
  return ['survey', ...progressPhases, 'finish']
}

export function getRepairStatus(repair: RepairData) {
  if (repair.phases.finish && repair.phases.finish.created_at.length > 0)
    return 'finish'
  if (
    repair.phases.progress &&
    repair.phases.progress.some((p) => p.created_at.length > 0)
  )
    return 'progress'
  if (repair.phases.survey && repair.phases.survey.created_at.length > 0)
    return 'survey'
  return 'pending'
}

export function getRepairType(phases: RepairData['phases']) {
  if (phases.progress && phases.progress.some((p) => p.repair_type))
    return phases.progress[0].repair_type
  if (phases.survey && phases.survey.repair_type)
    return phases.survey.repair_type
  return null
}
