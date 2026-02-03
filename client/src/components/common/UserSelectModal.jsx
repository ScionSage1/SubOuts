import { User } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function UserSelectModal() {
  const { currentUser, setCurrentUser, users } = useApp()

  // Don't render if user is already selected
  if (currentUser) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Welcome to SubOuts</h2>
          <p className="text-sm text-gray-500 mt-1">Who are you?</p>
        </div>

        <div className="space-y-2">
          {users.map(user => (
            <button
              key={user}
              onClick={() => setCurrentUser(user)}
              className="w-full px-4 py-3 text-left rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                {user.charAt(0)}
              </div>
              <span className="font-medium text-gray-900">{user}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
