// src/components/projects-filter.tsx

'use client'

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { PROJECT_STATUS } from '@/types/project-types'

export interface ProjectFilterOptions {
  status?: (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS] | 'all'
  client?: string
  searchTerm?: string
  sortBy?: 'date' | 'status' | 'name' | 'id' | 'client'
  sortOrder?: 'asc' | 'desc'
}

interface ProjectsFilterProps {
  onFilter: (filters: ProjectFilterOptions) => void
  onSort: ({
    sortBy,
    sortOrder,
  }: {
    sortBy: ProjectFilterOptions['sortBy']
    sortOrder: ProjectFilterOptions['sortOrder']
  }) => void
  clients?: string[]
}

export function ProjectsFilter({
  onFilter,
  // onSort,
  clients = [],
}: ProjectsFilterProps) {
  const [filters, setFilters] = useState<ProjectFilterOptions>({
    status: 'all',
    client: 'all',
    searchTerm: '',
    sortBy: 'date',
    sortOrder: 'desc',
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const handleFilterChange = (
    key: keyof ProjectFilterOptions,
    value: string
  ) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilter(newFilters)
  }

  // const handleSortChange = (sortBy: string) => {
  //   const newSortOrder =
  //     filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc'

  //   const newFilters = {
  //     ...filters,
  //     sortBy: sortBy as ProjectFilterOptions['sortBy'],
  //     sortOrder: newSortOrder,
  //   }

  //   setFilters(newFilters as ProjectFilterOptions)
  //   onSort({
  //     sortBy: sortBy as ProjectFilterOptions['sortBy'],
  //     sortOrder: newSortOrder,
  //   })
  // }

  const clearFilters = () => {
    const defaultFilters: ProjectFilterOptions = {
      status: 'all',
      client: 'all',
      searchTerm: '',
      sortBy: 'date',
      sortOrder: 'desc',
    }
    setFilters(defaultFilters)
    onFilter(defaultFilters)
  }

  const activeFiltersCount = [
    filters.status !== 'all',
    filters.client !== 'all',
    filters.searchTerm !== '',
  ].filter(Boolean).length

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Quick Status Filter */}
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value={PROJECT_STATUS.pending}>Pending</SelectItem>
            <SelectItem value={PROJECT_STATUS['in-progress']}>
              In Progress
            </SelectItem>
            <SelectItem value={PROJECT_STATUS.completed}>Completed</SelectItem>
          </SelectContent>
        </Select>

        {/* Advanced Filters */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Advanced Filters</h4>

              {/* Client Filter */}
              <div>
                <label className="text-sm font-medium">Client</label>
                <Select
                  value={filters.client}
                  onValueChange={(value) => handleFilterChange('client', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All Clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client} value={client}>
                        {client}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground"
                >
                  Clear All
                </Button>
                <Button size="sm" onClick={() => setIsFilterOpen(false)}>
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Sort Options */}
        <div className="flex gap-2">
          {/* <Button
            variant="outline"
            size="sm"
            onClick={() => handleSortChange('date')}
            className={filters.sortBy === 'date' ? 'bg-accent' : ''}
          >
            {filters.sortOrder === 'asc' ? (
              <SortAsc className="h-4 w-4 mr-1" />
            ) : (
              <SortDesc className="h-4 w-4 mr-1" />
            )}
            Date
          </Button> */}
          {/* <Button
            variant="outline"
            size="sm"
            onClick={() => handleSortChange('name')}
            className={filters.sortBy === 'name' ? 'bg-accent' : ''}
          >
            {filters.sortOrder === 'asc' ? (
              <SortAsc className="h-4 w-4 mr-1" />
            ) : (
              <SortDesc className="h-4 w-4 mr-1" />
            )}
            Name
          </Button> */}
          {/* <Button
            variant="outline"
            size="sm"
            onClick={() => handleSortChange('client')}
            className={filters.sortBy === 'client' ? 'bg-accent' : ''}
          >
            {filters.sortOrder === 'asc' ? (
              <SortAsc className="h-4 w-4 mr-1" />
            ) : (
              <SortDesc className="h-4 w-4 mr-1" />
            )}
            Client
          </Button> */}
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('status', 'all')}
              />
            </Badge>
          )}
          {/* {filters.client !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Client: {filters.client}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('client', 'all')}
              />
            </Badge>
          )} */}
          {filters.searchTerm && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.searchTerm}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('searchTerm', '')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

