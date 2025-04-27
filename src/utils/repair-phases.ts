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