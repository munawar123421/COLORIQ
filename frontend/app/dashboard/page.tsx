'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Clock, CheckCircle, Loader2, Upload, BarChart3, History } from 'lucide-react'
import Link from 'next/link'
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
  original_filename: string
  original_url: string
  corrected_url: string
  processing_time: number | null
  created_at: string
  status: string
}

export default function Dashboard() {
  const [user, setUser] = useState<any>({
    id: 'user-123',
    name: 'Loading...',
    email: 'loading@coloriq.com',
    avatar: null
  })
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentHistory, setRecentHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  // Load user from localStorage
  useEffect(() => {
    const userName = localStorage.getItem('userName') || 'Demo User'
    const userEmail = localStorage.getItem('userEmail') || 'demo@coloriq.com'
    const userId = localStorage.getItem('userId') || 'user-123'
    
    setUser({
      id: userId,
      name: userName,
      email: userEmail,
      avatar: null
    })
  }, [])

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        // Set demo data if no token
        setStats({
          total_processed: 12,
          completed: 10,
          failed: 2,
          success_rate: 83.3,
          average_processing_time: 2.4
        })
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
      } else {
        // Fallback to demo data
        setStats({
          total_processed: 12,
          completed: 10,
          failed: 2,
          success_rate: 83.3,
          average_processing_time: 2.4
        })
      }

      // Fetch recent history (last 5)
      const historyResponse = await fetch(`${API_URL}/api/images/history?limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (historyResponse.ok) {
        const historyData = await historyResponse.json()
        setRecentHistory(historyData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set demo data on error
      setStats({
        total_processed: 12,
        completed: 10,
        failed: 2,
        success_rate: 83.3,
        average_processing_time: 2.4
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-800 mb-2">
              Welcome back, {user?.name || 'User'}! 👋
            </h1>
            <p className="text-primary-600 text-sm sm:text-base">
              Here's your color correction overview
            </p>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-800 animate-spin" />
            </div>
          )}

          {!loading && (
            <>
              {/* Quick Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
              >
                {/* Total Processed */}
                <motion.div 
                  className="bg-white rounded-xl border border-primary-200 p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <motion.div 
                      className="p-2 bg-primary-800 rounded-lg"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </motion.div>
                  </div>
                  <motion.h3 
                    className="text-2xl sm:text-3xl font-bold text-primary-800 mb-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {stats?.total_processed || 0}
                  </motion.h3>
                  <p className="text-xs sm:text-sm text-primary-600">Total Processed</p>
                </motion.div>

                {/* Success Rate */}
                <motion.div 
                  className="bg-white rounded-xl border border-primary-200 p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <motion.div 
                      className="p-2 bg-green-600 rounded-lg"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </motion.div>
                  </div>
                  <motion.h3 
                    className="text-2xl sm:text-3xl font-bold text-primary-800 mb-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {stats?.success_rate.toFixed(1) || 0}%
                  </motion.h3>
                  <p className="text-xs sm:text-sm text-primary-600">Success Rate</p>
                </motion.div>

                {/* Avg Processing Time */}
                <motion.div 
                  className="bg-white rounded-xl border border-primary-200 p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <motion.div 
                      className="p-2 bg-primary-700 rounded-lg"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </motion.div>
                  </div>
                  <motion.h3 
                    className="text-2xl sm:text-3xl font-bold text-primary-800 mb-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {stats?.average_processing_time.toFixed(1) || 0}s
                  </motion.h3>
                  <p className="text-xs sm:text-sm text-primary-600">Avg Time</p>
                </motion.div>

                {/* Completed */}
                <motion.div 
                  className="bg-white rounded-xl border border-primary-200 p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <motion.div 
                      className="p-2 bg-primary-600 rounded-lg"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </motion.div>
                  </div>
                  <motion.h3 
                    className="text-2xl sm:text-3xl font-bold text-primary-800 mb-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    {stats?.completed || 0}
                  </motion.h3>
                  <p className="text-xs sm:text-sm text-primary-600">Completed</p>
                </motion.div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/dashboard/upload"
                    className="bg-primary-800 text-white rounded-xl p-6 hover:bg-primary-900 hover:shadow-lg transition-all duration-300 group block"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Upload className="w-8 h-8 mb-3" />
                    </motion.div>
                    <h3 className="text-lg font-bold mb-1">Upload Image</h3>
                    <p className="text-sm text-primary-100">Process new image</p>
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/dashboard/history"
                    className="bg-primary-700 text-white rounded-xl p-6 hover:bg-primary-800 hover:shadow-lg transition-all duration-300 group block"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <History className="w-8 h-8 mb-3" />
                    </motion.div>
                    <h3 className="text-lg font-bold mb-1">View History</h3>
                    <p className="text-sm text-primary-100">See past uploads</p>
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/dashboard/analytics"
                    className="bg-primary-600 text-white rounded-xl p-6 hover:bg-primary-700 hover:shadow-lg transition-all duration-300 group block"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <BarChart3 className="w-8 h-8 mb-3" />
                    </motion.div>
                    <h3 className="text-lg font-bold mb-1">Analytics</h3>
                    <p className="text-sm text-primary-100">View statistics</p>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-xl border border-primary-200 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="p-4 sm:p-6 border-b border-primary-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-bold text-primary-800">Recent Activity</h2>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        href="/dashboard/history"
                        className="text-sm text-primary-700 hover:text-primary-800 font-medium"
                      >
                        View All
                      </Link>
                    </motion.div>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  {recentHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                      >
                        <Upload className="w-12 h-12 text-primary-400 mx-auto mb-3" />
                      </motion.div>
                      <p className="text-primary-600 mb-4">No activity yet</p>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link
                          href="/dashboard/upload"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors text-sm font-medium"
                        >
                          Upload Your First Image
                        </Link>
                      </motion.div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentHistory.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{ x: 5, scale: 1.01 }}
                        >
                          <Link
                            href={`/dashboard/results/${item.id}`}
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-primary-50 transition-colors"
                          >
                            <motion.div 
                              className="w-16 h-16 bg-primary-100 rounded-lg overflow-hidden flex-shrink-0"
                              whileHover={{ scale: 1.05 }}
                            >
                              <img
                                src={item.corrected_url}
                                alt={item.original_filename}
                                className="w-full h-full object-cover"
                              />
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-primary-800 truncate">
                                {item.original_filename}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-primary-600 mt-1">
                                <span>{formatDate(item.created_at)}</span>
                                {item.processing_time && (
                                  <span>• {item.processing_time.toFixed(1)}s</span>
                                )}
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  item.status === 'completed' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {item.status}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </div>
      </DashboardLayout>
  )
}