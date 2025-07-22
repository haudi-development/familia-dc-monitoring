'use client'

import { X } from 'lucide-react'
import { Sensor } from '@/lib/types'
import { formatMetricValue } from '@/lib/utils'
import { DATA_CENTERS, ROOMS } from '@/lib/constants'
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'
import { useMemo } from 'react'

interface SensorDetailModalProps {
  sensor: Sensor
  isOpen: boolean
  onClose: () => void
}

export function SensorDetailModal({ sensor, isOpen, onClose }: SensorDetailModalProps) {
  if (!isOpen) return null

  // Generate historical data for the last 24 hours
  const historicalData = useMemo(() => {
    const data = []
    const now = new Date()
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000)
      const hour = time.getHours()
      
      // Simulate temperature variation throughout the day
      const baseTemp = sensor.temperature
      const tempVariation = Math.sin((hour - 6) * Math.PI / 12) * 2
      const randomVariation = (Math.random() - 0.5) * 0.5
      
      data.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        temperature: baseTemp + tempVariation + randomVariation,
        humidity: sensor.humidity + (Math.random() - 0.5) * 5,
        airflow: sensor.airflow + (Math.random() - 0.5) * 10,
      })
    }
    
    return data
  }, [sensor])

  const dc = DATA_CENTERS[sensor.dc_id]
  const room = ROOMS[sensor.room_id]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-20" onClick={onClose}></div>
        </div>

        <div className="inline-block w-full max-w-4xl p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">センサー詳細: {sensor.sensor_id}</h2>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p>ラック: {sensor.rack_id}</p>
              <p>データセンター: {dc?.name}</p>
              <p>ルーム: {room?.name}</p>
              <p>位置: {sensor.position === 'intake' ? '吸気側' : '排気側'}</p>
            </div>
          </div>

          {/* Current values */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">現在の温度</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatMetricValue(sensor.temperature, 'temperature')}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">現在の湿度</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatMetricValue(sensor.humidity, 'humidity')}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">現在の風量</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatMetricValue(sensor.airflow, 'airflow')}
              </div>
            </div>
          </div>

          {/* Temperature chart */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">温度推移（過去24時間）</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#50A69F" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#50A69F" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0' }}
                    formatter={(value: number) => `${value.toFixed(1)}°C`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#50A69F" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#temperatureGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Humidity and Airflow chart */}
          <div>
            <h3 className="text-lg font-semibold mb-3">湿度・風量推移（過去24時間）</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" stroke="#666" />
                  <YAxis yAxisId="left" stroke="#666" />
                  <YAxis yAxisId="right" orientation="right" stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0' }}
                    formatter={(value: number, name: string) => {
                      if (name === 'humidity') return `${value.toFixed(1)}%`
                      return `${value.toFixed(0)} CFM`
                    }}
                    labelFormatter={(label) => `時刻: ${label}`}
                  />
                  <Legend 
                    formatter={(value) => value === 'humidity' ? '湿度 (%)' : '風量 (CFM)'}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="humidity" 
                    stroke="#2196F3" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="airflow" 
                    stroke="#FF9800" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}