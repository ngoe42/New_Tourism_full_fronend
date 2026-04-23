import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Settings, Users, Shield,
  LogOut, Menu, X, Lock,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const PAGE_TITLES = {
  '/superadmin':          'System Dashboard',
  '/superadmin/settings': 'Site Settings',
  '/superadmin/users':    'User Management',
  '/superadmin/roles':    'Roles & Permissions',
}

const NAV = [
  { to: '/superadmin',          label: 'Dashboard',          icon: LayoutDashboard, end: true },
  { to: '/superadmin/settings', label: 'Site Settings',       icon: Settings,        end: false },
  { to: '/superadmin/users',    label: 'User Management',     icon: Users,           end: false },
  { to: '/superadmin/roles',    label: 'Roles & Permissions', icon: Shield,          end: false },
]

export default function SuperAdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'System'

  const handleLogout = () => { logout(); navigate('/login/admin') }

  const renderSidebar = (isMobile = false) => (
    <div className="flex flex-col h-full bg-gray-950 border-r border-gray-800">

      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
        <div className="w-8 h-8 rounded-lg bg-green-800 border border-green-700 flex items-center justify-center flex-shrink-0">
          <Lock size={14} className="text-green-300" />
        </div>
        <div className="leading-none">
          <p className="font-sans text-xs font-bold text-white tracking-widest uppercase">System</p>
          <p className="font-sans text-[10px] text-gray-500 tracking-wider">Nelson Tour &amp; Safari</p>
        </div>
        {isMobile && (
          <button onClick={() => setMobileOpen(false)} className="ml-auto text-gray-500 hover:text-white transition">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => isMobile && setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg font-sans text-sm font-medium transition-all duration-150
               ${isActive
                 ? 'bg-green-800/50 text-green-300 border border-green-700/40'
                 : 'text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent'}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-gray-800 px-4 py-4 bg-gray-900/50">
        <div className="text-[10px] font-sans text-gray-600 uppercase tracking-widest mb-1">Signed in as</div>
        <div className="font-sans text-xs font-semibold text-gray-300 truncate mb-2">{user?.name}</div>
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 bg-green-900/60 text-green-400 border border-green-700/40 rounded font-sans text-[10px] font-bold tracking-wide uppercase">
            Super Admin
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 font-sans text-xs text-gray-500 hover:text-red-400 transition"
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col flex-shrink-0 w-56">
        {renderSidebar(false)}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden flex"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <motion.aside
              className="relative z-10 flex flex-col w-56"
              initial={{ x: -224 }} animate={{ x: 0 }} exit={{ x: -224 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {renderSidebar(true)}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3.5 bg-gray-950 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-800 transition text-gray-400"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={19} />
            </button>
            <div className="flex items-center gap-2">
              <Lock size={15} className="text-green-500 hidden lg:block" />
              <h1 className="font-sans text-base font-bold text-white">{pageTitle}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-3 border-l border-gray-800">
            <div className="w-7 h-7 rounded-full bg-green-800 border border-green-700 flex items-center justify-center font-sans text-xs font-bold text-green-200">
              {user?.name?.[0]?.toUpperCase() ?? 'K'}
            </div>
            <span className="hidden sm:block font-sans text-sm font-medium text-gray-300">{user?.name}</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
