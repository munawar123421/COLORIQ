'use client'

import { motion } from 'framer-motion'
import { Target, Shield, AlertTriangle, Award, Zap, Star } from 'lucide-react'

interface PlatformTrustBadgeProps {
  impact: {
    colorMismatches: number
    purchaseConfidence: number
    returnRiskAlerts: number
  }
}

export default function PlatformTrustBadge({ impact }: PlatformTrustBadgeProps) {
  const metrics = [
    {
      label: 'Items had >10% color shift',
      value: impact.colorMismatches,
      title: 'Color mismatches detected',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'from-orange-100 to-red-100',
      iconBg: 'from-orange-500 to-red-500'
    },
    {
      label: '% purchase confidence',
      value: impact.purchaseConfidence,
      prefix: '+',
      title: 'Confidence in purchases',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'from-green-100 to-emerald-100',
      iconBg: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Items flagged as "high mismatch risk"',
      value: impact.returnRiskAlerts,
      title: 'Return risk alerts',
      icon: Target,
      color: 'text-red-600',
      bgColor: 'from-red-100 to-pink-100',
      iconBg: 'from-red-500 to-pink-500'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border-2 border-transparent bg-clip-padding rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 group"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotate: { duration: 15, repeat: Infinity, ease: "linear" },
            scale: { duration: 3, repeat: Infinity }
          }}
          className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-r from-purple-300 to-indigo-400 rounded-full -translate-y-8 translate-x-8"
        />
        <motion.div
          animate={{ 
            y: [0, -8, 0],
            x: [0, 5, 0]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-r from-blue-300 to-purple-400 rounded-full translate-y-6 -translate-x-6"
        />
      </div>

      {/* Border gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-indigo-300 rounded-2xl opacity-60" />
      <div className="relative bg-white/90 backdrop-blur-sm m-0.5 rounded-2xl p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg"
            >
              <Target className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">🎯 Your Impact</h3>
              <p className="text-sm text-gray-600">Making e-commerce better</p>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-4 mb-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ x: 5, scale: 1.02 }}
              className={`relative overflow-hidden bg-gradient-to-r ${metric.bgColor} rounded-xl p-4 border border-white/50 shadow-md hover:shadow-lg transition-all duration-300 group/metric`}
            >
              {/* Animated background glow */}
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover/metric:opacity-100 transition-opacity duration-300" />
              
              <div className="relative flex items-center gap-4">
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className={`p-2 bg-gradient-to-r ${metric.iconBg} rounded-lg shadow-md`}
                >
                  <metric.icon className="w-5 h-5 text-white" />
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                      className={`text-2xl font-bold ${metric.color}`}
                    >
                      {metric.prefix}{metric.value}
                    </motion.span>
                    <span className={`text-sm font-medium ${metric.color}`}>
                      {metric.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">
                    {metric.title}
                  </p>
                </div>

                {/* Pulse indicator */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`w-3 h-3 rounded-full bg-gradient-to-r ${metric.iconBg}`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative overflow-hidden bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-600 rounded-xl p-4 shadow-lg"
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0">
            <motion.div
              animate={{ 
                backgroundPosition: ['0% 0%', '100% 100%']
              }}
              transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
              className="w-full h-full bg-gradient-to-r from-white/10 via-transparent to-white/10"
              style={{
                backgroundSize: '200% 200%'
              }}
            />
          </div>
          
          <div className="relative text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Shield className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-white font-bold text-lg">Trusted Analyzer</span>
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Star className="w-5 h-5 text-yellow-300" />
              </motion.div>
            </div>
            
            <p className="text-white/90 text-sm font-medium mb-3">
              You're helping improve e-commerce color accuracy!
            </p>
            
            {/* Achievement badges */}
            <div className="flex items-center justify-center gap-2">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/30"
              >
                <Award className="w-3 h-3 inline mr-1" />
                Expert
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/30"
              >
                <Zap className="w-3 h-3 inline mr-1" />
                Active
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}