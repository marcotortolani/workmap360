'use client'

import { useState } from 'react'
import { Filter, SortAsc, SortDesc } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
// import { Calendar } from '@/components/ui/calendar'
// import { format } from 'date-fns'
// import { cn } from '@/lib/utils'

interface RepairsFilterProps {
  onFilter: (filters: unknown) => void
  onSort: (sort: unknown) => void
}

export function ProjectsFilter({ onFilter, onSort }: RepairsFilterProps) {
  //const [date, setDate] = useState<Date | undefined>(undefined)
  const [filters, setFilters] = useState({
    projectId: '',
    repairType: '',
    status: '',
    date: '',
    clientId: '',
    createdBy: '',
  })

  const [sort, setSort] = useState({
    column: 'date',
    direction: 'desc',
  })

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilter(newFilters)
  }

  // const handleDateSelect = (date: Date | undefined) => {
  //   setDate(date)
  //   if (date) {
  //     const formattedDate = format(date, 'yyyy-MM-dd')
  //     handleFilterChange('date', formattedDate)
  //   } else {
  //     handleFilterChange('date', '')
  //   }
  // }

  const handleSortChange = (column: string, direction: string) => {
    const newSort = { column, direction }
    setSort(newSort)
    onSort(newSort)
  }

  return (
    <div className="mb-4 space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-full sm:w-auto">
          <Label htmlFor="clientId" className="mb-1 block text-sm">
            Client
          </Label>
          <Select
            value={filters.projectId}
            onValueChange={(value) => handleFilterChange('clientId', value)}
          >
            <SelectTrigger id="clientId" className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              <SelectItem value="CL-001">CL-001</SelectItem>
              <SelectItem value="CL-002">CL-002</SelectItem>
              <SelectItem value="CL-003">CL-003</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-auto">
          <Label htmlFor="createdBy" className="mb-1 block text-sm">
            Created By
          </Label>
          <Select
            value={filters.projectId}
            onValueChange={(value) => handleFilterChange('createdBy', value)}
          >
            <SelectTrigger id="createdBy" className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Managers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Managers</SelectItem>
              <SelectItem value="Peter Smith">Peter Smith</SelectItem>
              <SelectItem value="John Doe">John Doe</SelectItem>
              <SelectItem value="Jane Doe">Jane Doe</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-auto">
          <Label htmlFor="repairType" className="mb-1 block text-sm">
            Repair Type
          </Label>
          <Select
            value={filters.repairType}
            onValueChange={(value) => handleFilterChange('repairType', value)}
          >
            <SelectTrigger id="repairType" className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Structural">Structural</SelectItem>
              <SelectItem value="Electrical">Electrical</SelectItem>
              <SelectItem value="Mechanical">Mechanical</SelectItem>
              <SelectItem value="Plumbing">Plumbing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-auto">
          <Label htmlFor="status" className="mb-1 block text-sm">
            Status
          </Label>
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger id="status" className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-process">In Process</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date */}
        {/* <div className="w-full sm:w-auto">
          <Label htmlFor="date" className="mb-1 block text-sm">
            Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal sm:w-[180px]',
                  !date && 'text-muted-foreground'
                )}
              >
                {date ? format(date, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div> */}

        <div className="w-full sm:w-auto">
          <Label htmlFor="sort" className="mb-1 block text-sm">
            Sort By
          </Label>
          <Select
            value={`${sort.column}-${sort.direction}`}
            onValueChange={(value) => {
              const [column, direction] = value.split('-')
              handleSortChange(column, direction)
            }}
          >
            <SelectTrigger id="sort" className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-asc">Date (Oldest first)</SelectItem>
              <SelectItem value="date-desc">Date (Newest first)</SelectItem>
              <SelectItem value="status-asc">Status (A-Z)</SelectItem>
              <SelectItem value="status-desc">Status (Z-A)</SelectItem>
              <SelectItem value="repairType-asc">Repair Type (A-Z)</SelectItem>
              <SelectItem value="repairType-desc">Repair Type (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          className="text-orange-500 hover:bg-orange-50 hover:text-orange-600"
          onClick={() => {
            setFilters({
              projectId: 'all',
              repairType: 'all',
              status: 'all',
              date: '',
              clientId: '',
              createdBy: '',
            })
            //setDate(undefined)
            onFilter({
              projectId: 'all',
              repairType: 'all',
              status: 'all',
              date: '',
            })
          }}
        >
          Clear Filters
        </Button>

        <div className="flex gap-2">
          <Button
            className="bg-orange-500 text-white hover:bg-orange-400"
            onClick={() => onFilter(filters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>

          <Button
            variant="outline"
            className="text-orange-500 hover:bg-orange-50 hover:text-orange-600"
            onClick={() => {
              const newDirection = sort.direction === 'asc' ? 'desc' : 'asc'
              handleSortChange(sort.column, newDirection)
            }}
          >
            {sort.direction === 'asc' ? (
              <SortAsc className="mr-2 h-4 w-4" />
            ) : (
              <SortDesc className="mr-2 h-4 w-4" />
            )}
            Sort
          </Button>
        </div>
      </div>
    </div>
  )
}