// 'use client'

// import { useState } from 'react'
// import { Filter, SortAsc, SortDesc } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// // import {
// //   Popover,
// //   PopoverContent,
// //   PopoverTrigger,
// // } from '@/components/ui/popover'
// import { Label } from '@/components/ui/label'
// // import { Calendar } from '@/components/ui/calendar'
// // import { format } from 'date-fns'
// // import { cn } from '@/lib/utils'

// interface RepairsFilterProps {
//   onFilter: (filters: unknown) => void
//   onSort: (sort: unknown) => void
// }

// export function ProjectsFilter({ onFilter, onSort }: RepairsFilterProps) {
//   //const [date, setDate] = useState<Date | undefined>(undefined)
//   const [filters, setFilters] = useState({
//     projectId: '',
//     repairType: '',
//     status: '',
//     date: '',
//     clientId: '',
//     createdBy: '',
//   })

//   const [sort, setSort] = useState({
//     column: 'date',
//     direction: 'desc',
//   })

//   const handleFilterChange = (key: string, value: string) => {
//     const newFilters = { ...filters, [key]: value }
//     setFilters(newFilters)
//     onFilter(newFilters)
//   }

//   // const handleDateSelect = (date: Date | undefined) => {
//   //   setDate(date)
//   //   if (date) {
//   //     const formattedDate = format(date, 'yyyy-MM-dd')
//   //     handleFilterChange('date', formattedDate)
//   //   } else {
//   //     handleFilterChange('date', '')
//   //   }
//   // }

//   const handleSortChange = (column: string, direction: string) => {
//     const newSort = { column, direction }
//     setSort(newSort)
//     onSort(newSort)
//   }

//   return (
//     <div className="mb-4 space-y-4">
//       <div className="flex flex-wrap items-center gap-4">
//         <div className="w-full sm:w-auto">
//           <Label htmlFor="clientId" className="mb-1 block text-sm">
//             Client
//           </Label>
//           <Select
//             value={filters.projectId}
//             onValueChange={(value) => handleFilterChange('clientId', value)}
//           >
//             <SelectTrigger id="clientId" className="w-full sm:w-[180px]">
//               <SelectValue placeholder="All Clients" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Clients</SelectItem>
//               <SelectItem value="CL-001">CL-001</SelectItem>
//               <SelectItem value="CL-002">CL-002</SelectItem>
//               <SelectItem value="CL-003">CL-003</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="w-full sm:w-auto">
//           <Label htmlFor="createdBy" className="mb-1 block text-sm">
//             Created By
//           </Label>
//           <Select
//             value={filters.projectId}
//             onValueChange={(value) => handleFilterChange('createdBy', value)}
//           >
//             <SelectTrigger id="createdBy" className="w-full sm:w-[180px]">
//               <SelectValue placeholder="All Managers" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Managers</SelectItem>
//               <SelectItem value="Peter Smith">Peter Smith</SelectItem>
//               <SelectItem value="John Doe">John Doe</SelectItem>
//               <SelectItem value="Jane Doe">Jane Doe</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="w-full sm:w-auto">
//           <Label htmlFor="repairType" className="mb-1 block text-sm">
//             Repair Type
//           </Label>
//           <Select
//             value={filters.repairType}
//             onValueChange={(value) => handleFilterChange('repairType', value)}
//           >
//             <SelectTrigger id="repairType" className="w-full sm:w-[180px]">
//               <SelectValue placeholder="All Types" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Types</SelectItem>
//               <SelectItem value="Structural">Structural</SelectItem>
//               <SelectItem value="Electrical">Electrical</SelectItem>
//               <SelectItem value="Mechanical">Mechanical</SelectItem>
//               <SelectItem value="Plumbing">Plumbing</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="w-full sm:w-auto">
//           <Label htmlFor="status" className="mb-1 block text-sm">
//             Status
//           </Label>
//           <Select
//             value={filters.status}
//             onValueChange={(value) => handleFilterChange('status', value)}
//           >
//             <SelectTrigger id="status" className="w-full sm:w-[180px]">
//               <SelectValue placeholder="All Statuses" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Statuses</SelectItem>
//               <SelectItem value="pending">Pending</SelectItem>
//               <SelectItem value="in-process">In Process</SelectItem>
//               <SelectItem value="completed">Completed</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Date */}
//         {/* <div className="w-full sm:w-auto">
//           <Label htmlFor="date" className="mb-1 block text-sm">
//             Date
//           </Label>
//           <Popover>
//             <PopoverTrigger asChild>
//               <Button
//                 id="date"
//                 variant="outline"
//                 className={cn(
//                   'w-full justify-start text-left font-normal sm:w-[180px]',
//                   !date && 'text-muted-foreground'
//                 )}
//               >
//                 {date ? format(date, 'PPP') : 'Pick a date'}
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-auto p-0" align="start">
//               <Calendar
//                 mode="single"
//                 selected={date}
//                 onSelect={handleDateSelect}
//                 initialFocus
//               />
//             </PopoverContent>
//           </Popover>
//         </div> */}

