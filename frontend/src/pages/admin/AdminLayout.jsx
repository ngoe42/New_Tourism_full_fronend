import { useState, useRef, useEffect, useCallback } from 'react'
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Map, CalendarCheck, MessageSquare,
  Mail, LogOut, Menu, Globe, Bell, CalendarClock, Inbox, Star, Images, Mountain
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { adminApi } from '../../api/admin'

const PAGE_TITLES = {
  '/admin': 'Dashboard',
  '/admin/tours': 'Tours',
  '/admin/bookings': 'Bookings',
  '/admin/testimonials': 'Testimonials',
  '/admin/inquiries': 'Inquiries',
  '/admin/experiences': 'Experiences',
  '/admin/routes': 'Kilimanjaro Routes',
}

function NotifBadge({ count }) {
  if (!count) return null
  return (
    <span className="min-w-[18px] h-[18px] px-1 bg-red-500 text-white rounded-full font-sans text-[10px] font-bold flex items-center justify-center leading-none">
      {count > 99 ? '99+' : count}
    </span>
  )
}

const SIDEBAR_EXPANDED = 224
const SIDEBAR_COLLAPSED = 64

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen]   = useState(false)
  const [collapsed, setCollapsed]       = useState(() => localStorage.getItem('sidebar_collapsed') === 'true')
  const [bellOpen, setBellOpen]         = useState(false)
  const [tooltip, setTooltip]           = useState(null)   // { label, badge, top, left }
  const [lastSeen, setLastSeen]         = useState(() => parseInt(localStorage.getItem('admin_notif_seen') ?? '0', 10))

  const bellRef = useRef(null)
  const { user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  /* ── stats polling ─────────────────────────────────────────── */
  const { data: stats } = useQuery({
    queryKey: ['admin-notif-stats'],
    queryFn: adminApi.stats,
    refetchInterval: 15000,
  })

  const pendingBookings     = stats?.pending_bookings     ?? 0
  const pendingInquiries    = stats?.pending_inquiries    ?? 0
  const pendingTestimonials = stats?.pending_testimonials ?? 0
  const totalPending = pendingBookings + pendingInquiries + pendingTestimonials
  const unread = Math.max(0, totalPending - lastSeen)

  /* ── close bell on outside click ───────────────────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* ── helpers ────────────────────────────────────────────────── */
  const toggleCollapsed = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev
      localStorage.setItem('sidebar_collapsed', String(next))
      if (!next) setTooltip(null)   // clear tooltip when expanding
      return next
    })
  }, [])

  const handleBellClick = () => {
    const opening = !bellOpen
    setBellOpen(opening)
    if (opening) {
      localStorage.setItem('admin_notif_seen', String(totalPending))
      setLastSeen(totalPending)
    }
  }

  const handleLogout = () => { logout(); navigate('/') }
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Admin'

  /* ── nav items ──────────────────────────────────────────────── */
  const navItems = [
    { to: '/admin',              label: 'Dashboard',    icon: LayoutDashboard, end: true,  badge: 0 },
    { to: '/admin/tours',        label: 'Tours',        icon: Map,             end: false, badge: 0 },
    { to: '/admin/bookings',     label: 'Bookings',     icon: CalendarCheck,   end: false, badge: pendingBookings },
    { to: '/admin/testimonials', label: 'Testimonials', icon: MessageSquare,   end: false, badge: pendingTestimonials },
    { to: '/admin/inquiries',    label: 'Inquiries',    icon: Mail,            end: false, badge: pendingInquiries },
    { to: '/admin/experiences',  label: 'Experiences',  icon: Images,          end: false, badge: 0 },
    { to: '/admin/routes',        label: 'Routes',       icon: Mountain,        end: false, badge: 0 },
  ]

  const notifItems = [
    { icon: CalendarClock, color: 'text-blue-500 bg-blue-50',     label: 'Pending Bookings',  count: pendingBookings,     to: '/admin/bookings' },
    { icon: Inbox,         color: 'text-indigo-500 bg-indigo-50', label: 'Pending Inquiries', count: pendingInquiries,    to: '/admin/inquiries' },
    { icon: Star,          color: 'text-amber-500 bg-amber-50',   label: 'Pending Reviews',   count: pendingTestimonials, to: '/admin/testimonials' },
  ].filter(n => n.count > 0)

  /* ── tooltip handlers ───────────────────────────────────────── */
  const showTooltip = (e, label, badge) => {
    if (!collapsed) return
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltip({ label, badge, top: rect.top + rect.height / 2, left: rect.right + 10 })
  }
  const hideTooltip = () => setTooltip(null)

  /* ── sidebar JSX (shared between desktop + mobile) ──────────── */
  const renderSidebar = (isMobile = false) => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">

      {/* Brand */}
      <div className={`flex items-center border-b border-gray-100 transition-all duration-300 ${collapsed && !isMobile ? 'justify-center px-0 py-5' : 'px-5 py-5'}`}>
        {(!collapsed || isMobile) ? (
          <div className="flex flex-col leading-none">
            <span className="font-serif font-bold text-lg tracking-[0.12em] uppercase text-gray-900 whitespace-nowrap">Nelson</span>
            <span className="font-serif italic text-[10px] tracking-[0.2em] uppercase text-amber-600 whitespace-nowrap">Tour &amp; Safari</span>
          </div>
        ) : (
          <span className="font-serif font-bold text-base tracking-widest text-gray-900">N</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto overflow-x-visible">
        {navItems.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => isMobile && setSidebarOpen(false)}
            onMouseEnter={(e) => showTooltip(e, label, badge)}
            onMouseLeave={hideTooltip}
            className={({ isActive }) =>
              `flex items-center rounded-lg font-sans text-sm font-medium transition-all duration-150 relative
               ${collapsed && !isMobile ? 'justify-center px-0 py-3 mx-1' : 'gap-3 px-4 py-2.5'}
               ${isActive ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                {(!collapsed || isMobile) && (
                  <>
                    <span className="flex-1 whitespace-nowrap overflow-hidden">{label}</span>
                    {badge > 0 && <NotifBadge count={badge} />}
                  </>
                )}
                {collapsed && !isMobile && badge > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-[14px] h-[14px] bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        <div className="pt-3 mt-3 border-t border-gray-100">
          <button
            onClick={() => { navigate('/'); isMobile && setSidebarOpen(false) }}
            onMouseEnter={(e) => showTooltip(e, 'Public Site', 0)}
            onMouseLeave={hideTooltip}
            className={`w-full flex items-center rounded-lg font-sans text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all duration-150
              ${collapsed && !isMobile ? 'justify-center px-0 py-3 mx-1' : 'gap-3 px-4 py-2.5'}`}
          >
            <Globe size={16} />
            {(!collapsed || isMobile) && <span className="whitespace-nowrap">View Public Site</span>}
          </button>
        </div>
      </nav>

      {/* User bottom */}
      {(!collapsed || isMobile) ? (
        <div className="border-t border-gray-100 px-4 py-4 bg-gray-50">
          <div className="text-[10px] font-sans text-gray-400 uppercase tracking-widest mb-1">Signed in as</div>
          <div className="font-sans text-xs font-semibold text-gray-800 truncate mb-2">{user?.email}</div>
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded font-sans text-[10px] font-bold tracking-wide uppercase">
              {user?.role ?? 'Admin'}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 font-sans text-xs text-gray-500 hover:text-red-500 transition-colors duration-150"
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>
      ) : (
        <div className="border-t border-gray-100 py-3 flex flex-col items-center gap-2 bg-gray-50">
          <div
            onMouseEnter={(e) => showTooltip(e, user?.name ?? 'Admin', 0)}
            onMouseLeave={hideTooltip}
            className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center font-sans text-xs font-bold text-white cursor-default"
          >
            {user?.name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <button
            onClick={handleLogout}
            onMouseEnter={(e) => showTooltip(e, 'Logout', 0)}
            onMouseLeave={hideTooltip}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* ── Desktop Sidebar ─────────────────────────────────────── */}
      <aside
        className="hidden lg:flex lg:flex-col flex-shrink-0 transition-all duration-300 ease-in-out"
        style={{ width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
      >
        {renderSidebar(false)}
      </aside>

      {/* ── Mobile Sidebar Overlay ───────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <motion.aside
              className="relative z-10 flex flex-col"
              style={{ width: SIDEBAR_EXPANDED }}
              initial={{ x: -SIDEBAR_EXPANDED }}
              animate={{ x: 0 }}
              exit={{ x: -SIDEBAR_EXPANDED }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {renderSidebar(true)}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tooltip (fixed, escapes sidebar bounds) ─────────────── */}
      <AnimatePresence>
        {tooltip && collapsed && (
          <motion.div
            key={tooltip.label}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[200] pointer-events-none"
            style={{ top: tooltip.top, left: tooltip.left, transform: 'translateY(-50%)' }}
          >
            <div className="flex items-center gap-1.5 bg-gray-900 text-white text-xs font-medium font-sans px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
              {tooltip.label}
              {tooltip.badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {tooltip.badge}
                </span>
              )}
              {/* Arrow */}
              <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-gray-900" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3.5 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile: open overlay */}
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={19} className="text-gray-600" />
            </button>
            {/* Desktop: collapse/expand sidebar */}
            <button
              className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={toggleCollapsed}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Menu size={19} className="text-gray-600" />
            </button>
            <h1 className="font-sans text-lg font-bold text-gray-900">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div ref={bellRef} className="relative">
              <button
                onClick={handleBellClick}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Bell size={18} className={bellOpen ? 'text-green-600' : 'text-gray-500'} />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-0.5 bg-red-500 text-white rounded-full font-sans text-[10px] font-bold flex items-center justify-center leading-none animate-pulse">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {bellOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <span className="font-sans text-sm font-bold text-gray-800">Notifications</span>
                      {totalPending > 0 && (
                        <span className="px-2 py-0.5 bg-red-50 text-red-500 rounded-full font-sans text-[11px] font-semibold">
                          {totalPending} pending
                        </span>
                      )}
                    </div>

                    {notifItems.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell size={28} className="text-gray-200 mx-auto mb-2" />
                        <p className="font-sans text-sm text-gray-400">All caught up!</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {notifItems.map(({ icon: Icon, color, label, count, to }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setBellOpen(false)}
                            className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
                          >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                              <Icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-sans text-sm font-semibold text-gray-800">{count} {label}</p>
                              <p className="font-sans text-xs text-gray-400">Requires your attention</p>
                            </div>
                            <span className="min-w-[22px] h-[22px] px-1 bg-red-500 text-white rounded-full font-sans text-xs font-bold flex items-center justify-center">
                              {count}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}

                    <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
                      <p className="font-sans text-[11px] text-gray-400 text-center">Updates every 15 seconds</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User */}
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center font-sans text-xs font-bold text-white">
                {user?.name?.[0]?.toUpperCase() ?? 'A'}
              </div>
              <span className="hidden sm:block font-sans text-sm font-medium text-gray-700">{user?.name ?? 'Admin'}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
