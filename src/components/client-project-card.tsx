/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ClientProjectCardProps {
  project: {
    id: string
    dropRange: string
    levelRange: string
    status: string
    repairs: {
      drop: string
      level: string
      repairType: string
      status: string
    }[]
  }
  onRepairClick: (repair: any, projectId: string) => void
}

export function ClientProjectCard({ project, onRepairClick }: ClientProjectCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{project.id}</CardTitle>
          <Badge
            className={
              project.status === "Completed"
                ? "bg-green-700 text-white hover:bg-green-700"
                : project.status === "In Progress"
                  ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                  : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
            }
          >
            {project.status}
          </Badge>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pb-2 pt-0">
          <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="font-medium text-gray-500">Drop Range</p>
              <p>{project.dropRange}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500">Level Range</p>
              <p>{project.levelRange}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Repairs</h4>
            <div className="space-y-2">
              {project.repairs.map((repair, index) => (
                <div
                  key={index}
                  className="flex cursor-pointer items-center justify-between rounded-md border p-2 hover:bg-gray-50"
                  onClick={() => onRepairClick(repair, project.id)}
                >
                  <div className="text-sm">
                    <p>
                      <span className="font-medium">Drop:</span> {repair.drop},
                      <span className="font-medium"> Level:</span> {repair.level}
                    </p>
                    <p className="text-gray-500">{repair.repairType}</p>
                  </div>
                  <Badge
                    className={
                      repair.status === "Approved"
                        ? "bg-green-700 text-white hover:bg-green-700"
                        : repair.status === "Pending"
                          ? "bg-orange-100 text-orange-800 hover:bg-orange-100"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    }
                  >
                    {repair.status}
                  </Badge>
                </div>
              ))}
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
      </CardFooter>
    </Card>
  )
}

