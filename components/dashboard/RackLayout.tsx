'use client'

import { useState } from 'react'
import { Rack, Sensor, MetricType } from '@/lib/types'
import { getHeatmapColor, formatMetricValue } from '@/lib/utils'
import { cn } from '@/lib/cn'
import { Router, Server } from 'lucide-react'

interface RackLayoutProps {
  racks: Rack[]
  sensors: Sensor[]
  metricType: MetricType
  onRackClick?: (rack: Rack) => void
}

export function RackLayout({ racks, sensors, metricType, onRackClick }: RackLayoutProps) {
  const [hoveredRack, setHoveredRack] = useState<string | null>(null)
  
  // Create sensor data map for quick lookup
  const sensorMap = new Map<string, { front: Sensor; back: Sensor }>()
  sensors.forEach(sensor => {
    const existing = sensorMap.get(sensor.rack_id) || { front: null!, back: null! }
    if (sensor.position === 'intake') {
      existing.front = sensor
    } else {
      existing.back = sensor
    }
    sensorMap.set(sensor.rack_id, existing)
  })
  
  // Calculate grid dimensions
  const maxRow = Math.max(...racks.map(r => r.row))
  const maxCol = Math.max(...racks.map(r => r.col))
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border)] p-6">
      <div className="grid gap-2" style={{ 
        gridTemplateColumns: `repeat(${maxCol}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${maxRow}, minmax(0, 1fr))`
      }}>
        {racks.map(rack => {
          const sensorData = sensorMap.get(rack.rack_id)
          if (!sensorData) return null
          
          const frontValue = sensorData.front[metricType]
          const backValue = sensorData.back[metricType]
          const avgValue = (frontValue + backValue) / 2
          
          const color = getHeatmapColor(avgValue, metricType)
          const isHovered = hoveredRack === rack.rack_id
          
          return (
            <div
              key={rack.rack_id}
              className={cn(
                'relative aspect-square rounded-lg transition-all duration-300 cursor-pointer',
                'flex items-center justify-center text-xs font-medium',
                isHovered && 'scale-110 z-10 shadow-lg'
              )}
              style={{ 
                backgroundColor: color,
                gridRow: rack.row,
                gridColumn: rack.col
              }}
              onMouseEnter={() => setHoveredRack(rack.rack_id)}
              onMouseLeave={() => setHoveredRack(null)}
              onClick={() => onRackClick?.(rack)}
            >
              {/* Special rack indicators */}
              {rack.rack_type === 'router' && (
                <Router className="w-6 h-6 text-white absolute top-1 right-1" />
              )}
              {rack.rack_type === 'poe_hub' && (
                <Server className="w-5 h-5 text-white absolute top-1 right-1" />
              )}
              
              {/* Rack ID */}
              <span className="text-white text-[10px]">{rack.rack_id.replace('RACK-', '')}</span>
              
              {/* Hover tooltip */}
              {isHovered && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white p-2 rounded shadow-lg text-xs whitespace-nowrap z-20">
                  <div className="font-semibold mb-1">{rack.rack_id}</div>
                  <div>表: {formatMetricValue(frontValue, metricType)}</div>
                  <div>裏: {formatMetricValue(backValue, metricType)}</div>
                  <div className="pt-1 border-t border-gray-700 mt-1">
                    平均: {formatMetricValue(avgValue, metricType)}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex items-center justify-center space-x-8">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-[var(--color-heatmap-cold)] rounded"></div>
          <span className="text-sm text-gray-600">低</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-[var(--color-heatmap-normal)] rounded"></div>
          <span className="text-sm text-gray-600">標準</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-[var(--color-heatmap-warm)] rounded"></div>
          <span className="text-sm text-gray-600">注意</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-[var(--color-heatmap-hot)] rounded"></div>
          <span className="text-sm text-gray-600">警告</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-[var(--color-heatmap-critical)] rounded"></div>
          <span className="text-sm text-gray-600">危険</span>
        </div>
      </div>
    </div>
  )
}