import { Link } from 'react-router-dom'
import { Settings, Users, Shield, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const cards = [
  {
    to: '/superadmin/settings',
    icon: Settings,
    color: 'bg-green-900/40 border-green-700/40',
    iconColor: 'text-green-400',
    title: 'Site Settings',
    desc: 'Control hero images, videos, about page content, story images and all site-wide media.',
  },
  {
    to: '/superadmin/users',
    icon: Users,
    color: 'bg-blue-900/30 border-blue-700/30',
    iconColor: 'text-blue-400',
    title: 'User Management',
    desc: 'View, create, edit and deactivate user accounts across the platform.',
  },
  {
    to: '/superadmin/roles',
    icon: Shield,
    color: 'bg-purple-900/30 border-purple-700/30',
    iconColor: 'text-purple-400',
    title: 'Roles & Permissions',
    desc: 'Define roles and granular permissions for admin staff access control.',
  },
]

export default function SuperAdminDashboard() {
  const { user } = useAuth()

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      <div>
        <h2 className="font-serif text-2xl font-bold text-white mb-1">
          Welcome back, {user?.name ?? 'Kenedy'}
        </h2>
        <p className="font-sans text-sm text-gray-400">
          System Control Panel &mdash; Nelson Tours &amp; Safari
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {cards.map(({ to, icon: Icon, color, iconColor, title, desc }) => (
          <Link
            key={to}
            to={to}
            className={`group flex flex-col gap-4 p-5 rounded-2xl border ${color} hover:brightness-110 transition`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gray-800 ${iconColor}`}>
              <Icon size={20} />
            </div>
            <div className="flex-1">
              <p className="font-sans text-sm font-semibold text-white mb-1">{title}</p>
              <p className="font-sans text-xs text-gray-400 leading-relaxed">{desc}</p>
            </div>
            <div className={`flex items-center gap-1 font-sans text-xs font-semibold ${iconColor} group-hover:gap-2 transition-all`}>
              Open <ArrowRight size={12} />
            </div>
          </Link>
        ))}
      </div>

    </div>
  )
}
