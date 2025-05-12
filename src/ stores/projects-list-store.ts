// create a zustand store with persist
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ProjectData } from '@/types/project-types'

import { EXAMPLE_PROJECTS } from '@/data/data-example'

interface ProjectsListStore {
  projectsList: ProjectData[]
  addProject: (newProject: ProjectData) => void
}

export const useProjectsListStore = create<ProjectsListStore>()(
  persist(
    (set) => ({
      projectsList: EXAMPLE_PROJECTS,
      addProject: (newProject) =>
        set((state) => ({
          projectsList: [...state.projectsList, newProject],
        })),
    }),
    {
      name: 'projects-list-storage',
    }
  )
)
