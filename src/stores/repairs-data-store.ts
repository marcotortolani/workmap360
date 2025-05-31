// create a zustand store with persist
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { RepairData } from '@/types/repair-type'

import { EXAMPLE_REPAIRS } from '@/data/data-example'

interface RepairsDataListStore {
  repairsDataList: RepairData[]
  addRepair: (newRepair: RepairData) => void
  updateRepair: (updatedRepair: RepairData) => void
  deleteRepair: (repairId: number) => void
}

export const useRepairsDataStore = create<RepairsDataListStore>()(
  persist(
    (set) => ({
      repairsDataList: EXAMPLE_REPAIRS,
      addRepair: (newRepair) =>
        set((state) => ({
          repairsDataList: [...state.repairsDataList, newRepair],
        })),

      updateRepair: (updatedRepair) =>
        set((state) => ({
          repairsDataList: state.repairsDataList.map((repair) =>
            repair.id === updatedRepair.id ? updatedRepair : repair
          ),
        })),
      deleteRepair: (repairId) =>
        set((state) => ({
          repairsDataList: state.repairsDataList.filter(
            (repair) => repair.id !== repairId
          ),
        })),
    }),
    {
      name: 'repairs-data-storage',
    }
  )
)
