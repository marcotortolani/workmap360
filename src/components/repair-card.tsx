/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface RepairCardProps {
  repair: {
    id: string
    projectId: string
    drop: string
    level: string
    repairType: string
    technician: string
    date: string
    status: string
  }
  onView: (repair: any) => void
}

export function RepairCard({ repair, onView }: RepairCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{repair.id}</CardTitle>
          <Badge
            className={
              repair.status === "Approved"
                ? "bg-green-100 text-green-800 hover:bg-green-100"
                : repair.status === "Pending"
                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                  : "bg-red-100 text-red-800 hover:bg-red-100"
            }
          >
            {repair.status}
          </Badge>
        </div>
        <p className="text-sm text-gray-500">Project: {repair.projectId}</p>
      </CardHeader>

      {expanded && (
        <CardContent className="pb-2 pt-0">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="font-medium text-gray-500">Drop</p>
              <p>{repair.drop}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500">Level</p>
              <p>{repair.level}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500">Repair Type</p>
              <p>{repair.repairType}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500">Technician</p>
              <p>{repair.technician}</p>
            </div>
            <div className="col-span-2">
              <p className="font-medium text-gray-500">Date</p>
              <p>{repair.date}</p>
            </div>
          </div>
        </CardContent>
      )}

      <CardFooter className="flex justify-between pt-2">
        <Button variant="ghost" size="sm" className="text-gray-500" onClick={() => setExpanded(!expanded)}>
          {expanded ? (
            <>
              <ChevronUp className="mr-1 h-4 w-4" />
              Less
            </>
          ) : (
            <>
              <ChevronDown className="mr-1 h-4 w-4" />
              Details
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="text-orange-500 hover:bg-orange-50 hover:text-orange-600"
          onClick={() => onView(repair)}
        >
          <Eye className="mr-1 h-4 w-4" />
          View
        </Button>
      </CardFooter>
    </Card>
  )
}

