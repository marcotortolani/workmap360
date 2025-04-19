"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogoutButton } from "@/components/logout-button"
import { TabsNavigation } from "@/components/tabs"
import { AvatarUpload } from "@/components/avatar-upload"

const technicianTabs = [
  { value: "projects", label: "My Projects", href: "/technician/projects" },
  { value: "new-repair", label: "New Repair", href: "/technician/new-repair" },
  { value: "profile", label: "Profile", href: "/technician/profile" },
]

export default function TechnicianProfilePage() {
  const [formData, setFormData] = useState({
    firstName: "Robert",
    lastName: "Johnson",
    email: "robert.johnson@example.com",
    role: "Technician",
    password: "••••••••",
    createdDate: "2023-03-10",
    status: "active",
    avatar: "/placeholder.svg?height=120&width=120",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Profile updated:", formData)
    // In a real app, you would update the profile in your backend
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-orange-500">Technician Dashboard</h1>
        <LogoutButton />
      </div>

      <TabsNavigation tabs={technicianTabs} basePath="/technician" />

      <div className="w-1/2 rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold">My Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="w-full max-w-[200px]">
              <AvatarUpload
                initialImage={formData.avatar}
                onImageChange={(image) => setFormData({ ...formData, avatar: image || "" })}
              />
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Enter first name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="email" className="text-gray-500">
                    Email (Non-editable)
                  </Label>
                  <Input id="email" type="email" value={formData.email} disabled className="bg-gray-100" />
                </div>

                <div>
                  <Label htmlFor="role" className="text-gray-500">
                    Role (Non-editable)
                  </Label>
                  <Input id="role" value={formData.role} disabled className="bg-gray-100" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <Label htmlFor="createdDate" className="text-gray-500">
                    Created Date (Non-editable)
                  </Label>
                  <Input id="createdDate" value={formData.createdDate} disabled className="bg-gray-100" />
                </div>
              </div>

              <div>
                <Label htmlFor="status" className="text-gray-500">
                  Status (Non-editable)
                </Label>
                <div className="mt-1 flex items-center">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      formData.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {formData.status === "active" ? "Active" : "Inactive"}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">(Only Admin/Manager can change your status)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="bg-orange-500 text-white hover:bg-orange-400">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

