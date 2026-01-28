// src/components/pages/admin/database-page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useCurrentUser } from '@/stores/user-store'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/pagination'
import { toast } from 'sonner'
import {
  Database,
  Download,
  RefreshCw,
  Archive,
  Users,
  FolderKanban,
  Wrench,
  // Image as ImageIcon,
  ListOrdered,
} from 'lucide-react'
import type {
  DatabaseStats,
  BackupHistory,
} from '@/types/database-backup-types'
import { formatBytes, formatTimestamp } from '@/lib/database/stats-utils'

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function DatabaseManagementPage() {
  const { accessToken } = useCurrentUser()
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [backups, setBackups] = useState<BackupHistory[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isLoadingBackups, setIsLoadingBackups] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch database statistics
  const fetchStats = async () => {
    if (!accessToken) return

    setIsLoadingStats(true)
    try {
      const response = await fetch('/api/database/stats', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }

      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Error loading database statistics', {
        duration: 5000,
        position: 'bottom-right',
      })
    } finally {
      setIsLoadingStats(false)
    }
  }

  // Fetch backup history
  const fetchBackupHistory = async (page: number) => {
    if (!accessToken) return

    setIsLoadingBackups(true)
    try {
      const response = await fetch(
        `/api/database/backup?page=${page}&limit=10`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      )

      if (!response.ok) {
        throw new Error('Failed to fetch backup history')
      }

      const data = await response.json()
      setBackups(data.backups)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching backup history:', error)
      toast.error('Error loading backup history', {
        duration: 5000,
        position: 'bottom-right',
      })
    } finally {
      setIsLoadingBackups(false)
    }
  }

  // Create backup record
  const handleCreateBackup = async () => {
    if (!accessToken) return

    setIsCreatingBackup(true)
    try {
      const response = await fetch('/api/database/backup', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (!response.ok) {
        throw new Error('Failed to create backup')
      }

      await response.json()

      // Trigger export download
      await handleExportDatabase()

      // Refresh backup history
      await fetchBackupHistory(currentPage)

      toast.success('Backup created successfully', {
        duration: 3000,
        position: 'bottom-center',
        style: {
          background: '#333',
          color: '#fff',
        },
      })
    } catch (error) {
      console.error('Error creating backup:', error)
      toast.error('Error creating backup', {
        duration: 5000,
        position: 'bottom-right',
      })
    } finally {
      setIsCreatingBackup(false)
    }
  }

  // Export database
  const handleExportDatabase = async () => {
    if (!accessToken) return

    setIsExporting(true)
    try {
      const response = await fetch('/api/database/export', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (!response.ok) {
        // Try to get error details from response
        const errorData = await response.json().catch(() => null)
        const errorMessage = errorData?.details || errorData?.error || 'Failed to export database'
        console.error('Export error details:', errorData)
        throw new Error(errorMessage)
      }

      const blob = await response.blob()

      // Download file
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `workmap360-backup-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success('Database exported successfully', {
        duration: 3000,
        position: 'bottom-center',
        style: {
          background: '#333',
          color: '#fff',
        },
      })
    } catch (error) {
      console.error('Error exporting database:', error)
      toast.error('Error exporting database', {
        duration: 5000,
        position: 'bottom-right',
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchBackupHistory(page)
  }

  // Initial load
  useEffect(() => {
    if (accessToken) {
      fetchStats()
      fetchBackupHistory(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken])

  return (
    <div className="space-y-6 px-2 md:px-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-orange-500 flex items-center gap-2">
            <Database className="h-8 w-8" />
            Database Management
          </h1>
          {stats && (
            <p className="text-sm text-gray-600 mt-1">
              Last updated: {formatTimestamp(stats.lastUpdated)}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            fetchStats()
            fetchBackupHistory(currentPage)
          }}
          disabled={isLoadingStats || isLoadingBackups}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoadingStats || isLoadingBackups ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Users Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ) : stats ? (
              <>
                <div className="text-2xl font-bold">{stats.users.total}</div>
                <div className="text-xs text-gray-600 mt-2 space-y-1">
                  <div>
                    Active: {stats.users.active} | Inactive:{' '}
                    {stats.users.inactive}
                  </div>
                  <div className="pt-1 border-t">
                    <div>Admin: {stats.users.byRole.admin}</div>
                    <div>Manager: {stats.users.byRole.manager}</div>
                    <div>Technician: {stats.users.byRole.technician}</div>
                    <div>Client: {stats.users.byRole.client}</div>
                    <div>Guest: {stats.users.byRole.guest}</div>
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* Projects Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-green-500" />
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ) : stats ? (
              <>
                <div className="text-2xl font-bold">{stats.projects.total}</div>
                <div className="text-xs text-gray-600 mt-2 space-y-1">
                  <div>Pending: {stats.projects.byStatus.pending}</div>
                  <div>
                    In Progress: {stats.projects.byStatus['in-progress']}
                  </div>
                  <div>Completed: {stats.projects.byStatus.completed}</div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* Repairs Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wrench className="h-4 w-4 text-orange-500" />
              Repairs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ) : stats ? (
              <>
                <div className="text-2xl font-bold">{stats.repairs.total}</div>
                <div className="text-xs text-gray-600 mt-2 space-y-1">
                  <div>Approved: {stats.repairs.byStatus.approved}</div>
                  <div>Pending: {stats.repairs.byStatus.pending}</div>
                  <div>Rejected: {stats.repairs.byStatus.rejected}</div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* Images Card */}
        {/* <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-purple-500" />
              Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ) : stats ? (
              <div className="text-2xl font-bold">{stats.images.total}</div>
            ) : null}
          </CardContent>
        </Card> */}

        {/* Repair Types Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ListOrdered className="h-4 w-4 text-red-500" />
              Repair Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ) : stats ? (
              <div className="text-2xl font-bold">
                {stats.repair_types.total}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Actions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Backup Actions</CardTitle>
          <CardDescription>
            Create database backups and export data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              onClick={handleCreateBackup}
              disabled={isCreatingBackup || isExporting}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Archive className="h-4 w-4 mr-2" />
              {isCreatingBackup ? 'Creating Backup...' : 'Create Backup'}
            </Button>
            <Button
              variant="outline"
              onClick={handleExportDatabase}
              disabled={isExporting || isCreatingBackup}
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export Database'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup History Section */}
      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <CardDescription>View previous database backups</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingBackups ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Database className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No backups yet</p>
              <p className="text-sm">Create your first backup to get started</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date Created</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Total Records</TableHead>
                    <TableHead>Tables</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell className="font-medium">
                        {formatTimestamp(backup.created_at)}
                      </TableCell>
                      <TableCell>{backup.created_by_user_name}</TableCell>
                      <TableCell>
                        {formatBytes(backup.backup_size_bytes)}
                      </TableCell>
                      <TableCell>
                        {backup.total_records.toLocaleString()}
                      </TableCell>
                      <TableCell>{backup.tables_count}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            backup.status === 'completed'
                              ? 'default'
                              : 'destructive'
                          }
                        >
                          {backup.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
