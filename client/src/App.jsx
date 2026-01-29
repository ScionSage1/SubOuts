import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import SubOutsListPage from './pages/SubOutsListPage'
import SubOutDetailPage from './pages/SubOutDetailPage'
import NewSubOutPage from './pages/NewSubOutPage'
import EditSubOutPage from './pages/EditSubOutPage'
import VendorsPage from './pages/VendorsPage'
import JobView from './pages/JobView'
import Settings from './pages/Settings'
import { useApp } from './context/AppContext'

function App() {
  const { sidebarOpen } = useApp()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 p-6 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/subouts" element={<SubOutsListPage />} />
            <Route path="/subouts/new" element={<NewSubOutPage />} />
            <Route path="/subouts/:id" element={<SubOutDetailPage />} />
            <Route path="/subouts/:id/edit" element={<EditSubOutPage />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/jobs/:jobCode" element={<JobView />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
