'use client'

import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Target, 
  DollarSign, 
  Calendar,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface QuickStatsCardsProps {
  stats: {
    totalAnalyses: number
    avgAccuracy: number
    returnsSaved: number
    thisMonth: number
    trends: {
      totalAnalyses: number
      avgAccuracy: number
      returnsSaved: number
      thisMonth: number
    }
  }
}

export default function QuickStatsCards({ stats }: QuickStatsCardsProps) {
  const cards = [
    {
      title: 'Total Analyses',
      value: stats.totalAnalyses,
      icon: BarChart3,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      trend: stats.trends.totalAnalyses,
      suffix: ''
    },
    {
      title: 'Avg. Accuracy',
      value: stats.avgAccuracy,
      icon: Target,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      trend: stats.trends.avgAccuracy,
      suffix: '%'
    },
    {
      title: 'Returns Saved',
      value: stats.returnsSaved,
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      trend: stats.trends.returnsSaved,
      suffix: '',
      prefix: '~₨ ',
      postfix: ' saved'
    },
    {
      title: 'This Month',
      value: stats.thisMonth,
      icon: Calendar,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      trend: stats.trends.thisMonth,
      suffix: ' this month'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          whileHover={{ y: -2 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 p-4"
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg ${card.bgColor} shadow-md`}>
              <card.icon className={`w-5 h-5 ${card.textColor}`} />
            </div>
            <div className="flex items-center gap-1">
              {card.trend > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : card.trend < 0 ? (
                <TrendingDown className="w-4 h-4 text-red-500" />
              ) : null}
              {card.trend !== 0 && (
                <span className={`text-xs font-semibold ${
                  card.trend > 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {card.trend > 0 ? '+' : ''}{card.trend}%
                </span>
              )}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              {card.prefix && (
                <span className="text-sm font-medium text-gray-600">{card.prefix}</span>
              )}
              <h3 className="text-2xl font-bold text-gray-900">
                {card.value.toLocaleString()}
              </h3>
              {card.suffix && (
                <span className="text-sm font-medium text-gray-600">{card.suffix}</span>
              )}
            </div>
            <p className="text-sm font-medium text-gray-600">
              {card.title}
              {card.postfix && <span className="text-xs">{card.postfix}</span>}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}