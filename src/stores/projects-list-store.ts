// create a zustand store with persist
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ProjectData } from '@/types/project-types'

import { EXAMPLE_PROJECTS } from '@/data/data-example'

interface ProjectsListStore {
  projectsList: ProjectData[]
  addProject: (newProject: ProjectData) => void
  updateProject: (updatedProject: ProjectData) => void
  deleteProject: (projectId: number) => void
}

export const useProjectsListStore = create<ProjectsListStore>()(
  persist(
    (set) => ({
      projectsList: EXAMPLE_PROJECTS,
      addProject: (newProject) =>
        set((state) => ({
          projectsList: [...state.projectsList, newProject],
        })),
      updateProject: (updatedProject) =>
        set((state) => ({
          projectsList: state.projectsList.map((project) =>
            project.id === updatedProject.id ? updatedProject : project
          ),
        })),
      deleteProject: (projectId) =>
        set((state) => ({
          projectsList: state.projectsList.filter(
            (project) => project.id !== projectId
          ),
        })),
    }),
    {
      name: 'projects-list-storage',
    }
  )
)
