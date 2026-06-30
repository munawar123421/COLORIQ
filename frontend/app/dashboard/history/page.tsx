'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Download, Eye, Trash2, Loader2, AlertCircle, Image as ImageIcon, Filter, SortAsc, X, ZoomIn, ArrowLeftRight } from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface HistoryItem {
  id: string
  original_filename: string
  original_url: string
  corrected_url: string
  heatmap_url: string | null
  status: string
  processing_time: number | null
  created_at: string
}

export default function HistoryPage() {
  const [user, setUser] = useState<any>({
    id: 'user-123',
    name: 'Loading...',
    email: 'loading@coloriq.com',
    avatar: null
  })
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'failed'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'time' | 'name'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null)
  const [compareMode, setCompareMode] = useState<HistoryItem | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Load user from localStorage
  useEffect(() => {
    const userName = localStorage.getItem('userName')
    const userEmail = localStorage.getItem('userEmail')
    const userId = localStorage.getItem('userId')
    
    if (userName && userEmail) {
      setUser({
        id: userId || 'user-123',
        name: userName,
        email: userEmail,
        avatar: null
      })
    }
  }, [])

  // Fetch history from API
  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      setError('')
      
      const token = localStorage.getItem('authToken')
      if (!token) {
        setError('Not authenticated. Please login again.')
        setLoading(false)
        return
      }

      console.log('🔍 Fetching history from:', `${API_URL}/api/images/history?limit=100`)
      console.log('🔑 Using token:', token ? 'Token exists' : 'No token')

      const response = await fetch(`${API_URL}/api/images/history?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📡 Response status:', response.status)
      console.log('📡 Response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error:', errorText)
        throw new Error(`Failed to fetch history: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('📊 History data received:', data)
      console.log('📊 Number of records:', data.length)
      
      setHistory(data)
    } catch (err: any) {
      console.error('❌ Error fetching history:', err)
      setError(err.message || 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) {
      return
    }

    try {
      setDeleteId(id)
      const token = localStorage.getItem('authToken')
      
      const response = await fetch(`${API_URL}/api/images/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete record')
      }

      // Remove from list
      setHistory(history.filter(item => item.id !== id))
    } catch (err: any) {
      console.error('Error deleting:', err)
      alert('Failed to delete record')
    } finally {
      setDeleteId(null)
    }
  }

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Filter history based on search
  const filteredHistory = history
    .filter(item => {
      // Search filter
      const matchesSearch = item.original_filename.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Status filter
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus
      
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      // Sorting logic
      let comparison = 0
      
      if (sortBy === 'date') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else if (sortBy === 'time') {
        comparison = (a.processing_time || 0) - (b.processing_time || 0)
      } else if (sortBy === 'name') {
        comparison = a.original_filename.localeCompare(b.original_filename)
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const openPreview = (url: string, title: string) => {
    setPreviewImage({ url, title })
  }

  const closePreview = () => {
    setPreviewImage(null)
  }

  const openCompare = (item: HistoryItem) => {
    setCompareMode(item)
  }

  const closeCompare = () => {
    setCompareMode(null)
  }

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
              Processing History
            </h1>
            <p className="text-primary-600 text-sm sm:text-base">
              View and manage your past color correction analyses
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl border border-primary-200 p-4 space-y-4"
          >
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by filename..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-primary-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-primary-500" />
                </button>
              )}
            </div>

            {/* Filters and Sort */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Status Filter */}
              <div className="flex-1">
                <label className="text-xs font-medium text-primary-600 mb-1 block">Status</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterStatus === 'all'
                        ? 'bg-primary-800 text-white shadow-md'
                        : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterStatus('completed')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterStatus === 'completed'
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                    }`}
                  >
                    Completed
                  </button>
                  <button
                    onClick={() => setFilterStatus('failed')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterStatus === 'failed'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                    }`}
                  >
                    Failed
                  </button>
                </div>
              </div>

              {/* Sort By */}
              <div className="flex-1">
                <label className="text-xs font-medium text-primary-600 mb-1 block">Sort By</label>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="flex-1 px-3 py-2 border border-primary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="date">Date</option>
                    <option value="time">Processing Time</option>
                    <option value="name">Filename</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 bg-primary-100 hover:bg-primary-200 rounded-lg transition-colors"
                    title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  >
                    <SortAsc className={`w-5 h-5 text-primary-700 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-primary-600">
              Showing <span className="font-semibold text-primary-800">{filteredHistory.length}</span> of{' '}
              <span className="font-semibold text-primary-800">{history.length}</span> results
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-800 animate-spin" />
              <span className="ml-3 text-primary-600">Loading history...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Error Loading History</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-red-500">Troubleshooting steps:</p>
                  <ul className="text-xs text-red-500 list-disc list-inside space-y-1">
                    <li>Make sure the backend server is running on {API_URL}</li>
                    <li>Check if you're logged in (refresh the page if needed)</li>
                    <li>Try uploading an image first to create history</li>
                    <li>Check browser console for detailed error messages</li>
                  </ul>
                </div>
                <button
                  onClick={fetchHistory}
                  className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredHistory.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 p-12 text-center"
            >
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No results found' : 'No processing history yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Upload and process your first image to see it here'}
              </p>
              
              {/* Debug Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm font-medium text-gray-700 mb-2">Debug Information:</p>
                <div className="space-y-1 text-xs text-gray-600">
                  <p>• API URL: {API_URL}</p>
                  <p>• Auth Token: {localStorage.getItem('authToken') ? '✅ Present' : '❌ Missing'}</p>
                  <p>• User: {user.name} ({user.email})</p>
                  <p>• Total Records: {history.length}</p>
                </div>
              </div>

              {!searchTerm && (
                <div className="space-y-3">
                  <Link
                    href="/dashboard/upload"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                  >
                    Upload Image
                  </Link>
                  <div className="text-sm text-gray-500">
                    or{' '}
                    <button
                      onClick={fetchHistory}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      refresh this page
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* History Grid */}
          {!loading && !error && filteredHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid gap-4 sm:gap-6"
            >
              {filteredHistory.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`bg-white rounded-xl border-2 shadow-sm transition-all duration-300 overflow-hidden ${
                    hoveredId === item.id 
                      ? 'border-blue-400 shadow-lg scale-[1.02]' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                      {/* Images Preview with Hover Effect */}
                      <div className="flex gap-3 flex-shrink-0">
                        <div 
                          className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 cursor-pointer group"
                          onClick={() => openPreview(item.original_url, 'Original - ' + item.original_filename)}
                        >
                          <img
                            src={item.original_url}
                            alt="Original"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <ZoomIn className="w-6 h-6 text-white" />
                          </div>
                          <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                            Original
                          </div>
                        </div>
                        <div 
                          className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-300 cursor-pointer group"
                          onClick={() => openPreview(item.corrected_url, 'Corrected - ' + item.original_filename)}
                        >
                          <img
                            src={item.corrected_url}
                            alt="Corrected"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <ZoomIn className="w-6 h-6 text-white" />
                          </div>
                          <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded">
                            Corrected
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 truncate">
                          {item.original_filename}
                        </h3>
                        
                        <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(item.created_at)}</span>
                          </div>
                          {item.processing_time && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Time:</span>
                              <span>{item.processing_time.toFixed(2)}s</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              item.status === 'completed' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => openCompare(item)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-all duration-300 text-sm font-medium hover:scale-105"
                          >
                            <ArrowLeftRight className="w-4 h-4" />
                            <span className="hidden sm:inline">Compare</span>
                          </button>
                          <Link
                            href={`/dashboard/results/${item.id}`}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-300 text-sm font-medium hover:scale-105"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">View</span>
                          </Link>
                          <button
                            onClick={() => downloadImage(item.corrected_url, `corrected-${item.original_filename}`)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all duration-300 text-sm font-medium hover:scale-105"
                          >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Download</span>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deleteId === item.id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-300 text-sm font-medium disabled:opacity-50 hover:scale-105"
                          >
                            {deleteId === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Results Count */}
          {!loading && !error && filteredHistory.length > 0 && (
            <div className="text-center text-sm text-gray-600">
              Showing {filteredHistory.length} of {history.length} results
            </div>
          )}
        </div>

        {/* Image Preview Modal */}
        <AnimatePresence>
          {previewImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={closePreview}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-5xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={closePreview}
                  className="absolute -top-12 right-0 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="bg-white rounded-2xl p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">{previewImage.title}</h3>
                  <img
                    src={previewImage.url}
                    alt={previewImage.title}
                    className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compare Modal */}
        <AnimatePresence>
          {compareMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={closeCompare}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-7xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={closeCompare}
                  className="absolute -top-12 right-0 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="bg-white rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <ArrowLeftRight className="w-6 h-6 text-blue-600" />
                    Side-by-Side Comparison
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Original */}
                    <div>
                      <div className="bg-gray-100 rounded-lg p-2 mb-2">
                        <p className="text-sm font-semibold text-gray-700 text-center">Original</p>
                      </div>
                      <img
                        src={compareMode.original_url}
                        alt="Original"
                        className="w-full h-auto rounded-xl border-2 border-gray-300"
                      />
                    </div>

                    {/* Corrected */}
                    <div>
                      <div className="bg-blue-100 rounded-lg p-2 mb-2">
                        <p className="text-sm font-semibold text-blue-700 text-center">AI Corrected</p>
                      </div>
                      <img
                        src={compareMode.corrected_url}
                        alt="Corrected"
                        className="w-full h-auto rounded-xl border-2 border-blue-400"
                      />
                    </div>
                  </div>

                  {/* Heatmap */}
                  {compareMode.heatmap_url && (
                    <div className="mt-6">
                      <div className="bg-purple-100 rounded-lg p-2 mb-2">
                        <p className="text-sm font-semibold text-purple-700 text-center">Difference Heatmap</p>
                      </div>
                      <img
                        src={compareMode.heatmap_url}
                        alt="Heatmap"
                        className="w-full h-auto max-h-64 object-contain rounded-xl border-2 border-purple-300"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Filename</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{compareMode.original_filename}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Status</p>
                      <p className={`text-sm font-semibold ${compareMode.status === 'completed' ? 'text-green-600' : 'text-red-600'}`}>
                        {compareMode.status}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Processing Time</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {compareMode.processing_time?.toFixed(2)}s
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Date</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(compareMode.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DashboardLayout>
  )
}