'use client'

// import { useState } from 'react'
// import { Eye } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'

// import { LogoutButton } from '@/components/logout-button'
// import { TabsNavigation } from '@/components/tabs'
// import { RepairsFilter } from '@/components/repairs-filter'
// import { RepairDetailModal } from '@/components/repair-detail-modal'

// import { RepairData, RepairDataStatusType } from '@/types/repair-type'

// import { REPAIR_LIST } from '@/data/repair-list'

// const adminTabs = [
//   { value: 'projects', label: 'Projects', href: '/admin/projects' },
//   { value: 'roles', label: 'Roles', href: '/admin/roles' },
//   { value: 'users', label: 'Users', href: '/admin/users' },
//   { value: 'repairs', label: 'Repairs', href: '/admin/repairs' },
// ]

export default function AdminRepairsPage() {
  // const [repairs, setRepairs] = useState(REPAIR_LIST)
  // const [selectedRepair, setSelectedRepair] = useState<RepairData>({})
  // const [isModalOpen, setIsModalOpen] = useState(false)

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

  // const handleViewRepair = (repair: any) => {
  //   setSelectedRepair(repair)
  //   setIsModalOpen(true)
  // }

  // const handleStatusUpdate = (repairId: string, status: RepairDataStatusType) => {
  //   console.log(`Updated repair ${repairId} status to ${status}`)
  //   // In a real app, you would update the status in your data
  //   setRepairs(
  //     repairs.map((repair) =>
  //       repair.id === repairId ? { ...repair, status: status as any } : repair
  //     )
  //   )
  // }

  return (
    <div className="flex flex-col gap-8 p-8">
      {/*
      

    
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
                  <TableCell>{repair.timestamp}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center capitalize rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
      )} */}
    </div>
  )
}
