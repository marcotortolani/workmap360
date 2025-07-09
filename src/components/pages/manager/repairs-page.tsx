// src/components/pages/manager/repairs-page.tsx

'use client'

import { useState, useMemo } from 'react'
import {
  Eye,
  Loader2,
  RefreshCw,
  MoreVertical,
  MapPin,
  Layers,
  Wrench,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FilterOptions, RepairsFilter } from '@/components/repairs-filter'
import { RepairDetailModal } from '@/components/repair-detail-modal'
import {
  RepairData,
  RepairDataStatusType,
  RepairPhase,
} from '@/types/repair-type'
import { getRepairType } from '@/lib/utils'
import { useRepairsList } from '@/hooks/use-repairs-list'
import { toast } from 'sonner'

// Componente de paginación responsive
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages = []
    const showPages = window.innerWidth < 640 ? 3 : 5 // Menos páginas en mobile

    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2))
    const endPage = Math.min(totalPages, startPage + showPages - 1)

    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mt-4 px-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1 || isLoading}
        className="text-xs sm:text-sm px-2 sm:px-3"
      >
        <span className="hidden sm:inline">Previous</span>
        <span className="sm:hidden">‹</span>
      </Button>

      {getPageNumbers().map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPageChange(page)}
          disabled={isLoading}
          className="text-xs sm:text-sm px-2 sm:px-3 min-w-[32px] sm:min-w-[36px]"
        >
          {page}
        </Button>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || isLoading}
        className="text-xs sm:text-sm px-2 sm:px-3"
      >
        <span className="hidden sm:inline">Next</span>
        <span className="sm:hidden">›</span>
      </Button>
    </div>
  )
}

