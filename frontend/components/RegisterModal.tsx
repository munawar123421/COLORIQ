'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, Mail, Lock, User, UserPlus, Loader2, CheckCircle, Check, Shield, Sparkles, ArrowRight } from 'lucide-react'
import { register, login } from '@/lib/api'

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin?: () => void
}

interface PasswordStrength {
  hasMinLength: boolean
  hasUpperCase: boolean
  hasLowerCase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  })

  const getPasswordStrengthScore = () => {
    const checks = Object.values(passwordStrength)
    return checks.filter(Boolean).length
  }

  const getPasswordStrengthText = () => {
    const score = getPasswordStrengthScore()
    if (score === 0) return { text: 'Enter password', color: 'text-gray-400' }
    if (score <= 2) return { text: 'Weak', color: 'text-red-500' }
    if (score <= 3) return { text: 'Fair', color: 'text-yellow-500' }
    if (score <= 4) return { text: 'Good', color: 'text-blue-500' }
    return { text: 'Strong', color: 'text-green-500' }
  }

  // Check password strength
  useEffect(() => {
    const password = formData.password
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    })
  }, [formData.password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!')
      return
    }

    // Check all password strength requirements
    if (!passwordStrength.hasMinLength) {
      setError('Password must be at least 8 characters long!')
      return
    }
    if (!passwordStrength.hasUpperCase) {
      setError('Password must contain at least one uppercase letter!')
      return
    }
    if (!passwordStrength.hasLowerCase) {
      setError('Password must contain at least one lowercase letter!')
      return
    }
    if (!passwordStrength.hasNumber) {
      setError('Password must contain at least one number!')
      return
    }
    if (!passwordStrength.hasSpecialChar) {
      setError('Password must contain at least one special character!')
      return
    }

    setLoading(true)

    try {
      // Step 1: Register the user
      const registerResponse = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      })

      // Step 2: Automatically log in the user
      const loginResponse = await login({
        email: formData.email,
        password: formData.password
      })

      // Step 3: Store authentication data
      localStorage.setItem('authToken', loginResponse.access_token)
      localStorage.setItem('userRole', loginResponse.user.role)
      localStorage.setItem('userEmail', loginResponse.user.email)
      localStorage.setItem('userName', loginResponse.user.name)
      localStorage.setItem('userId', loginResponse.user.id)

      // Step 4: Show success message briefly
      setSuccess(true)

      // Step 5: Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        setSuccess(false)
        onClose()
        
        // Redirect based on role
        if (loginResponse.user.role === 'admin') {
          window.location.href = '/admin/dashboard'
        } else {
          window.location.href = '/dashboard'
        }
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user types
    if (error) setError('')
  }

  // Success view with enhanced animation
  if (success) {
    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center overflow-hidden"
            >
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-100/50 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-100/50 rounded-full blur-2xl" />
              
              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
                
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-bold text-gray-900 mb-4"
                >
                  Welcome to COLORIQ! 🎉
                </motion.h2>
                
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-600 mb-6"
                >
                  Your account has been created successfully. Get ready to experience AI-powered color correction!
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-center gap-2 text-primary-600"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">Taking you to your dashboard...</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Enhanced Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 max-h-[95vh] overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 to-secondary-50/30" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary-100/30 rounded-full blur-2xl" />

            <div className="relative z-10 p-6 sm:p-8 overflow-y-auto max-h-[95vh]">
              {/* Close Button */}
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors bg-white/80 rounded-full p-2 shadow-sm"
              >
                <X className="w-5 h-5" />
              </motion.button>

              {/* Enhanced Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <UserPlus className="w-8 h-8 text-white" />
                </motion.div>
                
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold bg-gradient-to-r from-primary-800 to-secondary-800 bg-clip-text text-transparent mb-2"
                >
                  Join COLORIQ
                </motion.h2>
                
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-600 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-primary-500" />
                  Start your AI color correction journey
                  <Sparkles className="w-4 h-4 text-secondary-500" />
                </motion.p>
              </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-3 space-y-2 bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">Password must contain:</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordStrength.hasMinLength ? 'bg-green-500' : 'bg-gray-300'}`}>
                          {passwordStrength.hasMinLength && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-xs ${passwordStrength.hasMinLength ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordStrength.hasUpperCase ? 'bg-green-500' : 'bg-gray-300'}`}>
                          {passwordStrength.hasUpperCase && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-xs ${passwordStrength.hasUpperCase ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                          One uppercase letter (A-Z)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordStrength.hasLowerCase ? 'bg-green-500' : 'bg-gray-300'}`}>
                          {passwordStrength.hasLowerCase && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-xs ${passwordStrength.hasLowerCase ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                          One lowercase letter (a-z)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordStrength.hasNumber ? 'bg-green-500' : 'bg-gray-300'}`}>
                          {passwordStrength.hasNumber && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-xs ${passwordStrength.hasNumber ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                          One number (0-9)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordStrength.hasSpecialChar ? 'bg-green-500' : 'bg-gray-300'}`}>
                          {passwordStrength.hasSpecialChar && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-xs ${passwordStrength.hasSpecialChar ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                          One special character (!@#$%^&*)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 w-4 h-4 text-secondary-600 border-gray-300 rounded focus:ring-secondary-500"
                  required
                  disabled={loading}
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="#" className="text-secondary-600 hover:text-secondary-700 transition-colors">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-secondary-600 hover:text-secondary-700 transition-colors">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-secondary-600 to-secondary-700 text-white py-3 rounded-lg font-semibold hover:from-secondary-700 hover:to-secondary-800 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

              {/* Footer */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      onClose()
                      if (onSwitchToLogin) {
                        onSwitchToLogin()
                      }
                    }}
                    className="text-secondary-600 hover:text-secondary-700 font-semibold transition-colors underline decoration-2 underline-offset-2"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}