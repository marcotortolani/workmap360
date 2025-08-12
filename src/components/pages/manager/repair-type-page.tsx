'use client'

import { useState } from 'react'
import { useRepairTypeStore } from '@/stores/repair-type-store'
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
//import { RepairsFilter } from '@/components/repairs-filter'
import { RepairTypeDetailModal } from '@/components/repair-type-detail-modal'
import { RepairType } from '@/types/repair-type'
import { Separator } from '@/components/ui/separator'

export default function ManagerRepairTypePage() {
  //const [repairs, setRepairs] = useState(repairsData)
  const [selectedRepair, setSelectedRepair] = useState<RepairType | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { repairTypeList, setRepairTypeList } = useRepairTypeStore()

  console.log(repairTypeList[4].unit_measure.type.replace('_', ' + '));
  

  // const handleFilter = (filters: any) => {
  //   console.log('Applying filters:', filters)
  //   // In a real app, you would filter the repairs based on the filters
  //   // For now, we'll just log the filters
  // }

  // const handleSort = (sort: any) => {
  //   console.log('Applying sort:', sort)
  //   // In a real app, you would sort the repairs based on the sort
  //   // For now, we'll just log the sort
  // }

  const handleViewRepair = (repair: RepairType) => {
    setSelectedRepair(repair)
    setIsModalOpen(true)
  }

  const handleStatusUpdate = (
    repairId: RepairType['id'],
    status: RepairType['status']
  ) => {
    console.log(`Updated repair ${repairId} status to ${status}`)
    // In a real app, you would update the status in your data
    setRepairTypeList(
      repairTypeList.map((repair) =>
        repair.id === repairId
          ? { ...repair, status: status as RepairType['status'] }
          : repair
      )
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Repair Type List</h2>
        </div>

        {/* <RepairsFilter onFilter={handleFilter} onSort={handleSort} /> */}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">ID</TableHead>
                <TableHead>Variation</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Measure Type</TableHead>
                <TableHead>Units to Measure</TableHead>
                <TableHead>Unit to Charge</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repairTypeList
                .filter((repair) => repair.status === 'active')
                .map((repair) => (
                  <TableRow key={repair.id}>
                    <TableCell className="font-medium">{repair.id}</TableCell>
                    <TableCell>{repair.variation}</TableCell>
                    <TableCell>{repair.type}</TableCell>
                    <TableCell>{repair.unit_measure.type}</TableCell>
                    <TableCell>{repair.unit_measure.value}</TableCell>
                    <TableCell>{repair.unit_to_charge}</TableCell>
                    <TableCell>{repair.created_by_user_name}</TableCell>
                    <TableCell>{repair.created_at}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center capitalize rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          repair.status === 'active'
                            ? 'bg-green-100 text-green-800'
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

          <Separator className=" my-14" />
          <h3 className="mt-4 mb-2 text-lg font-semibold">Inactive Repairs</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">ID</TableHead>
                <TableHead>Variation</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Measure Type</TableHead>
                <TableHead>Units to Measure</TableHead>
                <TableHead>Unit to Charge</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className=" bg-neutral-300 text-neutral-500 ">
              {repairTypeList
                .filter((repair) => repair.status === 'inactive')
                .map((repair) => (
                  <TableRow key={repair.id} className=" hover:bg-neutral-200">
                    <TableCell className="font-medium">{repair.id}</TableCell>
                    <TableCell>{repair.variation}</TableCell>
                    <TableCell>{repair.type}</TableCell>
                    <TableCell className=" capitalize bg-red-300 ">{repair?.unit_measure?.type?.replace('_', ' + ')}</TableCell>
                    <TableCell>{repair.unit_measure.value}</TableCell>
                    <TableCell>{repair.unit_to_charge}</TableCell>
                    <TableCell>{repair.created_by_user_name}</TableCell>
                    <TableCell>{repair.created_at}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center capitalize rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          repair.status === 'active'
                            ? 'bg-green-100 text-green-800'
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
        <RepairTypeDetailModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          repair={selectedRepair}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  )
}
