'use client'

import { useState } from 'react'
import { MetricType } from '@/lib/types'
import { getMetricLabel } from '@/lib/utils'
import { cn } from '@/lib/cn'

interface HeatmapViewProps {
  selectedMetric: MetricType
  onMetricChange: (metric: MetricType) => void
}

const metrics: MetricType[] = ['temperature', 'humidity', 'airflow']

export function HeatmapView({ selectedMetric, onMetricChange }: HeatmapViewProps) {
  return (
    <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm border border-[var(--color-border)] p-2">
      {metrics.map(metric => (
        <button
          key={metric}
          onClick={() => onMetricChange(metric)}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            selectedMetric === metric
              ? 'bg-[var(--color-primary)] text-white'
              : 'text-gray-700 hover:bg-gray-100'
          )}
        >
          {getMetricLabel(metric)}
        </button>
      ))}
    </div>
  )
}