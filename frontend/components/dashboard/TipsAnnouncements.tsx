'use client'

import { motion } from 'framer-motion'
import { Megaphone, Lightbulb, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface TipsAnnouncementsProps {
  items: {
    type: 'tip' | 'announcement' | 'feature'
    title: string
    message: string
    isNew?: boolean
  }[]
}

export default function TipsAnnouncements({ items }: TipsAnnouncementsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextItem = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length)
  }

  const prevItem = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
  }

  const getItemStyle = (type: string) => {
    switch (type) {
      case 'announcement':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          icon: Megaphone
        }
      case 'feature':
        return {
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          iconColor: 'text-purple-600',
          icon: Star
        }
      default:
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          icon: Lightbulb
        }
    }
  }

  if (items.length === 0) return null

  const currentItem = items[currentIndex]
  const style = getItemStyle(currentItem.type)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${style.bgColor} ${style.borderColor} border rounded-xl p-4 shadow-lg`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 bg-white rounded-lg shadow-md">
            <style.icon className={`w-4 h-4 ${style.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900">
                📢 {currentItem.title}
              </h3>
              {currentItem.isNew && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  NEW
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {currentItem.message}
            </p>
          </div>
        </div>

        {/* Navigation controls */}
        {items.length > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={prevItem}
              className="p-1 hover:bg-white/50 rounded transition-colors"
              disabled={items.length <= 1}
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={nextItem}
              className="p-1 hover:bg-white/50 rounded transition-colors"
              disabled={items.length <= 1}
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Pagination dots */}
      {items.length > 1 && (
        <div className="flex justify-center gap-1 mt-3 pt-3 border-t border-white/50">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-gray-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}