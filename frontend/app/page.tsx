'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Palette, 
  Zap, 
  Shield, 
  Users, 
  ArrowRight, 
  CheckCircle, 
  Star,
  Upload,
  Link,
  BarChart3
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import LoginModal from '@/components/LoginModal'
import RegisterModal from '@/components/RegisterModal'
import FeatureCard from '@/components/FeatureCard'
import TestimonialCard from '@/components/TestimonialCard'

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  const features = [
    {
      icon: <Palette className="w-8 h-8" />,
      title: "AI Color Correction",
      description: "Advanced machine learning algorithms analyze and correct color distortions in clothing images for realistic representation."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Processing",
      description: "Get accurate color-corrected images in seconds with our optimized AI inference pipeline."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Accuracy Metrics",
      description: "Detailed accuracy scores, confidence levels, and visual heatmaps to understand color corrections."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with cloud storage and robust data protection measures."
    }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "E-commerce Manager",
      content: "COLORIQ has reduced our return rates by 40%. Customers now know exactly what they're buying!",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Online Retailer",
      content: "The AI accuracy is incredible. Our customer satisfaction has improved dramatically since using COLORIQ.",
      rating: 5
    },
    {
      name: "Emma Davis",
      role: "Fashion Buyer",
      content: "Finally, a solution that shows true-to-life colors. This is a game-changer for online fashion.",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen">
      <Navbar 
        onLoginClick={() => setShowLoginModal(true)}
        onRegisterClick={() => setShowRegisterModal(true)}
      />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center"
            >
              {/* COLORIQ Brand Name */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-8"
              >
                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-primary-800 to-primary-900 bg-clip-text text-transparent">
                  COLORIQ
                </h1>
              </motion.div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-8">
                <span className="text-3xl sm:text-4xl lg:text-5xl leading-tight">
                  AI-Powered Color Correction for E-commerce
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Solve color mismatch between online clothing images and real products. 
                Get accurate color previews that reduce returns.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
            >
              <motion.button
                onClick={() => setShowRegisterModal(true)}
                className="btn-hover bg-primary-800 hover:bg-primary-900 text-white px-10 py-5 rounded-xl font-semibold text-xl flex items-center justify-center gap-3 shadow-xl"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Free
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-6 h-6" />
                </motion.div>
              </motion.button>
              <motion.button
                onClick={() => setShowLoginModal(true)}
                className="btn-hover bg-white text-primary-800 px-10 py-5 rounded-xl font-semibold text-xl border-2 border-primary-200 hover:border-primary-300 shadow-lg"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign In
              </motion.button>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col items-center"
            >
              <p className="text-gray-500 mb-4 text-lg">Scroll down to get started</p>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-primary-600"
              >
                <ArrowRight className="w-6 h-6 transform rotate-90" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-200px" }}
            className="text-center"
          >
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true, margin: "-150px" }}
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
            >
              Get Started with AI Color Analysis
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true, margin: "-150px" }}
              className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto"
            >
              Upload your image and get AI-corrected colors instantly
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true, margin: "-100px" }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  viewport={{ once: true, margin: "-50px" }}
                >
                  {/* Upload Area */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="border-2 border-dashed border-primary-300 rounded-2xl p-12 hover:border-primary-400 transition-all duration-300 cursor-pointer group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      className="flex justify-center mb-6"
                    >
                      <div className="bg-primary-100 rounded-full p-6 group-hover:bg-primary-200 transition-colors">
                        <Upload className="w-12 h-12 text-primary-800" />
                      </div>
                    </motion.div>
                    
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                      Upload Your Image
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Drag and drop or click to browse
                    </p>
                    
                    <motion.button 
                      className="bg-primary-800 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-900 transition-all duration-300 shadow-lg"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Choose File
                    </motion.button>
                  </motion.div>

                  {/* Process Steps */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    viewport={{ once: true, margin: "0px" }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6"
                  >
                    <div className="text-center">
                      <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                        <span className="text-blue-600 font-bold">1</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">Upload</h4>
                      <p className="text-sm text-gray-600">Select image</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-yellow-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                        <span className="text-yellow-600 font-bold">2</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">Analyze</h4>
                      <p className="text-sm text-gray-600">AI processes</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                        <span className="text-green-600 font-bold">3</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">Results</h4>
                      <p className="text-sm text-gray-600">Get corrected</p>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              viewport={{ once: true, margin: "0px" }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">95%</div>
                <div className="text-gray-600">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">&lt;2s</div>
                <div className="text-gray-600">Processing Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
                <div className="text-gray-600">Images Processed</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden features-section">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 to-transparent pointer-events-none" />
        <div className="absolute top-10 right-10 w-32 h-32 bg-primary-100/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-secondary-100/20 rounded-full blur-2xl" />
        
        {/* Floating particles */}
        <div className="feature-particle"></div>
        <div className="feature-particle"></div>
        <div className="feature-particle"></div>
        <div className="feature-particle"></div>
        <div className="feature-particle"></div>
        <div className="feature-particle"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.h2 
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              Why Choose COLORIQ?
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Our AI-powered platform delivers accurate color correction with detailed analytics and seamless integration.
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1 + 0.4,
                  ease: "easeOut"
                }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="feature-magnetic"
              >
                <FeatureCard {...feature} index={index} />
              </motion.div>
            ))}
          </motion.div>

          {/* Additional interactive elements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <motion.div
              className="inline-flex items-center gap-2 bg-primary-100 text-primary-800 px-6 py-3 rounded-full font-medium cursor-pointer"
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "rgb(100, 79, 69, 0.15)",
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Palette className="w-5 h-5" />
              </motion.div>
              <span>Powered by Advanced AI Technology</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Transform Your E-commerce Experience
              </h2>
              <div className="space-y-4">
                {[
                  "Reduce return rates by up to 40%",
                  "Increase customer trust and satisfaction",
                  "Get detailed accuracy scores and heatmaps",
                  "Support for both image uploads and URLs",
                  "Enterprise-grade security and reliability"
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-xl"
            >
              <div className="text-center">
                <div className="bg-primary-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-primary-800" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Join Thousands of Users</h3>
                <p className="text-gray-600 mb-6">
                  E-commerce businesses worldwide trust COLORIQ to deliver accurate color representation.
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary-600">10K+</div>
                    <div className="text-sm text-gray-500">Images Processed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-secondary-600">95%</div>
                    <div className="text-sm text-gray-500">Accuracy Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent-600">40%</div>
                    <div className="text-sm text-gray-500">Return Reduction</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              See how COLORIQ is transforming e-commerce experiences
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-4 sm:px-6 lg:px-8 bg-primary-100">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              About COLORIQ
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
              COLORIQ was born from the frustration of online shopping disappointments. We recognized that color accuracy 
              is crucial for customer satisfaction in e-commerce, especially in the fashion industry.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                We're on a mission to bridge the gap between digital representation and physical reality in e-commerce. 
                Our AI-powered color correction technology ensures that what you see online is what you get in real life.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Advanced AI Technology</h4>
                    <p className="text-gray-600">Cutting-edge machine learning algorithms trained on millions of clothing images</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Industry Expertise</h4>
                    <p className="text-gray-600">Deep understanding of e-commerce challenges and customer expectations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Proven Results</h4>
                    <p className="text-gray-600">Helping businesses reduce return rates and increase customer satisfaction</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-xl"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Us?</h3>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Palette className="w-8 h-8 text-primary-800" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Color Accuracy</h4>
                  <p className="text-gray-600 text-sm">Industry-leading 95% color accuracy rate</p>
                </div>
                <div className="text-center">
                  <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-primary-800" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Fast Processing</h4>
                  <p className="text-gray-600 text-sm">Results in under 2 seconds</p>
                </div>
                <div className="text-center">
                  <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-primary-800" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Secure & Reliable</h4>
                  <p className="text-gray-600 text-sm">Enterprise-grade security and 99.9% uptime</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary-800">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Transform Your E-commerce?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of businesses using COLORIQ to deliver accurate color representation and reduce returns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowRegisterModal(true)}
                className="btn-hover bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 shadow-lg"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowLoginModal(true)}
                className="btn-hover bg-transparent text-white px-8 py-4 rounded-xl font-semibold text-lg border-2 border-white hover:bg-white hover:text-primary-600 transition-all"
              >
                Sign In Now
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-800 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="col-span-2">
              <div className="coloriq-logo mb-4">
                <div className="coloriq-logo-icon">
                  <div className="coloriq-logo-square"></div>
                  <div className="coloriq-logo-square"></div>
                  <div className="coloriq-logo-square"></div>
                  <div className="coloriq-logo-square"></div>
                </div>
                <div className="coloriq-logo-text">
                  <span className="coloriq-logo-title" style={{ color: 'white' }}>COLORIQ</span>
                  <span className="coloriq-logo-subtitle" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>AI COLOR TECH</span>
                </div>
              </div>
              <p className="text-primary-200 mb-6">
                AI-powered color correction system for e-commerce clothing. 
                Bridging the gap between digital representation and physical reality.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-primary-200">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-700 mt-8 pt-8 text-center text-primary-200">
            <p>&copy; 2024 COLORIQ. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false)
          setShowRegisterModal(true)
        }}
      />
      <RegisterModal 
        isOpen={showRegisterModal} 
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false)
          setShowLoginModal(true)
        }}
      />
    </div>
  )
}