// src/hooks/use-new-repair-form.ts

import { useCallback } from 'react'
import { useNewRepairFormStore } from '@/stores/new-repair-form-store'
import { ProjectData } from '@/types/project-types'

export const useNewRepairForm = () => {
  const {
    formData,
    saveFormState,
    clearFormState,
    updateProject,
    updateLocation,
    hasStoredData,
    getStoredData,
    isDataFresh,
  } = useNewRepairFormStore()

  // Restaurar estado del formulario si existe
  const restoreFormState = useCallback(
    (projects: ProjectData[]) => {
      const stored = getStoredData()
      if (!stored || !hasStoredData()) return null

      // Verificar que el proyecto aún existe en la lista
      const projectExists = projects.find((p) => p.id === stored.project_id)
      if (!projectExists) {
        // Si el proyecto ya no existe, limpiar los datos
        clearFormState()
        return null
      }

      // Verificar que los datos no sean muy antiguos
      if (!isDataFresh(24 * 7)) {
        // 7 días
        return {
          ...stored,
          isExpired: true,
        }
      }

      return {
        ...stored,
        isExpired: false,
      }
    },
    [getStoredData, hasStoredData, clearFormState, isDataFresh]
  )

  // Guardar proyecto seleccionado
  const saveProject = useCallback(
    (project: ProjectData) => {
      updateProject(project.id, project.name)
    },
    [updateProject]
  )

  // Guardar ubicación seleccionada
  const saveLocation = useCallback(
    (drop: number, level: number) => {
      updateLocation(drop, level)
    },
    [updateLocation]
  )

  // Guardar estado completo
  const saveComplete = useCallback(
    (project_id: number, project_name: string, drop: number, level: number) => {
      saveFormState({
        project_id,
        project_name,
        drop,
        level,
      })
    },
    [saveFormState]
  )

  return {
    // Estado
    formData,
    hasStoredData: hasStoredData(),

    // Acciones
    restoreFormState,
    saveProject,
    saveLocation,
    saveComplete,
    clearFormState,

    // Helpers
    isDataFresh: isDataFresh(),
    getLastUpdated: () =>
      formData?.lastUpdated ? new Date(formData.lastUpdated) : null,
  }
}
