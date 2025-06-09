export type UserRole =
  | 'authenticated'
  | 'admin'
  | 'manager'
  | 'technician'
  | 'client'
  | 'guest'
type UserStatus = 'active' | 'inactive'

export interface UserType {
  id: number
  first_name: string
  last_name: string
  email: string
  role: UserRole
  created_at: string
  status: UserStatus
  avatar: string
}
