"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProjectCardProps {
  project: {
    id: string
    client: string
    dropRange: string
    levelRange: string
    price: string
    status: string
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{project.id}</CardTitle>
          <Badge
            className={
              project.status === "Completed"
                ? "bg-green-100 text-green-800 hover:bg-green-100"
                : project.status === "In Progress"
                  ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                  : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
            }
          >
            {project.status}
          </Badge>
        </div>
        <p className="text-sm text-gray-500">{project.client}</p>
      </CardHeader>

      {expanded && (
        <CardContent className="pb-2 pt-0">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="font-medium text-gray-500">Drop Range</p>
              <p>{project.dropRange}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500">Level Range</p>
              <p>{project.levelRange}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500">Price</p>
              <p>${project.price}</p>
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

        <Button variant="outline" size="sm" className="text-orange-500 hover:bg-orange-50 hover:text-orange-600">
          <Edit className="mr-1 h-4 w-4" />
          Edit
        </Button>
      </CardFooter>
    </Card>
  )
}

