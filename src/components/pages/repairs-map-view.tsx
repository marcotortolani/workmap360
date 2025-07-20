// src/components/pages/repairs-map-view.tsx
'use client'

import { useState, useMemo } from 'react'
import { useProjectsList } from '@/hooks/use-projects-list'
import { useRepairsList } from '@/hooks/use-repairs-list'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { getRepairType } from '@/lib/utils'
import { RepairData, RepairDataStatusType } from '@/types/repair-type'
import { Eye, Filter, MapIcon, Loader2 } from 'lucide-react'
import { REPAIR_TYPE_LIST } from '@/data/repair-type-list'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { RepairDetailModal as MainRepairDetailModal } from '@/components/repair-detail-modal'
import { cn } from '@/lib/utils'

interface RepairListModalProps {
  repairs: RepairData[]
  onOpenChange: (open: boolean) => void
  onViewDetails: (repair: RepairData) => void
}

const RepairListModal = ({
  repairs,
  onOpenChange,
  onViewDetails,
}: RepairListModalProps) => {
  if (!repairs || repairs.length === 0) return null

  const firstRepair = repairs[0]
  const repairCode = `D${firstRepair.drop}.L${firstRepair.level}`

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Repairs at {repairCode}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto p-1 pr-4">
          <div className="space-y-4">
            {repairs.map((repair) => (
              <Card key={repair.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">
                      Repair #{repair.id} - Index {repair.repair_index}
                    </CardTitle>
                    <Badge>{getRepairType(repair.phases)}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    <strong>Status:</strong> {repair.status}
                  </p>
                  <p className="text-sm">
                    <strong>Created by:</strong> {repair.created_by_user_name}
                  </p>
                  <p className="text-sm">
                    <strong>Date:</strong>{' '}
                    {new Date(repair.created_at).toLocaleString()}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(repair)}
                    className="ml-auto"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function RepairsMapView() {
  const { projects, isLoading: projectsLoading } = useProjectsList()
  const {
    repairs,
    isLoading: repairsLoading,
    setFilters: setApiFilters,
    refetch,
  } = useRepairsList(1000)

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  )
  const [selectedElevationName, setSelectedElevationName] =
    useState<string>('all')
  const [dropRange, setDropRange] = useState({ min: '', max: '' })
  const [levelRange, setLevelRange] = useState({ min: '', max: '' })

  const [modalRepairs, setModalRepairs] = useState<RepairData[] | null>(null)
  const [detailedRepair, setDetailedRepair] = useState<RepairData | null>(null)

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId),
    [projects, selectedProjectId]
  )

  const handleProjectChange = (projectId: string) => {
    const id = parseInt(projectId, 10)
    setSelectedProjectId(id)
    setApiFilters({ project_id: id as number })
    setSelectedElevationName('all')
    setDropRange({ min: '', max: '' })
    setLevelRange({ min: '', max: '' })
  }

  const handleClearFilters = () => {
    setSelectedElevationName('all')
    setDropRange({ min: '', max: '' })
    setLevelRange({ min: '', max: '' })
  }

  const { grid, maxDrops, maxLevels, elevationHeaders, isCellValid } =
    useMemo(() => {
      if (!selectedProject) {
        return {
          grid: [],
          maxDrops: 0,
          maxLevels: 0,
          elevationHeaders: [],
          isCellValid: () => false,
        }
      }

      const elevationsForGrid =
        selectedElevationName === 'all'
          ? selectedProject.elevations
          : selectedProject.elevations.filter(
              (e) => e.name === selectedElevationName
            )

      const maxDrops = elevationsForGrid.reduce((sum, e) => sum + e.drops, 0)
      const maxLevels = Math.max(0, ...elevationsForGrid.map((e) => e.levels))

      const elevationHeaders = elevationsForGrid.map((elevation) => ({
        name: elevation.name,
        colSpan: elevation.drops,
      }))

      const elevationMap = new Map<number, { name: string; maxLevel: number }>()
      let currentDrop = 0
      for (const elev of elevationsForGrid) {
        for (let i = 1; i <= elev.drops; i++) {
          elevationMap.set(currentDrop + i, {
            name: elev.name,
            maxLevel: elev.levels,
          })
        }
        currentDrop += elev.drops
      }

      const isCellValid = (drop: number, level: number) => {
        const elevationInfo = elevationMap.get(drop)
        return elevationInfo ? level <= elevationInfo.maxLevel : false
      }

      const filteredRepairs = repairs.filter((repair) => {
        const dropMin = dropRange.min ? parseInt(dropRange.min, 10) : 1
        const dropMax = dropRange.max
          ? parseInt(dropRange.max, 10)
          : Number.POSITIVE_INFINITY
        const levelMin = levelRange.min ? parseInt(levelRange.min, 10) : 1
        const levelMax = levelRange.max
          ? parseInt(levelRange.max, 10)
          : Number.POSITIVE_INFINITY

        //const elevationInfo = elevationMap?.get(repair.drop)
        const matchesElevation =
          selectedElevationName === 'all' ||
          repair.elevation_name === selectedElevationName

        return (
          matchesElevation &&
          isCellValid(repair.drop, repair.level) &&
          repair.drop >= dropMin &&
          repair.drop <= dropMax &&
          repair.level >= levelMin &&
          repair.level <= levelMax
        )
      })

      const grid: (RepairData[] | undefined)[][] = Array(maxLevels)
        .fill(0)
        .map(() => Array(maxDrops).fill(undefined))

      filteredRepairs.forEach((repair) => {
        // Adjust for 1-based indexing
        const levelIndex = maxLevels - repair.level
        const dropIndex = repair.drop - 1

        if (
          levelIndex >= 0 &&
          levelIndex < maxLevels &&
          dropIndex >= 0 &&
          dropIndex < maxDrops
        ) {
          if (!grid[levelIndex][dropIndex]) {
            grid[levelIndex][dropIndex] = []
          }
          grid[levelIndex][dropIndex]?.push(repair)
        }
      })

      return { grid, maxDrops, maxLevels, elevationHeaders, isCellValid }
    }, [selectedProject, repairs, selectedElevationName, dropRange, levelRange])

  const getRepairSymbol = (repairType: string | null) => {
    const repairInfo = REPAIR_TYPE_LIST.find((rt) => rt.type === repairType)
    if (!repairInfo) return <span className="text-xs">?</span>
    return (
      <div
        className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold"
        style={{
          backgroundColor: repairInfo?.color ? repairInfo?.color : '#6B7280',
        }}
        title={repairInfo.variation}
      >
        {repairType}
      </div>
    )
  }

  const handleViewDetails = (repair: RepairData) => {
    setModalRepairs(null)
    setDetailedRepair(repair)
  }

  const handleStatusUpdate = async ({
    repairId,
    status,
  }: {
    repairId: number
    status: RepairDataStatusType
  }) => {
    console.log(`Updating repair ${repairId} to status ${status}`)
    refetch()
    setDetailedRepair((prev) => (prev ? { ...prev, status } : null))
  }

  const isLoading = projectsLoading || repairsLoading

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapIcon className="h-6 w-6" />
            Repairs Map View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Select Project</Label>
              <Select
                onValueChange={handleProjectChange}
                disabled={projectsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a project to view its map" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading && selectedProjectId && (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}

            {selectedProject && !isLoading && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label>Elevation</Label>
                    <Select
                      value={selectedElevationName}
                      onValueChange={setSelectedElevationName}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Elevations</SelectItem>
                        {selectedProject.elevations.map((e) => (
                          <SelectItem key={e.name} value={e.name}>
                            {e.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Drop Range</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={dropRange.min}
                        onChange={(e) =>
                          setDropRange({ ...dropRange, min: e.target.value })
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={dropRange.max}
                        onChange={(e) =>
                          setDropRange({ ...dropRange, max: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Level Range</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={levelRange.min}
                        onChange={(e) =>
                          setLevelRange({ ...levelRange, min: e.target.value })
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={levelRange.max}
                        onChange={(e) =>
                          setLevelRange({ ...levelRange, max: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex justify-end items-end ">
                    <Button
                      onClick={handleClearFilters}
                      disabled={
                        isLoading ||
                        !selectedProject ||
                        selectedElevationName === 'all'
                      }
                    >
                      Clear Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedProject && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Repair Grid</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="relative">
                <table className="border-collapse">
                  <thead>
                    <tr>
                      <th className="sticky left-0 top-0 z-20 bg-background p-2 border text-xs w-12 h-12"></th>
                      {elevationHeaders.map((header, index) => (
                        <th
                          key={index}
                          colSpan={header.colSpan}
                          className="sticky top-0 bg-background p-2 border text-xs h-12 text-center"
                        >
                          {header.name}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      <th className="sticky left-0 top-12 z-20 bg-background p-2 border text-xs w-12 h-12">
                        Lvl/Drp
                      </th>
                      {Array.from({ length: maxDrops }, (_, i) => (
                        <th
                          key={i}
                          className="sticky top-12 bg-background p-2 border text-xs w-12 h-12"
                        >
                          {i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {grid.map((row, levelIndex) => (
                      <tr key={levelIndex}>
                        <td className="sticky left-0 bg-background z-10 p-2 border text-xs font-bold w-12 h-12 text-center">
                          {maxLevels - levelIndex}
                        </td>
                        {row.map((cellRepairs, dropIndex) => {
                          const level = maxLevels - levelIndex
                          const drop = dropIndex + 1
                          const isValid = isCellValid(drop, level)
                          return (
                            <td
                              key={dropIndex}
                              className={cn(
                                'p-1 border w-12 h-12 text-center align-top relative',
                                !isValid && 'bg-gray-200'
                              )}
                            >
                              {isValid &&
                                cellRepairs &&
                                cellRepairs.length > 0 && (
                                  <div
                                    className="w-full h-full flex flex-wrap items-start justify-center gap-0.5 p-0.5 rounded-sm bg-sky-50 hover:bg-sky-100 cursor-pointer"
                                    onClick={() => setModalRepairs(cellRepairs)}
                                  >
                                    {cellRepairs
                                      .slice(0, 4)
                                      .map((repair, i) => (
                                        <div key={i}>
                                          {getRepairSymbol(
                                            getRepairType(
                                              repair?.phases || {}
                                            ) || 'unknown'
                                          )}
                                        </div>
                                      ))}
                                    {cellRepairs.length > 4 && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs p-0.5 w-4 h-4 justify-center"
                                      >
                                        +{cellRepairs.length - 4}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {modalRepairs && (
        <RepairListModal
          repairs={modalRepairs}
          onOpenChange={() => setModalRepairs(null)}
          onViewDetails={handleViewDetails}
        />
      )}

      {detailedRepair && (
        <MainRepairDetailModal
          open={!!detailedRepair}
          onOpenChange={() => setDetailedRepair(null)}
          repair={detailedRepair}
          onStatusUpdate={handleStatusUpdate}
          canEditStatus={true}
        />
      )}
    </div>
  )
}
