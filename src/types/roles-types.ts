export interface Role {
  id: number
  name: string
  description: string
}

export interface AdminType {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  createdDate: string
  status: string
  avatar: string
}

export interface ManagerType {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  createdDate: string
  status: string
  avatar: string
}

export interface TechnicianType {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  createdDate: string
  status: string
  avatar: string
}

export interface ClientType {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  createdDate: string
  status: string
  avatar: string
}
