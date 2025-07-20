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

//import { RepairDetailModal } from '@/components/repair-detail-modal'

//import { RepairData } from '@/types/repair-type'

import { EXAMPLE_PROJECTS } from '@/data/data-example'

export default function ClientProjectsPage() {
  const [expandedProjects, setExpandedProjects] = useState<
    Record<string, boolean>
  >({})
  //const [selectedRepair, setSelectedRepair] = useState<RepairData>()
  //const [isModalOpen, setIsModalOpen] = useState(false)

  const toggleProject = (projectId: number) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }))
  }

  // const handleRepairClick = (repair: RepairData, projectId: number) => {
  //   setSelectedRepair({
  //     ...repair,
  //     id: `REP-${Math.floor(Math.random() * 1000)}`,
  //     projectId,
  //     status: 'pending',
  //     technician: 'Robert Johnson',
  //   })
  //   setIsModalOpen(true)
  // }

  // const handleStatusUpdate = (repairId: string, status: string) => {
  //   console.log(`Updated repair ${repairId} status to ${status}`)
  //   // In a real app, you would update the status in your data
  // }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">My Projects</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Project ID</TableHead>
                <TableHead>Elevations</TableHead>
                <TableHead>Drop Range</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {EXAMPLE_PROJECTS.map((project) => (
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
                    <TableCell>{project.elevations.length}</TableCell>
                    <TableCell>
                      {project.elevations.reduce(
                        (total, e) => total + e.drops,
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          project.status === 'completed'
                            ? 'bg-green-700 text-white'
                            : project.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {project.status}
                      </span>
                    </TableCell>
                  </TableRow>

                  {/* {expandedProjects[project.id] && (
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
                              {project.repairTypes.map((repair, index) => (
                                <TableRow
                                  key={`repair-${repair}-${index}`}
                                  className="cursor-pointer hover:bg-gray-100"
                                  // onClick={() =>
                                  //   handleRepairClick(repair, project.id)
                                  // }
                                >
                                  <TableCell>{repair.}</TableCell>
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
                  )} */}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* {selectedRepair && (
        <RepairDetailModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          repair={selectedRepair}
          onStatusUpdate={handleStatusUpdate}
        />
      )} */}
    </div>
  )
}
