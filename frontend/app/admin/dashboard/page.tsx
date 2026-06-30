'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute'
import { 
  Users, 
  Image, 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Server,
  Database,
  HardDrive,
  Activity,
  Loader2,
  List,
  AlertCircle,
  Shield,
  Zap,
  UserCheck,
  Settings,
  Download,
  Backup,
  FileText,
  Eye,
  ChevronDown
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

interface SystemHealth {
  api_status: string
  database_status: string
  ai_model_status: string
  storage_status: string
  total_storage_used: number
  active_connections: number
}

interface RecentActivity {
  id: string
  type: string
  user_email: string
  user_name: string
  details: string
  timestamp: string
}

interface MostActiveUser {
  user_id: string
  user_name: string
  user_email: string
  upload_count: number
  last_upload: string
}

interface QuickAction {
  id: string
  title: string
  description: string
  action_type: string
  count?: number
}

export default function AdminDashboard() {
  const [admin, setAdmin] = useState({
    id: 'admin-1',
    name: 'Loading...',
    email: 'admin@coloriq.com',
    role: 'admin',
    avatar: null
  })

  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null)
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [mostActiveUsers, setMostActiveUsers] = useState<MostActiveUser[]>([])
  const [quickActions, setQuickActions] = useState<QuickAction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('authToken')
        if (!token) {
          setError('Authentication required')
          return
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }

        // Fetch all data in parallel
        const [analyticsRes, healthRes, activitiesRes, activeUsersRes, actionsRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/analytics`, { headers }),
          fetch(`${API_URL}/api/admin/system-health`, { headers }),
          fetch(`${API_URL}/api/admin/recent-activities?limit=6`, { headers }),
          fetch(`${API_URL}/api/admin/most-active-users?limit=5`, { headers }),
          fetch(`${API_URL}/api/admin/quick-actions`, { headers })
        ])

        if (!analyticsRes.ok) throw new Error('Failed to fetch analytics')
        if (!healthRes.ok) throw new Error('Failed to fetch system health')
        if (!activitiesRes.ok) throw new Error('Failed to fetch activities')
        if (!activeUsersRes.ok) throw new Error('Failed to fetch active users')
        if (!actionsRes.ok) throw new Error('Failed to fetch quick actions')

        const [analyticsData, healthData, activitiesData, activeUsersData, actionsData] = await Promise.all([
          analyticsRes.json(),
          healthRes.json(),
          activitiesRes.json(),
          activeUsersRes.json(),
          actionsRes.json()
        ])

        setAnalytics(analyticsData)
        setSystemHealth(healthData)
        setRecentActivities(activitiesData)
        setMostActiveUsers(activeUsersData)
        setQuickActions(actionsData)
        setLoading(false)
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err)
        setError(err.message || 'Failed to load dashboard data')
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered': return Users
      case 'image_processed': return CheckCircle
      case 'system_alert': return AlertTriangle
      case 'content_flagged': return Image
      default: return Activity
    }
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'navigation': return Eye
      case 'alert': return AlertCircle
      case 'warning': return AlertTriangle
      case 'maintenance': return Settings
      case 'export': return Download
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
              <p className="text-primary-600">Loading dashboard data...</p>
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
                onClick={() => window.location.reload()}
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

  return (
    <AdminProtectedRoute>
      <AdminLayout user={admin}>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-800">Admin Dashboard</h1>
              <p className="text-primary-600 mt-1">System overview and key metrics</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-primary-500">
              <Clock className="w-4 h-4" />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          {/* TOP ROW - Key Metrics */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Regular Users',
                  value: analytics.total_users.toLocaleString(),
                  subtitle: `${analytics.active_users} active`,
                  icon: Users,
                  color: 'primary'
                },
                {
                  title: 'Total Uploads',
                  value: analytics.total_uploads.toLocaleString(),
                  subtitle: `${analytics.daily_uploads} today`,
                  icon: Image,
                  color: 'primary'
                },
                {
                  title: 'Success Rate',
                  value: `${analytics.success_rate}%`,
                  subtitle: `${analytics.successful_uploads} successful`,
                  icon: CheckCircle,
                  color: 'green'
                },
                {
                  title: 'Avg Time',
                  value: `${analytics.average_processing_time}s`,
                  subtitle: 'Processing time',
                  icon: Zap,
                  color: 'primary'
                }
              ].map((kpi, index) => (
                <motion.div
                  key={kpi.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-xl border border-primary-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-${kpi.color === 'primary' ? 'primary-100' : kpi.color + '-100'}`}>
                      <kpi.icon className={`w-6 h-6 text-${kpi.color === 'primary' ? 'primary-800' : kpi.color + '-600'}`} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-primary-800 mb-1">{kpi.value}</h3>
                    <p className="text-sm font-medium text-primary-800">{kpi.title}</p>
                    <p className="text-xs text-primary-600">{kpi.subtitle}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* MIDDLE ROW - Performance & Alerts */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Processing Queue',
                  value: analytics.processing_queue.toString(),
                  subtitle: 'Images in queue',
                  icon: List,
                  color: analytics.processing_queue > 5 ? 'yellow' : 'blue',
                  alert: analytics.processing_queue > 10
                },
                {
                  title: 'Error Rate',
                  value: `${analytics.error_rate_24h}%`,
                  subtitle: 'Last 24 hours',
                  icon: AlertCircle,
                  color: analytics.error_rate_24h > 10 ? 'red' : analytics.error_rate_24h > 5 ? 'yellow' : 'green',
                  alert: analytics.error_rate_24h > 10
                },
                {
                  title: 'Storage Usage',
                  value: `${analytics.storage_usage_gb} GB`,
                  subtitle: 'Total used',
                  icon: HardDrive,
                  color: analytics.storage_usage_gb > 50 ? 'red' : analytics.storage_usage_gb > 20 ? 'yellow' : 'green',
                  alert: analytics.storage_usage_gb > 50
                },
                {
                  title: 'Failed Logins',
                  value: analytics.failed_logins_24h.toString(),
                  subtitle: 'Last 24 hours',
                  icon: Shield,
                  color: analytics.failed_logins_24h > 10 ? 'red' : analytics.failed_logins_24h > 5 ? 'yellow' : 'green',
                  alert: analytics.failed_logins_24h > 10
                }
              ].map((metric, index) => (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className={`bg-white rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow ${
                    metric.alert ? 'border-red-200 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-${metric.color}-100`}>
                      <metric.icon className={`w-6 h-6 text-${metric.color}-600`} />
                    </div>
                    {metric.alert && (
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
                    <p className="text-sm font-medium text-gray-900">{metric.title}</p>
                    <p className="text-xs text-gray-500">{metric.subtitle}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* BOTTOM ROW - Activities & Management */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Activities */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="bg-white rounded-xl border border-primary-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Activity className="w-5 h-5 text-primary-800" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-primary-800">Recent Activities</h2>
                    <p className="text-xs text-primary-600">Latest system events</p>
                  </div>
                </div>
                <Link 
                  href="/admin/audit-logs"
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors flex items-center gap-1"
                >
                  View All
                  <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
                </Link>
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
                        transition={{ duration: 0.3, delay: 0.9 + index * 0.05 }}
                        className="flex items-start gap-3 p-3 bg-primary-50/50 rounded-lg hover:bg-primary-50 transition-colors group"
                      >
                        <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                          <Icon className="w-4 h-4 text-primary-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-primary-800 truncate">{activity.details}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-primary-600 truncate font-medium">{activity.user_name}</p>
                            <span className="text-xs text-primary-400">•</span>
                            <p className="text-xs text-primary-500">{formatTimeAgo(activity.timestamp)}</p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                ) : (
                  <div className="text-center py-12 text-primary-500">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">No recent activities</p>
                    <p className="text-xs text-primary-400 mt-1">System events will appear here</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Most Active Users */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="bg-white rounded-xl border border-primary-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <UserCheck className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-primary-800">Top Users</h2>
                    <p className="text-xs text-primary-600">Most active this month</p>
                  </div>
                </div>
                <Link 
                  href="/admin/users"
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors flex items-center gap-1"
                >
                  Manage
                  <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
                </Link>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {mostActiveUsers.length > 0 ? (
                  mostActiveUsers.map((user, index) => (
                    <motion.div
                      key={user.user_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 1.0 + index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-primary-50/50 rounded-lg hover:bg-primary-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                            <span className="text-white font-semibold text-sm">
                              {user.user_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">#{index + 1}</span>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-primary-800 text-sm">{user.user_name}</p>
                          <p className="text-xs text-primary-600 truncate max-w-[140px]">{user.user_email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary-800">{user.upload_count}</p>
                        <p className="text-xs text-primary-600">uploads</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12 text-primary-500">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">No active users</p>
                    <p className="text-xs text-primary-400 mt-1">User activity will appear here</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="bg-white rounded-xl border border-primary-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Zap className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-primary-800">Quick Actions</h2>
                    <p className="text-xs text-primary-600">System management</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {quickActions.length > 0 ? (
                  quickActions.map((action, index) => {
                    const Icon = getActionIcon(action.action_type)
                    const isAlert = action.action_type === 'alert'
                    const isWarning = action.action_type === 'warning'
                    
                    return (
                      <motion.button
                        key={action.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 1.1 + index * 0.1 }}
                        className={`w-full flex items-center justify-between p-4 rounded-lg transition-all duration-200 text-left group ${
                          isAlert ? 'bg-red-50 hover:bg-red-100 border border-red-200' :
                          isWarning ? 'bg-yellow-50 hover:bg-yellow-100 border border-yellow-200' :
                          'bg-primary-50/50 hover:bg-primary-50 border border-primary-200'
                        } hover:shadow-md`}
                        whileHover={{ scale: 1.02, x: 2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-lg shadow-sm group-hover:shadow-md transition-shadow ${
                            isAlert ? 'bg-red-100' :
                            isWarning ? 'bg-yellow-100' :
                            'bg-white'
                          }`}>
                            <Icon className={`w-4 h-4 ${
                              isAlert ? 'text-red-600' :
                              isWarning ? 'text-yellow-600' :
                              'text-primary-700'
                            }`} />
                          </div>
                          <div>
                            <p className={`text-sm font-semibold ${
                              isAlert ? 'text-red-800' :
                              isWarning ? 'text-yellow-800' :
                              'text-primary-800'
                            }`}>{action.title}</p>
                            <p className={`text-xs ${
                              isAlert ? 'text-red-600' :
                              isWarning ? 'text-yellow-600' :
                              'text-primary-600'
                            }`}>{action.description}</p>
                          </div>
                        </div>
                        {action.count !== undefined && (
                          <div className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                            isAlert ? 'bg-red-200 text-red-800' :
                            isWarning ? 'bg-yellow-200 text-yellow-800' :
                            'bg-primary-200 text-primary-800'
                          }`}>
                            {action.count}
                          </div>
                        )}
                        <ChevronDown className={`w-4 h-4 rotate-[-90deg] transition-transform group-hover:translate-x-1 ${
                          isAlert ? 'text-red-600' :
                          isWarning ? 'text-yellow-600' :
                          'text-primary-600'
                        }`} />
                      </motion.button>
                    )
                  })
                ) : (
                  <div className="text-center py-12 text-primary-500">
                    <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">No actions available</p>
                    <p className="text-xs text-primary-400 mt-1">Quick actions will appear here</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  )
}