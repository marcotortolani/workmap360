import { UserType, UserRole } from './user-types'
import { ProjectData } from './project-types'

export type User = UserType
export type Role = UserRole
export type Project = ProjectData

export type Resource = 'users' | 'repair_types' | 'repairs' | 'projects'
export type Action = 'read' | 'create' | 'update' | 'delete'
