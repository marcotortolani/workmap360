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
import { FallbackAvatar } from './fallback-avatar'
import { LoaderPinwheelIcon } from 'lucide-react'

interface UserFormProps {
  user: UserType | null
  onSubmit?: (user: UserType) => void
  onCancel?: () => void
}

export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState({
    id: user?.id || null,
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    role: user?.role || '',
    status: user?.status || 'active',
    avatar: user?.avatar || null,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData as UserType)
    onCancel?.()
  }

  const handleRandomAvatar = () => {
    const newRandomAvatar =
      'https://avatar.iran.liara.run/public/' +
      Math.floor(Math.random() * 49 + 1).toString()
    setFormData({ ...formData, avatar: newRandomAvatar })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center sm:flex-row sm:items-start sm:gap-8">
        {/* <AvatarUpload
          initialImage={formData.avatar || newRandomAvatar}
          onImageChange={(image) => setFormData({ ...formData, avatar: image })}
        /> */}
        <div>
          <FallbackAvatar
            src={formData.avatar || ''}
            fallbackInitials={
              formData.first_name[0] + formData.last_name[0] || 'U'
            }
            className="h-24 w-24"
            alt="Avatar"
          />
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
                setFormData({ ...formData, role: value })
              }
              required
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="technician">Technician</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
              </SelectContent>
            </Select>
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
      <div className=" space-x-6">
        <Button variant="default" className="mt-4 " onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="w-full bg-green-600 text-white hover:bg-green-500 sm:w-auto transition-all duration-200 ease-in-out"
        >
          Save User
        </Button>
      </div>
    </form>
  )
}
