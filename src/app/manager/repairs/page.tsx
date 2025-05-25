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
import { RepairData, RepairDataStatusType } from '@/types/repair-type'

import { EXAMPLE_REPAIRS } from '@/data/data-example'

export default function ManagerRepairsPage() {
  const [repairs, setRepairs] = useState(EXAMPLE_REPAIRS)
  const [selectedRepair, setSelectedRepair] = useState<RepairData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleFilter = (filters: RepairData) => {
    console.log('Applying filters:', filters)
    // In a real app, you would filter the repairs based on the filters
    // For now, we'll just log the filters
  }

  const handleSort = (sort: RepairData) => {
    console.log('Applying sort:', sort)
    // In a real app, you would sort the repairs based on the sort
    // For now, we'll just log the sort
  }

  const handleViewRepair = (repair: RepairData) => {
    setSelectedRepair(repair)
    setIsModalOpen(true)
  }

  const handleStatusUpdate = ({
    repairId,
    status,
  }: {
    repairId: number
    status: RepairDataStatusType
  }) => {
    console.log(`Updated repair ${repairId} status to ${status}`)
    // In a real app, you would update the status in your data
    setRepairs(
      repairs.map((repair) =>
        repair.id === repairId ? { ...repair, status: status } : repair
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
                <TableHead className="w-12">ID</TableHead>
                <TableHead className="w-20">Type</TableHead>
                <TableHead className="w-10">Index</TableHead>
                <TableHead>Repair Code</TableHead>
                <TableHead>Project Name</TableHead>
                <TableHead>Elevation</TableHead>
                <TableHead>Drop</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Phases</TableHead>
                {/* <TableHead>Technicians</TableHead> */}
                {/* <TableHead>Date</TableHead> */}
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repairs.map((repair) => (
                <TableRow key={repair.id}>
                  <TableCell className="font-medium">#{repair.id}</TableCell>
                  <TableCell>
                    {/* {repair.repairType}{' '} */}
                    <span className="mx-1 px-2 py-0.5 bg-neutral-500 text-white rounded-md">
                      {repair.repairType}
                    </span>
                  </TableCell>
                  <TableCell>{repair.repairIndex}</TableCell>
                  <TableCell>
                    D{repair.drop}.L{repair.level}.{repair.repairType}.
                    {repair.repairIndex}
                  </TableCell>
                  <TableCell>{repair.projectName}</TableCell>
                  <TableCell>{repair.elevation}</TableCell>
                  <TableCell>{repair.drop}</TableCell>
                  <TableCell>{repair.level}</TableCell>
                  <TableCell>
                    <div className=" flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium ${
                          repair.phases.survey.createdAt !== 0
                            ? 'bg-green-300 text-green-900'
                            : 'bg-transparent text-black'
                        }`}
                      >
                        S
                      </span>
                      {repair.phases.progress.map((phase, index) => (
                        <span
                          key={index}
                          className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium ${
                            phase.createdAt !== 0
                              ? 'bg-green-300 text-green-900'
                              : 'bg-transparent text-black'
                          }`}
                        >
                          P{index + 1}
                        </span>
                      ))}
                      <span
                        className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium ${
                          repair.phases.finish.createdAt !== 0
                            ? 'bg-green-300 text-green-900'
                            : 'bg-transparent text-black'
                        }`}
                      >
                        F
                      </span>
                    </div>
                  </TableCell>
                  {/* <TableCell>{repair.technician}</TableCell> */}
                  {/* <TableCell>
                    {new Date(
                      repair.phases.survey.createdAt
                    ).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                    })}
                  </TableCell> */}
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        repair.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : repair.status === 'pending'
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
