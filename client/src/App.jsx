import { Routes, Route } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import SubOutsListPage from './pages/SubOutsListPage'
import SubOutDetailPage from './pages/SubOutDetailPage'
import NewSubOutPage from './pages/NewSubOutPage'
import EditSubOutPage from './pages/EditSubOutPage'
import VendorsPage from './pages/VendorsPage'
import JobView from './pages/JobView'
import ArchivedPage from './pages/ArchivedPage'
import Settings from './pages/Settings'
import { useApp } from './context/AppContext'
import AiChat from './components/cortex/AiChat'
import UserSelectModal from './components/common/UserSelectModal'

function App() {
  const { sidebarOpen, currentUser } = useApp()
  const queryClient = useQueryClient()

  // Handle tool results from MFCCortex AI
  const handleToolResult = (tool, result) => {
    // When a communication is logged via AI, refresh the communications and vendors queries
    if (tool === 'log_fabricator_communication' && result?.success) {
      queryClient.invalidateQueries({ queryKey: ['communications'] })
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
    }
    // When a sub out is completed/reopened via AI, refresh subouts and dashboard
    if (tool === 'update_subout_status' && result?.success) {
      queryClient.invalidateQueries({ queryKey: ['subouts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserSelectModal />
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
            <Route path="/archived" element={<ArchivedPage />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/jobs/:jobCode" element={<JobView />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
      <AiChat appId="subouts" userId={currentUser || 'guest'} onToolResult={handleToolResult} />
    </div>
  )
}

export default App
