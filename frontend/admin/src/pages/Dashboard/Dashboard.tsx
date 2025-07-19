import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { 
  Users, 
  UserCheck, 
  UserX, 
  TrendingUp, 
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell
} from 'recharts'

// Mock data for charts
const userGrowthData = [
  { name: 'Jan', users: 400 },
  { name: 'Feb', users: 450 },
  { name: 'Mar', users: 520 },
  { name: 'Apr', users: 580 },
  { name: 'May', users: 650 },
  { name: 'Jun', users: 720 },
]

const userActivityData = [
  { name: 'Mon', active: 320 },
  { name: 'Tue', active: 280 },
  { name: 'Wed', active: 390 },
  { name: 'Thu', active: 420 },
  { name: 'Fri', active: 380 },
  { name: 'Sat', active: 250 },
  { name: 'Sun', active: 200 },
]

const userRoleData = [
  { name: 'Users', value: 85, color: '#3B82F6' },
  { name: 'Admins', value: 15, color: '#EF4444' },
]

const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    growth: 0,
  })

  useEffect(() => {
    // Mock stats - in real app, fetch from API
    setStats({
      totalUsers: 1247,
      activeUsers: 1089,
      inactiveUsers: 158,
      growth: 12.5,
    })
  }, [])

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: `+${stats.growth}%`,
      changeColor: 'text-green-600',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+8.2%',
      changeColor: 'text-green-600',
    },
    {
      title: 'Inactive Users',
      value: stats.inactiveUsers,
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      change: '-2.1%',
      changeColor: 'text-red-600',
    },
    {
      title: 'Growth Rate',
      value: `${stats.growth}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+1.2%',
      changeColor: 'text-green-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {user?.name}. Here's an overview of your platform.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="admin-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </p>
                  <p className={`text-sm ${stat.changeColor}`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="admin-card p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              User Growth
            </h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Activity Chart */}
        <div className="admin-card p-6">
          <div className="flex items-center mb-4">
            <Activity className="h-5 w-5 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Weekly Activity
            </h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="active" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* User Role Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="admin-card p-6">
          <div className="flex items-center mb-4">
            <PieChart className="h-5 w-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              User Roles
            </h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Tooltip />
                <RechartsPieChart data={userRoleData} cx="50%" cy="50%" outerRadius={80}>
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </RechartsPieChart>
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {userRoleData.map((entry, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {entry.name}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {entry.value}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 admin-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  New user registered
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  john.doe@example.com • 2 minutes ago
                </p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  User role updated
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  jane.smith@example.com promoted to admin • 1 hour ago
                </p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <UserX className="h-4 w-4 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  User account suspended
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  spam.user@example.com • 3 hours ago
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
