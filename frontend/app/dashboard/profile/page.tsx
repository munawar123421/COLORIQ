'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ProfileSettings from '@/components/dashboard/ProfileSettings'

export default function ProfilePage() {
  const [user, setUser] = useState({
    id: 'user-123',
    name: 'Demo User',
    email: 'user@coloriq.com',
    role: 'user',
    avatar: null
  })

  useEffect(() => {
    // Get user data from localStorage after component mounts
    const userId = localStorage.getItem('userId')
    const userName = localStorage.getItem('userName')
    const userEmail = localStorage.getItem('userEmail')
    const userRole = localStorage.getItem('userRole')

    if (userId && userName && userEmail) {
      setUser({
        id: userId,
        name: userName,
        email: userEmail,
        role: userRole || 'user',
        avatar: null
      })
    }
  }, [])

  return (
    <DashboardLayout user={user}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Profile
          </h1>
          <p className="text-gray-600">
            Manage your account information and preferences
          </p>
        </motion.div>

        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <ProfileSettings user={user} />
        </motion.div>
      </div>
    </DashboardLayout>
  )
}