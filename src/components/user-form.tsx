/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { AvatarUpload } from '@/components/avatar-upload'
import { UserType } from '@/types/user-types'

interface UserFormProps {
  user: UserType | null
  onSubmit?: (user: any) => void
}

export function UserForm({ user, onSubmit }: UserFormProps) {
  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    role: user?.role || '',
    status: user?.status || 'active',
    avatar: user?.avatar || null,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center sm:flex-row sm:items-start sm:gap-8">
        <AvatarUpload
          initialImage={formData.avatar || undefined}
          onImageChange={(image) => setFormData({ ...formData, avatar: image })}
        />

        <div className="mt-6 w-full space-y-4 sm:mt-0">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder="Enter first name"
                required
              />
            </div>

            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
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

      <Button
        type="submit"
        className="w-full bg-orange-500 text-white hover:bg-orange-400 sm:w-auto"
      >
        Save User
      </Button>
    </form>
  )
}
