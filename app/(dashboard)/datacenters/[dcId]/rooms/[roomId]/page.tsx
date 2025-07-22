'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Filter, Search, Thermometer, Droplets, Wind, AlertCircle, Server, Database } from 'lucide-react'
import { MetricCards } from '@/components/dashboard/MetricCards'
import { RackLayoutSimple } from '@/components/dashboard/RackLayoutSimple'
import { RackLayoutDual } from '@/components/dashboard/RackLayoutDual'
import { HeatmapView } from '@/components/dashboard/HeatmapView'
import { RackDetailModal } from '@/components/dashboard/RackDetailModal'
import { generateRackLayoutForRoom, generateDummySensorDataForRoom, updateSensorData } from '@/lib/dummy-data'
import { Rack, Sensor, MetricType, MetricCard } from '@/lib/types'
import { DATA_CENTERS, ROOMS } from '@/lib/constants'
import { formatMetricValue } from '@/lib/utils'

type ViewType = 'heatmap' | 'list'

export default function RoomDetailPage() {
  const params = useParams()
  const dcId = params.dcId as string
  const roomId = params.roomId as string
  
  const dataCenter = DATA_CENTERS[dcId]
  const room = ROOMS[roomId]
  
  const [racks, setRacks] = useState<Rack[]>([])
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('temperature')
  const [selectedRack, setSelectedRack] = useState<Rack | null>(null)
  const [selectedSensors, setSelectedSensors] = useState<{ intake: Sensor | null; exhaust: Sensor | null }>({
    intake: null,
    exhaust: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [viewType, setViewType] = useState<ViewType>('heatmap')
  const [selectedColumn, setSelectedColumn] = useState<string>('all')
  const [selectedPosition, setSelectedPosition] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Initialize data on client side only
  useEffect(() => {
    if (room && dataCenter) {
      setRacks(generateRackLayoutForRoom(roomId, dcId))
      setSensors(generateDummySensorDataForRoom(roomId, dcId))
      setIsLoading(false)
    }
  }, [roomId, dcId, room, dataCenter])
  
  // Update sensor data every 60 seconds
  useEffect(() => {
    if (!isLoading && sensors.length > 0) {
      const interval = setInterval(() => {
        setSensors(currentSensors => updateSensorData(currentSensors))
      }, 60000)
      
      return () => clearInterval(interval)
    }
  }, [isLoading, sensors.length])
  
  // Calculate metrics
  const calculateMetrics = (): MetricCard[] => {
    const temps = sensors.map(s => s.temperature)
    const humidities = sensors.map(s => s.humidity)
    const airflows = sensors.map(s => s.airflow)
    
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length
    const avgHumidity = humidities.reduce((a, b) => a + b, 0) / humidities.length
    const avgAirflow = airflows.reduce((a, b) => a + b, 0) / airflows.length
    
    // Count alerts (simple threshold-based)
    const alerts = sensors.filter(s => 
      s.temperature > 30 || s.humidity > 65 || s.airflow < 90
    ).length
    
    return [
      {
        title: '平均温度',
        value: avgTemp.toFixed(1),
        unit: '°C',
        trend: 'stable',
      },
      {
        title: '平均湿度',
        value: avgHumidity.toFixed(1),
        unit: '%',
        trend: 'stable',
      },
      {
        title: '平均風量',
        value: avgAirflow.toFixed(0),
        unit: 'CFM',
        trend: 'stable',
      },
      {
        title: 'アクティブアラート',
        value: alerts,
        unit: '件',
        trend: alerts > 0 ? 'up' : 'stable',
      },
    ]
  }
  
  const handleRackClick = (rack: Rack) => {
    setSelectedRack(rack)
    const intakeSensor = sensors.find(s => s.rack_id === rack.rack_id && s.position === 'intake')
    const exhaustSensor = sensors.find(s => s.rack_id === rack.rack_id && s.position === 'exhaust')
    setSelectedSensors({ intake: intakeSensor || null, exhaust: exhaustSensor || null })
  }
  
  // Filter sensors
  const filteredSensors = sensors.filter(sensor => {
    if (selectedColumn !== 'all') {
      const rackColumn = sensor.rack_id.split('-')[2]?.charAt(0)
      if (rackColumn !== selectedColumn) return false
    }
    
    if (selectedPosition !== 'all' && sensor.position !== selectedPosition) return false
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        sensor.sensor_id.toLowerCase().includes(query) ||
        sensor.rack_id.toLowerCase().includes(query)
      )
    }
    
    return true
  })
  
  if (!dataCenter || !room) {
    return <div>ルームが見つかりません</div>
  }
  
  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
          <p className="mt-4 text-gray-600">データを読み込んでいます...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <Link 
          href={`/datacenters/${dcId}/rooms`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {dataCenter.name}のルーム一覧に戻る
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {dataCenter.name} - {room.name}
        </h1>
        <p className="text-gray-600 mt-1">リアルタイムセンサーデータの監視</p>
      </div>
      
      {/* Metric cards */}
      <MetricCards metrics={calculateMetrics()} />
      
      {/* View tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setViewType('heatmap')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              viewType === 'heatmap'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Thermometer className="h-4 w-4" />
              <span>ヒートマップ</span>
            </div>
          </button>
          <button
            onClick={() => setViewType('list')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              viewType === 'list'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>センサーリスト</span>
            </div>
          </button>
        </nav>
      </div>
      
      {viewType === 'heatmap' ? (
        <>
          {/* Heatmap controls */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">ラック配置図（17列 × 10行）</h2>
            <HeatmapView selectedMetric={selectedMetric} onMetricChange={setSelectedMetric} />
          </div>
          
          {/* Rack layout heatmap */}
          <RackLayoutDual 
            racks={racks} 
            sensors={sensors} 
            metricType={selectedMetric}
            onRackClick={handleRackClick}
          />
        </>
      ) : (
        /* Sensor list view */
        <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border)]">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">センサーリスト</h2>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  列
                </label>
                <select
                  value={selectedColumn}
                  onChange={(e) => setSelectedColumn(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="all">すべて</option>
                  {[...Array(17)].map((_, i) => (
                    <option key={i} value={String.fromCharCode(65 + i)}>
                      {String.fromCharCode(65 + i)}列
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  位置
                </label>
                <select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="all">すべて</option>
                  <option value="intake">吸気側</option>
                  <option value="exhaust">排気側</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  検索
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="センサーID、ラックID"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              {filteredSensors.length}件のセンサーが見つかりました
            </div>
          </div>
          
          {/* Sensor table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    センサーID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ラックID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    位置
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    温度
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    湿度
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    風量
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状態
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSensors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      センサーが見つかりません
                    </td>
                  </tr>
                ) : (
                  filteredSensors.map((sensor) => {
                    const hasAlert = sensor.temperature > 30 || sensor.humidity > 65 || sensor.airflow < 90
                    
                    return (
                      <tr key={sensor.sensor_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {sensor.sensor_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sensor.rack_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            sensor.position === 'intake' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {sensor.position === 'intake' ? '吸気側' : '排気側'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatMetricValue(sensor.temperature, 'temperature')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatMetricValue(sensor.humidity, 'humidity')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatMetricValue(sensor.airflow, 'airflow')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {hasAlert ? (
                            <span className="inline-flex items-center space-x-1 text-red-600">
                              <AlertCircle className="h-4 w-4" />
                              <span>異常</span>
                            </span>
                          ) : (
                            <span className="text-green-600">正常</span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Rack detail modal */}
      {selectedRack && selectedSensors.intake && selectedSensors.exhaust && (
        <RackDetailModal
          rack={selectedRack}
          intakeSensor={selectedSensors.intake}
          exhaustSensor={selectedSensors.exhaust}
          isOpen={!!selectedRack}
          onClose={() => setSelectedRack(null)}
        />
      )}
    </div>
  )
}