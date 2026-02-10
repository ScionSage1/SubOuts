import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, Building2, Settings, Archive } from 'lucide-react'
import clsx from 'clsx'
import { useApp } from '../../context/AppContext'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/subouts', icon: Package, label: 'All SubOuts' },
  { to: '/archived', icon: Archive, label: 'Archived' },
  { to: '/vendors', icon: Building2, label: 'Sub Fabricators' },
  { to: '/settings', icon: Settings, label: 'Settings' }
]

export default function Sidebar() {
  const { sidebarOpen } = useApp()

  return (
    <aside
      className={clsx(
        'fixed left-0 top-14 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-30',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      <nav className="p-2 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {sidebarOpen && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-xs text-gray-400 text-center">
            MFC SubOuts Tracker v1.0
          </div>
        </div>
      )}
    </aside>
  )
}
