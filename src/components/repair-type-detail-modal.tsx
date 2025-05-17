'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

import { RepairType } from '@/types/repair-type'

interface RepairDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  repair: RepairType
  onStatusUpdate?: (
    repairId: RepairType['id'],
    status: RepairType['status']
  ) => void
}

export function RepairTypeDetailModal({
  open,
  onOpenChange,
  repair,
  onStatusUpdate,
}: RepairDetailModalProps) {
  const [status, setStatus] = useState(repair.status)

  const handleStatusUpdate = () => {
    onStatusUpdate?.(repair.id, status)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Repair ID: {repair.id}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Variation
              </Label>
              <p className="font-medium">{repair.variation}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Type</Label>
              <p className="font-medium">{repair.type}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Description
              </Label>
              <p className="font-medium">
                {repair.description ? repair.description : 'N/A'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Measure Type
              </Label>
              <p className="font-medium">{repair.unitMeasure.type}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Units To Measure
              </Label>
              <p className="font-medium">{repair.unitMeasure.value}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Unit to Charge
              </Label>
              <p className="font-medium">{repair.unitToCharge}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Created By
              </Label>
              <p className="font-medium">{repair.createdBy}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Created At
              </Label>
              <p className="font-medium">
                {new Date(repair.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="status" className="text-sm font-medium">
              Status
            </Label>
            <Select
              value={repair.status}
              onValueChange={(status) =>
                setStatus(status as RepairType['status'])
              }
            >
              <SelectTrigger id="status" className="mt-1">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleStatusUpdate}
            className="bg-orange-500 text-white hover:bg-orange-400"
          >
            Update Status
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
