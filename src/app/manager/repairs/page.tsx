/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RepairsFilter } from '@/components/repairs-filter'
import { RepairDetailModal } from '@/components/repair-detail-modal'

export default function ManagerRepairsPage() {
  const [repairs, setRepairs] = useState(repairsData)
  const [selectedRepair, setSelectedRepair] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleFilter = (filters: any) => {
    console.log('Applying filters:', filters)
    // In a real app, you would filter the repairs based on the filters
    // For now, we'll just log the filters
  }

  const handleSort = (sort: any) => {
    console.log('Applying sort:', sort)
    // In a real app, you would sort the repairs based on the sort
    // For now, we'll just log the sort
  }

  const handleViewRepair = (repair: any) => {
    setSelectedRepair(repair)
    setIsModalOpen(true)
  }

  const handleStatusUpdate = (repairId: string, status: string) => {
    console.log(`Updated repair ${repairId} status to ${status}`)
    // In a real app, you would update the status in your data
    setRepairs(
      repairs.map((repair) =>
        repair.id === repairId ? { ...repair, status: status as any } : repair
      )
    )
  }

  return (
    <div className="flex flex-col gap-8">

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Repairs</h2>
        </div>

        <RepairsFilter onFilter={handleFilter} onSort={handleSort} />

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Repair ID</TableHead>
                <TableHead>Project ID</TableHead>
                <TableHead>Drop</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Repair Type</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repairs.map((repair) => (
                <TableRow key={repair.id}>
                  <TableCell className="font-medium">{repair.id}</TableCell>
                  <TableCell>{repair.projectId}</TableCell>
                  <TableCell>{repair.drop}</TableCell>
                  <TableCell>{repair.level}</TableCell>
                  <TableCell>{repair.repairType}</TableCell>
                  <TableCell>{repair.technician}</TableCell>
                  <TableCell>{repair.date}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        repair.status === 'Approved'
                          ? 'bg-green-100 text-green-800'
                          : repair.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {repair.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                      onClick={() => handleViewRepair(repair)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
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

const repairsData = [
  {
    id: 'REP-001',
    projectId: 'PRJ-001',
    drop: '15',
    level: '3',
    repairType: 'Structural',
    technician: 'Robert Johnson',
    date: '2023-05-15',
    status: 'Approved',
  },
  {
    id: 'REP-002',
    projectId: 'PRJ-001',
    drop: '18',
    level: '4',
    repairType: 'Electrical',
    technician: 'Robert Johnson',
    date: '2023-05-18',
    status: 'Pending',
  },
  {
    id: 'REP-003',
    projectId: 'PRJ-002',
    drop: '20',
    level: '5',
    repairType: 'Mechanical',
    technician: 'Michael Brown',
    date: '2023-06-02',
    status: 'Pending',
  },
  {
    id: 'REP-004',
    projectId: 'PRJ-003',
    drop: '10',
    level: '4',
    repairType: 'Structural',
    technician: 'Robert Johnson',
    date: '2023-06-10',
    status: 'Approved',
  },
  {
    id: 'REP-005',
    projectId: 'PRJ-003',
    drop: '12',
    level: '5',
    repairType: 'Electrical',
    technician: 'Michael Brown',
    date: '2023-06-15',
    status: 'Approved',
  },
  {
    id: 'REP-006',
    projectId: 'PRJ-003',
    drop: '8',
    level: '3',
    repairType: 'Plumbing',
    technician: 'Robert Johnson',
    date: '2023-06-20',
    status: 'Rejected',
  },
]
