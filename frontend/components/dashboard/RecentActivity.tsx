'use client'

import { motion } from 'framer-motion'
import { Eye, Upload, Link as LinkIcon, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Analysis {
  id: string
  thumbnail: string
  originalImage: string
  correctedImage: string
  source: 'upload' | 'url'
  accuracy: number
  confidence: number
  date: string
  productName: string
}

interface RecentActivityProps {
  analyses: Analysis[]
}

export default function RecentActivity({ analyses }: RecentActivityProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">📋 Recently Checked</h2>
        <Link
          href="/dashboard/history"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors group"
        >
          View All
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {analyses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="bg-gray-100 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No analyses yet</h3>
          <p className="text-gray-600 mb-6">
            Upload your first image to get started with AI color correction
          </p>
          <Link
            href="/dashboard/upload"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Upload className="w-4 h-4" />
            Start Analysis
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-semibold text-gray-600 border-b border-gray-200">
            <div className="col-span-1">Image</div>
            <div className="col-span-4">Product</div>
            <div className="col-span-2">Accuracy</div>
            <div className="col-span-3">Date</div>
            <div className="col-span-2">Action</div>
          </div>

          {/* Table Rows */}
          {analyses.map((analysis, index) => (
            <motion.div
              key={analysis.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="grid grid-cols-12 gap-4 items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
            >
              {/* Thumbnail */}
              <div className="col-span-1">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg overflow-hidden shadow-md">
                    <div className="w-full h-full bg-gradient-to-br from-blue-200/50 to-purple-200/50 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-600">🖼️</span>
                    </div>
                  </div>
                  {/* Source indicator */}
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full shadow-md border flex items-center justify-center">
                    {analysis.source === 'upload' ? (
                      <Upload className="w-3 h-3 text-blue-600" />
                    ) : (
                      <LinkIcon className="w-3 h-3 text-purple-600" />
                    )}
                  </div>
                </div>
              </div>

              {/* Product Name */}
              <div className="col-span-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {analysis.productName}
                </h3>
                <p className="text-sm text-gray-500">
                  {analysis.source === 'upload' ? 'Uploaded' : 'From URL'}
                </p>
              </div>

              {/* Accuracy */}
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    analysis.accuracy >= 90 ? 'bg-green-500' :
                    analysis.accuracy >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="font-bold text-gray-900">{analysis.accuracy}%</span>
                </div>
              </div>

              {/* Date */}
              <div className="col-span-3">
                <span className="text-sm text-gray-600">{analysis.date}</span>
              </div>

              {/* Action */}
              <div className="col-span-2">
                <Link
                  href={`/dashboard/results/${analysis.id}`}
                  className="inline-flex items-center gap-2 bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  <Eye className="w-3 h-3" />
                  View →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}