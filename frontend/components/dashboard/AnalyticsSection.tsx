'use client'

import { motion } from 'framer-motion'
import { 
  Lightbulb, 
  BarChart3, 
  TrendingUp, 
  Target,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

interface AnalyticsSectionProps {
  data: {
    aiInsight: {
      message: string
      type: 'tip' | 'achievement' | 'warning'
    }
    weeklyActivity: {
      day: string
      count: number
    }[]
    accuracyTrend: {
      week: number
      accuracy: number
    }[]
    platformImpact: {
      colorMismatches: number
      purchaseConfidence: number
      returnRiskAlerts: number
    }
  }
}

export default function AnalyticsSection({ data }: AnalyticsSectionProps) {
  // Calculate derived metrics
  const totalWeeklyActivity = data.weeklyActivity.reduce((sum, day) => sum + day.count, 0)
  const currentAccuracy = data.accuracyTrend[data.accuracyTrend.length - 1]?.accuracy || 0
  const isImproving = data.accuracyTrend.length > 1 && 
    data.accuracyTrend[data.accuracyTrend.length - 1].accuracy > data.accuracyTrend[0].accuracy

  const cards = [
    {
      id: 'insight',
      title: 'AI Insight',
      icon: Lightbulb,
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Smart Tip
            </span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
            {data.aiInsight.message}
          </p>
        </div>
      )
    },
    {
      id: 'activity',
      title: 'Weekly Activity',
      icon: BarChart3,
      content: (
        <div className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{totalWeeklyActivity}</span>
            <span className="text-sm text-gray-500">analyses</span>
          </div>
          
          {/* Mini bar chart */}
          <div className="flex items-end gap-1 h-8">
            {data.weeklyActivity.map((day, index) => {
              const maxCount = Math.max(...data.weeklyActivity.map(d => d.count))
              const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0
              
              return (
                <motion.div
                  key={day.day}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex-1 bg-gray-200 rounded-sm min-h-[2px] relative group"
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-gray-900 text-white text-xs px-1 py-0.5 rounded whitespace-nowrap">
                      {day.count}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
          
          <Link 
            href="/dashboard/analytics"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium group"
          >
            View details
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      )
    },
    {
      id: 'accuracy',
      title: 'Accuracy Trend',
      icon: TrendingUp,
      content: (
        <div className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{currentAccuracy}%</span>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              isImproving 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              <TrendingUp className={`w-3 h-3 ${isImproving ? '' : 'rotate-180'}`} />
              {isImproving ? 'Improving' : 'Stable'}
            </div>
          </div>
          
          {/* Mini trend line */}
          <div className="relative h-8 bg-gray-50 rounded">
            <svg className="w-full h-full" viewBox="0 0 100 32" preserveAspectRatio="none">
              <motion.polyline
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1 }}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                points={data.accuracyTrend.map((point, index) => {
                  const x = (index / (data.accuracyTrend.length - 1)) * 100
                  const y = 32 - ((point.accuracy - 80) / 20) * 32 // Normalize to 80-100% range
                  return `${x},${Math.max(2, Math.min(30, y))}`
                }).join(' ')}
              />
            </svg>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>4 weeks ago</span>
            <span>Now</span>
          </div>
        </div>
      )
    },
    {
      id: 'impact',
      title: 'Your Impact',
      icon: Target,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Mismatches detected</span>
              <span className="font-semibold text-gray-900">{data.platformImpact.colorMismatches}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Confidence boost</span>
              <span className="font-semibold text-green-600">+{data.platformImpact.purchaseConfidence}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Risk alerts</span>
              <span className="font-semibold text-orange-600">{data.platformImpact.returnRiskAlerts}</span>
            </div>
          </div>
          
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium text-gray-600">Trusted Analyzer</span>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Analytics Overview</h2>
          <p className="text-sm text-gray-500 mt-1">Your color analysis insights and performance</p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -2 }}
            className="group relative bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {/* Card Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                <card.icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </div>
              <h3 className="font-medium text-gray-900">{card.title}</h3>
            </div>

            {/* Card Content */}
            <div className="space-y-3">
              {card.content}
            </div>

            {/* Hover Effect Border */}
            <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-100 transition-colors pointer-events-none" />
          </motion.div>
        ))}
      </div>
    </div>
  )
}