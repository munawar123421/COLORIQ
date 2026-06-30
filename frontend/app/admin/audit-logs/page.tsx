'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '@/components/admin/AdminLayout'
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  User, 
  Activity, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Settings,
  RefreshCw
} from 'lucide-react'

export default function AuditLogs() {
  const [admin] = useState({
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@coloriq.com',
    role: 'Super Admin',
    avatar: null
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState('all')
  const [filterUser, setFilterUser] = useState('all')
  const [dateRange, setDateRange] = useState('7d')

  // Mock audit log data
  const [auditLogs] = useState([
    {
      id: '1',
      timestamp: '2024-01-24T10:45:32Z',
      user: 'admin@coloriq.com',
      userType: 'admin',
      action: 'user_suspended',
      resource: 'User Account',
      resourceId: 'user_123',
      details: 'Suspended user mike.wilson@email.com for policy violation',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success',
      severity: 'high'
    },
    {
      id: '2',
      timestamp: '2024-01-24T10:42:15Z',
      user: 'admin@coloriq.com',
      userType: 'admin',
      action: 'content_approved',
      resource: 'Content Item',
      resourceId: 'content_456',
      details: 'Approved uploaded image red_dress_001.jpg',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success',
      severity: 'medium'
    },
    {
      id: '3',
      timestamp: '2024-01-24T10:38:47Z',
      user: 'sarah.ahmed@email.com',
      userType: 'user',
      action: 'analysis_completed',
      resource: 'AI Analysis',
      resourceId: 'analysis_789',
      details: 'Completed color analysis with 94.2% accuracy',
      ipAddress: '203.0.113.45',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      status: 'success',
      severity: 'low'
    },
    {
      id: '4',
      timestamp: '2024-01-24T10:35:22Z',
      user: 'system',
      userType: 'system',
      action: 'backup_completed',
      resource: 'Database',
      resourceId: 'db_backup_001',
      details: 'Automated daily database backup completed successfully',
      ipAddress: '127.0.0.1',
      userAgent: 'System/1.0',
      status: 'success',
      severity: 'low'
    },
    {
      id: '5',
      timestamp: '2024-01-24T10:32:08Z',
      user: 'john.doe@email.com',
      userType: 'user',
      action: 'login_failed',
      resource: 'Authentication',
      resourceId: 'auth_001',
      details: 'Failed login attempt - incorrect password',
      ipAddress: '198.51.100.23',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      status: 'failed',
      severity: 'medium'
    },
    {
      id: '6',
      timestamp: '2024-01-24T10:28:55Z',
      user: 'admin@coloriq.com',
      userType: 'admin',
      action: 'settings_updated',
      resource: 'System Settings',
      resourceId: 'settings_001',
      details: 'Updated AI model confidence threshold to 85%',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success',
      severity: 'high'
    },
    {
      id: '7',
      timestamp: '2024-01-24T10:25:33Z',
      user: 'emma.davis@email.com',
      userType: 'user',
      action: 'profile_updated',
      resource: 'User Profile',
      resourceId: 'profile_234',
      details: 'Updated profile information and preferences',
      ipAddress: '203.0.113.67',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success',
      severity: 'low'
    },
    {
      id: '8',
      timestamp: '2024-01-24T10:22:41Z',
      user: 'system',
      userType: 'system',
      action: 'ai_model_updated',
      resource: 'AI Model',
      resourceId: 'model_v2',
      details: 'Deployed new AI model version 2.0.1 to production',
      ipAddress: '127.0.0.1',
      userAgent: 'System/1.0',
      status: 'success',
      severity: 'high'
    }
  ])

  const [stats] = useState({
    totalLogs: 2847,
    todayLogs: 156,
    failedActions: 23,
    criticalEvents: 8
  })

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAction = filterAction === 'all' || log.action.includes(filterAction)
    const matchesUser = filterUser === 'all' || log.userType === filterUser
    return matchesSearch && matchesAction && matchesUser
  })

  const getActionIcon = (action: string) => {
    if (action.includes('login') || action.includes('auth')) return Shield
    if (action.includes('user') || action.includes('profile')) return User
    if (action.includes('content') || action.includes('analysis')) return Eye
    if (action.includes('settings') || action.includes('updated')) return Settings
    if (action.includes('backup') || action.includes('system')) return Activity
    return FileText
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'failed': return 'text-red-600'
      case 'warning': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircle
      case 'failed': return XCircle
      case 'warning': return AlertTriangle
      default: return Activity
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'user': return 'bg-blue-100 text-blue-800'
      case 'system': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const actionTypes = [
    'all', 'login', 'user', 'content', 'analysis', 'settings', 'backup', 'system'
  ]

  const userTypes = [
    'all', 'admin', 'user', 'system'
  ]

  return (
    <AdminLayout user={admin}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-600 mt-1">Track all system activities and user actions</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Logs', value: stats.totalLogs, color: 'primary', icon: FileText },
            { label: 'Today\'s Logs', value: stats.todayLogs, color: 'green', icon: Calendar },
            { label: 'Failed Actions', value: stats.failedActions, color: 'red', icon: XCircle },
            { label: 'Critical Events', value: stats.criticalEvents, color: 'primary', icon: AlertTriangle }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</h3>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-primary-200 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Action Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {actionTypes.map(action => (
                  <option key={action} value={action}>
                    {action === 'all' ? 'All Actions' : action.charAt(0).toUpperCase() + action.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* User Type Filter */}
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {userTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Users' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-end">
              <span className="text-sm text-primary-600">
                {filteredLogs.length} of {auditLogs.length} logs
              </span>
            </div>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white rounded-xl border border-primary-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log, index) => {
                  const ActionIcon = getActionIcon(log.action)
                  const StatusIcon = getStatusIcon(log.status)
                  
                  return (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatTimestamp(log.timestamp)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{log.user}</p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getUserTypeColor(log.userType)}`}>
                              {log.userType}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <ActionIcon className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">
                            {log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <p className="font-medium">{log.resource}</p>
                          <p className="text-xs text-gray-500">{log.resourceId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${getStatusColor(log.status)}`} />
                          <span className={`text-sm font-medium ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <p className="truncate" title={log.details}>
                          {log.details}
                        </p>
                        <div className="text-xs text-gray-500 mt-1">
                          IP: {log.ipAddress}
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-primary-50 px-6 py-3 border-t border-primary-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredLogs.length}</span> of{' '}
                <span className="font-medium">{filteredLogs.length}</span> results
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
                  Previous
                </button>
                <button className="px-3 py-1 bg-primary-800 text-white text-sm rounded">
                  1
                </button>
                <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}