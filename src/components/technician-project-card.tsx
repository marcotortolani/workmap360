"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TechnicianProjectCardProps {
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
}

export function TechnicianProjectCard({ project }: TechnicianProjectCardProps) {
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
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Drop</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.repairs.map((repair, index) => (
                    <TableRow key={index}>
                      <TableCell>{repair.drop}</TableCell>
                      <TableCell>{repair.level}</TableCell>
                      <TableCell>{repair.repairType}</TableCell>
                      <TableCell>
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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

