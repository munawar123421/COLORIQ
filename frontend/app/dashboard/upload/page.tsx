'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  Sparkles, 
  Zap,
  ArrowLeft,
  Download,
  Eye,
  RotateCcw,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function UploadPage() {
  const [user, setUser] = useState<any>({
    id: 'user-123',
    name: 'Loading...',
    email: 'loading@coloriq.com',
    avatar: null
  })
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff']
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG, PNG, WEBP, BMP, TIFF)')
      return
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    setError('')
    
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUploadSubmit = async () => {
    if (!selectedFile) {
      setError('Please select an image to upload')
      return
    }

    setIsProcessing(true)
    setError('')
    setUploadProgress(0)

    try {
      // Get auth token
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('Not authenticated. Please login again.')
      }

      // Create form data
      const formData = new FormData()
      formData.append('file', selectedFile)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      // Upload and process
      const response = await fetch(`${API_URL}/api/images/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Upload failed')
      }

      const data = await response.json()
      
      // Set results
      setResults({
        processingId: data.processing_id,
        originalImage: data.original_url,
        correctedImage: data.corrected_url,
        heatmapImage: data.heatmap_url,
        processingTime: data.processing_time,
        status: data.status
      })

    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to process image. Please try again.')
    } finally {
      setIsProcessing(false)
      setUploadProgress(0)
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setResults(null)
    setError('')
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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

  if (results) {
    return (
      <DashboardLayout user={user}>
        <div className="min-h-screen bg-gray-50">
          {/* Premium Header */}
          <div className="border-b border-gray-200 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <button
                    onClick={resetUpload}
                    className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-300 border border-gray-200 hover:border-[#6C63FF]/50 group"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-[#6C63FF] transition-colors" />
                  </button>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 via-[#6C63FF] to-[#00E5FF] bg-clip-text text-transparent">
                      Analysis Complete
                    </h1>
                    <p className="text-gray-600 text-xs sm:text-sm mt-0.5">AI-powered color correction results</p>
                  </div>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button 
                    onClick={() => downloadImage(results.correctedImage, 'coloriq-corrected.jpg')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-[#6C63FF] to-[#00E5FF] text-white rounded-xl hover:shadow-lg hover:shadow-[#6C63FF]/30 transition-all duration-300 font-medium text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download Result</span>
                    <span className="sm:hidden">Download</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Main Content - Image Comparison */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {/* Side-by-Side Comparison */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-gray-200">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#00E5FF] rounded-full animate-pulse"></div>
                      Image Comparison
                    </h2>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1">Original vs AI-Corrected</p>
                  </div>
                  
                  <div className="p-4 sm:p-6">
                    <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                      {/* Original Image */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">Original</span>
                          <button
                            onClick={() => {
                              const modal = document.getElementById('zoom-modal-original')
                              if (modal) modal.classList.remove('hidden')
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300 border border-gray-200 hover:border-[#6C63FF]/50 group"
                          >
                            <Eye className="w-4 h-4 text-gray-600 group-hover:text-[#6C63FF]" />
                          </button>
                        </div>
                        <div className="relative bg-white rounded-xl overflow-hidden border-2 border-gray-200 group">
                          <img
                            src={results.originalImage}
                            alt="Original"
                            className="w-full h-auto object-contain"
                          />
                        </div>
                      </div>

                      {/* Corrected Image */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-[#6C63FF] to-[#00E5FF] bg-clip-text text-transparent uppercase tracking-wider">
                            AI Corrected
                          </span>
                          <button
                            onClick={() => {
                              const modal = document.getElementById('zoom-modal-corrected')
                              if (modal) modal.classList.remove('hidden')
                            }}
                            className="p-2 hover:bg-primary-50 rounded-lg transition-all duration-300 border border-gray-200 hover:border-primary-600/50 group"
                          >
                            <Eye className="w-4 h-4 text-gray-600 group-hover:text-primary-800" />
                          </button>
                        </div>
                        <div className="relative bg-white rounded-xl overflow-hidden border-2 border-[#6C63FF]/30 shadow-lg shadow-[#6C63FF]/10 group">
                          <img
                            src={results.correctedImage}
                            alt="Corrected"
                            className="w-full h-auto object-contain"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Download Buttons */}
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
                      <button
                        onClick={() => downloadImage(results.originalImage, 'coloriq-original.jpg')}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 border border-gray-200 hover:border-gray-300 text-sm font-medium"
                      >
                        <Download className="w-4 h-4" />
                        Download Original
                      </button>
                      <button
                        onClick={() => downloadImage(results.correctedImage, 'coloriq-corrected.jpg')}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#6C63FF] to-[#00E5FF] text-white rounded-xl hover:shadow-lg hover:shadow-[#6C63FF]/30 transition-all duration-300 font-medium text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download Corrected
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={resetUpload}
                    className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 border border-gray-200 hover:border-gray-300 font-medium text-sm"
                  >
                    <RotateCcw className="w-4 sm:w-5 h-4 sm:h-5" />
                    Analyze Another Image
                  </button>
                  <Link
                    href="/dashboard"
                    className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 border border-gray-600 font-medium text-sm"
                  >
                    <ArrowLeft className="w-4 sm:w-5 h-4 sm:h-5" />
                    Back to Dashboard
                  </Link>
                </div>
              </div>

              {/* Sidebar - Info Panel */}
              <div className="space-y-4 sm:space-y-6">
                {/* Processing Status */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-gray-200">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Processing Info</h3>
                  </div>
                  <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <span className="text-xs sm:text-sm font-medium text-gray-700">Status</span>
                      <span className="flex items-center gap-2 text-xs sm:text-sm font-bold text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        {results.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200">
                      <span className="text-xs sm:text-sm font-medium text-gray-700">Processing Time</span>
                      <span className="text-xs sm:text-sm font-bold text-primary-800">{results.processingTime.toFixed(2)}s</span>
                    </div>
                    <div className="flex flex-col gap-1 p-3 sm:p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200">
                      <span className="text-xs sm:text-sm font-medium text-gray-700">Processing ID</span>
                      <span className="text-xs font-mono text-primary-800 break-all">{results.processingId.slice(0, 16)}...</span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl border border-primary-200 shadow-lg p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Quick Stats</h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600">Model Used</span>
                      <span className="text-xs sm:text-sm font-semibold text-gray-900">UNet ColorIQ</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600">Resolution</span>
                      <span className="text-xs sm:text-sm font-semibold text-gray-900">Original</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600">Format</span>
                      <span className="text-xs sm:text-sm font-semibold text-gray-900">JPEG</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Zoom Modals */}
          {/* Original Image Modal */}
          <div id="zoom-modal-original" className="hidden fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="relative max-w-7xl w-full">
              <button
                onClick={() => {
                  const modal = document.getElementById('zoom-modal-original')
                  if (modal) modal.classList.add('hidden')
                }}
                className="absolute -top-12 right-0 p-2 sm:p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm sm:text-base"
              >
                <span className="text-xl sm:text-2xl leading-none">×</span>
              </button>
              <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Original Image - Full View</h3>
                <div className="bg-white rounded-xl overflow-hidden">
                  <img
                    src={results.originalImage}
                    alt="Original Full"
                    className="w-full h-auto max-h-[70vh] sm:max-h-[80vh] object-contain mx-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Corrected Image Modal */}
          <div id="zoom-modal-corrected" className="hidden fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="relative max-w-7xl w-full">
              <button
                onClick={() => {
                  const modal = document.getElementById('zoom-modal-corrected')
                  if (modal) modal.classList.add('hidden')
                }}
                className="absolute -top-12 right-0 p-2 sm:p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm sm:text-base"
              >
                <span className="text-xl sm:text-2xl leading-none">×</span>
              </button>
              <div className="bg-white rounded-2xl border border-[#6C63FF]/30 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#00E5FF] bg-clip-text text-transparent mb-3 sm:mb-4">
                  AI Corrected Image - Full View
                </h3>
                <div className="bg-white rounded-xl overflow-hidden">
                  <img
                    src={results.correctedImage}
                    alt="Corrected Full"
                    className="w-full h-auto max-h-[70vh] sm:max-h-[80vh] object-contain mx-auto"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="p-2 bg-primary-800 rounded-xl shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-primary-800">
              AI Color Correction
            </h1>
          </div>
          <p className="text-gray-600">
            Upload a clothing image to get AI-powered color correction
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </motion.div>
        )}
        
        {/* Upload Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary-800 rounded-lg shadow-md">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Upload Image</h3>
                <p className="text-sm text-gray-600">JPG, PNG, WEBP, BMP, TIFF • Max 10MB</p>
              </div>
            </div>

            {!selectedFile ? (
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer ${
                  dragActive 
                    ? 'border-primary-600 bg-primary-50/50' 
                    : 'border-gray-300 hover:border-primary-600 hover:bg-primary-50/30'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/bmp,image/tiff"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <div className="text-center">
                  <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-3 font-medium text-lg">
                    {dragActive ? 'Drop your image here!' : 'Drop image or click to browse'}
                  </p>
                  <button className="bg-primary-800 text-white px-6 py-3 rounded-lg hover:bg-primary-900 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl">
                    Choose File
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {previewUrl && (
                  <div className="relative group">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-64 object-contain rounded-lg shadow-md bg-gray-50"
                    />
                    <button
                      onClick={resetUpload}
                      className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                )}
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4 border border-primary-200">
                  <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-600">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Process Button */}
        <div className="text-center mb-6">
          <button
            onClick={handleUploadSubmit}
            disabled={!selectedFile || isProcessing}
            className="bg-primary-800 text-white px-8 py-4 rounded-xl hover:bg-primary-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3 mx-auto"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Image...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Process Image
              </>
            )}
          </button>
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-800 rounded-xl shadow-lg">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-lg">AI Processing in Progress! ✨</h4>
                <p className="text-gray-600 mb-3">
                  Our advanced AI is analyzing colors and generating corrections...
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    style={{ width: `${uploadProgress}%` }}
                    className="h-2 bg-primary-800 rounded-full transition-all duration-300"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">{uploadProgress}% complete</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      </DashboardLayout>
  )
}
