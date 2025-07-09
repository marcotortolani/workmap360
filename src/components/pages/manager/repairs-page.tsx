




// src/components/pages/manager/repairs-page.tsx

'use client'

import { useState, useMemo } from 'react'
import { Eye, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

// Componente de paginación
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
    const showPages = 5 // Mostrar 5 páginas a la vez

    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2))
    const endPage = Math.min(totalPages, startPage + showPages - 1)

    // Ajustar si estamos cerca del final
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
    <div className="flex items-center justify-center gap-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1 || isLoading}
      >
        Previous
      </Button>

      {getPageNumbers().map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPageChange(page)}
          disabled={isLoading}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || isLoading}
      >
        Next
      </Button>
    </div>
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
    // currentFilters,
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

    // Para búsqueda, podríamos implementar búsqueda en el backend
    // Por ahora, la manejaremos localmente

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

    // Aplicar filtros que no son de búsqueda a la API
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

    // La ordenación se podría implementar en el backend
    // Por ahora, la manejaremos localmente si es necesario
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
      // Aquí implementarías la actualización del estado
      // Por ejemplo, usando updateRepairStatusViaAPI
      console.log(`Updated repair ${repairId} status to ${status}`)

      // Refrescar la lista después de actualizar
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

  // Función helper para verificar si una fase está completa
  const isPhaseComplete = (phase: RepairPhase): boolean => {
    return (phase && phase.created_at && phase.created_at.length > 0) || false
  }

  const handleRefresh = () => {
    refetch()
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Repairs
            {pagination && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                (Showing {filteredRepairs.length} of {pagination.total})
              </span>
            )}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>

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
              <span>Loading repairs...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && repairs.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-2">Error loading repairs</p>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        {!isLoading || repairs.length > 0 ? (
          <>
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
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
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
                      <TableRow key={repair.id}>
                        <TableCell className="font-medium">
                          #{repair.id}
                        </TableCell>
                        <TableCell>
                          <span className="mx-1 px-2 py-0.5 bg-neutral-500 text-white rounded-md">
                            {getRepairType(repair.phases)}
                          </span>
                        </TableCell>
                        <TableCell>{repair.repair_index}</TableCell>
                        <TableCell>
                          D{repair.drop}.L{repair.level}.
                          {getRepairType(repair.phases)}.{repair.repair_index}
                        </TableCell>
                        <TableCell>{repair.project_name}</TableCell>
                        <TableCell>{repair.elevation_name}</TableCell>
                        <TableCell>{repair.drop}</TableCell>
                        <TableCell>{repair.level}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium ${
                                isPhaseComplete(
                                  repair.phases.survey as RepairPhase
                                )
                                  ? 'bg-green-300 text-green-900'
                                  : 'bg-transparent text-black'
                              }`}
                            >
                              S
                            </span>
                            {repair.phases.progress?.map((phase, index) => (
                              <span
                                key={index}
                                className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium ${
                                  isPhaseComplete(phase as RepairPhase)
                                    ? 'bg-green-300 text-green-900'
                                    : 'bg-transparent text-black'
                                }`}
                              >
                                P{index + 1}
                              </span>
                            ))}
                            <span
                              className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium ${
                                isPhaseComplete(
                                  repair.phases.finish as RepairPhase
                                )
                                  ? 'bg-green-300 text-green-900'
                                  : 'bg-transparent text-black'
                              }`}
                            >
                              F
                            </span>
                          </div>
                        </TableCell>
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
                    ))
                  )}
                </TableBody>
              </Table>
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
      </div>

      {selectedRepair && (
        <RepairDetailModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          repair={selectedRepair}
          onStatusUpdate={handleStatusUpdate}
          canEditStatus={true} // Los managers pueden editar el estado
        />
      )}
    </div>
  )
}