// Componente para las fases
const PhasesDisplay = ({ repair }: { repair: RepairData }) => {
  const isPhaseComplete = (phase: RepairPhase): boolean => {
    return (phase && phase.created_at && phase.created_at.length > 0) || false
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      <Badge
        variant={
          isPhaseComplete(repair.phases.survey as RepairPhase)
            ? 'default'
            : 'outline'
        }
        className={`text-xs ${
          isPhaseComplete(repair.phases.survey as RepairPhase)
            ? 'bg-green-100 text-green-800 border-green-300'
            : 'bg-gray-100 text-gray-600'
        }`}
      >
        S
      </Badge>

      {repair.phases.progress?.map((phase, index) => (
        <Badge
          key={index}
          variant={
            isPhaseComplete(phase as RepairPhase) ? 'default' : 'outline'
          }
          className={`text-xs ${
            isPhaseComplete(phase as RepairPhase)
              ? 'bg-green-100 text-green-800 border-green-300'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          P{index + 1}
        </Badge>
      ))}

      <Badge
        variant={
          isPhaseComplete(repair.phases.finish as RepairPhase)
            ? 'default'
            : 'outline'
        }
        className={`text-xs ${
          isPhaseComplete(repair.phases.finish as RepairPhase)
            ? 'bg-green-100 text-green-800 border-green-300'
            : 'bg-gray-100 text-gray-600'
        }`}
      >
        F
      </Badge>
    </div>
  )
}

// Card component para mobile
const RepairCard = ({
  repair,
  onViewRepair,
}: {
  repair: RepairData
  onViewRepair: (repair: RepairData) => void
}) => {
  const repairCode = `D${repair.drop}.L${repair.level}.${getRepairType(
    repair.phases
  )}.${repair.repair_index}`

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-muted-foreground">
                #{repair.id}
              </span>
              <Badge variant="secondary" className="text-xs">
                {getRepairType(repair.phases)}
              </Badge>
            </div>
            <h3 className="font-semibold text-base truncate">{repairCode}</h3>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewRepair(repair)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span className="truncate">{repair.project_name}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <Layers className="h-3 w-3 text-muted-foreground" />
              <span className="truncate">{repair.elevation_name}</span>
            </div>
            <div className="text-center">
              <span className="text-muted-foreground">D:</span> {repair.drop}
            </div>
            <div className="text-center">
              <span className="text-muted-foreground">L:</span> {repair.level}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-3 w-3 text-muted-foreground" />
            <PhasesDisplay repair={repair} />
          </div>

          <Badge
            variant={
              repair.status === 'approved'
                ? 'default'
                : repair.status === 'pending'
                ? 'secondary'
                : 'destructive'
            }
            className={`text-xs ${
              repair.status === 'approved'
                ? 'bg-green-100 text-green-800'
                : repair.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {repair.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ManagerRepairsPage() {
  const {
    repairs,
    pagination,
    isLoading,
    error,
    refetch,
    setPage,
    setFilters: setApiFilters,
    currentPage,
    totalPages,
  } = useRepairsList(20)

  const [selectedRepair, setSelectedRepair] = useState<RepairData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<FilterOptions>({
    status: 'all',
    project: 'all',
    elevation: 'all',
    searchTerm: '',
    sortBy: 'date',
    sortOrder: 'desc',
  })

  // Obtener proyectos y elevaciones únicos para los filtros
  const uniqueProjects = useMemo(
    () => [...new Set(repairs.map((r) => r.project_name))],
    [repairs]
  )
  const uniqueElevations = useMemo(
    () => [...new Set(repairs.map((r) => r.elevation_name))],
    [repairs]
  )

  // Convertir filtros locales a filtros de API
  const convertFiltersToAPI = (filters: FilterOptions) => {
    const apiFilters: Record<string, string> = {}

    if (filters.status && filters.status !== 'all') {
      apiFilters.status = filters.status
    }

    if (filters.project && filters.project !== 'all') {
      apiFilters.project_name = filters.project
    }

    if (filters.elevation && filters.elevation !== 'all') {
      apiFilters.elevation_name = filters.elevation
    }

    return apiFilters
  }

  // Aplicar filtros locales (principalmente para búsqueda)
  const filteredRepairs = useMemo(() => {
    let filtered = [...repairs]

    // Aplicar filtro de búsqueda localmente
    if (localFilters.searchTerm) {
      const searchLower = localFilters.searchTerm.toLowerCase()
      filtered = filtered.filter((repair) => {
        const repairCode = `D${repair.drop}.L${repair.level}.${getRepairType(
          repair.phases
        )}.${repair.repair_index}`.toLowerCase()
        const projectName = repair.project_name.toLowerCase()
        const elevationName = repair.elevation_name.toLowerCase()
        const createdBy = repair.created_by_user_name?.toLowerCase() || ''

        return (
          repairCode.includes(searchLower) ||
          projectName.includes(searchLower) ||
          elevationName.includes(searchLower) ||
          createdBy.includes(searchLower) ||
          repair.id.toString().includes(searchLower)
        )
      })
    }

    return filtered
  }, [repairs, localFilters.searchTerm])

  const handleFilter = (newFilters: FilterOptions) => {
    setLocalFilters(newFilters)
    const apiFilters = convertFiltersToAPI(newFilters)
    setApiFilters(apiFilters)
  }

  const handleSort = ({
    sortBy,
    sortOrder,
  }: {
    sortBy: FilterOptions['sortBy']
    sortOrder: FilterOptions['sortOrder']
  }) => {
    setLocalFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder,
    }))
  }

  const handleViewRepair = (repair: RepairData) => {
    setSelectedRepair(repair)
    setIsModalOpen(true)
  }

  const handleStatusUpdate = async ({
    repairId,
    status,
  }: {
    repairId: number
    status: RepairDataStatusType
  }) => {
    try {
      console.log(`Updated repair ${repairId} status to ${status}`)
      await refetch()

      toast.success('Repair status updated successfully', {
        duration: 3000,
        position: 'bottom-right',
      })
    } catch (error) {
      toast.error('Failed to update repair status', {
        description: 'Error' + error,
        duration: 5000,
        position: 'bottom-right',
      })
    }
  }

  const handleRefresh = () => {
    refetch()
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 p-2 sm:p-4 lg:p-8 max-w-7xl mx-auto">
      <Card className="w-full">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl lg:text-2xl font-semibold">
                Repairs Management
              </CardTitle>
              {pagination && (
                <p className="text-sm text-muted-foreground mt-1">
                  Showing {filteredRepairs.length} of {pagination.total} repairs
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filtros */}
          <RepairsFilter
            onFilter={handleFilter}
            onSort={handleSort}
            projects={uniqueProjects}
            elevations={uniqueElevations}
          />

          {/* Loading State */}
          {isLoading && repairs.length === 0 && (
            <div className="flex justify-center items-center py-12">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-sm sm:text-base">Loading repairs...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && repairs.length === 0 && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <p className="text-red-600 mb-2 text-sm sm:text-base">
                  Error loading repairs
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                  {error}
                </p>
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Content */}
          {!isLoading || repairs.length > 0 ? (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden">
                {filteredRepairs.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-sm">
                      {localFilters.searchTerm
                        ? 'No repairs found matching the search criteria'
                        : 'No repairs found matching the current filters'}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {filteredRepairs.map((repair) => (
                      <RepairCard
                        key={repair.id}
                        repair={repair}
                        onViewRepair={handleViewRepair}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">ID</TableHead>
                        <TableHead className="w-20">Type</TableHead>
                        <TableHead className="w-16">Index</TableHead>
                        <TableHead className="min-w-[160px]">
                          Repair Code
                        </TableHead>
                        <TableHead className="min-w-[200px]">
                          Project Name
                        </TableHead>
                        <TableHead className="w-24">Elevation</TableHead>
                        <TableHead className="w-16">Drop</TableHead>
                        <TableHead className="w-16">Level</TableHead>
                        <TableHead className="w-32">Phases</TableHead>
                        <TableHead className="w-24">Status</TableHead>
                        <TableHead className="w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRepairs.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={11}
                            className="text-center py-8 text-muted-foreground"
                          >
                            {localFilters.searchTerm
                              ? 'No repairs found matching the search criteria'
                              : 'No repairs found matching the current filters'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRepairs.map((repair) => (
                          <TableRow
                            key={repair.id}
                            className="hover:bg-muted/50"
                          >
                            <TableCell className="font-medium">
                              #{repair.id}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {getRepairType(repair.phases)}
                              </Badge>
                            </TableCell>
                            <TableCell>{repair.repair_index}</TableCell>
                            <TableCell className="font-mono text-sm">
                              D{repair.drop}.L{repair.level}.
                              {getRepairType(repair.phases)}.
                              {repair.repair_index}
                            </TableCell>
                            <TableCell className="truncate max-w-[200px]">
                              {repair.project_name}
                            </TableCell>
                            <TableCell>{repair.elevation_name}</TableCell>
                            <TableCell>{repair.drop}</TableCell>
                            <TableCell>{repair.level}</TableCell>
                            <TableCell>
                              <PhasesDisplay repair={repair} />
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  repair.status === 'approved'
                                    ? 'default'
                                    : repair.status === 'pending'
                                    ? 'secondary'
                                    : 'destructive'
                                }
                                className={`text-xs ${
                                  repair.status === 'approved'
                                    ? 'bg-green-100 text-green-800'
                                    : repair.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {repair.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                                onClick={() => handleViewRepair(repair)}
                              >
                                <Eye className="mr-1 h-3 w-3" />
                                <span className="hidden xl:inline">View</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
                isLoading={isLoading}
              />
            </>
          ) : null}
        </CardContent>
      </Card>

      {selectedRepair && (
        <RepairDetailModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          repair={selectedRepair}
          onStatusUpdate={handleStatusUpdate}
          canEditStatus={true}
        />
      )}
    </div>
  )
}

// // src/components/pages/manager/repairs-page.tsx

// 'use client'

// import { useState, useMemo } from 'react'
// import { Eye, Loader2, RefreshCw } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'
// import { FilterOptions, RepairsFilter } from '@/components/repairs-filter'
// import { RepairDetailModal } from '@/components/repair-detail-modal'
// import {
//   RepairData,
//   RepairDataStatusType,
//   RepairPhase,
// } from '@/types/repair-type'
// import { getRepairType } from '@/lib/utils'
// import { useRepairsList } from '@/hooks/use-repairs-list'
// import { toast } from 'sonner'

// // Componente de paginación
// interface PaginationProps {
//   currentPage: number
//   totalPages: number
//   onPageChange: (page: number) => void
//   isLoading?: boolean
// }

// function Pagination({
//   currentPage,
//   totalPages,
//   onPageChange,
//   isLoading,
// }: PaginationProps) {
//   const getPageNumbers = () => {
//     const pages = []
//     const showPages = 5 // Mostrar 5 páginas a la vez

//     let startPage = Math.max(1, currentPage - Math.floor(showPages / 2))
//     const endPage = Math.min(totalPages, startPage + showPages - 1)

//     // Ajustar si estamos cerca del final
//     if (endPage - startPage + 1 < showPages) {
//       startPage = Math.max(1, endPage - showPages + 1)
//     }

//     for (let i = startPage; i <= endPage; i++) {
//       pages.push(i)
//     }

//     return pages
//   }

//   if (totalPages <= 1) return null

//   return (
//     <div className="flex items-center justify-center gap-2 mt-4">
//       <Button
//         variant="outline"
//         size="sm"
//         onClick={() => onPageChange(currentPage - 1)}
//         disabled={currentPage <= 1 || isLoading}
//       >
//         Previous
//       </Button>

//       {getPageNumbers().map((page) => (
//         <Button
//           key={page}
//           variant={page === currentPage ? 'default' : 'outline'}
//           size="sm"
//           onClick={() => onPageChange(page)}
//           disabled={isLoading}
//         >
//           {page}
//         </Button>
//       ))}

//       <Button
//         variant="outline"
//         size="sm"
//         onClick={() => onPageChange(currentPage + 1)}
//         disabled={currentPage >= totalPages || isLoading}
//       >
//         Next
//       </Button>
//     </div>
//   )
// }

// export default function ManagerRepairsPage() {
//   const {
//     repairs,
//     pagination,
//     isLoading,
//     error,
//     refetch,
//     setPage,
//     setFilters: setApiFilters,
//     currentPage,
//     totalPages,
//     // currentFilters,
//   } = useRepairsList(20)

//   const [selectedRepair, setSelectedRepair] = useState<RepairData | null>(null)
//   const [isModalOpen, setIsModalOpen] = useState(false)
//   const [localFilters, setLocalFilters] = useState<FilterOptions>({
//     status: 'all',
//     project: 'all',
//     elevation: 'all',
//     searchTerm: '',
//     sortBy: 'date',
//     sortOrder: 'desc',
//   })

//   // Obtener proyectos y elevaciones únicos para los filtros
//   const uniqueProjects = useMemo(
//     () => [...new Set(repairs.map((r) => r.project_name))],
//     [repairs]
//   )
//   const uniqueElevations = useMemo(
//     () => [...new Set(repairs.map((r) => r.elevation_name))],
//     [repairs]
//   )

//   // Convertir filtros locales a filtros de API
//   const convertFiltersToAPI = (filters: FilterOptions) => {
//     const apiFilters: Record<string, string> = {}

//     if (filters.status && filters.status !== 'all') {
//       apiFilters.status = filters.status
//     }

//     if (filters.project && filters.project !== 'all') {
//       apiFilters.project_name = filters.project
//     }

//     if (filters.elevation && filters.elevation !== 'all') {
//       apiFilters.elevation_name = filters.elevation
//     }

//     // Para búsqueda, podríamos implementar búsqueda en el backend
//     // Por ahora, la manejaremos localmente

//     return apiFilters
//   }

//   // Aplicar filtros locales (principalmente para búsqueda)
//   const filteredRepairs = useMemo(() => {
//     let filtered = [...repairs]

//     // Aplicar filtro de búsqueda localmente
//     if (localFilters.searchTerm) {
//       const searchLower = localFilters.searchTerm.toLowerCase()
//       filtered = filtered.filter((repair) => {
//         const repairCode = `D${repair.drop}.L${repair.level}.${getRepairType(
//           repair.phases
//         )}.${repair.repair_index}`.toLowerCase()
//         const projectName = repair.project_name.toLowerCase()
//         const elevationName = repair.elevation_name.toLowerCase()
//         const createdBy = repair.created_by_user_name?.toLowerCase() || ''

//         return (
//           repairCode.includes(searchLower) ||
//           projectName.includes(searchLower) ||
//           elevationName.includes(searchLower) ||
//           createdBy.includes(searchLower) ||
//           repair.id.toString().includes(searchLower)
//         )
//       })
//     }

//     return filtered
//   }, [repairs, localFilters.searchTerm])

//   const handleFilter = (newFilters: FilterOptions) => {
//     setLocalFilters(newFilters)

//     // Aplicar filtros que no son de búsqueda a la API
//     const apiFilters = convertFiltersToAPI(newFilters)
//     setApiFilters(apiFilters)
//   }

//   const handleSort = ({
//     sortBy,
//     sortOrder,
//   }: {
//     sortBy: FilterOptions['sortBy']
//     sortOrder: FilterOptions['sortOrder']
//   }) => {
//     setLocalFilters((prev) => ({
//       ...prev,
//       sortBy,
//       sortOrder,
//     }))

//     // La ordenación se podría implementar en el backend
//     // Por ahora, la manejaremos localmente si es necesario
//   }

//   const handleViewRepair = (repair: RepairData) => {
//     setSelectedRepair(repair)
//     setIsModalOpen(true)
//   }

//   const handleStatusUpdate = async ({
//     repairId,
//     status,
//   }: {
//     repairId: number
//     status: RepairDataStatusType
//   }) => {
//     try {
//       // Aquí implementarías la actualización del estado
//       // Por ejemplo, usando updateRepairStatusViaAPI
//       console.log(`Updated repair ${repairId} status to ${status}`)

//       // Refrescar la lista después de actualizar
//       await refetch()

//       toast.success('Repair status updated successfully', {
//         duration: 3000,
//         position: 'bottom-right',
//       })
//     } catch (error) {
//       toast.error('Failed to update repair status', {
//         description: 'Error' + error,
//         duration: 5000,
//         position: 'bottom-right',
//       })
//     }
//   }

//   // Función helper para verificar si una fase está completa
//   const isPhaseComplete = (phase: RepairPhase): boolean => {
//     return (phase && phase.created_at && phase.created_at.length > 0) || false
//   }

//   const handleRefresh = () => {
//     refetch()
//   }

//   return (
//     <div className="flex flex-col gap-8">
//       <div className="rounded-lg border bg-white p-6 shadow-sm">
//         <div className="mb-4 flex items-center justify-between">
//           <h2 className="text-xl font-semibold">
//             Repairs
//             {pagination && (
//               <span className="ml-2 text-sm font-normal text-muted-foreground">
//                 (Showing {filteredRepairs.length} of {pagination.total})
//               </span>
//             )}
//           </h2>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={handleRefresh}
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//             ) : (
//               <RefreshCw className="mr-2 h-4 w-4" />
//             )}
//             Refresh
//           </Button>
//         </div>

//         <RepairsFilter
//           onFilter={handleFilter}
//           onSort={handleSort}
//           projects={uniqueProjects}
//           elevations={uniqueElevations}
//         />

//         {/* Loading State */}
//         {isLoading && repairs.length === 0 && (
//           <div className="flex justify-center items-center py-12">
//             <div className="flex items-center gap-2">
//               <Loader2 className="h-6 w-6 animate-spin" />
//               <span>Loading repairs...</span>
//             </div>
//           </div>
//         )}

//         {/* Error State */}
//         {error && repairs.length === 0 && (
//           <div className="flex justify-center items-center py-12">
//             <div className="text-center">
//               <p className="text-red-600 mb-2">Error loading repairs</p>
//               <p className="text-sm text-muted-foreground mb-4">{error}</p>
//               <Button onClick={handleRefresh} variant="outline">
//                 Try Again
//               </Button>
//             </div>
//           </div>
//         )}

//         {/* Table */}
//         {!isLoading || repairs.length > 0 ? (
//           <>
//             <div className="overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead className="w-12">ID</TableHead>
//                     <TableHead className="w-20">Type</TableHead>
//                     <TableHead className="w-10">Index</TableHead>
//                     <TableHead>Repair Code</TableHead>
//                     <TableHead>Project Name</TableHead>
//                     <TableHead>Elevation</TableHead>
//                     <TableHead>Drop</TableHead>
//                     <TableHead>Level</TableHead>
//                     <TableHead>Phases</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {filteredRepairs.length === 0 ? (
//                     <TableRow>
//                       <TableCell
//                         colSpan={11}
//                         className="text-center py-8 text-muted-foreground"
//                       >
//                         {localFilters.searchTerm
//                           ? 'No repairs found matching the search criteria'
//                           : 'No repairs found matching the current filters'}
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     filteredRepairs.map((repair) => (
//                       <TableRow key={repair.id}>
//                         <TableCell className="font-medium">
//                           #{repair.id}
//                         </TableCell>
//                         <TableCell>
//                           <span className="mx-1 px-2 py-0.5 bg-neutral-500 text-white rounded-md">
//                             {getRepairType(repair.phases)}
//                           </span>
//                         </TableCell>
//                         <TableCell>{repair.repair_index}</TableCell>
//                         <TableCell>
//                           D{repair.drop}.L{repair.level}.
//                           {getRepairType(repair.phases)}.{repair.repair_index}
//                         </TableCell>
//                         <TableCell>{repair.project_name}</TableCell>
//                         <TableCell>{repair.elevation_name}</TableCell>
//                         <TableCell>{repair.drop}</TableCell>
//                         <TableCell>{repair.level}</TableCell>
//                         <TableCell>
//                           <div className="flex items-center gap-2">
//                             <span
//                               className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium ${
//                                 isPhaseComplete(
//                                   repair.phases.survey as RepairPhase
//                                 )
//                                   ? 'bg-green-300 text-green-900'
//                                   : 'bg-transparent text-black'
//                               }`}
//                             >
//                               S
//                             </span>
//                             {repair.phases.progress?.map((phase, index) => (
//                               <span
//                                 key={index}
//                                 className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium ${
//                                   isPhaseComplete(phase as RepairPhase)
//                                     ? 'bg-green-300 text-green-900'
//                                     : 'bg-transparent text-black'
//                                 }`}
//                               >
//                                 P{index + 1}
//                               </span>
//                             ))}
//                             <span
//                               className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium ${
//                                 isPhaseComplete(
//                                   repair.phases.finish as RepairPhase
//                                 )
//                                   ? 'bg-green-300 text-green-900'
//                                   : 'bg-transparent text-black'
//                               }`}
//                             >
//                               F
//                             </span>
//                           </div>
//                         </TableCell>
//                         <TableCell>
//                           <span
//                             className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
//                               repair.status === 'approved'
//                                 ? 'bg-green-100 text-green-800'
//                                 : repair.status === 'pending'
//                                 ? 'bg-yellow-100 text-yellow-800'
//                                 : 'bg-red-100 text-red-800'
//                             }`}
//                           >
//                             {repair.status}
//                           </span>
//                         </TableCell>
//                         <TableCell>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             className="text-orange-500 hover:bg-orange-50 hover:text-orange-600"
//                             onClick={() => handleViewRepair(repair)}
//                           >
//                             <Eye className="mr-2 h-4 w-4" />
//                             View
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
//             </div>

//             {/* Pagination */}
//             <Pagination
//               currentPage={currentPage}
//               totalPages={totalPages}
//               onPageChange={setPage}
//               isLoading={isLoading}
//             />
//           </>
//         ) : null}
//       </div>

//       {selectedRepair && (
//         <RepairDetailModal
//           open={isModalOpen}
//           onOpenChange={setIsModalOpen}
//           repair={selectedRepair}
//           onStatusUpdate={handleStatusUpdate}
//           canEditStatus={true} // Los managers pueden editar el estado
//         />
//       )}
//     </div>
//   )
// }
