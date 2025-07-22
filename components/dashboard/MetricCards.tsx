import { MetricCard as MetricCardType } from '@/lib/types'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/cn'

interface MetricCardsProps {
  metrics: MetricCardType[]
}

export function MetricCards({ metrics }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  )
}

function MetricCard({ title, value, unit, trend, trendValue }: MetricCardType) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'text-red-500' : trend === 'down' ? 'text-blue-500' : 'text-gray-400'
  
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {trend && (
          <div className={cn('flex items-center space-x-1', trendColor)}>
            <TrendIcon className="w-4 h-4" />
            {trendValue && <span className="text-xs">{trendValue}%</span>}
          </div>
        )}
      </div>
      <div className="flex items-baseline space-x-1">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        <span className="text-sm text-gray-500">{unit}</span>
      </div>
    </div>
  )
}