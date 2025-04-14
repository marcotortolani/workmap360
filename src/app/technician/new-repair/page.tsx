"use client"

import { useState } from "react"
import { Camera, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LogoutButton } from "@/components/logout-button"
import { TabsNavigation } from "@/components/tabs"

const technicianTabs = [
  { value: "projects", label: "My Projects", href: "/technician/projects" },
  { value: "new-repair", label: "New Repair", href: "/technician/new-repair" },
  { value: "profile", label: "Profile", href: "/technician/profile" },
]

export default function TechnicianNewRepairPage() {
  const [formData, setFormData] = useState({
    projectId: "",
    drop: "",
    level: "",
    repairType: "",
    surveyImage: null,
    progressImage: null,
    finishImage: null,
  })

  const isFormComplete =
    formData.projectId &&
    formData.drop &&
    formData.level &&
    formData.repairType &&
    formData.surveyImage &&
    formData.progressImage &&
    formData.finishImage

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-orange-500">Technician Dashboard</h1>
        <LogoutButton />
      </div>

      <TabsNavigation tabs={technicianTabs} basePath="/technician" />

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">New Repair</h2>
        <form className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="sm:col-span-4">
              <label className="mb-2 block text-sm font-medium">Project ID</label>
              <Select
                value={formData.projectId}
                onValueChange={(value) => setFormData({ ...formData, projectId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRJ-001">PRJ-001 (Drop: 10-20, Level: 1-5)</SelectItem>
                  <SelectItem value="PRJ-002">PRJ-002 (Drop: 15-25, Level: 3-8)</SelectItem>
                  <SelectItem value="PRJ-003">PRJ-003 (Drop: 5-15, Level: 2-6)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Drop</label>
              <Input
                type="number"
                placeholder="Enter drop"
                value={formData.drop}
                onChange={(e) => setFormData({ ...formData, drop: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Level</label>
              <Input
                type="number"
                placeholder="Enter level"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium">Repair Type</label>
              <Select
                value={formData.repairType}
                onValueChange={(value) => setFormData({ ...formData, repairType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select repair type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="structural">Structural</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="mechanical">Mechanical</SelectItem>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Survey Image</label>
              <div className="mt-1 flex flex-col gap-2">
                <div className="flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer rounded-md bg-white font-medium text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 hover:text-orange-400">
                        <span>Upload a file</span>
                        <Input
                          type="file"
                          className="sr-only"
                          onChange={() => setFormData({ ...formData, surveyImage: "uploaded" })}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center justify-center"
                  onClick={() => setFormData({ ...formData, surveyImage: "camera" })}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Use Camera
                </Button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Progress Image</label>
              <div className="mt-1 flex flex-col gap-2">
                <div className="flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer rounded-md bg-white font-medium text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 hover:text-orange-400">
                        <span>Upload a file</span>
                        <Input
                          type="file"
                          className="sr-only"
                          onChange={() => setFormData({ ...formData, progressImage: "uploaded" })}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center justify-center"
                  onClick={() => setFormData({ ...formData, progressImage: "camera" })}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Use Camera
                </Button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Finish Image</label>
              <div className="mt-1 flex flex-col gap-2">
                <div className="flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer rounded-md bg-white font-medium text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 hover:text-orange-400">
                        <span>Upload a file</span>
                        <Input
                          type="file"
                          className="sr-only"
                          onChange={() => setFormData({ ...formData, finishImage: "uploaded" })}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center justify-center"
                  onClick={() => setFormData({ ...formData, finishImage: "camera" })}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Use Camera
                </Button>
              </div>
            </div>
          </div>

          <Button
            className="w-full bg-orange-500 text-white hover:bg-orange-400 disabled:bg-gray-300"
            disabled={!isFormComplete}
          >
            Submit Repair
          </Button>
        </form>
      </div>
    </div>
  )
}

