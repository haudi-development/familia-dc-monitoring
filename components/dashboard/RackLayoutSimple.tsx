'use client'

import { useState } from 'react'
import { Rack, Sensor, MetricType } from '@/lib/types'
import { getHeatmapColor, formatMetricValue } from '@/lib/utils'
import { cn } from '@/lib/cn'

interface RackLayoutSimpleProps {
  racks: Rack[]
  sensors: Sensor[]
  metricType: MetricType
  onRackClick?: (rack: Rack) => void
}

export function RackLayoutSimple({ racks, sensors, metricType, onRackClick }: RackLayoutSimpleProps) {
  const [hoveredRack, setHoveredRack] = useState<string | null>(null)
  
  // Create sensor data map for quick lookup
  const sensorMap = new Map<string, { intake: Sensor; exhaust: Sensor }>()
  sensors.forEach(sensor => {
    const existing = sensorMap.get(sensor.rack_id) || { intake: null!, exhaust: null! }
    if (sensor.position === 'intake') {
      existing.intake = sensor
    } else {
      existing.exhaust = sensor
    }
    sensorMap.set(sensor.rack_id, existing)
  })
  
  // 17列 × 10行のグリッドを作成
  const maxRow = 10
  const maxCol = 17
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border)] p-6 overflow-x-auto">
      <div className="min-w-[1400px]">
        {/* Column labels (A-Q) */}
        <div className="flex mb-2">
          <div className="w-10"></div> {/* Space for row numbers */}
          <div className="grid grid-cols-17 gap-x-3" style={{ gridTemplateColumns: `repeat(${maxCol}, minmax(0, 1fr))` }}>
            {[...Array(maxCol)].map((_, i) => (
              <div key={i} className="w-14 text-center text-sm font-bold text-gray-700">
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <div className="w-10"></div> {/* Space for right row numbers */}
        </div>
        
        {/* Rack grid with row numbers */}
        <div className="flex">
          {/* Row numbers */}
          <div className="grid grid-rows-10 gap-1">
            {[...Array(maxRow)].map((_, i) => (
              <div key={i} className="h-12 w-10 flex items-center justify-center text-sm font-medium text-gray-600">
                {i + 1}
              </div>
            ))}
          </div>
          
          {/* Rack grid */}
          <div className="grid grid-cols-17 gap-x-3 gap-y-1" style={{ gridTemplateColumns: `repeat(${maxCol}, minmax(0, 1fr))` }}>
            {[...Array(maxRow)].map((_, row) => (
              [...Array(maxCol)].map((_, col) => {
                const rack = racks.find(r => r.row === row + 1 && r.col === col + 1)
                if (!rack) {
                  return <div key={`empty-${row}-${col}`} className="w-14 h-12"></div>
                }
                
                const sensorData = sensorMap.get(rack.rack_id)
                if (!sensorData) return <div key={`no-sensor-${row}-${col}`} className="w-14 h-12"></div>
                
                const intakeValue = sensorData.intake[metricType]
                const exhaustValue = sensorData.exhaust[metricType]
                const avgValue = (intakeValue + exhaustValue) / 2
                
                const color = getHeatmapColor(avgValue, metricType)
                const isHovered = hoveredRack === rack.rack_id
                
                return (
                  <div
                    key={rack.rack_id}
                    className={cn(
                      'relative w-14 h-12 rounded-sm transition-all duration-200 cursor-pointer',
                      'flex items-center justify-center text-xs font-medium text-white',
                      'border border-gray-300',
                      isHovered && 'scale-110 z-10 shadow-xl ring-2 ring-gray-800'
                    )}
                    style={{ backgroundColor: color }}
                    onMouseEnter={() => setHoveredRack(rack.rack_id)}
                    onMouseLeave={() => setHoveredRack(null)}
                    onClick={() => onRackClick?.(rack)}
                  >
                    {/* Rack identifier */}
                    <span className="text-[10px] font-bold">
                      {rack.column_label}{rack.row}
                    </span>
                    
                    {/* Hover tooltip */}
                    {isHovered && (
                      <div className={cn(
                        "absolute left-1/2 transform -translate-x-1/2 bg-gray-900 text-white p-3 rounded shadow-lg text-xs whitespace-nowrap z-20",
                        rack.row <= 3 ? "top-full mt-2" : "bottom-full mb-2"
                      )}>
                        <div className="font-semibold mb-2">{rack.rack_id}</div>
                        <div className="space-y-1">
                          <div>位置: {rack.column_label}列 {rack.row}行</div>
                          <div className="border-t border-gray-700 pt-1">
                            <div>吸気側: {formatMetricValue(intakeValue, metricType)}</div>
                            <div>排気側: {formatMetricValue(exhaustValue, metricType)}</div>
                          </div>
                          <div className="border-t border-gray-700 pt-1 font-semibold">
                            平均: {formatMetricValue(avgValue, metricType)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            ))}
          </div>
          
          {/* Row numbers on the right */}
          <div className="grid grid-rows-10 gap-1 ml-1">
            {[...Array(maxRow)].map((_, i) => (
              <div key={i} className="h-12 w-10 flex items-center justify-center text-sm font-medium text-gray-600">
                {i + 1}
              </div>
            ))}
          </div>
        </div>
        
        {/* Column labels at the bottom */}
        <div className="flex mt-2">
          <div className="w-10"></div>
          <div className="grid grid-cols-17 gap-x-3" style={{ gridTemplateColumns: `repeat(${maxCol}, minmax(0, 1fr))` }}>
            {[...Array(maxCol)].map((_, i) => (
              <div key={i} className="w-14 text-center text-sm font-bold text-gray-700">
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <div className="w-10"></div>
        </div>
        
        {/* Legend */}
        <div className="mt-6 flex items-center justify-center space-x-6">
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
    </div>
  )
}