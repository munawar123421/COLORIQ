'use client'

import { motion } from 'framer-motion'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  index: number
}

export default function FeatureCard({ icon, title, description, index }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className="group bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-primary-200 transition-all duration-300 cursor-pointer relative overflow-hidden"
    >
      {/* Background gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 to-secondary-50/0 group-hover:from-primary-50/50 group-hover:to-secondary-50/30 transition-all duration-500 rounded-xl" />
      
      {/* Icon container with enhanced hover effects */}
      <motion.div 
        className="relative bg-gradient-to-r from-primary-100 to-secondary-100 rounded-lg w-16 h-16 flex items-center justify-center mb-4 group-hover:from-primary-200 group-hover:to-secondary-200 transition-all duration-300 feature-icon-pulse"
        whileHover={{ 
          scale: 1.1,
          rotate: [0, -5, 5, 0],
          transition: { 
            scale: { duration: 0.2 },
            rotate: { duration: 0.6, ease: "easeInOut" }
          }
        }}
      >
        <motion.div 
          className="text-primary-600 group-hover:text-primary-700 transition-colors duration-300"
          whileHover={{ 
            scale: 1.1,
            transition: { duration: 0.2 }
          }}
        >
          {icon}
        </motion.div>
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-lg bg-primary-400/0 group-hover:bg-primary-400/10 transition-all duration-300" />
        
        {/* Ripple effect on hover */}
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-primary-300/0 group-hover:border-primary-300/30"
          whileHover={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0, 0.3],
            transition: { duration: 1, repeat: Infinity }
          }}
        />
      </motion.div>
      
      {/* Content with staggered animation */}
      <div className="relative z-10">
        <motion.h3 
          className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-800 transition-colors duration-300"
          whileHover={{ x: 2 }}
          transition={{ duration: 0.2 }}
        >
          {title}
        </motion.h3>
        
        <motion.p 
          className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300"
          whileHover={{ x: 2 }}
          transition={{ duration: 0.2, delay: 0.05 }}
        >
          {description}
        </motion.p>
      </div>
      
      {/* Subtle border animation */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-primary-200/50 transition-all duration-300" />
      
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-primary-100/0 group-hover:border-t-primary-200/60 transition-all duration-300 rounded-tr-xl" />
    </motion.div>
  )
}