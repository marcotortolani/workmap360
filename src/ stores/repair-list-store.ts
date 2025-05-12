// create a zustand store with persist
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { RepairType } from '@/types/repair-type'

import { REPAIR_LIST } from '@/data/repair-list'

interface RepairListStore {
  repairList: RepairType[]
  setRepairList: (repairList: RepairType[]) => void
}

export const useRepairListStore = create<RepairListStore>()(
  persist(
    (set) => ({
      repairList: REPAIR_LIST,
      setRepairList: (repairList) => set({ repairList }),
    }),
    {
      name: 'repair-list-storage',
    }
  )
)
