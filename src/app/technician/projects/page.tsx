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
import { TabsNavigation } from '@/components/tabs'

const technicianTabs = [
  { value: 'projects', label: 'My Projects', href: '/technician/projects' },
  { value: 'new-repair', label: 'New Repair', href: '/technician/new-repair' },
  { value: 'profile', label: 'Profile', href: '/technician/profile' },
]

export default function TechnicianProjectsPage() {
  const [expandedProjects, setExpandedProjects] = useState<
    Record<string, boolean>
  >({})

  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }))
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-orange-500">
          Technician Dashboard
        </h1>
        <LogoutButton />
      </div>

      <TabsNavigation tabs={technicianTabs} basePath="/technician" />

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
                            ? 'bg-completed-bg text-completed-text'
                            : project.status === 'In Progress'
                            ? 'bg-inprogress-bg text-inprogress-text'
                            : 'bg-pending-bg text-pending-text'
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
                                <TableRow key={index}>
                                  <TableCell>{repair.drop}</TableCell>
                                  <TableCell>{repair.level}</TableCell>
                                  <TableCell>{repair.repairType}</TableCell>
                                  <TableCell>
                                    <span
                                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                        repair.status === 'Approved'
                                          ? ' bg-approved-bg text-approved-text'
                                          : repair.status === 'Pending'
                                          ? 'bg-pending-bg text-pending-text'
                                          : 'bg-rejected-bg text-rejected-text'
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
