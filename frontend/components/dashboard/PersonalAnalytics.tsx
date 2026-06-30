'use client'

import { motion } from 'framer-motion'
import { 
  Image as ImageIcon, 
  Target, 
  AlertTriangle, 
  TrendingDown,
  BarChart3,
  Award,
  Zap,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Activity
} from 'lucide-react'

interface PersonalAnalyticsProps {
  data: {
    totalImages: number
    averageAccuracy: number
    commonIssue: string
    returnRateSaved: number
  }
}

export default function PersonalAnalytics({ data }: PersonalAnalyticsProps) {
  const metrics = [
    {
      title: 'Total Images',
      value: data.totalImages,
      suffix: '',
      icon: ImageIcon,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: '+12%',
      changeType: 'up' as const
    },
    {
      title: 'Average Accuracy',
      value: data.averageAccuracy,
      suffix: '%',
      icon: Target,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: '+5.2%',
      changeType: 'up' as const
    },
    {
      title: 'Return Rate Saved',
      value: data.returnRateSaved,
      suffix: '%',
      icon: TrendingDown,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: '+3.1%',
      changeType: 'up' as const
    }
  ]

  const getAccuracyGrade = (accuracy: number) => {
    if (accuracy >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100' }
    if (accuracy >= 85) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' }
    if (accuracy >= 80) return { grade: 'B+', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    if (accuracy >= 75) return { grade: 'B', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { grade: 'C', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const accuracyGrade = getAccuracyGrade(data.averageAccuracy)

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-purple-800 bg-clip-text text-transparent">
            Your Insights
          </h2>
        </div>
        <p className="text-gray-600">Color accuracy analytics & performance</p>
      </div>

      {/* Metric Cards */}
      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-blue-50/30 rounded-2xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${metric.bgColor} flex items-center justify-center shadow-lg`}>
                    <metric.icon className={`w-7 h-7 ${metric.textColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{metric.title}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-gray-900">
                        {metric.value}{metric.suffix}
                      </p>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                        metric.changeType === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {metric.changeType === 'up' ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )}
                        {metric.change}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Progress indicator for accuracy */}
                {metric.title === 'Average Accuracy' && (
                  <div className="text-right">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold ${accuracyGrade.bg} ${accuracyGrade.color} shadow-lg`}>
                      <Award className="w-4 h-4" />
                      Grade {accuracyGrade.grade}
                    </div>
                  </div>
                )}
              </div>

              {/* Progress bar for accuracy */}
              {metric.title === 'Average Accuracy' && (
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Performance</span>
                    <span>{data.averageAccuracy}% of 100%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${data.averageAccuracy}%` }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      className={`h-3 rounded-full bg-gradient-to-r ${metric.color} shadow-sm`}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Common Issue Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-orange-50/50 to-red-50/30 rounded-2xl"></div>
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Most Common Issue</h3>
              <p className="text-gray-700 font-medium mb-3">{data.commonIssue}</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <p className="text-sm text-gray-600">
                  Based on your recent color analyses
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Performance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl"></div>
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Performance Summary</h3>
              <p className="text-gray-600">Your monthly achievements</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm font-medium">This Month</span>
                <span className="font-bold text-gray-900 text-lg">{Math.floor(data.totalImages * 0.6)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Images processed</p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm font-medium">Improvement</span>
                <span className="font-bold text-green-600 text-lg">+5.2%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Accuracy boost</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm text-gray-700 italic font-medium">
                "You most often check red and blue items. Color mismatch is highest in pastel shades."
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50/50 to-blue-50/30 rounded-2xl"></div>
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Quick Actions</h3>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 group border border-gray-100 hover:border-blue-200">
              <div className="flex items-center justify-between">
                <span>View detailed analytics</span>
                <ArrowUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
            <button className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 rounded-xl transition-all duration-300 group border border-gray-100 hover:border-green-200">
              <div className="flex items-center justify-between">
                <span>Export analysis report</span>
                <ArrowUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
            <button className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-xl transition-all duration-300 group border border-gray-100 hover:border-purple-200">
              <div className="flex items-center justify-between">
                <span>Compare with industry average</span>
                <ArrowUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}