// src/components/repairs-filter.tsx

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
import { RepairDataStatusType } from '@/types/repair-type'

export interface FilterOptions {
  status?: RepairDataStatusType | 'all'
  project?: string
  elevation?: string
  searchTerm?: string
  sortBy?: 'date' | 'status' | 'project' | 'id'
  sortOrder?: 'asc' | 'desc'
}

// export interface SortOptions {
//   sortBy: 'date' | 'status' | 'project' | 'id'
//   sortOrder: 'asc' | 'desc'
// }

interface RepairsFilterProps {
  onFilter: (filters: FilterOptions) => void
  onSort: ({
    sortBy,
    sortOrder,
  }: {
    sortBy: FilterOptions['sortBy']
    sortOrder: FilterOptions['sortOrder']
  }) => void
  projects?: string[]
  elevations?: string[]
}

export function RepairsFilter({
  onFilter,
  //onSort,
  projects = [],
  elevations = [],
}: RepairsFilterProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    project: 'all',
    elevation: 'all',
    searchTerm: '',
    sortBy: 'date',
    sortOrder: 'desc',
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilter(newFilters)
  }

  // const handleSortChange = (sortBy: string) => {
  //   const newSortOrder =
  //     filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc'

  //   const newFilters = {
  //     ...filters,
  //     sortBy: sortBy as FilterOptions['sortBy'],
  //     sortOrder: newSortOrder,
  //   }

  //   setFilters(newFilters as FilterOptions)
  //   onSort({
  //     sortBy: sortBy as FilterOptions['sortBy'],
  //     sortOrder: newSortOrder,
  //   })
  // }

  const clearFilters = () => {
    const defaultFilters: FilterOptions = {
      status: 'all',
      project: 'all',
      elevation: 'all',
      searchTerm: '',
      sortBy: 'date',
      sortOrder: 'desc',
    }
    setFilters(defaultFilters)
    onFilter(defaultFilters)
  }

  const activeFiltersCount = [
    filters.status !== 'all',
    filters.project !== 'all',
    filters.elevation !== 'all',
    filters.searchTerm !== '',
  ].filter(Boolean).length

  return (
    <div className="mb-6 space-y-4">
      <div className="h-full flex flex-wrap wrap-anywhere gap-2">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search repairs..."
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
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
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

              {/* Project Filter */}
              <div>
                <label className="text-sm font-medium">Project</label>
                <Select
                  value={filters.project}
                  onValueChange={(value) =>
                    handleFilterChange('project', value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project} value={project}>
                        {project}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Elevation Filter */}
              <div>
                <label className="text-sm font-medium">Elevation</label>
                <Select
                  value={filters.elevation}
                  onValueChange={(value) =>
                    handleFilterChange('elevation', value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All Elevations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Elevations</SelectItem>
                    {elevations.map((elevation) => (
                      <SelectItem key={elevation} value={elevation}>
                        {elevation}
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
        <div className=" flex gap-2">
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
            onClick={() => handleSortChange('id')}
            className={filters.sortBy === 'id' ? 'bg-accent' : ''}
          >
            {filters.sortOrder === 'asc' ? (
              <SortAsc className="h-4 w-4 mr-1" />
            ) : (
              <SortDesc className="h-4 w-4 mr-1" />
            )}
            ID
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
          {filters.project !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Project: {filters.project}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('project', 'all')}
              />
            </Badge>
          )}
          {filters.elevation !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Elevation: {filters.elevation}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('elevation', 'all')}
              />
            </Badge>
          )}
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

// /* eslint-disable @typescript-eslint/no-explicit-any */
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
//   onFilter: (filters: any) => void
//   onSort: (sort: any) => void
// }

// export function RepairsFilter({ onFilter, onSort }: RepairsFilterProps) {
//   //const [date, setDate] = useState<Date | undefined>(undefined)
//   const [filters, setFilters] = useState({
//     projectId: '',
//     repairType: '',
//     status: '',
//     date: '',
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
//           <Label htmlFor="projectId" className="mb-1 block text-sm">
//             Project ID
//           </Label>
//           <Select
//             value={filters.projectId}
//             onValueChange={(value) => handleFilterChange('projectId', value)}
//           >
//             <SelectTrigger id="projectId" className="w-full sm:w-[180px]">
//               <SelectValue placeholder="All Projects" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Projects</SelectItem>
//               <SelectItem value="PRJ-001">PRJ-001</SelectItem>
//               <SelectItem value="PRJ-002">PRJ-002</SelectItem>
//               <SelectItem value="PRJ-003">PRJ-003</SelectItem>
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
//               <SelectItem value="Pending">Pending</SelectItem>
//               <SelectItem value="Approved">Approved</SelectItem>
//               <SelectItem value="Rejected">Rejected</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

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
