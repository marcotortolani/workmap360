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
  Plus,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FilterOptions, RepairsFilter } from '@/components/repairs-filter'
import { Pagination } from '@/components/pagination'
import { RepairDetailModal } from '@/components/repair-detail-modal'
import RepairPhaseForm from '../technician/repair-phase-form'
import {
  RepairData,
  RepairDataStatusType,
  RepairPhase,
} from '@/types/repair-type'
import { getRepairType } from '@/lib/utils'
import { useRepairsList } from '@/hooks/use-repairs-list'
import { useProjectsList } from '@/hooks/use-projects-list'
import { toast } from 'sonner'

// Helper function to determine if repair can have next phase
const canAddNextPhase = (repair: RepairData, totalPhases: number): boolean => {
  const { phases } = repair
  const progressPhasesNeeded = Math.max(0, totalPhases - 2)
  const currentProgressCount = phases.progress?.length || 0

  // Can add survey if missing
  if (!phases.survey) return true

  // Can add progress if needed and not all completed
  if (progressPhasesNeeded > 0 && currentProgressCount < progressPhasesNeeded) {
    return true
  }

  // Can add finish if missing and all progress completed
  if (!phases.finish && currentProgressCount >= progressPhasesNeeded) {
    return true
  }

  return false
}

// Helper function to determine the next phase name
const getNextPhaseName = (repair: RepairData, totalPhases: number): string => {
  const { phases } = repair
  const progressPhasesNeeded = Math.max(0, totalPhases - 2)
  const currentProgressCount = phases.progress?.length || 0

  if (!phases.survey) return 'Survey'

  if (progressPhasesNeeded > 0 && currentProgressCount < progressPhasesNeeded) {
    return `Progress ${currentProgressCount + 1}`
  }

  if (!phases.finish && currentProgressCount >= progressPhasesNeeded) {
    return 'Finish'
  }

  return ''
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
  onAddPhase,
  canAddPhase,
  nextPhaseName,
}: {
  repair: RepairData
  onViewRepair: (repair: RepairData) => void
  onAddPhase: (repair: RepairData) => void
  canAddPhase: boolean
  nextPhaseName: string
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
              {canAddPhase && (
                <DropdownMenuItem onClick={() => onAddPhase(repair)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add {nextPhaseName}
                </DropdownMenuItem>
              )}
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

        {/* Action buttons for mobile */}
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-orange-500 hover:bg-orange-50 hover:text-orange-600"
            onClick={() => onViewRepair(repair)}
          >
            <Eye className="mr-1 h-3 w-3" />
            View
          </Button>
          {canAddPhase && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
              onClick={() => onAddPhase(repair)}
            >
              <Plus className="mr-1 h-3 w-3" />
              {nextPhaseName}
            </Button>
          )}
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
    updateStatus,
    currentPage,
    totalPages,
  } = useRepairsList(20)

  const { projects } = useProjectsList()

  const [selectedRepair, setSelectedRepair] = useState<RepairData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPhaseFormOpen, setIsPhaseFormOpen] = useState(false)
  const [phaseFormRepair, setPhaseFormRepair] = useState<RepairData | null>(
    null
  )
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

  // unique elevations in project selected
  const uniqueElevationsInProject = useMemo(
    () => [
      ...new Set(
        repairs
          .filter((r) => r.project_name === localFilters.project)
          .map((r) => r.elevation_name)
      ),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [localFilters.project]
  )

  // Helper function to get total phases for a repair
  const getTotalPhases = (repair: RepairData): number => {
    // Buscar el proyecto correspondiente
    const project = projects.find((p) => p.id === repair.project_id)
    if (!project) return 3 // Default value

    // Buscar el tipo de reparación en el proyecto
    const repairTypeConfig = project.repair_types.find(
      (rt) => rt.repair_type === repair.phases.survey?.repair_type
    )

    return repairTypeConfig?.phases || 3 // Default value
  }

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

    if (localFilters.project && localFilters.project !== 'all') {
      filtered = filtered.filter(
        (repair) => repair.project_name === localFilters.project
      )
    }

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
  }, [repairs, localFilters.searchTerm, localFilters.project])

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

  const handleAddPhase = (repair: RepairData) => {
    setPhaseFormRepair(repair)
    setIsPhaseFormOpen(true)
  }

  const handlePhaseFormSuccess = () => {
    setIsPhaseFormOpen(false)
    setPhaseFormRepair(null)
    handleRefresh()
    toast.success('Phase added successfully!', {
      duration: 3000,
      position: 'bottom-right',
    })
  }

  const handlePhaseFormCancel = () => {
    setIsPhaseFormOpen(false)
    setPhaseFormRepair(null)
  }

  const handleStatusUpdate = async ({
    repairId,
    status,
  }: {
    repairId: number
    status: RepairDataStatusType
  }) => {
    await updateStatus(repairId, status)
    handleRefresh()
  }

  const handleRefresh = async () => {
    await refetch()
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 p-2 sm:p-4 lg:p-8 max-w-screen-2xl mx-auto">
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
            elevations={uniqueElevationsInProject}
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
                    {filteredRepairs.map((repair) => {
                      const totalPhases = getTotalPhases(repair)
                      const canAdd = canAddNextPhase(repair, totalPhases)
                      const nextPhase = getNextPhaseName(repair, totalPhases)

                      return (
                        <RepairCard
                          key={repair.id}
                          repair={repair}
                          onViewRepair={handleViewRepair}
                          onAddPhase={handleAddPhase}
                          canAddPhase={canAdd}
                          nextPhaseName={nextPhase}
                        />
                      )
                    })}
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
                        <TableHead className="w-32">Actions</TableHead>
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
                        filteredRepairs.map((repair) => {
                          const totalPhases = getTotalPhases(repair)
                          const canAdd = canAddNextPhase(repair, totalPhases)
                          const nextPhase = getNextPhaseName(
                            repair,
                            totalPhases
                          )

                          return (
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
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                                    onClick={() => handleViewRepair(repair)}
                                  >
                                    <Eye className="h-3 w-3" />
                                    <span className="hidden xl:inline ml-1">
                                      View
                                    </span>
                                  </Button>
                                  {canAdd && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                                      onClick={() => handleAddPhase(repair)}
                                      title={`Add ${nextPhase} Phase`}
                                    >
                                      <Plus className="h-3 w-3" />
                                      <span className="hidden xl:inline ml-1">
                                        {nextPhase}
                                      </span>
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
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

      {/* Repair Detail Modal */}
      {selectedRepair && (
        <RepairDetailModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          repair={selectedRepair}
          onStatusUpdate={handleStatusUpdate}
          canEditStatus={true}
        />
      )}

      {/* Repair Phase Form Dialog */}
      {phaseFormRepair && (
        <Dialog open={isPhaseFormOpen} onOpenChange={setIsPhaseFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Add New Phase - D{phaseFormRepair.drop}.L{phaseFormRepair.level}
                .{getRepairType(phaseFormRepair.phases)}.
                {phaseFormRepair.repair_index}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <RepairPhaseForm
                projectId={phaseFormRepair.project_id}
                projectName={phaseFormRepair.project_name}
                elevationName={phaseFormRepair.elevation_name}
                drop={phaseFormRepair.drop}
                level={phaseFormRepair.level}
                repairType={phaseFormRepair.phases.survey?.repair_type || ''}
                repairIndex={phaseFormRepair.repair_index}
                totalPhases={getTotalPhases(phaseFormRepair)}
                existingRepair={phaseFormRepair}
                onSuccess={handlePhaseFormSuccess}
                onCancel={handlePhaseFormCancel}
                folderName={phaseFormRepair.project_name}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
