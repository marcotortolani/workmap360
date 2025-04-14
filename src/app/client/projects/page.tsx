/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LogoutButton } from '@/components/logout-button'
import { RepairDetailModal } from '@/components/repair-detail-modal'

export default function ClientProjectsPage() {
  const [expandedProjects, setExpandedProjects] = useState<
    Record<string, boolean>
  >({})
  const [selectedRepair, setSelectedRepair] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }))
  }

  const handleRepairClick = (repair: any, projectId: string) => {
    setSelectedRepair({
      ...repair,
      id: `REP-${Math.floor(Math.random() * 1000)}`,
      projectId,
      date: '2023-05-15',
      technician: 'Robert Johnson',
    })
    setIsModalOpen(true)
  }

  const handleStatusUpdate = (repairId: string, status: string) => {
    console.log(`Updated repair ${repairId} status to ${status}`)
    // In a real app, you would update the status in your data
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-orange-500">Client Dashboard</h1>
        <LogoutButton />
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">My Projects</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Project ID</TableHead>
                <TableHead>Drop Range</TableHead>
                <TableHead>Level Range</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <React.Fragment key={project.id}>
                  <TableRow
                    key={project.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleProject(project.id)}
                  >
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {expandedProjects[project.id] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{project.id}</TableCell>
                    <TableCell>{project.dropRange}</TableCell>
                    <TableCell>{project.levelRange}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          project.status === 'Completed'
                            ? 'bg-green-700 text-white'
                            : project.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {project.status}
                      </span>
                    </TableCell>
                  </TableRow>

                  {expandedProjects[project.id] && (
                    <TableRow>
                      <TableCell colSpan={5} className="p-0">
                        <div className="bg-gray-50 p-4">
                          <h3 className="mb-2 text-sm font-medium">Repairs</h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Drop</TableHead>
                                <TableHead>Level</TableHead>
                                <TableHead>Repair Type</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {project.repairs.map((repair, index) => (
                                <TableRow
                                  key={`repair-${repair}-${index}`}
                                  className="cursor-pointer hover:bg-gray-100"
                                  onClick={() =>
                                    handleRepairClick(repair, project.id)
                                  }
                                >
                                  <TableCell>{repair.drop}</TableCell>
                                  <TableCell>{repair.level}</TableCell>
                                  <TableCell>{repair.repairType}</TableCell>
                                  <TableCell>
                                    <span
                                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                        repair.status === 'Approved'
                                          ? 'bg-green-700 text-white'
                                          : repair.status === 'Pending'
                                          ? 'bg-orange-100 text-orange-800'
                                          : 'bg-gray-100 text-gray-800'
                                      }`}
                                    >
                                      {repair.status}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedRepair && (
        <RepairDetailModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          repair={selectedRepair}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  )
}

const projects = [
  {
    id: 'PRJ-001',
    dropRange: '10-20',
    levelRange: '1-5',
    status: 'In Progress',
    repairs: [
      {
        drop: '15',
        level: '3',
        repairType: 'Structural',
        status: 'Approved',
      },
      {
        drop: '18',
        level: '4',
        repairType: 'Electrical',
        status: 'Pending',
      },
    ],
  },
  {
    id: 'PRJ-002',
    dropRange: '15-25',
    levelRange: '3-8',
    status: 'Pending',
    repairs: [
      {
        drop: '20',
        level: '5',
        repairType: 'Mechanical',
        status: 'Pending',
      },
    ],
  },
  {
    id: 'PRJ-003',
    dropRange: '5-15',
    levelRange: '2-6',
    status: 'Completed',
    repairs: [
      {
        drop: '10',
        level: '4',
        repairType: 'Structural',
        status: 'Approved',
      },
      {
        drop: '12',
        level: '5',
        repairType: 'Electrical',
        status: 'Approved',
      },
      {
        drop: '8',
        level: '3',
        repairType: 'Plumbing',
        status: 'Rejected',
      },
    ],
  },
]
