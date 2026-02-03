import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext(null)

const USERS = ['Doug', 'Todd', 'Blake', 'Evan', 'Ken', 'Joe L.', 'Joe S.', 'Conrad']

export function AppProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [viewMode, setViewMode] = useState('cards') // 'cards' or 'table'
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem('subouts-user') || null
  })

  const toggleSidebar = () => setSidebarOpen(prev => !prev)

  const handleSetUser = (user) => {
    setCurrentUser(user)
    localStorage.setItem('subouts-user', user)
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('subouts-user')
  }

  const value = {
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    viewMode,
    setViewMode,
    currentUser,
    setCurrentUser: handleSetUser,
    logout,
    users: USERS
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
