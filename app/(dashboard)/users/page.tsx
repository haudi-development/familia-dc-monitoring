'use client'

import { useState } from 'react'
import { UserPlus, Edit2, Trash2, Shield, User, Mail, Calendar, CheckCircle, XCircle } from 'lucide-react'

interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'operator' | 'viewer'
  status: 'active' | 'inactive'
  lastLogin: Date | null
  createdAt: Date
}

// Mock user data
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    status: 'active',
    lastLogin: new Date('2025-01-22T10:30:00'),
    createdAt: new Date('2025-01-01')
  },
  {
    id: '2',
    username: 'operator1',
    email: 'operator1@example.com',
    role: 'operator',
    status: 'active',
    lastLogin: new Date('2025-01-22T09:15:00'),
    createdAt: new Date('2025-01-05')
  },
  {
    id: '3',
    username: 'viewer1',
    email: 'viewer1@example.com',
    role: 'viewer',
    status: 'active',
    lastLogin: new Date('2025-01-21T14:20:00'),
    createdAt: new Date('2025-01-10')
  },
  {
    id: '4',
    username: 'operator2',
    email: 'operator2@example.com',
    role: 'operator',
    status: 'inactive',
    lastLogin: new Date('2025-01-15T11:45:00'),
    createdAt: new Date('2025-01-08')
  }
]

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [showAddModal, setShowAddModal] = useState(false)
  
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin': return '管理者'
      case 'operator': return 'オペレーター'
      case 'viewer': return '閲覧者'
      default: return role
    }
  }
  
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'operator': return 'bg-blue-100 text-blue-800'
      case 'viewer': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  const handleToggleStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ))
  }
  
  const handleDeleteUser = (userId: string) => {
    if (confirm('このユーザーを削除してもよろしいですか？')) {
      setUsers(users.filter(user => user.id !== userId))
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ユーザー管理</h1>
          <p className="text-gray-600 mt-1">ユーザーアカウントと権限管理</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          <span>新規ユーザー追加</span>
        </button>
      </div>
      
      {/* User statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">全ユーザー数</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <User className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">アクティブ</p>
              <p className="text-2xl font-bold text-green-600">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">管理者</p>
              <p className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">本日のログイン</p>
              <p className="text-2xl font-bold text-blue-600">3</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>
      
      {/* User list */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border)]">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">ユーザー一覧</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ユーザー
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ロール
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最終ログイン
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作成日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {getRoleDisplay(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status === 'active' ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          アクティブ
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          非アクティブ
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin ? user.lastLogin.toLocaleString('ja-JP') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.createdAt.toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`px-3 py-1 rounded text-xs transition-colors ${
                          user.status === 'active'
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {user.status === 'active' ? '無効化' : '有効化'}
                      </button>
                      <button className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1.5 text-red-600 hover:text-red-700 transition-colors"
                        disabled={user.username === 'admin'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add user modal placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">新規ユーザー追加</h3>
            <p className="text-gray-600">ユーザー追加機能は開発中です</p>
            <button
              onClick={() => setShowAddModal(false)}
              className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  )
}