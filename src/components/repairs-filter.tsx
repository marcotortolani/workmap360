// src/components/repairs-filter.tsx

'use client'

import { useState, useMemo } from 'react'
import { Filter, X, Check, ChevronsUpDown, Search } from 'lucide-react'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { MultiSelect } from '@/components/ui/multi-select'
import { RepairDataStatusType } from '@/types/repair-type'
import { ProjectData, Elevation, TechnicianAssignment } from '@/types/project-types'
import { getDropRangeForElevation } from '@/lib/utils/elevation-utils'
import { REPAIR_TYPE_LIST } from '@/data/repair-type-list'
import { useTechniciansList } from '@/hooks/use-technicians-list'
import { cn } from '@/lib/utils'

export interface FilterOptions {
  status?: RepairDataStatusType | 'all'
  project?: { id: number; name: string }
  elevation?: string
  drop?: number | 'all'
  level?: number | 'all'
  repairCode?: string
  repairTypes?: string[]
  technician?: { id: number; name: string }
  sortBy?: 'created_at' | 'updated_at' | 'status' | 'project' | 'id'
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
  projects?: ProjectData[]
  elevations?: Elevation[]
}

export function RepairsFilter({
  onFilter,
  onSort,
  projects = [],
  elevations = [],
}: RepairsFilterProps) {
  const { technicians, loading: loadingTechnicians } = useTechniciansList()

  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    project: { id: 0, name: 'all' },
    elevation: 'all',
    drop: 'all',
    level: 'all',
    repairCode: '',
    repairTypes: [],
    technician: { id: 0, name: 'all' },
    sortBy: 'updated_at',
    sortOrder: 'desc',
  })

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isTechnicianOpen, setIsTechnicianOpen] = useState(false)
  const [technicianSearch, setTechnicianSearch] = useState('')

  // Prepare repair type options for MultiSelect
  const repairTypeOptions = REPAIR_TYPE_LIST.filter(
    (rt) => rt.status === 'active'
  ).map((rt) => ({
    value: rt.type,
    label: `${rt.type} - ${rt.variation}`,
    color: rt.color,
  }))

  const selectedProject = projects.find((p) => p.id === filters.project?.id)

  // Filter technicians by selected project
  const filteredTechnicians = useMemo(() => {
    let filtered = technicians

    // If project selected, filter by assigned technicians
    if (filters.project && filters.project.id !== 0) {
      if (!selectedProject) {
        return []
      }

      const assignedTechnicianIds = selectedProject.technicians?.map(
        (t: TechnicianAssignment) => t.technician_id
      ) || []

      filtered = technicians.filter((tech) => assignedTechnicianIds.includes(tech.id))
    }

    // Apply search filter
    if (technicianSearch.trim()) {
      const searchLower = technicianSearch.toLowerCase()
      filtered = filtered.filter((tech) => {
        const fullName = `${tech.first_name} ${tech.last_name}`.toLowerCase()
        return fullName.includes(searchLower)
      })
    }

    return filtered
  }, [technicians, filters.project, selectedProject, technicianSearch])

  const getDropConstraints = () => {
    if (!filters.project) {
      return {
        min: 1,
        max: 0,
        placeholder: 'Select project first',
        disabled: true,
      }
    }

    if (!selectedProject) {
      return { min: 1, max: 0, placeholder: 'Invalid project', disabled: true }
    }

    if (filters.elevation === 'all') {
      // Si no hay elevation específica, permitir todos los drops del proyecto
      const totalDrops = selectedProject.elevations.reduce(
        (total, elev) => total + elev.drops,
        0,
      )
      return {
        min: 1,
        max: totalDrops,
        placeholder: `1-${totalDrops} (All elevations)`,
        disabled: false,
      }
    }

    // Si hay elevation seleccionada, usar solo los drops de esa elevation
    const range = getDropRangeForElevation(
      filters.elevation as string,
      selectedProject.elevations,
    )
    if (range) {
      return {
        min: range.min,
        max: range.max,
        placeholder: `${range.min}-${range.max} (${range.elevation})`,
        disabled: false,
      }
    }

    return { min: 1, max: 0, placeholder: 'Invalid elevation', disabled: true }
  }

  const getLevelConstraints = () => {
    if (!filters.project) {
      return {
        min: 1,
        max: 0,
        placeholder: 'Select project first',
        disabled: true,
      }
    }

    if (!selectedProject) {
      return { min: 1, max: 0, placeholder: 'Invalid project', disabled: true }
    }

    if (filters.elevation === 'all') {
      // Si no hay elevation específica, usar el máximo de levels del proyecto
      const maxLevels = selectedProject.elevations.reduce(
        (max, elev) => Math.max(max, elev.levels),
        0,
      )
      return {
        min: 1,
        max: maxLevels,
        placeholder: `1-${maxLevels} (Max in project)`,
        disabled: false,
      }
    }

    // Si hay elevation seleccionada, usar los levels de esa elevation
    const selectedElevation = selectedProject.elevations.find(
      (e) => e.name === filters.elevation,
    )
    if (selectedElevation) {
      return {
        min: 1,
        max: selectedElevation.levels,
        placeholder: `1-${selectedElevation.levels} (${selectedElevation.name})`,
        disabled: false,
      }
    }

    return { min: 1, max: 0, placeholder: 'Invalid elevation', disabled: true }
  }

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    if (key === 'project') {
      const newProjectId = projects.find((p) => p.name === value)?.id || 0
      const newProject = projects.find((p) => p.id === newProjectId)

      // Check if current technician is assigned to the new project
      let newTechnician = filters.technician
      if (newProjectId !== 0 && filters.technician?.id !== 0) {
        const assignedTechIds = newProject?.technicians?.map(
          (t: TechnicianAssignment) => t.technician_id
        ) || []

        // If current technician is not in the new project, reset to "All"
        if (!assignedTechIds.includes(filters.technician?.id || 0)) {
          newTechnician = { id: 0, name: 'all' }
        }
      }

      const newFilters = {
        ...filters,
        [key]: {
          id: newProjectId,
          name: value,
        },
        elevation: 'all',
        drop: 'all',
        level: 'all',
        technician: newTechnician,
      }

      setFilters(newFilters)
      onFilter(newFilters)
      return
    }

    if (key === 'elevation') {
      setFilters({
        ...filters,
        [key]: value,
        drop: 'all',
        level: 'all',
      })
      onFilter({
        ...filters,
        [key]: value,
        drop: 'all',
        level: 'all',
      })
      return
    }

    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilter(newFilters)
  }

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-') as [
      FilterOptions['sortBy'],
      FilterOptions['sortOrder'],
    ]

    const newFilters = {
      ...filters,
      sortBy,
      sortOrder,
    }

    setFilters(newFilters)
    onSort({
      sortBy,
      sortOrder,
    })
  }

  const handleRepairTypesChange = (types: string[]) => {
    const newFilters = { ...filters, repairTypes: types }
    setFilters(newFilters)
    onFilter(newFilters)
  }

  const handleTechnicianChange = (value: string) => {
    if (value === 'all') {
      const newFilters = { ...filters, technician: { id: 0, name: 'all' } }
      setFilters(newFilters)
      onFilter(newFilters)
      return
    }

    // Find technician by full name
    const technician = technicians.find(
      (tech) => `${tech.first_name} ${tech.last_name}` === value
    )

    if (technician) {
      const newFilters = {
        ...filters,
        technician: { id: technician.id, name: value },
      }
      setFilters(newFilters)
      onFilter(newFilters)
    }
  }

  const clearFilters = () => {
    const defaultFilters: FilterOptions = {
      status: 'all',
      project: { id: 0, name: 'all' },
      elevation: 'all',
      drop: 'all',
      level: 'all',
      repairCode: '',
      repairTypes: [],
      technician: { id: 0, name: 'all' },
      sortBy: 'updated_at',
      sortOrder: 'desc',
    }
    setFilters(defaultFilters)
    onFilter(defaultFilters)
    onSort({
      sortBy: 'updated_at',
      sortOrder: 'desc',
    })
  }

  // Cuenta solo los filtros dentro del popover de Advanced Filters
  const advancedFiltersCount = [
    filters.project?.name !== 'all',
    filters.elevation !== 'all',
    filters.drop !== 'all',
    filters.level !== 'all',
  ].filter(Boolean).length

  // Cuenta todos los filtros activos (incluye los de fuera del popover)
  const activeFiltersCount = [
    filters.status !== 'all',
    filters.project?.name !== 'all',
    filters.elevation !== 'all',
    filters.drop !== 'all',
    filters.level !== 'all',
    filters.repairCode !== '',
    filters.repairTypes && filters.repairTypes.length > 0,
    filters.technician?.id !== 0,
  ].filter(Boolean).length

  return (
    <div className="mb-6 space-y-4">
      <div className="h-full flex flex-wrap xl:flex-nowrap wrap-anywhere gap-2">
        {/* Advanced Filters */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {advancedFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {advancedFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[80vw] min-w-2xs max-w-2xl ml-2 shadow-xl shadow-black/40">
            <div className="space-y-4">
              <h4 className="font-medium">Advanced Filters</h4>

              {/* Project Filter */}
              <div>
                <label className="text-sm font-medium">Project</label>
                <Select
                  value={selectedProject?.name || 'all'}
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
                      <SelectItem key={project.id} value={project.name}>
                        {project.name}
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
                    {elevations.map((elevation, i) => (
                      <SelectItem
                        key={`${i}-${elevation.name}`}
                        value={elevation.name}
                      >
                        {elevation.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Drops filter */}
              <div>
                {(() => {
                  const constraints = getDropConstraints()
                  return (
                    <>
                      <label className="text-sm font-medium">
                        Drops{' '}
                        {constraints.max > 0 &&
                          `(${constraints.min}-${constraints.max})`}
                      </label>
                      <Input
                        type="number"
                        value={filters.drop}
                        onChange={(e) =>
                          handleFilterChange('drop', e.target.value)
                        }
                        className="mt-1"
                        min={constraints.min}
                        max={constraints.max}
                        disabled={constraints.disabled}
                        placeholder={constraints.placeholder}
                      />
                    </>
                  )
                })()}
              </div>

              {/* Levels filter */}
              <div>
                {(() => {
                  const constraints = getLevelConstraints()
                  return (
                    <>
                      <label className="text-sm font-medium">
                        Levels{' '}
                        {constraints.max > 0 &&
                          `(${constraints.min}-${constraints.max})`}
                      </label>
                      <Input
                        type="number"
                        value={filters.level}
                        onChange={(e) =>
                          handleFilterChange('level', e.target.value)
                        }
                        className="mt-1"
                        min={constraints.min}
                        max={constraints.max}
                        disabled={constraints.disabled}
                        placeholder={constraints.placeholder}
                      />
                    </>
                  )
                })()}
              </div>

              <div className="flex justify-end">
                <Button size="sm" onClick={() => setIsFilterOpen(false)}>
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Repair Type Filter */}
        <div className="w-[180px]">
          <MultiSelect
            options={repairTypeOptions}
            value={filters.repairTypes || []}
            onValueChange={handleRepairTypesChange}
            placeholder="All Repair Types"
            maxDisplayed={2}
          />
        </div>

        {/* Technician Filter with Search */}
        <Popover
          open={isTechnicianOpen}
          onOpenChange={(open) => {
            setIsTechnicianOpen(open)
            if (!open) {
              setTechnicianSearch('') // Reset search when closing
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isTechnicianOpen}
              className="w-[200px] justify-between"
              disabled={loadingTechnicians}
            >
              <span className="truncate">
                {filters.technician?.id !== 0
                  ? filters.technician?.name
                  : filters.project?.id !== 0
                  ? `All (${filteredTechnicians.length})`
                  : 'All Technicians'}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-0">
            <div className="flex flex-col">
              {/* Search Input */}
              <div className="flex items-center border-b px-3 py-2">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Input
                  placeholder="Search technician..."
                  value={technicianSearch}
                  onChange={(e) => setTechnicianSearch(e.target.value)}
                  className="h-8 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              {/* Technicians List */}
              <ScrollArea className="h-[300px]">
                <div className="p-1">
                  {/* All Technicians Option */}
                  <button
                    onClick={() => {
                      handleTechnicianChange('all')
                      setIsTechnicianOpen(false)
                    }}
                    className={cn(
                      'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                      filters.technician?.id === 0 && 'bg-accent'
                    )}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        filters.technician?.id === 0
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    All Technicians
                  </button>

                  {/* Loading State */}
                  {loadingTechnicians && (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      Loading technicians...
                    </div>
                  )}

                  {/* Technicians */}
                  {!loadingTechnicians && filteredTechnicians.length > 0 ? (
                    filteredTechnicians.map((tech) => {
                      const fullName = `${tech.first_name} ${tech.last_name}`
                      const isSelected = filters.technician?.id === tech.id

                      return (
                        <button
                          key={tech.id}
                          onClick={() => {
                            handleTechnicianChange(fullName)
                            setIsTechnicianOpen(false)
                          }}
                          className={cn(
                            'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                            isSelected && 'bg-accent'
                          )}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              isSelected ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          {fullName}
                        </button>
                      )
                    })
                  ) : (
                    !loadingTechnicians && (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        {technicianSearch
                          ? 'No technician matches your search'
                          : 'No technicians available'}
                      </div>
                    )
                  )}
                </div>
              </ScrollArea>
            </div>
          </PopoverContent>
        </Popover>

        {/* Quick Status Filter */}
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated_at-desc">Recently Modified</SelectItem>
            <SelectItem value="updated_at-asc">Oldest Modified</SelectItem>
            <SelectItem value="created_at-desc">Recently Created</SelectItem>
            <SelectItem value="created_at-asc">Oldest Created</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear All Button */}
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear All
          </Button>
        )}
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
          {filters.project?.id !== 0 && filters.project?.name !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Project: {filters.project?.name}
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
          {filters.drop !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Drop: {filters.drop}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('drop', 'all')}
              />
            </Badge>
          )}
          {filters.level !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Level: {filters.level}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('level', 'all')}
              />
            </Badge>
          )}

          {filters.repairCode && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.repairCode}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('repairCode', '')}
              />
            </Badge>
          )}

          {filters.repairTypes &&
            filters.repairTypes.length > 0 &&
            filters.repairTypes.map((type) => (
              <Badge key={type} variant="secondary" className="gap-1">
                Type: {type}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() =>
                    handleRepairTypesChange(
                      filters.repairTypes!.filter((t) => t !== type)
                    )
                  }
                />
              </Badge>
            ))}

          {filters.technician?.id !== 0 && (
            <Badge variant="secondary" className="gap-1">
              Created by: {filters.technician?.name}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleTechnicianChange('all')}
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
