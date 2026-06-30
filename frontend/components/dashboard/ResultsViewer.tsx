'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Download, 
  Clock, 
  FileImage,
  FileText,
  Maximize2
} from 'lucide-react'
import Link from 'next/link'

interface ResultsViewerProps {
  data: {
    id: string
    originalImage: string
    correctedImage: string
    heatmapImage: string
    processingTime: number
    productName: string
    source: 'upload' | 'url'
    uploadDate: string
  }
}

export default function ResultsViewer({ data }: ResultsViewerProps) {
  const [comparisonSlider, setComparisonSlider] = useState(50)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [comparisonMode, setComparisonMode] = useState<'slider' | 'sideBySide'>('slider')

  // Keyboard shortcuts for comparison
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'c' || e.key === 'C') {
        setComparisonMode(comparisonMode === 'slider' ? 'sideBySide' : 'slider')
      }
      if (e.key === 'f' || e.key === 'F') {
        setIsFullscreen(!isFullscreen)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [comparisonMode, isFullscreen])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDownloadImage = async (type: 'original' | 'corrected') => {
    try {
      const imageUrl = type === 'original' ? data.originalImage : data.correctedImage
      const filename = `${type}-${data.productName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`
      
      // Show loading state
      const button = document.querySelector(`[data-download-${type}]`) as HTMLButtonElement
      if (button) {
        const originalText = button.innerHTML
        button.innerHTML = '<div class="flex items-center gap-2"><div class="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div><span>Downloading...</span></div>'
        button.disabled = true
      }

      // Method 1: Try direct fetch with CORS handling
      try {
        const response = await fetch(imageUrl, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'image/*',
          },
        })

        if (response.ok) {
          const blob = await response.blob()
          
          // Create download link
          const downloadUrl = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = downloadUrl
          link.download = filename
          link.style.display = 'none'
          
          // Trigger download
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          // Clean up
          URL.revokeObjectURL(downloadUrl)
          
          // Show success feedback
          if (button) {
            button.innerHTML = '<div class="flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span>Downloaded!</span></div>'
            
            setTimeout(() => {
              button.innerHTML = originalText
              button.disabled = false
            }, 2000)
          }
          return // Successfully downloaded, exit function
        }
      } catch (fetchError) {
        console.log('Direct fetch failed, trying alternative method:', fetchError)
      }

      // Method 2: Try using canvas to convert image to blob
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = imageUrl
        })

        // Create canvas and draw image
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          
          // Convert to blob
          canvas.toBlob((blob) => {
            if (blob) {
              const downloadUrl = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = downloadUrl
              link.download = filename
              link.style.display = 'none'
              
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              
              URL.revokeObjectURL(downloadUrl)
              
              // Show success feedback
              if (button) {
                button.innerHTML = '<div class="flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span>Downloaded!</span></div>'
                
                setTimeout(() => {
                  button.innerHTML = originalText
                  button.disabled = false
                }, 2000)
              }
            }
          }, 'image/jpeg', 0.9)
        }
        return
      } catch (canvasError) {
        console.log('Canvas method failed, trying fallback:', canvasError)
      }

      // Method 3: Fallback - open in new tab
      window.open(imageUrl, '_blank')
      
      // Show fallback message
      if (button) {
        button.innerHTML = '<div class="flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg><span>Opened in new tab</span></div>'
        
        setTimeout(() => {
          button.innerHTML = originalText
          button.disabled = false
        }, 3000)
      }
      
    } catch (error) {
      console.error('All download methods failed:', error)
      
      // Show error feedback
      const button = document.querySelector(`[data-download-${type}]`) as HTMLButtonElement
      if (button) {
        const originalText = button.innerHTML
        button.innerHTML = '<div class="flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg><span>Failed</span></div>'
        button.classList.add('bg-red-50', 'border-red-200', 'text-red-700')
        
        setTimeout(() => {
          button.innerHTML = originalText
          button.disabled = false
          button.classList.remove('bg-red-50', 'border-red-200', 'text-red-700')
        }, 3000)
      }
      
      // Show user-friendly error message
      alert(`Download failed. Please try:\n1. Right-click the image and select "Save image as..."\n2. Check your internet connection\n3. Try again in a few moments`)
    }
  }

  const handleDownloadReport = async () => {
    // Get button reference and store original text
    const button = document.querySelector('[data-download-report]') as HTMLButtonElement
    const originalText = button?.innerHTML || 'Download Report'
    
    try {
      // Show loading state
      if (button) {
        button.innerHTML = '<div class="flex items-center gap-2"><div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Generating...</div>'
        button.disabled = true
      }

      // Generate a comprehensive report
      const reportData = {
        title: "COLORIQ Analysis Report",
        productName: data.productName,
        analysisId: data.id,
        analysisDate: formatDate(data.uploadDate),
        processingTime: `${data.processingTime}ms`,
        source: data.source === 'upload' ? 'File Upload' : 'URL Import',
        images: {
          originalImage: data.originalImage,
          correctedImage: data.correctedImage,
          heatmapImage: data.heatmapImage
        },
        generatedAt: new Date().toISOString(),
        generatedBy: "COLORIQ AI Color Correction System"
      }
      
      // Create a formatted JSON report
      const reportJson = JSON.stringify(reportData, null, 2)
      const blob = new Blob([reportJson], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `coloriq-report-${data.productName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      
      // Show success feedback
      if (button) {
        button.innerHTML = '<div class="flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Downloaded!</div>'
        
        setTimeout(() => {
          button.innerHTML = originalText
          button.disabled = false
        }, 2000)
      }
      
    } catch (error) {
      console.error('Report generation failed:', error)
      
      // Show error feedback
      if (button) {
        button.innerHTML = '<div class="flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>Failed</div>'
        button.classList.add('bg-red-600', 'hover:bg-red-700')
        button.classList.remove('bg-primary-600', 'hover:bg-primary-700')
        
        setTimeout(() => {
          button.innerHTML = originalText
          button.disabled = false
          button.classList.remove('bg-red-600', 'hover:bg-red-700')
          button.classList.add('bg-primary-600', 'hover:bg-primary-700')
        }, 3000)
      }
      
      alert('Failed to generate report. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{data.productName}</h1>
            <p className="text-gray-600">
              Analyzed on {formatDate(data.uploadDate)} • Source: {data.source === 'upload' ? 'Upload' : 'URL'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
          <button
            onClick={handleDownloadReport}
            data-download-report
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-4 h-4" />
            Download Report
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`grid ${isFullscreen ? 'grid-cols-1' : 'lg:grid-cols-3'} gap-6`}>
        {/* Image Comparison - Takes 2 columns */}
        <div className={`${isFullscreen ? 'col-span-1' : 'lg:col-span-2'} space-y-6`}>
          {/* Comparison Viewer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Color Comparison</h2>
              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setComparisonMode('slider')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      comparisonMode === 'slider'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Slider
                  </button>
                  <button
                    onClick={() => setComparisonMode('sideBySide')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      comparisonMode === 'sideBySide'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Side by Side
                  </button>
                </div>
              </div>
            </div>

            {/* Image Container */}
            <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: comparisonMode === 'sideBySide' ? '2/1' : '16/10' }}>
              <>
                  {comparisonMode === 'slider' ? (
                    /* Slider Comparison */
                    <div className="relative w-full h-full overflow-hidden">
                      {/* Corrected Image (Background) */}
                      <img
                        src={data.correctedImage}
                        alt="AI Corrected Image"
                        className="absolute inset-0 w-full h-full comparison-image"
                        onError={(e) => {
                          console.error('Failed to load corrected image:', data.correctedImage)
                          e.currentTarget.src = '/api/placeholder/600/400'
                        }}
                      />
                      
                      {/* Original Image (Foreground with dynamic width) */}
                      <div 
                        className="absolute inset-0 overflow-hidden"
                        style={{ width: `${comparisonSlider}%` }}
                      >
                        <img
                          src={data.originalImage}
                          alt="Original Image"
                          className="w-full h-full comparison-image"
                          style={{ width: `${100 * (100 / comparisonSlider)}%` }}
                          onError={(e) => {
                            console.error('Failed to load original image:', data.originalImage)
                            e.currentTarget.src = '/api/placeholder/600/400'
                          }}
                        />
                      </div>

                      {/* Divider Line */}
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10 flex items-center justify-center"
                        style={{ left: `${comparisonSlider}%`, transform: 'translateX(-50%)' }}
                      >
                        {/* Slider Handle */}
                        <div className="w-8 h-8 bg-white rounded-full shadow-lg border-2 border-gray-300 cursor-grab active:cursor-grabbing flex items-center justify-center">
                          <div className="flex gap-0.5">
                            <div className="w-0.5 h-4 bg-gray-400 rounded-full" />
                            <div className="w-0.5 h-4 bg-gray-400 rounded-full" />
                          </div>
                        </div>
                      </div>

                      {/* Image Labels with Download */}
                      <div className="absolute bottom-2 left-2 flex items-center gap-2">
                        <div className="bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
                          Original
                        </div>
                        <button
                          onClick={() => handleDownloadImage('original')}
                          className="bg-black/70 hover:bg-black/90 text-white p-1 rounded transition-colors"
                          title="Download Original Image"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 right-2 flex items-center gap-2">
                        <button
                          onClick={() => handleDownloadImage('corrected')}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded transition-colors"
                          title="Download Corrected Image"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        <div className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
                          AI Corrected
                        </div>
                      </div>

                      {/* Invisible Slider Input */}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={comparisonSlider}
                        onChange={(e) => setComparisonSlider(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 image-comparison-slider z-30"
                      />
                    </div>
                  ) : (
                    /* Side by Side Comparison */
                    <div className="flex w-full h-full">
                      {/* Original Image */}
                      <div className="relative w-1/2 h-full border-r-2 border-white">
                        <img
                          src={data.originalImage}
                          alt="Original Image"
                          className="w-full h-full comparison-image"
                          onError={(e) => {
                            console.error('Failed to load original image:', data.originalImage)
                            e.currentTarget.src = '/api/placeholder/600/400'
                          }}
                        />
                        <div className="absolute bottom-2 left-2 flex items-center gap-2">
                          <div className="bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
                            Original
                          </div>
                          <button
                            onClick={() => handleDownloadImage('original')}
                            className="bg-black/70 hover:bg-black/90 text-white p-1 rounded transition-colors"
                            title="Download Original Image"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Corrected Image */}
                      <div className="relative w-1/2 h-full">
                        <img
                          src={data.correctedImage}
                          alt="AI Corrected Image"
                          className="w-full h-full comparison-image"
                          onError={(e) => {
                            console.error('Failed to load corrected image:', data.correctedImage)
                            e.currentTarget.src = '/api/placeholder/600/400'
                          }}
                        />
                        <div className="absolute bottom-2 right-2 flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadImage('corrected')}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded transition-colors"
                            title="Download Corrected Image"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                          <div className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
                            AI Corrected
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
            </div>

            {/* Comparison Instructions */}
            <div className="mt-4">
              {comparisonMode === 'slider' && (
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-black/70 rounded"></div>
                    Original
                  </span>
                  <span className="text-xs text-gray-500">← Drag slider to compare →</span>
                  <span className="flex items-center gap-2">
                    AI Corrected
                    <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  </span>
                </div>
              )}
              {comparisonMode === 'sideBySide' && (
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-black/70 rounded"></div>
                    Original Image
                  </span>
                  <span className="flex items-center gap-2">
                    AI Corrected Image
                    <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  </span>
                </div>
              )}
              
              {/* Keyboard Shortcuts Help */}
              <div className="mt-2 text-center">
                <div className="inline-flex items-center gap-4 text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                  <span>Press <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-gray-700 font-mono">C</kbd> to toggle comparison</span>
                  <span>Press <kbd className="px-1 py-0.5 bg-white border border-gray-300 rounded text-gray-700 font-mono">F</kbd> for fullscreen</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Download Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Download Options</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <button
                onClick={() => handleDownloadImage('original')}
                data-download-original
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileImage className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Original Image</p>
                  <p className="text-sm text-gray-600">JPG/PNG</p>
                </div>
              </button>
              
              <button
                onClick={() => handleDownloadImage('corrected')}
                data-download-corrected
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5 text-primary-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Corrected Image</p>
                  <p className="text-sm text-gray-600">JPG/PNG</p>
                </div>
              </button>
              
              <button
                onClick={handleDownloadReport}
                data-download-report
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="w-5 h-5 text-secondary-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Full Report</p>
                  <p className="text-sm text-gray-600">JSON</p>
                </div>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Metrics and Details - Takes 1 column */}
        <div className="space-y-6">
          {/* Processing Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Information</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">Processing Time</span>
                </div>
                <span className="font-semibold text-gray-900">{data.processingTime}ms</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}