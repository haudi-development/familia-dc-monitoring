'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Database, 
  AlertCircle, 
  Users,
  Building2
} from 'lucide-react'
import { cn } from '@/lib/cn'

const menuItems = [
  {
    title: 'ダッシュボード',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'データセンター',
    href: '/datacenters',
    icon: Building2,
  },
  {
    title: 'データ管理',
    href: '/data',
    icon: Database,
  },
  {
    title: 'アラート管理',
    href: '/alerts',
    icon: AlertCircle,
  },
  {
    title: 'ユーザー管理',
    href: '/users',
    icon: Users,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 h-screen bg-white border-r border-[var(--color-border)] fixed left-0 top-0">
      <div className="p-6">
        <Link href="/" className="block">
          <h1 className="text-2xl font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors cursor-pointer">Familia for DC</h1>
        </Link>
      </div>
      
      <nav className="px-4 py-2">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href))
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'sidebar-link',
                    isActive && 'active'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}