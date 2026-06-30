'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Clock, CheckCircle, XCircle, Loader2, BarChart3, PieChart, Activity, Calendar, Zap, Target } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Stats {
  total_processed: number
  completed: number
  failed: number
  success_rate: number
  average_processing_time: number
}

interface HistoryItem {
  id: string
  processing_time: number | null
  created_at: string
  status: string
}

export default function AnalyticsPage() {
  const [user, setUser] = useState<any>({
    id: 'user-123',
    name: 'Loading...',
    email: 'loading@coloriq.com',
    avatar: null
  })
  const [stats, setStats] = useState<Stats | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChart, setSelectedChart] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null)

  // Load user
  useEffect(() => {
    const userName = localStorage.getItem('userName')
    const userEmail = localStorage.getItem('userEmail')
    const userId = localStorage.getItem('userId')
    
    if (userName && userEmail) {
      setUser({
        id: userId,
        name: userName,
        email: userEmail,
        avatar: null
      })
    }
  }, [])

  // Fetch analytics data
  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        setLoading(false)
        return
      }

      // Fetch stats
      const statsResponse = await fetch(`${API_URL}/api/images/stats/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch all history for charts
      const historyResponse = await fetch(`${API_URL}/api/images/history?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (historyResponse.ok) {
        const historyData = await historyResponse.json()
        setHistory(historyData)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate processing time distribution
  const getProcessingTimeStats = () => {
    const times = history
      .filter(item => item.processing_time !== null)
      .map(item => item.processing_time!)
    
    if (times.length === 0) return { min: 0, max: 0, avg: 0 }
    
    return {
      min: Math.min(...times),
      max: Math.max(...times),
      avg: times.reduce((a, b) => a + b, 0) / times.length
    }
  }

  // Calculate time distribution buckets
  const getTimeDistribution = () => {
    const buckets = {
      fast: 0,      // < 10s
      medium: 0,    // 10-15s
      slow: 0,      // 15-20s
      verySlow: 0   // > 20s
    }

    history.forEach(item => {
      if (item.processing_time) {
        if (item.processing_time < 10) buckets.fast++
        else if (item.processing_time < 15) buckets.medium++
        else if (item.processing_time < 20) buckets.slow++
        else buckets.verySlow++
      }
    })

    return buckets
  }

  // Calculate weekly activity
  const getWeeklyActivity = () => {
    const last4Weeks = Array.from({ length: 4 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - ((3 - i) * 7))
      return {
        start: new Date(date),
        label: `Week ${4 - i}`
      }
    })

    const activityMap = new Map<number, number>()
    last4Weeks.forEach((_, i) => activityMap.set(i, 0))

    history.forEach(item => {
      const itemDate = new Date(item.created_at)
      last4Weeks.forEach((week, index) => {
        const weekEnd = new Date(week.start)
        weekEnd.setDate(weekEnd.getDate() + 7)
        if (itemDate >= week.start && itemDate < weekEnd) {
          activityMap.set(index, activityMap.get(index)! + 1)
        }
      })
    })

    return last4Weeks.map((week, i) => ({
      label: week.label,
      count: activityMap.get(i) || 0
    }))
  }

  const timeStats = getProcessingTimeStats()
  const timeDistribution = getTimeDistribution()
  const weeklyActivity = getWeeklyActivity()
  
  const maxActivity = Math.max(...weeklyActivity.map(d => d.count), 1)

  // Calculate pie chart percentages
  const completedPercentage = stats ? (stats.completed / stats.total_processed) * 100 : 0
  const failedPercentage = stats ? (stats.failed / stats.total_processed) * 100 : 0

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-800 mb-2">
              Analytics & Insights
            </h1>
            <p className="text-primary-600 text-sm sm:text-base">
              Detailed statistics and visualizations of your color correction activity
            </p>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-800 animate-spin" />
            </div>
          )}

          {!loading && stats && (
            <>
              {/* Overview Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
              >
                <motion.div 
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white rounded-xl border border-primary-200 p-4 sm:p-6 cursor-pointer transition-shadow hover:shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary-800 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-sm font-medium text-primary-700">Total Processed</h3>
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold text-primary-800">
                    {stats.total_processed}
                  </p>
                  <p className="text-xs text-primary-600 mt-2">All time</p>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white rounded-xl border border-primary-200 p-4 sm:p-6 cursor-pointer transition-shadow hover:shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-sm font-medium text-primary-700">Completed</h3>
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold text-green-600">
                    {stats.completed}
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    {completedPercentage.toFixed(1)}% success
                  </p>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white rounded-xl border border-primary-200 p-4 sm:p-6 cursor-pointer transition-shadow hover:shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-red-600 rounded-lg">
                      <XCircle className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-sm font-medium text-primary-700">Failed</h3>
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold text-red-600">
                    {stats.failed}
                  </p>
                  <p className="text-xs text-red-600 mt-2">
                    {failedPercentage.toFixed(1)}% failed
                  </p>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white rounded-xl border border-primary-200 p-4 sm:p-6 cursor-pointer transition-shadow hover:shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary-700 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-sm font-medium text-primary-700">Success Rate</h3>
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold text-primary-800">
                    {stats.success_rate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-primary-600 mt-2">Overall performance</p>
                </motion.div>
              </motion.div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Pie Chart - Status Distribution */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white rounded-xl border border-primary-200 p-6 shadow-lg"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <PieChart className="w-5 h-5 text-primary-600" />
                    <h2 className="text-lg sm:text-xl font-bold text-primary-800">Status Distribution</h2>
                  </div>

                  <div className="flex flex-col items-center">
                    {/* Animated Pie Chart */}
                    <div className="relative w-48 h-48 mb-6">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Background circle */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#f3f4f6"
                          strokeWidth="20"
                        />
                        
                        {/* Completed segment */}
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="20"
                          strokeDasharray={`${completedPercentage * 2.51} ${251 - completedPercentage * 2.51}`}
                          initial={{ strokeDasharray: "0 251" }}
                          animate={{ strokeDasharray: `${completedPercentage * 2.51} ${251 - completedPercentage * 2.51}` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          onMouseEnter={() => setHoveredSegment('completed')}
                          onMouseLeave={() => setHoveredSegment(null)}
                          className="cursor-pointer transition-all"
                          style={{ 
                            filter: hoveredSegment === 'completed' ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))' : 'none',
                            strokeWidth: hoveredSegment === 'completed' ? '22' : '20'
                          }}
                        />
                        
                        {/* Failed segment */}
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="20"
                          strokeDasharray={`${failedPercentage * 2.51} ${251 - failedPercentage * 2.51}`}
                          strokeDashoffset={-completedPercentage * 2.51}
                          initial={{ strokeDasharray: "0 251" }}
                          animate={{ 
                            strokeDasharray: `${failedPercentage * 2.51} ${251 - failedPercentage * 2.51}`,
                            strokeDashoffset: -completedPercentage * 2.51
                          }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                          onMouseEnter={() => setHoveredSegment('failed')}
                          onMouseLeave={() => setHoveredSegment(null)}
                          className="cursor-pointer transition-all"
                          style={{ 
                            filter: hoveredSegment === 'failed' ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))' : 'none',
                            strokeWidth: hoveredSegment === 'failed' ? '22' : '20'
                          }}
                        />
                        
                        {/* Center text */}
                        <text
                          x="50"
                          y="50"
                          textAnchor="middle"
                          dy="0.3em"
                          className="text-2xl font-bold fill-primary-800"
                          transform="rotate(90 50 50)"
                        >
                          {stats.total_processed}
                        </text>
                      </svg>
                    </div>

                    {/* Legend */}
                    <div className="space-y-3 w-full">
                      <motion.div 
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg cursor-pointer"
                        whileHover={{ scale: 1.02, x: 5 }}
                        onMouseEnter={() => setHoveredSegment('completed')}
                        onMouseLeave={() => setHoveredSegment(null)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-primary-700">Completed</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-green-600">{stats.completed}</span>
                          <span className="text-sm text-primary-600 ml-2">({completedPercentage.toFixed(1)}%)</span>
                        </div>
                      </motion.div>

                      <motion.div 
                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg cursor-pointer"
                        whileHover={{ scale: 1.02, x: 5 }}
                        onMouseEnter={() => setHoveredSegment('failed')}
                        onMouseLeave={() => setHoveredSegment(null)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                          <span className="text-sm font-medium text-primary-700">Failed</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-red-600">{stats.failed}</span>
                          <span className="text-sm text-primary-600 ml-2">({failedPercentage.toFixed(1)}%)</span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Processing Time Distribution */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white rounded-xl border border-primary-200 p-6 shadow-lg"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Clock className="w-5 h-5 text-primary-600" />
                    <h2 className="text-lg sm:text-xl font-bold text-primary-800">Processing Time Distribution</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-primary-800" />
                        <p className="text-xs font-medium text-primary-700">Fast (&lt;10s)</p>
                      </div>
                      <p className="text-2xl font-bold text-primary-800">{timeDistribution.fast}</p>
                    </motion.div>

                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-primary-800" />
                        <p className="text-xs font-medium text-primary-700">Medium (10-15s)</p>
                      </div>
                      <p className="text-2xl font-bold text-primary-800">{timeDistribution.medium}</p>
                    </motion.div>

                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg p-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-primary-800" />
                        <p className="text-xs font-medium text-primary-700">Slow (15-20s)</p>
                      </div>
                      <p className="text-2xl font-bold text-primary-800">{timeDistribution.slow}</p>
                    </motion.div>

                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-primary-200 to-primary-300 rounded-lg p-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-primary-800" />
                        <p className="text-xs font-medium text-primary-700">Very Slow (&gt;20s)</p>
                      </div>
                      <p className="text-2xl font-bold text-primary-800">{timeDistribution.verySlow}</p>
                    </motion.div>
                  </div>

                  {/* Stats Summary */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-primary-200">
                    <div className="text-center">
                      <p className="text-xs text-primary-600 mb-1">Average</p>
                      <p className="text-lg font-bold text-primary-800">{stats.average_processing_time.toFixed(1)}s</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-primary-600 mb-1">Fastest</p>
                      <p className="text-lg font-bold text-primary-800">{timeStats.min.toFixed(1)}s</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-primary-600 mb-1">Slowest</p>
                      <p className="text-lg font-bold text-primary-800">{timeStats.max.toFixed(1)}s</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Activity Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-xl border border-primary-200 p-6 shadow-lg"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="w-5 h-5 text-primary-600" />
                  <h2 className="text-lg sm:text-xl font-bold text-primary-800">Weekly Activity Trend</h2>
                </div>

                {/* Animated Bar Chart */}
                <div className="space-y-4">
                  {weeklyActivity.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center gap-4"
                    >
                      <span className="text-sm font-medium text-primary-700 w-16 text-right">
                        {item.label}
                      </span>
                      <div className="flex-1 bg-primary-50 rounded-full h-10 overflow-hidden relative group">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.count / maxActivity) * 100}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                          className="bg-gradient-to-r from-primary-700 via-primary-800 to-primary-900 h-full rounded-full flex items-center justify-end pr-3 relative overflow-hidden"
                        >
                          {/* Animated shine effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{
                              x: ['-100%', '200%']
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 3
                            }}
                          />
                          {item.count > 0 && (
                            <span className="text-sm font-bold text-white relative z-10">
                              {item.count}
                            </span>
                          )}
                        </motion.div>
                        {/* Hover tooltip */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-primary-800/50 rounded-full">
                          <span className="text-white text-sm font-semibold">
                            {item.count} upload{item.count !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-6 pt-4 border-t border-primary-200 flex justify-between text-sm">
                  <span className="text-primary-600">
                    Total in period: <span className="font-bold text-primary-800">
                      {weeklyActivity.reduce((sum, item) => sum + item.count, 0)}
                    </span>
                  </span>
                  <span className="text-primary-600">
                    Peak: <span className="font-bold text-primary-800">
                      {maxActivity} uploads
                    </span>
                  </span>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </DashboardLayout>
  )
}
