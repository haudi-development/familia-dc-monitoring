'use client'

import { useState, useMemo } from 'react'
import { Plus, X, TrendingUp } from 'lucide-react'
import { Sensor, MetricType } from '@/lib/types'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'

interface SensorComparisonGraphProps {
  sensors: Sensor[]
  selectedDC: string
  selectedRoom: string
  selectedColumn: string
  selectedPosition: string
}

const COLORS = [
  '#50A69F', '#2196F3', '#FF9800', '#4CAF50', '#9C27B0', 
  '#F44336', '#00BCD4', '#FFC107', '#795548', '#607D8B'
]

export function SensorComparisonGraph({ 
  sensors, 
  selectedDC, 
  selectedRoom, 
  selectedColumn, 
  selectedPosition 
}: SensorComparisonGraphProps) {
  const [selectedSensorIds, setSelectedSensorIds] = useState<string[]>([])
  const [metricType, setMetricType] = useState<MetricType>('temperature')
  const [showSensorSelector, setShowSensorSelector] = useState(false)

  // Filter available sensors based on current filters
  const availableSensors = useMemo(() => {
    return sensors.filter(sensor => {
      if (selectedDC !== 'all' && sensor.dc_id !== selectedDC) return false
      if (selectedRoom !== 'all' && sensor.room_id !== selectedRoom) return false
      if (selectedColumn !== 'all') {
        const rackColumn = sensor.rack_id.split('-')[2]?.charAt(0)
        if (rackColumn !== selectedColumn) return false
      }
      if (selectedPosition !== 'all' && sensor.position !== selectedPosition) return false
      return true
    })
  }, [sensors, selectedDC, selectedRoom, selectedColumn, selectedPosition])

  // Get selected sensors
  const selectedSensors = useMemo(() => {
    return sensors.filter(sensor => selectedSensorIds.includes(sensor.sensor_id))
  }, [sensors, selectedSensorIds])

  // Generate historical data for comparison
  const comparisonData = useMemo(() => {
    const data = []
    const now = new Date()
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000)
      const hour = time.getHours()
      
      const dataPoint: any = {
        time: `${hour.toString().padStart(2, '0')}:00`,
      }
      
      selectedSensors.forEach(sensor => {
        const baseValue = sensor[metricType]
        let variation = 0
        
        if (metricType === 'temperature') {
          variation = Math.sin((hour - 6) * Math.PI / 12) * 2 + (Math.random() - 0.5) * 0.5
        } else if (metricType === 'humidity') {
          variation = (Math.random() - 0.5) * 5
        } else {
          variation = (Math.random() - 0.5) * 10
        }
        
        dataPoint[sensor.sensor_id] = baseValue + variation
      })
      
      data.push(dataPoint)
    }
    
    return data
  }, [selectedSensors, metricType])

  const addSensor = (sensorId: string) => {
    if (!selectedSensorIds.includes(sensorId) && selectedSensorIds.length < 10) {
      setSelectedSensorIds([...selectedSensorIds, sensorId])
    }
  }

  const removeSensor = (sensorId: string) => {
    setSelectedSensorIds(selectedSensorIds.filter(id => id !== sensorId))
  }

  const addColumnExhaustSensors = () => {
    if (selectedColumn === 'all') return
    
    const columnExhaustSensors = availableSensors
      .filter(sensor => {
        const rackColumn = sensor.rack_id.split('-')[2]?.charAt(0)
        return rackColumn === selectedColumn && sensor.position === 'exhaust'
      })
      .slice(0, 10 - selectedSensorIds.length)
    
    const newIds = columnExhaustSensors
      .map(s => s.sensor_id)
      .filter(id => !selectedSensorIds.includes(id))
    
    setSelectedSensorIds([...selectedSensorIds, ...newIds])
  }

  const getMetricUnit = () => {
    switch (metricType) {
      case 'temperature': return '°C'
      case 'humidity': return '%'
      case 'airflow': return 'CFM'
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border)] p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                表示項目
              </label>
              <select
                value={metricType}
                onChange={(e) => setMetricType(e.target.value as MetricType)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="temperature">温度</option>
                <option value="humidity">湿度</option>
                <option value="airflow">風量</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSensorSelector(!showSensorSelector)}
                className="flex items-center space-x-2 px-4 py-2 border border-[var(--color-primary)] text-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary)] hover:text-white transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>センサー追加</span>
              </button>
              {selectedColumn !== 'all' && (
                <button
                  onClick={addColumnExhaustSensors}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>{selectedColumn}列の排気側を一括追加</span>
                </button>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {selectedSensorIds.length}/10 センサー選択中
          </div>
        </div>

        {/* Selected sensors */}
        {selectedSensorIds.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedSensors.map((sensor, index) => (
              <div
                key={sensor.sensor_id}
                className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm"
                style={{ backgroundColor: `${COLORS[index % COLORS.length]}20`, color: COLORS[index % COLORS.length] }}
              >
                <span>{sensor.rack_id} ({sensor.position === 'intake' ? '吸気' : '排気'})</span>
                <button
                  onClick={() => removeSensor(sensor.sensor_id)}
                  className="hover:opacity-70"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sensor selector */}
      {showSensorSelector && (
        <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border)] p-4">
          <h3 className="font-semibold mb-3">センサー選択</h3>
          <div className="max-h-60 overflow-y-auto">
            <div className="grid grid-cols-3 gap-2">
              {availableSensors.map(sensor => (
                <button
                  key={sensor.sensor_id}
                  onClick={() => addSensor(sensor.sensor_id)}
                  disabled={selectedSensorIds.includes(sensor.sensor_id)}
                  className={`text-left px-3 py-2 rounded border text-sm transition-colors ${
                    selectedSensorIds.includes(sensor.sensor_id)
                      ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                      : 'border-gray-300 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] hover:bg-opacity-10'
                  }`}
                >
                  <div className="font-medium">{sensor.rack_id}</div>
                  <div className="text-xs text-gray-600">
                    {sensor.position === 'intake' ? '吸気側' : '排気側'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Graph */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border)] p-6">
        {selectedSensorIds.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>比較するセンサーを選択してください</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-4">
              {metricType === 'temperature' ? '温度' : metricType === 'humidity' ? '湿度' : '風量'}推移（過去24時間）
            </h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={comparisonData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0' }}
                    formatter={(value: number) => `${value.toFixed(1)}${getMetricUnit()}`}
                    labelFormatter={(label) => `時刻: ${label}`}
                  />
                  <Legend 
                    formatter={(value) => {
                      const sensor = selectedSensors.find(s => s.sensor_id === value)
                      return sensor ? `${sensor.rack_id} (${sensor.position === 'intake' ? '吸気' : '排気'})` : value
                    }}
                  />
                  {selectedSensors.map((sensor, index) => (
                    <Line 
                      key={sensor.sensor_id}
                      type="monotone" 
                      dataKey={sensor.sensor_id}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  )
}