'use client'

import { X } from 'lucide-react'
import { Rack, Sensor } from '@/lib/types'
import { formatMetricValue } from '@/lib/utils'
import { useEffect } from 'react'

interface RackDetailModalProps {
  rack: Rack
  intakeSensor: Sensor
  exhaustSensor: Sensor
  isOpen: boolean
  onClose: () => void
}

export function RackDetailModal({ rack, intakeSensor, exhaustSensor, isOpen, onClose }: RackDetailModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6 transform transition-all">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold text-gray-900 mb-4">{rack.rack_id}</h2>
        
        <div className="space-y-6">
          {/* Intake sensor data */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">吸気側センサー</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded">
                <div className="text-xs text-gray-500 mb-1">温度</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatMetricValue(intakeSensor.temperature, 'temperature')}
                </div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded">
                <div className="text-xs text-gray-500 mb-1">湿度</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatMetricValue(intakeSensor.humidity, 'humidity')}
                </div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded">
                <div className="text-xs text-gray-500 mb-1">風量</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatMetricValue(intakeSensor.airflow, 'airflow')}
                </div>
              </div>
            </div>
          </div>
          
          {/* Exhaust sensor data */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">排気側センサー</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-red-50 rounded">
                <div className="text-xs text-gray-500 mb-1">温度</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatMetricValue(exhaustSensor.temperature, 'temperature')}
                </div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded">
                <div className="text-xs text-gray-500 mb-1">湿度</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatMetricValue(exhaustSensor.humidity, 'humidity')}
                </div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded">
                <div className="text-xs text-gray-500 mb-1">風量</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatMetricValue(exhaustSensor.airflow, 'airflow')}
                </div>
              </div>
            </div>
          </div>
          
          {/* Rack info */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">位置:</span>
                <span className="ml-2 font-medium">Row {rack.row}, Col {rack.col}</span>
              </div>
              <div>
                <span className="text-gray-500">タイプ:</span>
                <span className="ml-2 font-medium">
                  {rack.rack_type === 'router' ? 'ルーター' : 
                   rack.rack_type === 'poe_hub' ? 'PoE Hub' : '通常'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}