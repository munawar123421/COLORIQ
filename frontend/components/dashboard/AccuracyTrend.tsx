'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react'

interface AccuracyTrendProps {
  trendData: {
    week: number
    accuracy: number
  }[]
}

export default function AccuracyTrend({ trendData }: AccuracyTrendProps) {
  const maxAccuracy = Math.max(...trendData.map(d => d.accuracy))
  const minAccuracy = Math.min(...trendData.map(d => d.accuracy))
  const range = maxAccuracy - minAccuracy || 1
  const isImproving = trendData[trendData.length - 1].accuracy > trendData[0].accuracy
  const currentAccuracy = trendData[trendData.length - 1].accuracy

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-2 border-transparent bg-clip-padding rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 group"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          animate={{ 
            x: [0, 10, 0],
            y: [0, -5, 0]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-2 right-2 w-12 h-12 bg-gradient-to-r from-green-300 to-emerald-400 rounded-full"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute bottom-2 left-2 w-8 h-8 bg-gradient-to-r from-teal-300 to-green-400 rounded-full"
        />
      </div>

      {/* Border gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-200 to-emerald-300 rounded-2xl opacity-60" />
      <div className="relative bg-white/90 backdrop-blur-sm m-0.5 rounded-2xl p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg"
            >
              <Activity className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">📈 Accuracy Trend</h3>
              <p className="text-sm text-gray-600">Last 4 weeks</p>
            </div>
          </div>
          
          {/* Current accuracy badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg"
          >
            {currentAccuracy}%
          </motion.div>
        </div>

        {/* Enhanced Chart */}
        <div className="space-y-4">
          {/* Chart container */}
          <div className="relative bg-gradient-to-t from-green-50 to-transparent rounded-xl p-4">
            <div className="relative h-20">
              {/* SVG Chart */}
              <svg className="w-full h-full" viewBox="0 0 300 80">
                {/* Grid lines */}
                <defs>
                  <pattern id="grid" width="60" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.5"/>
                  </pattern>
                  
                  {/* Gradient for the line */}
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                  
                  {/* Gradient for the area under the line */}
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                
                <rect width="300" height="80" fill="url(#grid)" />
                
                {/* Area under the curve */}
                <motion.path
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  d={`M ${trendData.map((point, index) => {
                    const x = (index / (trendData.length - 1)) * 260 + 20
                    const y = 70 - ((point.accuracy - minAccuracy) / range) * 50
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
                  }).join(' ')} L 280 70 L 20 70 Z`}
                  fill="url(#areaGradient)"
                />
                
                {/* Main trend line */}
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                  d={`M ${trendData.map((point, index) => {
                    const x = (index / (trendData.length - 1)) * 260 + 20
                    const y = 70 - ((point.accuracy - minAccuracy) / range) * 50
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
                  }).join(' ')}`}
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  filter="drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3))"
                />
                
                {/* Data points with animation */}
                {trendData.map((point, index) => {
                  const x = (index / (trendData.length - 1)) * 260 + 20
                  const y = 70 - ((point.accuracy - minAccuracy) / range) * 50
                  return (
                    <g key={index}>
                      {/* Outer glow */}
                      <motion.circle
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.3 }}
                        transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                        cx={x}
                        cy={y}
                        r="8"
                        fill="#10b981"
                      />
                      {/* Main point */}
                      <motion.circle
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                        whileHover={{ scale: 1.3 }}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#ffffff"
                        stroke="#10b981"
                        strokeWidth="3"
                        className="cursor-pointer"
                      />
                      {/* Accuracy label on hover */}
                      <motion.text
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        x={x}
                        y={y - 15}
                        textAnchor="middle"
                        className="text-xs font-bold fill-gray-700"
                      >
                        {point.accuracy}%
                      </motion.text>
                    </g>
                  )
                })}
              </svg>
            </div>
          </div>

          {/* Week labels */}
          <div className="flex justify-between text-xs text-gray-500 px-4">
            {trendData.map((point, index) => (
              <motion.span 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="font-medium"
              >
                Week {point.week}
              </motion.span>
            ))}
          </div>

          {/* Enhanced trend indicator */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex items-center justify-center gap-3 pt-4 border-t border-gray-100"
          >
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              isImproving 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {isImproving ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="font-bold text-sm">
                {isImproving ? '📈 Improving' : '📉 Declining'}
              </span>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md cursor-pointer"
            >
              <Zap className="w-4 h-4 text-white" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}