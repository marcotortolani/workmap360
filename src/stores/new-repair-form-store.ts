// src/stores/new-repair-form-store.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NewRepairFormData {
  project_id: number
  project_name: string
  drop: number
  level: number
  lastUpdated: string // Para saber cuándo fue la última vez que se actualizó
}

interface NewRepairFormStore {
  formData: NewRepairFormData | null

  // Acciones
  saveFormState: (data: Omit<NewRepairFormData, 'lastUpdated'>) => void
  clearFormState: () => void
  updateProject: (project_id: number, project_name: string) => void
  updateLocation: (drop: number, level: number) => void
  hasStoredData: () => boolean
  getStoredData: () => NewRepairFormData | null
  isDataFresh: (maxHours?: number) => boolean // Para verificar si los datos no son muy antiguos
}

export const useNewRepairFormStore = create<NewRepairFormStore>()(
  persist(
    (set, get) => ({
      formData: null,

      // Guardar estado completo del formulario
      saveFormState: (data) =>
        set({
          formData: {
            ...data,
            lastUpdated: new Date().toISOString(),
          },
        }),

      // Limpiar estado guardado
      clearFormState: () => set({ formData: null }),

      // Actualizar solo el proyecto
      updateProject: (project_id, project_name) => {
        const currentData = get().formData
        set({
          formData: {
            project_id,
            project_name,
            drop: currentData?.drop || 1,
            level: currentData?.level || 1,
            lastUpdated: new Date().toISOString(),
          },
        })
      },

      // Actualizar solo la ubicación (drop y level)
      updateLocation: (drop, level) => {
        const currentData = get().formData
        if (currentData) {
          set({
            formData: {
              ...currentData,
              drop,
              level,
              lastUpdated: new Date().toISOString(),
            },
          })
        }
      },

      // Verificar si hay datos guardados
      hasStoredData: () => {
        const data = get().formData
        return data !== null && data.project_id > 0
      },

      // Obtener datos guardados
      getStoredData: () => get().formData,

      // Verificar si los datos son recientes (por defecto 7 días)
      isDataFresh: (maxHours = 24 * 7) => {
        const data = get().formData
        if (!data || !data.lastUpdated) return false

        const lastUpdated = new Date(data.lastUpdated)
        const now = new Date()
        const hoursDiff =
          (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60)

        return hoursDiff <= maxHours
      },
    }),
    {
      name: 'new-repair-form-storage',
      // Solo persistir formData
      partialize: (state) => ({ formData: state.formData }),
    }
  )
)
