'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Image, 
  Clock, 
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Eye,
  Target,
  Zap,
  AlertTriangle,
  Loader2,
  CheckCircle,
  HardDrive,
  Activity,
  PieChart,
  LineChart,
  Brain
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface SystemAnalytics {
  total_users: number
  active_users: number
  total_uploads: number
  successful_uploads: number
  failed_uploads: number
  success_rate: number
  daily_uploads: number
  weekly_uploads: number
  monthly_uploads: number
  average_processing_time: number
  processing_queue: number
  error_rate_24h: number
  storage_usage_gb: number
  failed_logins_24h: number
}

interface MostActiveUser {
  user_id: string
  user_name: string
  user_email: string
  upload_count: number
  last_upload: string
}

interface RecentActivity {
  id: string
  type: string
  user_email: string
  user_name: string
  details: string
  timestamp: string
}

export default function Analytics() {
  const [admin, setAdmin] = useState({
    id: 'admin-1',
    name: 'Loading...',
    email: 'admin@coloriq.com',
    role: 'admin',
    avatar: null
  })

  const [timeRange, setTimeRange] = useState('7d')
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)

  // Real data from API
  const [analyticsData, setAnalyticsData] = useState<SystemAnalytics | null>(null)
  const [mostActiveUsers, setMostActiveUsers] = useState<MostActiveUser[]>([])
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])

  // Load admin user from localStorage
  useEffect(() => {
    const userName = localStorage.getItem('userName')
    const userEmail = localStorage.getItem('userEmail')
    const userId = localStorage.getItem('userId')
    
    if (userName && userEmail) {
      setAdmin({
        id: userId || 'admin-1',
        name: userName,
        email: userEmail,
        role: 'admin',
        avatar: null
      })
    }
  }, [])

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('Authentication required')
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      // Fetch all data in parallel
      const [analyticsRes, activeUsersRes, activitiesRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/analytics`, { headers }),
        fetch(`${API_URL}/api/admin/most-active-users?limit=5`, { headers }),
        fetch(`${API_URL}/api/admin/recent-activities?limit=8`, { headers })
      ])

      if (!analyticsRes.ok) throw new Error('Failed to fetch analytics')
      if (!activeUsersRes.ok) throw new Error('Failed to fetch active users')
      if (!activitiesRes.ok) throw new Error('Failed to fetch activities')

      const [analyticsData, activeUsersData, activitiesData] = await Promise.all([
        analyticsRes.json(),
        activeUsersRes.json(),
        activitiesRes.json()
      ])

      setAnalyticsData(analyticsData)
      setMostActiveUsers(activeUsersData)
      setRecentActivities(activitiesData)
      setLoading(false)
    } catch (err: any) {
      console.error('Failed to fetch analytics data:', err)
      setError(err.message || 'Failed to load analytics data')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchAnalyticsData().finally(() => {
      setTimeout(() => setRefreshing(false), 1000)
    })
  }

  const exportData = () => {
    if (!analyticsData) return
    
    const data = {
      exported_at: new Date().toISOString(),
      time_range: timeRange,
      analytics: analyticsData,
      active_users: mostActiveUsers,
      recent_activities: recentActivities
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `coloriq-analytics-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const timeRanges = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered': return Users
      case 'image_processed': return CheckCircle
      case 'system_alert': return AlertTriangle
      default: return Activity
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (loading) {
    return (
      <AdminProtectedRoute>
        <AdminLayout user={admin}>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-primary-800 animate-spin mx-auto mb-4" />
              <p className="text-primary-600">Loading analytics data...</p>
            </div>
          </div>
        </AdminLayout>
      </AdminProtectedRoute>
    )
  }

  if (error) {
    return (
      <AdminProtectedRoute>
        <AdminLayout user={admin}>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900"
              >
                Retry
              </button>
            </div>
          </div>
        </AdminLayout>
      </AdminProtectedRoute>
    )
  }

  if (!analyticsData) return null

  return (
    <AdminProtectedRoute>
      <AdminLayout user={admin}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-primary-800">Analytics Dashboard</h1>
              <p className="text-primary-600 mt-1">Real-time platform performance and user insights</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {timeRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button 
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Total Users',
                value: analyticsData.total_users.toLocaleString(),
                subtitle: `${analyticsData.active_users} active`,
                icon: Users,
                color: 'primary',
                key: 'users'
              },
              {
                title: 'Total Uploads',
                value: analyticsData.total_uploads.toLocaleString(),
                subtitle: `${analyticsData.daily_uploads} today`,
                icon: Image,
                color: 'primary',
                key: 'uploads'
              },
              {
                title: 'Success Rate',
                value: `${analyticsData.success_rate.toFixed(1)}%`,
                subtitle: `${analyticsData.successful_uploads} successful`,
                icon: CheckCircle,
                color: 'green',
                key: 'success'
              },
              {
                title: 'Avg Processing',
                value: `${analyticsData.average_processing_time.toFixed(1)}s`,
                subtitle: `${analyticsData.processing_queue} in queue`,
                icon: Zap,
                color: 'primary',
                key: 'processing'
              }
            ].map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`bg-white rounded-xl border-2 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                  selectedMetric === metric.key ? 'border-primary-500 bg-primary-50' : 'border-primary-200'
                }`}
                onClick={() => setSelectedMetric(selectedMetric === metric.key ? null : metric.key)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-${metric.color === 'primary' ? 'primary-100' : metric.color + '-100'}`}>
                    <metric.icon className={`w-6 h-6 text-${metric.color === 'primary' ? 'primary-800' : metric.color + '-600'}`} />
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 uppercase tracking-wider">{timeRange}</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary-800 mb-1">{metric.value}</h3>
                  <p className="text-sm font-medium text-primary-800">{metric.title}</p>
                  <p className="text-xs text-primary-600 mt-1">{metric.subtitle}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Charts Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upload Trends Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-xl border border-primary-200 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-primary-800 flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-primary-600" />
                  Upload Trends
                </h2>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                    <span className="text-primary-600">Daily</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary-700 rounded-full"></div>
                    <span className="text-primary-600">Weekly</span>
                  </div>
                </div>
              </div>

              {/* Line Chart Simulation */}
              <div className="relative h-48 bg-gradient-to-t from-primary-50 to-transparent rounded-lg p-4">
                <div className="absolute inset-4">
                  {/* Chart Grid */}
                  <div className="absolute inset-0 grid grid-cols-7 gap-1">
                    {Array.from({ length: 7 }, (_, i) => (
                      <div key={i} className="border-l border-gray-200 border-dashed opacity-50"></div>
                    ))}
                  </div>
                  
                  {/* Chart Data Points */}
                  <div className="relative h-full flex items-end justify-between">
                    {[65, 78, 82, 95, 88, 92, 105].map((value, index) => (
                      <motion.div
                        key={index}
                        initial={{ height: 0 }}
                        animate={{ height: `${value}%` }}
                        transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                        className="relative group"
                      >
                        <div 
                          className="w-8 bg-gradient-to-t from-primary-800 to-primary-600 rounded-t-lg shadow-lg"
                          style={{ height: `${value}%` }}
                        />
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {Math.round(value * 1.2)}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* X-axis labels */}
                  <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Success Rate Pie Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-green-600" />
                  Processing Results
                </h2>
                <div className="text-sm text-gray-500">Last 30 days</div>
              </div>

              {/* Donut Chart */}
              <div className="relative flex items-center justify-center">
                <div className="relative w-48 h-48">
                  {/* Success Arc */}
                  <motion.div
                    initial={{ strokeDasharray: "0 628" }}
                    animate={{ strokeDasharray: `${analyticsData.success_rate * 6.28} 628` }}
                    transition={{ duration: 1.5, delay: 0.6 }}
                    className="absolute inset-0"
                  >
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="16"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="url(#successGradient)"
                        strokeWidth="16"
                        strokeLinecap="round"
                        strokeDasharray={`${analyticsData.success_rate * 5.03} 628`}
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#34d399" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </motion.div>
                  
                  {/* Center Text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">
                        {analyticsData.success_rate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-500">Success Rate</div>
                    </div>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="ml-8 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Successful</div>
                      <div className="text-xs text-gray-500">{analyticsData.successful_uploads.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Failed</div>
                      <div className="text-xs text-gray-500">{analyticsData.failed_uploads.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Processing</div>
                      <div className="text-xs text-gray-500">{analyticsData.processing_queue}</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Advanced Analytics Charts */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Processing Time Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Processing Time Distribution
              </h2>
              
              <div className="space-y-4">
                {[
                  { range: '< 1s', percentage: 25, color: 'bg-green-500' },
                  { range: '1-2s', percentage: 45, color: 'bg-blue-500' },
                  { range: '2-3s', percentage: 20, color: 'bg-yellow-500' },
                  { range: '3-5s', percentage: 8, color: 'bg-orange-500' },
                  { range: '> 5s', percentage: 2, color: 'bg-red-500' }
                ].map((item, index) => (
                  <motion.div
                    key={item.range}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{item.range}</span>
                      <span className="text-sm font-bold text-gray-900">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
                        className={`h-2 rounded-full ${item.color}`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* User Activity Heatmap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Activity Heatmap
              </h2>
              
              <div className="space-y-3">
                <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 text-center">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} className="py-1">{day}</div>
                  ))}
                </div>
                
                {Array.from({ length: 4 }, (_, week) => (
                  <div key={week} className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 7 }, (_, day) => {
                      const intensity = Math.random()
                      return (
                        <motion.div
                          key={day}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.8 + (week * 7 + day) * 0.02 }}
                          className={`w-6 h-6 rounded-sm cursor-pointer hover:scale-110 transition-transform ${
                            intensity > 0.8 ? 'bg-purple-600' :
                            intensity > 0.6 ? 'bg-purple-500' :
                            intensity > 0.4 ? 'bg-purple-400' :
                            intensity > 0.2 ? 'bg-purple-300' : 'bg-gray-200'
                          }`}
                          title={`${Math.round(intensity * 100)} uploads`}
                        />
                      )
                    })}
                  </div>
                ))}
                
                <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
                  <span>Less</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(level => (
                      <div
                        key={level}
                        className={`w-3 h-3 rounded-sm ${
                          level === 1 ? 'bg-gray-200' :
                          level === 2 ? 'bg-purple-300' :
                          level === 3 ? 'bg-purple-400' :
                          level === 4 ? 'bg-purple-500' : 'bg-purple-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span>More</span>
                </div>
              </div>
            </motion.div>

            {/* AI Model Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                AI Model Metrics
              </h2>
              
              <div className="space-y-6">
                {/* Accuracy Gauge */}
                <div className="text-center">
                  <div className="relative w-32 h-16 mx-auto mb-4">
                    <svg className="w-full h-full" viewBox="0 0 200 100">
                      <path
                        d="M 20 80 A 80 80 0 0 1 180 80"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="12"
                        strokeLinecap="round"
                      />
                      <motion.path
                        initial={{ strokeDasharray: "0 251" }}
                        animate={{ strokeDasharray: `${analyticsData.success_rate * 2.51} 251` }}
                        transition={{ duration: 1.5, delay: 0.9 }}
                        d="M 20 80 A 80 80 0 0 1 180 80"
                        fill="none"
                        stroke="url(#accuracyGradient)"
                        strokeWidth="12"
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="accuracyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                      <div className="text-2xl font-bold text-gray-900">{analyticsData.success_rate.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500">Model Accuracy</div>
                    </div>
                  </div>
                </div>
                
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-indigo-50 rounded-lg">
                    <div className="text-lg font-bold text-indigo-600">
                      {analyticsData.average_processing_time.toFixed(1)}s
                    </div>
                    <div className="text-xs text-gray-600">Avg Time</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">
                      {(100 - analyticsData.error_rate_24h).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">Reliability</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Performance Metrics */}
          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                System Health
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Error Rate (24h)</span>
                  <span className={`text-sm font-bold ${
                    analyticsData.error_rate_24h < 5 ? 'text-green-600' : 
                    analyticsData.error_rate_24h < 10 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {analyticsData.error_rate_24h.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Storage Usage</span>
                  <span className={`text-sm font-bold ${
                    analyticsData.storage_usage_gb < 10 ? 'text-green-600' : 
                    analyticsData.storage_usage_gb < 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {analyticsData.storage_usage_gb.toFixed(2)} GB
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Failed Logins (24h)</span>
                  <span className={`text-sm font-bold ${
                    analyticsData.failed_logins_24h < 5 ? 'text-green-600' : 
                    analyticsData.failed_logins_24h < 10 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {analyticsData.failed_logins_24h}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Most Active Users */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Top Users
                </h2>
                <span className="text-xs text-gray-500">{mostActiveUsers.length} users</span>
              </div>

              <div className="space-y-3">
                {mostActiveUsers.length > 0 ? (
                  mostActiveUsers.map((user, index) => (
                    <motion.div
                      key={user.user_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {user.user_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{user.user_name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[120px]">{user.user_email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{user.upload_count}</p>
                        <p className="text-xs text-gray-500">uploads</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No active users</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Activities */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  Recent Activity
                </h2>
                <span className="text-xs text-gray-500">{recentActivities.length} activities</span>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => {
                    const Icon = getActivityIcon(activity.type)
                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Icon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{activity.details}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-500 truncate">{activity.user_name}</p>
                            <span className="text-xs text-gray-400">•</span>
                            <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent activities</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Detailed Metrics */}
          {selectedMetric && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-xl border border-blue-200 p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Detailed {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Metrics
                </h3>
                <button
                  onClick={() => setSelectedMetric(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                {selectedMetric === 'users' && (
                  <>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{analyticsData.total_users}</div>
                      <div className="text-sm text-gray-600">Total Registered</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{analyticsData.active_users}</div>
                      <div className="text-sm text-gray-600">Active Users</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {((analyticsData.active_users / analyticsData.total_users) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Activity Rate</div>
                    </div>
                  </>
                )}
                
                {selectedMetric === 'uploads' && (
                  <>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{analyticsData.total_uploads}</div>
                      <div className="text-sm text-gray-600">Total Uploads</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{analyticsData.daily_uploads}</div>
                      <div className="text-sm text-gray-600">Today</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{analyticsData.weekly_uploads}</div>
                      <div className="text-sm text-gray-600">This Week</div>
                    </div>
                  </>
                )}
                
                {selectedMetric === 'success' && (
                  <>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{analyticsData.successful_uploads}</div>
                      <div className="text-sm text-gray-600">Successful</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{analyticsData.failed_uploads}</div>
                      <div className="text-sm text-gray-600">Failed</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{analyticsData.success_rate.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                    </div>
                  </>
                )}
                
                {selectedMetric === 'processing' && (
                  <>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{analyticsData.average_processing_time.toFixed(1)}s</div>
                      <div className="text-sm text-gray-600">Average Time</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{analyticsData.processing_queue}</div>
                      <div className="text-sm text-gray-600">In Queue</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{analyticsData.error_rate_24h.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">Error Rate</div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  )
}