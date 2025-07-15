// src/app/dashboard/admin/dashboard/page.tsx
'use client'
import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Users,
  Wrench,
  FolderKanban,
  CheckCircle,
  XCircle,
  Hourglass,
  Loader2,
  Trophy,
  Calendar,
} from 'lucide-react'
import { getDashboardStats } from '@/lib/dashboard-data'
import { DashboardStats } from '@/types/dashboard-types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const roleIcons: { [key: string]: React.ElementType } = {
  admin: Users,
  manager: Users,
  technician: Wrench,
  client: Users,
  guest: Users,
}

export default function ManagerDashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const stats = await getDashboardStats()
      setData(stats)
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center text-muted-foreground">
        Could not load dashboard data.
      </div>
    )
  }

  const { users, repairs, projects, technicianRanking, repairsByMonth } = data

  const repairTypeData = Object.entries(repairs.byType).map(
    ([name, count]) => ({
      name,
      count,
    })
  )

  const usersByRoleData = Object.entries(users.byRole).map(([role, count]) => ({
    name: role.charAt(0).toUpperCase() + role.slice(1),
    count,
    Icon: roleIcons[role] || Users,
  }))

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* User Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.total}</div>
            <p className="text-xs text-muted-foreground">
              +{users.newLastMonth} in the last month
            </p>
          </CardContent>
        </Card>

        {/* Repairs Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Repairs</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{repairs.open}</div>
            <div className="flex items-center text-xs text-muted-foreground space-x-2">
              <span className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                {repairs.approved} approved
              </span>
              <span className="flex items-center">
                <XCircle className="h-3 w-3 mr-1 text-red-500" />
                {repairs.rejected} rejected
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Projects Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.inProgress}</div>
            <div className="flex items-center text-xs text-muted-foreground space-x-2">
              <span className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                {projects.completed} completed
              </span>
              <span className="flex items-center">
                <Hourglass className="h-3 w-3 mr-1 text-yellow-500" />
                {projects.pending} pending
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Users by Role */}
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
            <CardDescription>
              Distribution of users across different roles.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {usersByRoleData.map(({ name, count, Icon }) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="capitalize text-sm font-medium">{name}</span>
                </div>
                <span className="font-bold">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Repairs by Type */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Repairs by Type</CardTitle>
            <CardDescription>
              Total count of repairs for each type.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={repairTypeData}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Legend iconType="circle" />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Technician Ranking */}
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
              Technician Ranking
            </CardTitle>
            <CardDescription>
              Top 5 technicians by repairs created.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {technicianRanking.map((tech, index) => (
                <li key={tech.name} className="flex items-center gap-4">
                  <span className="font-bold text-lg text-muted-foreground w-6">
                    {index + 1}.
                  </span>
                  <Avatar className="w-14 h-14 lg:w-20 lg:h-20 overflow-hidden  rounded-full">
                    <AvatarImage src={tech.avatar} alt="Avatar" />
                    <AvatarFallback className="flex items-center justify-center text-4xl bg-gradient-to-br font-bold text-sky-100 from-blue-500 to-purple-600">
                      {tech.name}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{tech.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {tech.count} repairs
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Repairs by Month */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
              Repairs per Month (Last Year)
            </CardTitle>
            <CardDescription>Monthly repair creation trends.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={repairsByMonth}>
                <XAxis
                  dataKey="month"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Repairs"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
