'use client'

import { useState } from 'react'
import { Rack, Sensor, MetricType } from '@/lib/types'
import { getHeatmapColor, formatMetricValue } from '@/lib/utils'
import { determineSensorPositions } from '@/lib/rack-utils'
import { cn } from '@/lib/cn'
import { Wind, ArrowUp, ArrowDown } from 'lucide-react'

interface RackLayoutDualProps {
  racks: Rack[]
  sensors: Sensor[]
  metricType: MetricType
  onRackClick?: (rack: Rack) => void
}

export function RackLayoutDual({ racks, sensors, metricType, onRackClick }: RackLayoutDualProps) {
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
  
  const maxRow = 10
  const maxCol = 17
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border)] p-6 overflow-x-auto">
      <div className="min-w-[1400px]">
        {/* Column labels with corridor indicators */}
        <div className="mb-4">
          {/* Column labels */}
          <div className="flex">
            <div className="w-10"></div>
            <div className="grid grid-cols-17 gap-x-5" style={{ gridTemplateColumns: `repeat(${maxCol}, minmax(0, 1fr))` }}>
              {[...Array(maxCol)].map((_, i) => (
                <div key={i} className="w-14 text-center text-sm font-bold text-gray-700">
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div className="w-10"></div>
          </div>
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
          
          {/* Rack grid with corridor indicators */}
          <div className="relative">
            {/* Corridor indicators */}
            <div className="absolute inset-0 grid grid-cols-33 gap-0 pointer-events-none" style={{ gridTemplateColumns: 'auto 56px auto 56px auto 56px auto 56px auto 56px auto 56px auto 56px auto 56px auto 56px auto 56px auto 56px auto 56px auto 56px auto 56px auto 56px auto 56px auto' }}>
              {/* Left exhaust corridor */}
              <div className="flex flex-col items-center justify-center bg-red-50/50 border-x border-red-200/50" style={{ marginLeft: '-20px', width: '30px' }}>
                <ArrowUp className="h-4 w-4 text-red-500 mb-1" />
                <span className="text-[10px] font-medium text-red-600 rotate-90">排気</span>
                <ArrowUp className="h-4 w-4 text-red-500 mt-1" />
              </div>
              
              {/* A column */}
              <div></div>
              
              {/* A-B intake corridor */}
              <div className="flex flex-col items-center justify-center bg-blue-50/50 border-x border-blue-200/50">
                <ArrowDown className="h-4 w-4 text-blue-500 mb-1" />
                <span className="text-[10px] font-medium text-blue-600 rotate-90">吸気</span>
                <ArrowDown className="h-4 w-4 text-blue-500 mt-1" />
              </div>
              
              {/* B column */}
              <div></div>
              
              {/* B-C exhaust corridor */}
              <div className="flex flex-col items-center justify-center bg-red-50/50 border-x border-red-200/50">
                <ArrowUp className="h-4 w-4 text-red-500 mb-1" />
                <span className="text-[10px] font-medium text-red-600 rotate-90">排気</span>
                <ArrowUp className="h-4 w-4 text-red-500 mt-1" />
              </div>
              
              {/* C column */}
              <div></div>
              
              {/* C-D intake corridor */}
              <div className="flex flex-col items-center justify-center bg-blue-50/50 border-x border-blue-200/50">
                <ArrowDown className="h-4 w-4 text-blue-500 mb-1" />
                <span className="text-[10px] font-medium text-blue-600 rotate-90">吸気</span>
                <ArrowDown className="h-4 w-4 text-blue-500 mt-1" />
              </div>
              
              {/* D column */}
              <div></div>
              
              {/* D-E exhaust corridor */}
              <div className="flex flex-col items-center justify-center bg-red-50/50 border-x border-red-200/50">
                <ArrowUp className="h-4 w-4 text-red-500 mb-1" />
                <span className="text-[10px] font-medium text-red-600 rotate-90">排気</span>
                <ArrowUp className="h-4 w-4 text-red-500 mt-1" />
              </div>
              
              {/* Continue pattern for remaining columns... */}
              {/* E column */}
              <div></div>
              
              {/* E-F intake corridor */}
              <div className="flex flex-col items-center justify-center bg-blue-50/50 border-x border-blue-200/50">
                <ArrowDown className="h-4 w-4 text-blue-500 mb-1" />
                <span className="text-[10px] font-medium text-blue-600 rotate-90">吸気</span>
                <ArrowDown className="h-4 w-4 text-blue-500 mt-1" />
              </div>
              
              {/* F column */}
              <div></div>
              
              {/* F-G exhaust corridor */}
              <div className="flex flex-col items-center justify-center bg-red-50/50 border-x border-red-200/50">
                <ArrowUp className="h-4 w-4 text-red-500 mb-1" />
                <span className="text-[10px] font-medium text-red-600 rotate-90">排気</span>
                <ArrowUp className="h-4 w-4 text-red-500 mt-1" />
              </div>
              
              {/* G column */}
              <div></div>
              
              {/* G-H intake corridor */}
              <div className="flex flex-col items-center justify-center bg-blue-50/50 border-x border-blue-200/50">
                <ArrowDown className="h-4 w-4 text-blue-500 mb-1" />
                <span className="text-[10px] font-medium text-blue-600 rotate-90">吸気</span>
                <ArrowDown className="h-4 w-4 text-blue-500 mt-1" />
              </div>
              
              {/* H column */}
              <div></div>
              
              {/* H-I exhaust corridor */}
              <div className="flex flex-col items-center justify-center bg-red-50/50 border-x border-red-200/50">
                <ArrowUp className="h-4 w-4 text-red-500 mb-1" />
                <span className="text-[10px] font-medium text-red-600 rotate-90">排気</span>
                <ArrowUp className="h-4 w-4 text-red-500 mt-1" />
              </div>
              
              {/* I column */}
              <div></div>
              
              {/* I-J intake corridor */}
              <div className="flex flex-col items-center justify-center bg-blue-50/50 border-x border-blue-200/50">
                <ArrowDown className="h-4 w-4 text-blue-500 mb-1" />
                <span className="text-[10px] font-medium text-blue-600 rotate-90">吸気</span>
                <ArrowDown className="h-4 w-4 text-blue-500 mt-1" />
              </div>
              
              {/* J column */}
              <div></div>
              
              {/* J-K exhaust corridor */}
              <div className="flex flex-col items-center justify-center bg-red-50/50 border-x border-red-200/50">
                <ArrowUp className="h-4 w-4 text-red-500 mb-1" />
                <span className="text-[10px] font-medium text-red-600 rotate-90">排気</span>
                <ArrowUp className="h-4 w-4 text-red-500 mt-1" />
              </div>
              
              {/* K column */}
              <div></div>
              
              {/* K-L intake corridor */}
              <div className="flex flex-col items-center justify-center bg-blue-50/50 border-x border-blue-200/50">
                <ArrowDown className="h-4 w-4 text-blue-500 mb-1" />
                <span className="text-[10px] font-medium text-blue-600 rotate-90">吸気</span>
                <ArrowDown className="h-4 w-4 text-blue-500 mt-1" />
              </div>
              
              {/* L column */}
              <div></div>
              
              {/* L-M exhaust corridor */}
              <div className="flex flex-col items-center justify-center bg-red-50/50 border-x border-red-200/50">
                <ArrowUp className="h-4 w-4 text-red-500 mb-1" />
                <span className="text-[10px] font-medium text-red-600 rotate-90">排気</span>
                <ArrowUp className="h-4 w-4 text-red-500 mt-1" />
              </div>
              
              {/* M column */}
              <div></div>
              
              {/* M-N intake corridor */}
              <div className="flex flex-col items-center justify-center bg-blue-50/50 border-x border-blue-200/50">
                <ArrowDown className="h-4 w-4 text-blue-500 mb-1" />
                <span className="text-[10px] font-medium text-blue-600 rotate-90">吸気</span>
                <ArrowDown className="h-4 w-4 text-blue-500 mt-1" />
              </div>
              
              {/* N column */}
              <div></div>
              
              {/* N-O exhaust corridor */}
              <div className="flex flex-col items-center justify-center bg-red-50/50 border-x border-red-200/50">
                <ArrowUp className="h-4 w-4 text-red-500 mb-1" />
                <span className="text-[10px] font-medium text-red-600 rotate-90">排気</span>
                <ArrowUp className="h-4 w-4 text-red-500 mt-1" />
              </div>
              
              {/* O column */}
              <div></div>
              
              {/* O-P intake corridor */}
              <div className="flex flex-col items-center justify-center bg-blue-50/50 border-x border-blue-200/50">
                <ArrowDown className="h-4 w-4 text-blue-500 mb-1" />
                <span className="text-[10px] font-medium text-blue-600 rotate-90">吸気</span>
                <ArrowDown className="h-4 w-4 text-blue-500 mt-1" />
              </div>
              
              {/* P column */}
              <div></div>
              
              {/* P-Q exhaust corridor */}
              <div className="flex flex-col items-center justify-center bg-red-50/50 border-x border-red-200/50">
                <ArrowUp className="h-4 w-4 text-red-500 mb-1" />
                <span className="text-[10px] font-medium text-red-600 rotate-90">排気</span>
                <ArrowUp className="h-4 w-4 text-red-500 mt-1" />
              </div>
              
              {/* Q column */}
              <div></div>
              
              {/* Right intake corridor */}
              <div className="flex flex-col items-center justify-center bg-blue-50/50 border-x border-blue-200/50" style={{ marginRight: '-20px', width: '30px' }}>
                <ArrowDown className="h-4 w-4 text-blue-500 mb-1" />
                <span className="text-[10px] font-medium text-blue-600 rotate-90">吸気</span>
                <ArrowDown className="h-4 w-4 text-blue-500 mt-1" />
              </div>
            </div>
            
            {/* Rack grid */}
            <div className="grid grid-cols-17 gap-x-5 gap-y-1 relative z-10" style={{ gridTemplateColumns: `repeat(${maxCol}, minmax(0, 1fr))` }}>
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
                  
                  const intakeColor = getHeatmapColor(intakeValue, metricType)
                  const exhaustColor = getHeatmapColor(exhaustValue, metricType)
                  
                  const isHovered = hoveredRack === rack.rack_id
                  const positions = determineSensorPositions(rack)
                  
                  return (
                    <div
                      key={rack.rack_id}
                      className={cn(
                        'relative w-14 h-12 rounded-sm transition-all duration-200 cursor-pointer',
                        'flex border border-gray-300 overflow-hidden',
                        isHovered && 'scale-110 z-10 shadow-xl ring-2 ring-gray-800'
                      )}
                      onMouseEnter={() => setHoveredRack(rack.rack_id)}
                      onMouseLeave={() => setHoveredRack(null)}
                      onClick={() => onRackClick?.(rack)}
                    >
                      {/* Split display for intake and exhaust */}
                      <div 
                        className="w-1/2 h-full flex items-center justify-center"
                        style={{ 
                          backgroundColor: positions.intake === 'left' ? intakeColor : exhaustColor,
                          borderRight: '1px solid rgba(0,0,0,0.2)'
                        }}
                      >
                      </div>
                      <div 
                        className="w-1/2 h-full flex items-center justify-center"
                        style={{ 
                          backgroundColor: positions.intake === 'right' ? intakeColor : exhaustColor 
                        }}
                      >
                      </div>
                      
                      {/* Rack identifier */}
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white pointer-events-none">
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
                              温度差: {Math.abs(exhaustValue - intakeValue).toFixed(1)}°C
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              ))}
            </div>
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
          <div className="grid grid-cols-17 gap-x-5" style={{ gridTemplateColumns: `repeat(${maxCol}, minmax(0, 1fr))` }}>
            {[...Array(maxCol)].map((_, i) => (
              <div key={i} className="w-14 text-center text-sm font-bold text-gray-700">
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <div className="w-10"></div>
        </div>
        
        {/* Legend */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-center space-x-6">
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
          
          {/* 通路説明 */}
          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 text-blue-600">
                <ArrowDown className="h-4 w-4" />
                <span className="font-medium">吸気側通路</span>
              </div>
              <span className="text-gray-500">床下から冷気が流入する通路</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 text-red-600">
                <ArrowUp className="h-4 w-4" />
                <span className="font-medium">排気側通路</span>
              </div>
              <span className="text-gray-500">暖気が天井へ排出される通路</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}