'use client'

import { motion } from 'framer-motion'
import { Lightbulb, Sparkles, Brain, Zap } from 'lucide-react'

interface AIInsightCardProps {
  insight: {
    message: string
    type: 'tip' | 'achievement' | 'warning'
  }
}

export default function AIInsightCard({ insight }: AIInsightCardProps) {
  const getInsightStyle = () => {
    switch (insight.type) {
      case 'achievement':
        return {
          bgGradient: 'from-emerald-50 via-green-50 to-teal-50',
          borderGradient: 'from-emerald-200 to-green-300',
          iconBg: 'from-emerald-500 to-green-600',
          iconColor: 'text-white',
          textColor: 'text-emerald-800',
          accentColor: 'text-emerald-600'
        }
      case 'warning':
        return {
          bgGradient: 'from-amber-50 via-yellow-50 to-orange-50',
          borderGradient: 'from-amber-200 to-yellow-300',
          iconBg: 'from-amber-500 to-yellow-600',
          iconColor: 'text-white',
          textColor: 'text-amber-800',
          accentColor: 'text-amber-600'
        }
      default:
        return {
          bgGradient: 'from-blue-50 via-indigo-50 to-purple-50',
          borderGradient: 'from-blue-200 to-purple-300',
          iconBg: 'from-blue-500 to-purple-600',
          iconColor: 'text-white',
          textColor: 'text-blue-800',
          accentColor: 'text-blue-600'
        }
    }
  }

  const style = getInsightStyle()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`relative overflow-hidden bg-gradient-to-br ${style.bgGradient} border-2 border-transparent bg-clip-padding rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 group`}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/20 rounded-full -translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-12 translate-y-12 group-hover:scale-125 transition-transform duration-500" />
      </div>

      {/* Border gradient effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${style.borderGradient} rounded-2xl opacity-60`} />
      <div className="relative bg-white/80 backdrop-blur-sm m-0.5 rounded-2xl p-6">
        
        {/* Header with animated icon */}
        <div className="flex items-start gap-4 mb-4">
          <motion.div
            initial={{ rotate: 0, scale: 1 }}
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className={`relative p-3 bg-gradient-to-r ${style.iconBg} rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
          >
            <Lightbulb className={`w-6 h-6 ${style.iconColor}`} />
            
            {/* Sparkle effect */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </motion.div>
          </motion.div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <motion.h3 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={`font-bold text-lg ${style.textColor}`}
              >
                💡 AI Color Insight
              </motion.h3>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Brain className={`w-5 h-5 ${style.accentColor}`} />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Insight message with typing animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="relative"
        >
          <p className={`text-sm ${style.textColor} leading-relaxed font-medium`}>
            {insight.message}
          </p>
          
          {/* Animated underline */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 1, duration: 0.8 }}
            className={`h-0.5 bg-gradient-to-r ${style.iconBg} mt-3 rounded-full`}
          />
        </motion.div>

        {/* Floating action indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-between mt-4"
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-2 h-2 rounded-full bg-gradient-to-r ${style.iconBg}`}
            />
            <span className={`text-xs font-semibold ${style.accentColor} uppercase tracking-wide`}>
              AI Powered
            </span>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.1 }}
            className={`p-2 bg-gradient-to-r ${style.iconBg} rounded-lg shadow-md cursor-pointer`}
          >
            <Zap className="w-4 h-4 text-white" />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}