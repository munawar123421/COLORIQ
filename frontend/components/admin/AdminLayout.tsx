'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard,
  Users,
  BarChart3,
  Shield,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Crown,
  Search,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AdminLayoutProps {
  children: React.ReactNode
  user: {
    id: string
    name: string
    email: string
    role: string
    avatar?: string | null
  }
}

export default function AdminLayout({ children, user }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const pathname = usePathname()

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setSidebarCollapsed(false)
        setMobileMenuOpen(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, description: 'System overview' },
    { name: 'User Management', href: '/admin/users', icon: Users, description: 'Manage users' },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, description: 'Performance metrics' },
    { name: 'Settings', href: '/admin/settings', icon: Settings, description: 'System settings' },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: Shield, description: 'Security logs' },
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

  const sidebarWidth = sidebarCollapsed ? 80 : 288

  return (
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
      <div 
        className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ 
          width: isMobile ? '288px' : `${sidebarWidth}px`
        }}
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
                  <Link href="/admin/dashboard" className="group">
                    <div className="coloriq-logo coloriq-logo-admin">
                      <div className="coloriq-logo-icon">
                        <div className="coloriq-logo-square"></div>
                        <div className="coloriq-logo-square"></div>
                        <div className="coloriq-logo-square"></div>
                        <div className="coloriq-logo-square"></div>
                      </div>
                      <div className="coloriq-logo-text">
                        <span className="coloriq-logo-title">COLORIQ</span>
                        <span className="coloriq-logo-subtitle">Admin Panel</span>
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
                  className="mx-auto relative"
                >
                  <Link href="/admin/dashboard" className="group">
                    <div className="coloriq-logo-icon scale-75 relative">
                      <div className="coloriq-logo-square"></div>
                      <div className="coloriq-logo-square"></div>
                      <div className="coloriq-logo-square"></div>
                      <div className="coloriq-logo-square"></div>
                      <Crown className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500" />
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
                        layoutId="activeAdminIndicator"
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

          {/* Logout Button */}
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
      </div>

      {/* Main content */}
      <div 
        className="min-h-screen transition-all duration-300"
        style={{
          marginLeft: isMobile ? '0' : `${sidebarWidth}px`
        }}
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
                  className="text-xl font-bold bg-gradient-to-r from-primary-800 to-primary-600 bg-clip-text text-transparent flex items-center gap-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Crown className="w-5 h-5 text-yellow-500" />
                  {navigation.find(nav => nav.href === pathname)?.name || 'Admin Panel'}
                </motion.h1>
                <motion.p 
                  className="text-sm text-gray-600"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  Manage your COLORIQ platform ⚡
                </motion.p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <motion.div 
                className="hidden md:flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200/50 min-w-[200px]"
                whileHover={{ scale: 1.02 }}
                whileFocus={{ scale: 1.02 }}
              >
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="bg-transparent text-sm text-gray-800 placeholder-gray-500 focus:outline-none flex-1"
                />
              </motion.div>

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

              {/* Profile dropdown */}
              <div className="relative">
                <motion.button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div 
                    className="w-9 h-9 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-md relative"
                    whileHover={{ rotate: 5 }}
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-xl object-cover" />
                    ) : (
                      <span className="text-white font-semibold text-sm">
                        {getUserInitials(user.name)}
                      </span>
                    )}
                    <Crown className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500" />
                  </motion.div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-primary-600 font-medium">{user.role}</p>
                  </div>
                  <motion.div
                    animate={{ rotate: profileDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </motion.div>
                </motion.button>

                {/* Dropdown menu */}
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200/50 py-2 z-50 backdrop-blur-xl"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        href="/admin/settings"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Account Settings
                      </Link>
                      <hr className="my-2 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

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
                  <span className="text-xs font-medium">{item.name.split(' ')[0]}</span>
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
  )
}