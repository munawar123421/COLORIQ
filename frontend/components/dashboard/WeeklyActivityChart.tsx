'use client'

import { motion } from 'framer-motion'
import { BarChart3, ArrowRight, TrendingUp, Calendar } from 'lucide-react'
import Link from 'next/link'

interface WeeklyActivityChartProps {
  weeklyData: {
    day: string
    count: number
  }[]
}

export default function WeeklyActivityChart({ weeklyData }: WeeklyActivityChartProps) {
  const maxCount = Math.max(...weeklyData.map(d => d.count))
  const totalCount = weeklyData.reduce((sum, d) => sum + d.count, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 border-2 border-transparent bg-clip-padding rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 group"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity }
          }}
          className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-r from-blue-300 to-indigo-400 rounded-full -translate-y-10 translate-x-10"
        />
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-r from-cyan-300 to-blue-400 rounded-full translate-y-8 -translate-x-8"
        />
      </div>

      {/* Border gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-indigo-300 rounded-2xl opacity-60" />
      <div className="relative bg-white/90 backdrop-blur-sm m-0.5 rounded-2xl p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg"
            >
              <BarChart3 className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">📊 Your Activity</h3>
              <p className="text-sm text-gray-600">(Last 7 Days)</p>
            </div>
          </div>
          
          {/* Total count badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg"
          >
            {totalCount} total
          </motion.div>
        </div>

        {/* Enhanced Chart */}
        <div className="space-y-4">
          <div className="relative">
            {/* Chart container with gradient background */}
            <div className="bg-gradient-to-t from-blue-50 to-transparent rounded-xl p-4">
              <div className="flex items-end justify-between gap-3 h-24">
                {weeklyData.map((day, index) => {
                  const heightPercentage = maxCount > 0 ? (day.count / maxCount) * 100 : 0
                  
                  return (
                    <motion.div
                      key={day.day}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ 
                        height: `${heightPercentage}%`,
                        opacity: 1
                      }}
                      transition={{ 
                        duration: 0.8, 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{ 
                        scale: 1.1,
                        y: -2
                      }}
                      className="flex flex-col items-center gap-2 flex-1 group/bar cursor-pointer"
                    >
                      {/* Bar with gradient and glow effect */}
                      <div className="relative w-full min-h-[8px] bg-gradient-to-t from-blue-500 via-blue-400 to-blue-300 rounded-t-lg shadow-lg group-hover/bar:shadow-blue-300 transition-all duration-300">
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-400 to-blue-200 rounded-t-lg opacity-0 group-hover/bar:opacity-50 transition-opacity duration-300" />
                        
                        {/* Count tooltip */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          whileHover={{ opacity: 1, y: -5 }}
                          className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg"
                        >
                          {day.count}
                        </motion.div>
                      </div>
                      
                      {/* Day label */}
                      <span className="text-xs font-semibold text-gray-600 group-hover/bar:text-blue-600 transition-colors">
                        {day.day}
                      </span>
                      
                      {/* Count display */}
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="text-xs text-gray-500 font-medium"
                      >
                        {day.count}
                      </motion.span>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600 font-medium">This Week</span>
              </div>
              
              <Link
                href="/dashboard/analytics"
                className="group flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg"
              >
                <TrendingUp className="w-4 h-4" />
                See full analytics
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}