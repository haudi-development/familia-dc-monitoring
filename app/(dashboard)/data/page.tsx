'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, Download, ChevronRight, LineChart } from 'lucide-react'
import { generateDummySensorDataForRoom } from '@/lib/dummy-data'
import { DATA_CENTERS, ROOMS } from '@/lib/constants'
import { Sensor } from '@/lib/types'
import { formatMetricValue } from '@/lib/utils'
import { SensorDetailModal } from '@/components/dashboard/SensorDetailModal'
import { SensorComparisonGraph } from '@/components/dashboard/SensorComparisonGraph'

type TabType = 'list' | 'graph'

export default function DataManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>('list')
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [selectedDC, setSelectedDC] = useState<string>('all')
  const [selectedRoom, setSelectedRoom] = useState<string>('all')
  const [selectedColumn, setSelectedColumn] = useState<string>('all')
  const [selectedPosition, setSelectedPosition] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load all sensor data
  useEffect(() => {
    setIsLoading(true)
    const allSensors: Sensor[] = []
    
    // Generate sensors for all rooms
    Object.values(DATA_CENTERS).forEach(dc => {
      dc.rooms.forEach(roomId => {
        const roomSensors = generateDummySensorDataForRoom(roomId, dc.dc_id)
        allSensors.push(...roomSensors)
      })
    })
    
    setSensors(allSensors)
    setIsLoading(false)
  }, [])

  // Get available rooms based on selected DC
  const availableRooms = useMemo(() => {
    if (selectedDC === 'all') {
      return Object.values(ROOMS)
    }
    const dc = DATA_CENTERS[selectedDC]
    return dc ? dc.rooms.map(roomId => ROOMS[roomId]).filter(Boolean) : []
  }, [selectedDC])

  // Filter sensors
  const filteredSensors = useMemo(() => {
    return sensors.filter(sensor => {
      // DC filter
      if (selectedDC !== 'all' && sensor.dc_id !== selectedDC) return false
      
      // Room filter
      if (selectedRoom !== 'all' && sensor.room_id !== selectedRoom) return false
      
      // Column filter
      if (selectedColumn !== 'all') {
        const rackColumn = sensor.rack_id.split('-')[2]?.charAt(0)
        if (rackColumn !== selectedColumn) return false
      }
      
      // Position filter
      if (selectedPosition !== 'all' && sensor.position !== selectedPosition) return false
      
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          sensor.sensor_id.toLowerCase().includes(query) ||
          sensor.rack_id.toLowerCase().includes(query)
        )
      }
      
      return true
    })
  }, [sensors, selectedDC, selectedRoom, selectedColumn, selectedPosition, searchQuery])

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['センサーID', 'ラックID', 'DC', 'ルーム', '位置', '温度(°C)', '湿度(%)', '風量(CFM)']
    const rows = filteredSensors.map(sensor => [
      sensor.sensor_id,
      sensor.rack_id,
      sensor.dc_id,
      sensor.room_id,
      sensor.position === 'intake' ? '吸気側' : '排気側',
      sensor.temperature.toFixed(1),
      sensor.humidity.toFixed(1),
      sensor.airflow.toFixed(0)
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `sensor_data_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">データ管理</h1>
          <p className="text-gray-600 mt-1">センサーデータの詳細表示と分析</p>
        </div>
        {activeTab === 'list' && (
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>CSVエクスポート</span>
          </button>
        )}
      </div>

      {/* Tab navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'list'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>センサーリスト</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'graph'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <LineChart className="h-4 w-4" />
              <span>比較グラフ</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border)] p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold">フィルター</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* DC filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              データセンター
            </label>
            <select
              value={selectedDC}
              onChange={(e) => {
                setSelectedDC(e.target.value)
                setSelectedRoom('all')
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="all">すべて</option>
              {Object.values(DATA_CENTERS).map(dc => (
                <option key={dc.dc_id} value={dc.dc_id}>{dc.name}</option>
              ))}
            </select>
          </div>

          {/* Room filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ルーム
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="all">すべて</option>
              {availableRooms.map(room => (
                <option key={room.room_id} value={room.room_id}>{room.name}</option>
              ))}
            </select>
          </div>

          {/* Column filter */}
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

          {/* Position filter */}
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

          {/* Search */}
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
      </div>

      {/* Tab content */}
      {activeTab === 'list' ? (
        <>
          {/* Results summary */}
          <div className="text-sm text-gray-600">
            {filteredSensors.length}件のセンサーが見つかりました
          </div>

          {/* Sensor list */}
          <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border)]">
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
                  DC/ルーム
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
                  
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSensors.map((sensor) => (
                <tr
                  key={sensor.sensor_id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedSensor(sensor)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sensor.sensor_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sensor.rack_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sensor.dc_id} / {sensor.room_id}
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
                    <ChevronRight className="h-4 w-4" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        </>
      ) : (
        <SensorComparisonGraph 
          sensors={sensors}
          selectedDC={selectedDC}
          selectedRoom={selectedRoom}
          selectedColumn={selectedColumn}
          selectedPosition={selectedPosition}
        />
      )}

      {/* Sensor detail modal */}
      {selectedSensor && (
        <SensorDetailModal
          sensor={selectedSensor}
          isOpen={!!selectedSensor}
          onClose={() => setSelectedSensor(null)}
        />
      )}
    </div>
  )
}