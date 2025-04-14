/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserCardProps {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: string
    createdDate: string
    status: string
    avatar: string
  }
  onEdit: (user: any) => void
}

export function UserCard({ user, onEdit }: UserCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar>
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="bg-orange-100 text-orange-800">
            {user.firstName.charAt(0)}
            {user.lastName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-medium">
            {user.firstName} {user.lastName}
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
              {user.role}
            </Badge>
            <Badge
              className={
                user.status === "active"
                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                  : "bg-red-100 text-red-800 hover:bg-red-100"
              }
            >
              {user.status === "active" ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pb-2 pt-0">
          <div className="space-y-2 text-sm">
            <div>
              <p className="font-medium text-gray-500">Email</p>
              <p>{user.email}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500">Created Date</p>
              <p>{user.createdDate}</p>
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

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="text-orange-500 hover:bg-orange-50 hover:text-orange-600"
            onClick={() => onEdit(user)}
          >
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

