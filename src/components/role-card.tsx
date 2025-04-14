"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface RoleCardProps {
  role: {
    id: number
    name: string
    permissions: string[]
  }
}

export function RoleCard({ role }: RoleCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{role.name}</CardTitle>
      </CardHeader>

      {expanded && (
        <CardContent className="pb-2 pt-0">
          <p className="mb-2 text-sm font-medium text-gray-500">Permissions:</p>
          <div className="flex flex-wrap gap-1">
            {role.permissions.map((permission, index) => (
              <Badge key={index} variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                {permission}
              </Badge>
            ))}
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
              Permissions
            </>
          )}
        </Button>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="text-orange-500 hover:bg-orange-50 hover:text-orange-600">
            <Edit className="mr-1 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50 hover:text-red-600">
            <Trash2 className="mr-1 h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

