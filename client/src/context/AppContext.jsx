import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [viewMode, setViewMode] = useState('cards') // 'cards' or 'table'

  const toggleSidebar = () => setSidebarOpen(prev => !prev)

  const value = {
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    viewMode,
    setViewMode
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
