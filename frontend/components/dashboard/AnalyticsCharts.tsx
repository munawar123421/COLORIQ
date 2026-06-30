'use client'

import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Target,
  Users,
  Calendar,
  Award,
  Lightbulb
} from 'lucide-react'

interface AnalyticsChartsProps {
  data: {
    accuracyOverTime: Array<{ date: string; accuracy: number }>
    uploadsPerWeek: Array<{ week: string; uploads: number }>
    sourceBreakdown: Array<{ source: string; count: number; percentage: number }>
    averageAccuracy: number
    globalAverage: number
    totalImages: number
    improvementRate: number
    insights: string[]
  }
}

export default function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const maxUploads = Math.max(...data.uploadsPerWeek.map(w => w.uploads))
  const maxAccuracy = Math.max(...data.accuracyOverTime.map(a => a.accuracy))
  const minAccuracy = Math.min(...data.accuracyOverTime.map(a => a.accuracy))

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Images</p>
              <p className="text-3xl font-bold text-gray-900">{data.totalImages}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Your Average</p>
              <p className="text-3xl font-bold text-green-600">{data.averageAccuracy}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Global Average</p>
              <p className="text-3xl font-bold text-gray-600">{data.globalAverage}%</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Improvement</p>
              <p className="text-3xl font-bold text-purple-600">+{data.improvementRate}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Accuracy Over Time Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Accuracy Over Time</h3>
              <p className="text-sm text-gray-600">Your color accuracy trend</p>
            </div>
          </div>

          <div className="relative h-64">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((y) => (
                <line
                  key={y}
                  x1="40"
                  y1={160 - (y * 1.2)}
                  x2="380"
                  y2={160 - (y * 1.2)}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
              ))}

              {/* Accuracy line */}
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={data.accuracyOverTime.map((point, index) => {
                  const x = 40 + (index * (340 / (data.accuracyOverTime.length - 1)))
                  const y = 160 - ((point.accuracy - 70) * 3) // Scale from 70-100 to fit chart
                  return `${x},${y}`
                }).join(' ')}
              />

              {/* Data points */}
              {data.accuracyOverTime.map((point, index) => {
                const x = 40 + (index * (340 / (data.accuracyOverTime.length - 1)))
                const y = 160 - ((point.accuracy - 70) * 3)
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#3b82f6"
                    className="hover:r-6 transition-all cursor-pointer"
                  />
                )
              })}

              {/* Y-axis labels */}
              {[70, 80, 90, 100].map((value) => (
                <text
                  key={value}
                  x="35"
                  y={165 - ((value - 70) * 3)}
                  textAnchor="end"
                  className="text-xs fill-gray-500"
                >
                  {value}%
                </text>
              ))}
            </svg>
          </div>
        </motion.div>

        {/* Uploads Per Week Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Uploads Per Week</h3>
              <p className="text-sm text-gray-600">Your activity pattern</p>
            </div>
          </div>

          <div className="space-y-4">
            {data.uploadsPerWeek.map((week, index) => (
              <div key={week.week} className="flex items-center gap-4">
                <div className="w-16 text-sm text-gray-600">{week.week}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(week.uploads / maxUploads) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-end pr-2"
                  >
                    <span className="text-white text-xs font-medium">{week.uploads}</span>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Source Breakdown and Gauge */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Source Type Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <PieChart className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Source Type Breakdown</h3>
              <p className="text-sm text-gray-600">Upload vs URL usage</p>
            </div>
          </div>

          <div className="space-y-4">
            {data.sourceBreakdown.map((source, index) => (
              <div key={source.source} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${index === 0 ? 'bg-purple-500' : 'bg-purple-300'}`} />
                  <span className="text-gray-700">{source.source}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{source.count} images</span>
                  <span className="font-semibold text-gray-900">{source.percentage}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Visual pie representation */}
          <div className="mt-6 flex justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#e5e7eb"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#8b5cf6"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${(data.sourceBreakdown[0].percentage / 100) * 314} 314`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{data.sourceBreakdown[0].percentage}%</div>
                  <div className="text-xs text-gray-600">Upload</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Performance Gauge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Performance vs Global</h3>
              <p className="text-sm text-gray-600">How you compare to all users</p>
            </div>
          </div>

          <div className="text-center">
            <div className="relative w-40 h-40 mx-auto mb-4">
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
                {/* Background circle */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                {/* Global average */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  stroke="#f59e0b"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${(data.globalAverage / 100) * 377} 377`}
                  className="opacity-50"
                />
                {/* Your performance */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  stroke="#10b981"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${(data.averageAccuracy / 100) * 377} 377`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{data.averageAccuracy}%</div>
                  <div className="text-xs text-gray-600">Your Score</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-gray-600">You: {data.averageAccuracy}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full opacity-50" />
                <span className="text-gray-600">Global: {data.globalAverage}%</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700 font-medium">
                You're performing {(data.averageAccuracy - data.globalAverage).toFixed(1)}% above average!
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
            <p className="text-sm text-gray-600">Personalized recommendations based on your data</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {data.insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.9 + (index * 0.1) }}
              className="bg-white rounded-lg p-4 border border-blue-200"
            >
              <p className="text-sm text-gray-700">{insight}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}