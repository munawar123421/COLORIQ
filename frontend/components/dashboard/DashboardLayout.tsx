'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Upload, 
  History, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  User,
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface DashboardLayoutProps {
  children: React.ReactNode
  user: {
    id: string
    name: string
    email: string
    avatar?: string | null
  }
}

// Create context for sidebar state persistence
const SidebarContext = createContext<{
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
}>({
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {}
})

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const pathname = usePathname()

  // Initialize and persist sidebar state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      
      // On mobile, always use overlay mode
      if (mobile) {
        setMobileMenuOpen(false)
      }
    }
    
    // Load persisted sidebar state from localStorage
    const savedSidebarState = localStorage.getItem('coloriq-sidebar-collapsed')
    if (savedSidebarState !== null) {
      setSidebarCollapsed(JSON.parse(savedSidebarState))
    }
    
    checkMobile()
    setIsInitialized(true)
    
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Persist sidebar state to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('coloriq-sidebar-collapsed', JSON.stringify(sidebarCollapsed))
    }
  }, [sidebarCollapsed, isInitialized])

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, description: 'Overview & stats' },
    { name: 'Upload', href: '/dashboard/upload', icon: Upload, description: 'Upload images' },
    { name: 'History', href: '/dashboard/history', icon: History, description: 'Past corrections' },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, description: 'Performance data' },
    { name: 'Profile', href: '/dashboard/profile', icon: User, description: 'Account settings' },
    { name: 'Contact', href: '/dashboard/contact', icon: MessageCircle, description: 'Get support' },
  ]

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.replace('/')
  }

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen)
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  // Calculate sidebar width and main content margin
  const sidebarWidth = sidebarCollapsed ? 80 : 288
  const mainContentMargin = isMobile ? 0 : sidebarWidth

  // Don't render until initialized to prevent hydration mismatch
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <SidebarContext.Provider value={{ sidebarCollapsed, setSidebarCollapsed }}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
        {/* Mobile backdrop */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.div 
          className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
          animate={{ 
            width: isMobile ? 288 : sidebarWidth 
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="flex flex-col h-full bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl">
            {/* Logo Section */}
            <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100/80">
              <AnimatePresence mode="wait">
                {!sidebarCollapsed || isMobile ? (
                  <motion.div
                    key="full-logo"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link href="/" className="group">
                      <div className="coloriq-logo">
                        <div className="coloriq-logo-icon">
                          <div className="coloriq-logo-square"></div>
                          <div className="coloriq-logo-square"></div>
                          <div className="coloriq-logo-square"></div>
                          <div className="coloriq-logo-square"></div>
                        </div>
                        <div className="coloriq-logo-text">
                          <span className="coloriq-logo-title">COLORIQ</span>
                          <span className="coloriq-logo-subtitle">AI Color Correction</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    key="collapsed-logo"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="mx-auto"
                  >
                    <Link href="/" className="group">
                      <div className="coloriq-logo-icon scale-75">
                        <div className="coloriq-logo-square"></div>
                        <div className="coloriq-logo-square"></div>
                        <div className="coloriq-logo-square"></div>
                        <div className="coloriq-logo-square"></div>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Mobile close button */}
              {isMobile && (
                <motion.button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
              {navigation.map((item, index) => {
                const isActive = pathname === item.href
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-600/25 transform scale-[1.02]'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-primary-700 hover:shadow-md hover:scale-[1.01]'
                      }`}
                      onClick={() => isMobile && setMobileMenuOpen(false)}
                    >
                      <motion.div
                        className={`flex-shrink-0 ${sidebarCollapsed && !isMobile ? 'mx-auto' : ''}`}
                        whileHover={{ scale: 1.1, rotate: isActive ? 0 : 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <item.icon className={`w-5 h-5 ${
                          isActive ? 'text-white' : 'text-gray-600 group-hover:text-primary-600'
                        }`} />
                      </motion.div>
                      
                      <AnimatePresence>
                        {(!sidebarCollapsed || isMobile) && (
                          <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1 min-w-0"
                          >
                            <div className="font-semibold">{item.name}</div>
                            {!isActive && (
                              <div className="text-xs text-gray-500 group-hover:text-primary-500 mt-0.5">
                                {item.description}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute right-3 w-2 h-2 bg-white rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}

                      {/* Tooltip for collapsed state */}
                      {sidebarCollapsed && !isMobile && (
                        <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg transition-opacity duration-200">
                          {item.name}
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                        </div>
                      )}
                    </Link>
                  </motion.div>
                )
              })}
            </nav>

            {/* Logout Button - No User Profile Card */}
            <div className="p-4">
              <motion.button
                onClick={handleLogout}
                className={`flex items-center gap-3 w-full px-4 py-3.5 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all duration-300 group border border-gray-200 hover:border-red-200 shadow-sm hover:shadow-md ${
                  sidebarCollapsed && !isMobile ? 'justify-center' : ''
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <LogOut className="w-5 h-5" />
                </motion.div>
                
                <AnimatePresence>
                  {(!sidebarCollapsed || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="font-semibold"
                    >
                      Sign Out
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip for collapsed logout */}
                {sidebarCollapsed && !isMobile && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg transition-opacity duration-200">
                    Sign Out
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main content */}
        <motion.div 
          className="min-h-screen transition-all duration-300 ease-in-out"
          animate={{
            marginLeft: mainContentMargin
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Top bar */}
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6">
              <div className="flex items-center gap-4">
                {/* Hamburger Menu */}
                <motion.button
                  onClick={toggleSidebar}
                  className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </motion.div>
                </motion.button>
                
                <div className="hidden sm:block">
                  <motion.h1 
                    className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {navigation.find(nav => nav.href === pathname)?.name || 'Dashboard'}
                  </motion.h1>
                  <motion.p 
                    className="text-sm text-gray-600"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    Welcome back, {user.name.split(' ')[0]}! ✨
                  </motion.p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Notifications */}
                <motion.button 
                  className="relative p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Bell className="w-5 h-5" />
                  </motion.div>
                  <motion.span 
                    className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.button>

                {/* User avatar - Enhanced display in header */}
                <motion.div 
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-9 h-9 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-xl object-cover" />
                    ) : (
                      <span className="text-white font-semibold text-sm">
                        {getUserInitials(user.name)}
                      </span>
                    )}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
            <div className="max-w-7xl mx-auto w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full"
              >
                {children}
              </motion.div>
            </div>
          </main>
        </motion.div>

        {/* Mobile bottom navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl">
          <div className="flex justify-around px-2 py-3">
            {navigation.slice(0, 5).map((item) => {
              const isActive = pathname === item.href
              return (
                <motion.div key={item.name} whileTap={{ scale: 0.95 }}>
                  <Link
                    href={item.href}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'text-primary-700 bg-primary-50 shadow-md' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      animate={{ scale: isActive ? 1.1 : 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <item.icon className="w-5 h-5" />
                    </motion.div>
                    <span className="text-xs font-medium">{item.name}</span>
                    {isActive && (
                      <motion.div 
                        className="w-1.5 h-1.5 bg-primary-700 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </SidebarContext.Provider>
  )
}