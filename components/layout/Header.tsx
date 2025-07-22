'use client'

import { Bell, User, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function Header() {
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }
  
  return (
    <header className="h-16 bg-white border-b border-[var(--color-border)] fixed top-0 right-0 left-64 z-10">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-gray-800">データセンター監視システム</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 pl-4 border-l border-gray-200 hover:bg-gray-50 py-2 px-3 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">管理者</span>
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>ログアウト</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}