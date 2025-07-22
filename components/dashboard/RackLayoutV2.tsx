'use client'

import { useState } from 'react'
import { Rack, Sensor, MetricType } from '@/lib/types'
import { getHeatmapColor, formatMetricValue } from '@/lib/utils'
import { cn } from '@/lib/cn'
import { Router, Zap } from 'lucide-react'

interface RackLayoutV2Props {
  racks: Rack[]
  sensors: Sensor[]
  metricType: MetricType
  onRackClick?: (rack: Rack) => void
}

export function RackLayoutV2({ racks, sensors, metricType, onRackClick }: RackLayoutV2Props) {
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
  
  // Group racks by their group (every 3 columns)
  const rackGroups: { [key: string]: Rack[] } = {}
  const groupLabels = ['A-C', 'D-F', 'G-I', 'J-L', 'M-O', 'P']
  
  racks.forEach(rack => {
    const groupIndex = Math.floor((rack.col - 1) / 3)
    const groupKey = groupLabels[Math.min(groupIndex, groupLabels.length - 1)]
    if (!rackGroups[groupKey]) {
      rackGroups[groupKey] = []
    }
    rackGroups[groupKey].push(rack)
  })
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border)] p-6 overflow-x-auto">
      <div className="min-w-[1200px]">
        {/* Header with temperature/humidity indicators */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">ゲートウェイ：各通路に1台設置。1台で合計20台（吸気側と排気側各10台ずつ）のセンサーからのデータを収集。PoE給電。</span>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            ※関東（A列とG列）のセンサーは片側の通路分のセンサー（10台）にしか対応しない。
          </div>
        </div>
        
        {/* Main rack layout */}
        <div className="relative">
          {/* Group labels at the top */}
          <div className="flex mb-2">
            {groupLabels.map((label, index) => (
              <div 
                key={label} 
                className="flex-1 text-center text-sm font-medium text-[var(--color-primary)]"
                style={{ 
                  marginLeft: index === 0 ? '50px' : '0',
                  width: label === 'P' ? '100px' : '150px' 
                }}
              >
                {label === 'P' ? '16℃-17℃' : `${13 + index * 3}℃`}
                <div className="text-xs text-gray-500">排気側</div>
                <div className="text-xs font-bold">{label}</div>
              </div>
            ))}
          </div>
          
          {/* Rack grid */}
          <div className="flex">
            {/* Row numbers on the left */}
            <div className="flex flex-col mr-2">
              <div className="h-6"></div>
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  className="h-[40px] flex items-center justify-center text-xs text-gray-500 font-medium"
                >
                  {i + 1}
                </div>
              ))}
            </div>
            
            {/* Rack groups */}
            <div className="flex gap-4">
              {groupLabels.map((groupLabel) => {
                const groupRacks = rackGroups[groupLabel] || []
                const maxRow = Math.max(...groupRacks.map(r => r.row), 10)
                const groupCols = [...new Set(groupRacks.map(r => r.col))].sort((a, b) => a - b)
                
                return (
                  <div key={groupLabel} className="relative">
                    {/* Temperature sensor indicators */}
                    <div className="absolute -top-6 left-0 right-0 flex justify-around">
                      {groupCols.map(col => (
                        <div key={col} className="text-xs text-red-500">●</div>
                      ))}
                    </div>
                    
                    <div 
                      className="grid gap-1" 
                      style={{ 
                        gridTemplateColumns: `repeat(${groupCols.length}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${maxRow}, minmax(0, 1fr))`
                      }}
                    >
                      {[...Array(maxRow)].map((_, row) => (
                        groupCols.map(col => {
                          const rack = groupRacks.find(r => r.row === row + 1 && r.col === col)
                          if (!rack) {
                            return <div key={`${row}-${col}`} className="w-[40px] h-[40px]"></div>
                          }
                          
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
                                'relative w-[40px] h-[40px] rounded transition-all duration-300 cursor-pointer',
                                'flex items-center justify-center text-[10px] font-medium border',
                                isHovered && 'scale-110 z-10 shadow-lg',
                                rack.rack_type === 'poe_hub' && 'ring-2 ring-blue-500'
                              )}
                              style={{ 
                                backgroundColor: color,
                                borderColor: rack.rack_type === 'poe_hub' ? '#3B82F6' : 'rgba(0,0,0,0.1)'
                              }}
                              onMouseEnter={() => setHoveredRack(rack.rack_id)}
                              onMouseLeave={() => setHoveredRack(null)}
                              onClick={() => onRackClick?.(rack)}
                            >
                              {/* Special rack indicators */}
                              {rack.rack_type === 'router' && (
                                <Router className="w-4 h-4 text-white absolute top-0.5 right-0.5" />
                              )}
                              {rack.rack_type === 'poe_hub' && (
                                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-[8px] px-1 rounded">
                                  PoE
                                </div>
                              )}
                              
                              {/* Rack number */}
                              <span className="text-white">{rackNumber(rack.rack_id)}</span>
                              
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
                        })
                      ))}
                    </div>
                    
                    {/* PoE Hub indicators */}
                    {groupRacks.some(r => r.rack_type === 'poe_hub') && (
                      <div className="absolute -bottom-8 left-0 right-0 flex justify-center">
                        <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                          <Zap className="w-3 h-3" />
                          <span>PoE Hub</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              
              {/* Router on the right */}
              <div className="ml-4 flex flex-col items-center justify-center">
                <div className="bg-gray-700 text-white p-4 rounded-lg">
                  <Router className="w-8 h-8" />
                  <div className="text-xs mt-1">ルーター</div>
                </div>
              </div>
            </div>
            
            {/* Row numbers on the right */}
            <div className="flex flex-col ml-2">
              <div className="h-6"></div>
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  className="h-[40px] flex items-center justify-center text-xs text-gray-500 font-medium"
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
          
          {/* Bottom indicators */}
          <div className="flex justify-center mt-4 space-x-8">
            <div className="text-center">
              <div className="bg-gray-200 text-gray-700 px-4 py-1 rounded text-sm">通路EPS</div>
            </div>
            <div className="text-center">
              <div className="bg-gray-200 text-gray-700 px-4 py-1 rounded text-sm">EPS</div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-8 flex items-center justify-center space-x-8">
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
        
        {/* Additional info */}
        <div className="mt-6 space-y-2 text-sm">
          <div className="flex items-start space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded mt-0.5"></div>
            <p className="text-gray-600">
              温湿度センサー：各ラックの吸気側と排気側にそれぞれ一台ずつ設置する。電池駆動により給電不要。
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-12 h-4 bg-blue-500 rounded mt-0.5 flex items-center justify-center text-white text-xs">
              PoE Hub
            </div>
            <p className="text-gray-600">
              PoE Hub、LANケーブル：各通路にPoEのEthernetケーブルを配線
              <br />
              ※給電数ですが、貴社にてご手配いただきますようお願いいたします。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function rackNumber(rackId: string): string {
  return rackId.replace('RACK-', '')
}