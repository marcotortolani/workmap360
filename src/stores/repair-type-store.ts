// create a zustand store with persist
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { RepairType } from '@/types/repair-type'

import { REPAIR_TYPE_LIST } from '@/data/repair-type-list'

interface RepairListStore {
  repairTypeList: RepairType[]
  setRepairTypeList: (repairList: RepairType[]) => void
}

export const useRepairTypeStore = create<RepairListStore>()(
  persist(
    (set) => ({
      repairTypeList: REPAIR_TYPE_LIST,
      setRepairTypeList: (repairTypeList) => set({ repairTypeList }),
    }),
    {
      name: 'repair-type-list-storage',
    }
  )
)
