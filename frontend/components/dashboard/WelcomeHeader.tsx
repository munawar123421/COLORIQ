'use client'

import { motion } from 'framer-motion'
import { 
  Plus,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import Link from 'next/link'

interface WelcomeHeaderProps {
  user: {
    name: string
    email: string
  }
  lastLogin?: string
}

export default function WelcomeHeader({ user, lastLogin }: WelcomeHeaderProps) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            👋 Welcome back, {user.name.split(' ')[0]}!
          </h1>
          <p className="text-gray-600 mb-2">
            Ready to check another clothing color? Start a new analysis below.
          </p>
          {lastLogin && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Last login: {lastLogin}</span>
            </div>
          )}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Link
            href="/dashboard/upload"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            New Color Analysis
          </Link>
        </motion.div>
      </div>
    </div>
  )
}