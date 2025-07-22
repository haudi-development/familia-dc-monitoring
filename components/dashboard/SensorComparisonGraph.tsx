'use client'

import { useState, useMemo } from 'react'
import { Plus, X, TrendingUp, Calendar, Table } from 'lucide-react'
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

type TimeRange = '1hour' | '6hours' | '24hours' | '7days' | '30days'

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
  const [timeRange, setTimeRange] = useState<TimeRange>('24hours')
  const [showDataTable, setShowDataTable] = useState(false)

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

  // Get time configuration based on selected range
  const getTimeConfig = () => {
    switch (timeRange) {
      case '1hour':
        return { points: 60, interval: 60 * 1000, format: (time: Date) => time.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) }
      case '6hours':
        return { points: 72, interval: 5 * 60 * 1000, format: (time: Date) => time.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) }
      case '24hours':
        return { points: 96, interval: 15 * 60 * 1000, format: (time: Date) => time.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) }
      case '7days':
        return { points: 168, interval: 60 * 60 * 1000, format: (time: Date) => 
          `${(time.getMonth() + 1)}/${time.getDate()} ${time.getHours()}:00` }
      case '30days':
        return { points: 180, interval: 4 * 60 * 60 * 1000, format: (time: Date) => 
          `${(time.getMonth() + 1)}/${time.getDate()}` }
    }
  }

  // Generate historical data for comparison
  const comparisonData = useMemo(() => {
    const data = []
    const now = new Date()
    const config = getTimeConfig()
    
    for (let i = config.points - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * config.interval)
      const hour = time.getHours()
      const day = time.getDay()
      
      const dataPoint: Record<string, string | number> = {
        time: config.format(time),
      }
      
      selectedSensors.forEach(sensor => {
        const baseValue = sensor[metricType]
        let variation = 0
        
        if (metricType === 'temperature') {
          // Daily pattern + weekly pattern
          variation = Math.sin((hour - 6) * Math.PI / 12) * 2 + 
                     Math.sin(day * Math.PI / 3.5) * 0.5 +
                     (Math.random() - 0.5) * 0.5
        } else if (metricType === 'humidity') {
          variation = Math.sin(hour * Math.PI / 12) * 3 + (Math.random() - 0.5) * 2
        } else {
          variation = Math.sin((hour - 9) * Math.PI / 12) * 15 + (Math.random() - 0.5) * 5
        }
        
        dataPoint[sensor.sensor_id] = Math.max(0, baseValue + variation)
      })
      
      data.push(dataPoint)
    }
    
    return data
  }, [selectedSensors, metricType, timeRange])

  const addSensor = (sensorId: string) => {
    if (!selectedSensorIds.includes(sensorId) && selectedSensorIds.length < 10) {
      setSelectedSensorIds([...selectedSensorIds, sensorId])
    }
  }

  const removeSensor = (sensorId: string) => {
    setSelectedSensorIds(selectedSensorIds.filter(id => id !== sensorId))
  }

  const addColumnSensors = (position: 'intake' | 'exhaust') => {
    if (selectedColumn === 'all') return
    
    const columnSensors = availableSensors
      .filter(sensor => {
        const rackColumn = sensor.rack_id.split('-')[2]?.charAt(0)
        return rackColumn === selectedColumn && sensor.position === position
      })
      .slice(0, 10 - selectedSensorIds.length)
    
    const newIds = columnSensors
      .map(s => s.sensor_id)
      .filter(id => !selectedSensorIds.includes(id))
    
    if (newIds.length > 0) {
      setSelectedSensorIds([...selectedSensorIds, ...newIds])
    }
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                期間
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="1hour">過去1時間</option>
                <option value="6hours">過去6時間</option>
                <option value="24hours">過去24時間</option>
                <option value="7days">過去7日間</option>
                <option value="30days">過去30日間</option>
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
                <>
                  <button
                    onClick={() => addColumnSensors('intake')}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    disabled={selectedSensorIds.length >= 10}
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>{selectedColumn}列の吸気側を一括追加</span>
                  </button>
                  <button
                    onClick={() => addColumnSensors('exhaust')}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    disabled={selectedSensorIds.length >= 10}
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>{selectedColumn}列の排気側を一括追加</span>
                  </button>
                </>
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {metricType === 'temperature' ? '温度' : metricType === 'humidity' ? '湿度' : '風量'}推移
                （{timeRange === '1hour' ? '過去1時間' : 
                  timeRange === '6hours' ? '過去6時間' :
                  timeRange === '24hours' ? '過去24時間' :
                  timeRange === '7days' ? '過去7日間' : '過去30日間'}）
              </h3>
              <button
                onClick={() => setShowDataTable(!showDataTable)}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Table className="h-4 w-4" />
                <span>{showDataTable ? 'グラフ表示' : 'データ表示'}</span>
              </button>
            </div>
            
            {!showDataTable ? (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={comparisonData} margin={{ top: 5, right: 30, left: 20, bottom: timeRange === '7days' || timeRange === '30days' ? 80 : 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#666" 
                      interval={timeRange === '30days' ? 4 : timeRange === '7days' ? 12 : timeRange === '24hours' ? 4 : 'preserveStartEnd'}
                      angle={timeRange === '7days' || timeRange === '30days' ? -45 : 0}
                      textAnchor={timeRange === '7days' || timeRange === '30days' ? 'end' : 'middle'}
                      height={timeRange === '7days' || timeRange === '30days' ? 60 : 30}
                    />
                    <YAxis 
                      stroke="#666" 
                      domain={[
                        (dataMin: number) => Math.floor(dataMin - 1),
                        (dataMax: number) => Math.ceil(dataMax + 1)
                      ]}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        padding: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value: number, name: string) => {
                        const sensor = selectedSensors.find(s => s.sensor_id === name)
                        return [
                          `${value.toFixed(1)}${getMetricUnit()}`,
                          sensor ? `${sensor.rack_id} (${sensor.position === 'intake' ? '吸気' : '排気'})` : name
                        ]
                      }}
                      labelFormatter={(label) => `時刻: ${label}`}
                      labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
                    />
                    <Legend 
                      formatter={(value) => {
                        const sensor = selectedSensors.find(s => s.sensor_id === value)
                        return sensor ? `${sensor.rack_id} (${sensor.position === 'intake' ? '吸気' : '排気'})` : value
                      }}
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                    {selectedSensors.map((sensor, index) => (
                      <Line 
                        key={sensor.sensor_id}
                        type="monotone" 
                        dataKey={sensor.sensor_id}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={2}
                        dot={timeRange === '1hour' || timeRange === '6hours'}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-medium text-gray-700">時刻</th>
                      {selectedSensors.map((sensor, index) => (
                        <th 
                          key={sensor.sensor_id} 
                          className="text-right py-2 px-2 font-medium"
                          style={{ color: COLORS[index % COLORS.length] }}
                        >
                          {sensor.rack_id}<br/>
                          <span className="text-xs font-normal">
                            ({sensor.position === 'intake' ? '吸気' : '排気'})
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.slice(-24).reverse().map((data, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2">{data.time}</td>
                        {selectedSensors.map((sensor) => (
                          <td key={sensor.sensor_id} className="text-right py-2 px-2">
                            {typeof data[sensor.sensor_id] === 'number' 
                              ? `${(data[sensor.sensor_id] as number).toFixed(1)}${getMetricUnit()}`
                              : '-'
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}