'use client'

import type React from 'react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

import { UserType } from '@/types/user-types'

import { LoaderPinwheelIcon } from 'lucide-react'
import { getUserInitials } from '@/lib/api/users'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { generateRandomPeepsAvatar } from '@/lib/utils/avatar-peeps'

interface UserFormProps {
  adminPermissions?: boolean
  user: UserType | null
  onSubmit?: (user: UserType) => void
  onCancel?: () => void
}

export function UserForm({
  adminPermissions,
  user,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const [formData, setFormData] = useState<Partial<UserType>>({
    id: user?.id || 0,
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    role: user?.role || 'guest',
    status: user?.status || 'active',
    avatar: user?.avatar || generateRandomPeepsAvatar(),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData as UserType)
    onCancel?.()
  }

  const handleRandomAvatar = async () => {
    const newAvatar = generateRandomPeepsAvatar()
    setTimeout(() => {
      setFormData({ ...formData, avatar: newAvatar })
    }, 100)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center sm:flex-row sm:items-start sm:gap-8">
        <div>
          <Avatar className="w-24 h-24 lg:w-36 lg:h-36  overflow-hidden  rounded-full">
            <AvatarImage src={formData?.avatar} alt="Avatar" />
            <AvatarFallback
              className="flex items-center justify-center lg:text-2xl bg-gradient-to-br font-bold text-sky-100 from-blue-500 to-purple-600"
              aria-disabled={formData?.avatar ? false : true}
            >
              {getUserInitials(formData as UserType)}
            </AvatarFallback>
          </Avatar>
          <Button
            type="button"
            onClick={handleRandomAvatar}
            variant="outline"
            className="mt-4"
          >
            <LoaderPinwheelIcon className="h-4 w-4 " />
            Random
          </Button>
        </div>

        <div className="mt-6 w-full space-y-4 sm:mt-0">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                placeholder="Enter first name"
                required
              />
            </div>

            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email address"
                required
              />
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value as UserType['role'] })
                }
                required
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {adminPermissions && (
                    <SelectItem value="admin">Admin</SelectItem>
                  )}
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Label htmlFor="status">Status</Label>
            <div className="flex items-center gap-2">
              <Switch
                id="status"
                checked={formData.status === 'active'}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    status: checked ? 'active' : 'inactive',
                  })
                }
              />
              <span className="text-sm font-medium">
                {formData.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className=" w-full flex items-center justify-center gap-10">
        <Button variant="default" className=" " onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="w-full bg-green-600 text-white hover:bg-green-500 sm:w-auto transition-all duration-200 ease-in-out"
          disabled={
            !formData.first_name ||
            !formData.last_name ||
            !formData.email ||
            !formData.role
          }
        >
          Save User
        </Button>
      </div>
    </form>
  )
}
