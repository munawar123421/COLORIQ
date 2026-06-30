'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ResultsViewer from '@/components/dashboard/ResultsViewer'
import { Loader2, AlertCircle } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface AnalysisData {
  id: string
  originalImage: string
  correctedImage: string
  heatmapImage: string
  processingTime: number
  productName: string
  source: 'upload' | 'url'
  uploadDate: string
}

export default function ResultsPage() {
  const params = useParams()
  const [user, setUser] = useState<any>({
    id: 'user-123',
    name: 'Loading...',
    email: 'loading@coloriq.com',
    avatar: null
  })
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  // Fetch analysis data from API
  useEffect(() => {
    if (params.id) {
      fetchAnalysisData(params.id as string)
    }
  }, [params.id])

  const fetchAnalysisData = async (id: string) => {
    try {
      setLoading(true)
      setError('')
      
      const token = localStorage.getItem('authToken')
      if (!token) {
        setError('Not authenticated. Please login again.')
        setLoading(false)
        return
      }

      console.log('🔍 Fetching analysis data for ID:', id)
      console.log('🔍 API URL:', `${API_URL}/api/images/${id}`)

      const response = await fetch(`${API_URL}/api/images/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error:', errorText)
        throw new Error(`Failed to fetch analysis data: ${response.status}`)
      }

      const data = await response.json()
      console.log('📊 Analysis data received:', data)

      // Transform API data to component format
      const transformedData: AnalysisData = {
        id: data.id,
        originalImage: data.original_url,
        correctedImage: data.corrected_url,
        heatmapImage: data.heatmap_url || '/api/placeholder/600/600',
        processingTime: data.processing_time ? Math.round(data.processing_time * 1000) : 1850,
        productName: data.original_filename.replace(/\.[^/.]+$/, ""), // Remove file extension
        source: 'upload' as const, // TODO: Determine from data
        uploadDate: data.created_at
      }

      setAnalysisData(transformedData)
    } catch (err: any) {
      console.error('❌ Error fetching analysis data:', err)
      setError(err.message || 'Failed to load analysis data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary-800 animate-spin" />
          <span className="ml-3 text-primary-600">Loading analysis results...</span>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout user={user}>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-lg font-medium text-red-800">Error Loading Analysis</p>
            <p className="text-red-600 mt-1">{error}</p>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-red-500">Troubleshooting steps:</p>
              <ul className="text-sm text-red-500 list-disc list-inside space-y-1">
                <li>Make sure the backend server is running on {API_URL}</li>
                <li>Check if you're logged in (refresh the page if needed)</li>
                <li>Verify the analysis ID exists in your history</li>
                <li>Check browser console for detailed error messages</li>
              </ul>
            </div>
            <button
              onClick={() => fetchAnalysisData(params.id as string)}
              className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!analysisData) {
    return (
      <DashboardLayout user={user}>
        <div className="text-center py-12">
          <p className="text-gray-600">Analysis data not found.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ResultsViewer data={analysisData} />
        </motion.div>
      </div>
    </DashboardLayout>
  )
}