//         <div className="w-full sm:w-auto">
//           <Label htmlFor="sort" className="mb-1 block text-sm">
//             Sort By
//           </Label>
//           <Select
//             value={`${sort.column}-${sort.direction}`}
//             onValueChange={(value) => {
//               const [column, direction] = value.split('-')
//               handleSortChange(column, direction)
//             }}
//           >
//             <SelectTrigger id="sort" className="w-full sm:w-[180px]">
//               <SelectValue placeholder="Sort by" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="date-asc">Date (Oldest first)</SelectItem>
//               <SelectItem value="date-desc">Date (Newest first)</SelectItem>
//               <SelectItem value="status-asc">Status (A-Z)</SelectItem>
//               <SelectItem value="status-desc">Status (Z-A)</SelectItem>
//               <SelectItem value="repairType-asc">Repair Type (A-Z)</SelectItem>
//               <SelectItem value="repairType-desc">Repair Type (Z-A)</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       <div className="flex justify-between">
//         <Button
//           variant="outline"
//           className="text-orange-500 hover:bg-orange-50 hover:text-orange-600"
//           onClick={() => {
//             setFilters({
//               projectId: 'all',
//               repairType: 'all',
//               status: 'all',
//               date: '',
//               clientId: '',
//               createdBy: '',
//             })
//             //setDate(undefined)
//             onFilter({
//               projectId: 'all',
//               repairType: 'all',
//               status: 'all',
//               date: '',
//             })
//           }}
//         >
//           Clear Filters
//         </Button>

//         <div className="flex gap-2">
//           <Button
//             className="bg-orange-500 text-white hover:bg-orange-400"
//             onClick={() => onFilter(filters)}
//           >
//             <Filter className="mr-2 h-4 w-4" />
//             Filter
//           </Button>

//           <Button
//             variant="outline"
//             className="text-orange-500 hover:bg-orange-50 hover:text-orange-600"
//             onClick={() => {
//               const newDirection = sort.direction === 'asc' ? 'desc' : 'asc'
//               handleSortChange(sort.column, newDirection)
//             }}
//           >
//             {sort.direction === 'asc' ? (
//               <SortAsc className="mr-2 h-4 w-4" />
//             ) : (
//               <SortDesc className="mr-2 h-4 w-4" />
//             )}
//             Sort
//           </Button>
//         </div>
//       </div>
//     </div>
//   )
// }
