import { Link, useNavigate } from 'react-router-dom'
import { Menu, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import Button from '../common/Button'

export default function Header() {
  const { toggleSidebar } = useApp()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/subouts?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">SubOuts</span>
            <span className="text-sm text-gray-500">Tracker</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs, lots..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </form>

          <Button onClick={() => navigate('/subouts/new')}>
            <Plus className="w-4 h-4 mr-1" />
            New Sub
          </Button>
        </div>
      </div>
    </header>
  )
}
