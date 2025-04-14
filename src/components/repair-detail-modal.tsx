"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface RepairDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  repair: {
    id: string
    projectId: string
    drop: string
    level: string
    repairType: string
    date: string
    technician: string
    status: "Approved" | "Pending" | "Rejected"
  }
  onStatusUpdate?: (repairId: string, status: string) => void
}

export function RepairDetailModal({ open, onOpenChange, repair, onStatusUpdate }: RepairDetailModalProps) {
  const [status, setStatus] = useState(repair.status)

  const handleStatusUpdate = () => {
    onStatusUpdate?.(repair.id, status)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Repair {repair.id}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Project ID</Label>
              <p className="font-medium">{repair.projectId}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Date</Label>
              <p className="font-medium">{repair.date}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Drop</Label>
              <p className="font-medium">{repair.drop}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Level</Label>
              <p className="font-medium">{repair.level}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Repair Type</Label>
              <p className="font-medium">{repair.repairType}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Technician</Label>
              <p className="font-medium">{repair.technician}</p>
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="status" className="text-sm font-medium">
              Status
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status" className="mt-1">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleStatusUpdate} className="bg-orange-500 text-white hover:bg-orange-400">
            Update Status
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

