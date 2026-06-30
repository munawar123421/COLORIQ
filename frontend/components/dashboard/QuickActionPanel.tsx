'use client'

import { motion } from 'framer-motion'
import { Upload, Link as LinkIcon, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'

export default function QuickActionPanel() {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-6"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-purple-800 bg-clip-text text-transparent">
            Start New Color Analysis
          </h2>
        </div>
        <p className="text-gray-600">
          Upload an image or paste a URL to get AI-powered color correction
        </p>
      </motion.div>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* Upload Image Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          whileHover={{ y: -2 }}
        >
          <Link
            href="/dashboard/upload"
            className="block bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-md hover:shadow-lg transition-all duration-300 p-6 group"
          >
            <div className="text-center">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl w-12 h-12 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl"
              >
                <Upload className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                Upload Image
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Drag & drop or select your clothing image
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded font-medium">JPG</span>
                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded font-medium">PNG</span>
                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded font-medium">WEBP</span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Paste URL Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ y: -2 }}
        >
          <Link
            href="/dashboard/upload"
            className="block bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-md hover:shadow-lg transition-all duration-300 p-6 group"
          >
            <div className="text-center">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl w-12 h-12 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl"
              >
                <LinkIcon className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                Paste Product URL
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Enter a direct link to any e-commerce image
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded font-medium">Amazon</span>
                <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded font-medium">eBay</span>
                <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded font-medium">Shopify</span>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-center mt-6"
      >
        <Link
          href="/dashboard/upload"
          className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Zap className="w-5 h-5" />
          Start Analysis
        </Link>
      </motion.div>
    </div>
  )
}