'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Send, Mail, Phone, MapPin, Clock, CheckCircle, Loader2 } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

export default function ContactPage() {
  const [user, setUser] = useState<any>({
    id: 'user-123',
    name: 'Loading...',
    email: 'loading@coloriq.com',
    avatar: null
  })
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Load user from localStorage
  useEffect(() => {
    const userName = localStorage.getItem('userName') || 'Demo User'
    const userEmail = localStorage.getItem('userEmail') || 'demo@coloriq.com'
    const userId = localStorage.getItem('userId') || 'user-123'
    
    setUser({
      id: userId,
      name: userName,
      email: userEmail,
      avatar: null
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ subject: '', message: '', priority: 'medium' })
    }, 3000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-800 mb-2">
            Contact Support
          </h1>
          <p className="text-primary-600 text-sm sm:text-base">
            Get in touch with our team for assistance, feedback, or questions
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl border border-primary-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary-800 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-primary-800">Send us a message</h2>
              </div>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-primary-800 mb-2">Message Sent!</h3>
                  <p className="text-primary-600">
                    Thank you for contacting us. We'll get back to you within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* User Info Display */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={user.name}
                        disabled
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg bg-primary-50 text-primary-700 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-2">
                        Your Email
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg bg-primary-50 text-primary-700 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Priority Level
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="low">Low - General inquiry</option>
                      <option value="medium">Medium - Technical support</option>
                      <option value="high">High - Urgent issue</option>
                      <option value="critical">Critical - System down</option>
                    </select>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Brief description of your inquiry"
                      className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Please provide detailed information about your inquiry..."
                      rows={6}
                      className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary-800 hover:bg-primary-900 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Contact Details */}
            <div className="bg-white rounded-xl border border-primary-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-primary-800 mb-4">Get in Touch</h3>
              <div className="space-y-4">
                <motion.div 
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary-50 transition-colors"
                  whileHover={{ x: 5 }}
                >
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Mail className="w-4 h-4 text-primary-800" />
                  </div>
                  <div>
                    <p className="font-medium text-primary-800">Email</p>
                    <p className="text-sm text-primary-600">support@coloriq.com</p>
                    <p className="text-xs text-primary-500">We respond within 24 hours</p>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary-50 transition-colors"
                  whileHover={{ x: 5 }}
                >
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Phone className="w-4 h-4 text-primary-800" />
                  </div>
                  <div>
                    <p className="font-medium text-primary-800">Phone</p>
                    <p className="text-sm text-primary-600">+1 (555) 123-4567</p>
                    <p className="text-xs text-primary-500">Mon-Fri, 9AM-6PM EST</p>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary-50 transition-colors"
                  whileHover={{ x: 5 }}
                >
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <MapPin className="w-4 h-4 text-primary-800" />
                  </div>
                  <div>
                    <p className="font-medium text-primary-800">Address</p>
                    <p className="text-sm text-primary-600">123 Tech Street</p>
                    <p className="text-sm text-primary-600">Innovation City, IC 12345</p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Support Hours */}
            <div className="bg-white rounded-xl border border-primary-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary-800" />
                <h3 className="text-lg font-bold text-primary-800">Support Hours</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-primary-700">Monday - Friday</span>
                  <span className="text-primary-600">9:00 AM - 6:00 PM EST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-700">Saturday</span>
                  <span className="text-primary-600">10:00 AM - 4:00 PM EST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-700">Sunday</span>
                  <span className="text-primary-600">Closed</span>
                </div>
              </div>
            </div>

            {/* FAQ Link */}
            <motion.div
              className="bg-primary-50 rounded-xl border border-primary-200 p-6"
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-lg font-bold text-primary-800 mb-2">Need Quick Help?</h3>
              <p className="text-sm text-primary-600 mb-4">
                Check our frequently asked questions for instant answers to common queries.
              </p>
              <button className="text-primary-800 font-semibold text-sm hover:text-primary-900 transition-colors">
                View FAQ →
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}