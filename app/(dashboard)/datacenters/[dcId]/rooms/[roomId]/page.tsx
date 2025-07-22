'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { MetricCards } from '@/components/dashboard/MetricCards'
import { RackLayoutSimple } from '@/components/dashboard/RackLayoutSimple'
import { HeatmapView } from '@/components/dashboard/HeatmapView'
import { RackDetailModal } from '@/components/dashboard/RackDetailModal'
import { generateRackLayoutForRoom, generateDummySensorDataForRoom, updateSensorData } from '@/lib/dummy-data'
import { Rack, Sensor, MetricType, MetricCard } from '@/lib/types'
import { DATA_CENTERS, ROOMS } from '@/lib/constants'

export default function RoomDetailPage() {
  const params = useParams()
  const dcId = params.dcId as string
  const roomId = params.roomId as string
  
  const dataCenter = DATA_CENTERS.find(dc => dc.dc_id === dcId)
  const room = ROOMS.find(r => r.room_id === roomId)
  
  const [racks, setRacks] = useState<Rack[]>([])
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('temperature')
  const [selectedRack, setSelectedRack] = useState<Rack | null>(null)
  const [selectedSensors, setSelectedSensors] = useState<{ front: Sensor | null; back: Sensor | null }>({
    front: null,
    back: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  
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
    const frontSensor = sensors.find(s => s.rack_id === rack.rack_id && s.position === 'front')
    const backSensor = sensors.find(s => s.rack_id === rack.rack_id && s.position === 'back')
    setSelectedSensors({ front: frontSensor || null, back: backSensor || null })
  }
  
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
          {dataCenter.dc_name}のルーム一覧に戻る
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {dataCenter.dc_name} - {room.room_name}
        </h1>
        <p className="text-gray-600 mt-1">リアルタイムセンサーデータの監視</p>
      </div>
      
      {/* Metric cards */}
      <MetricCards metrics={calculateMetrics()} />
      
      {/* Heatmap controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">ラック配置図（17列 × 10行）</h2>
        <HeatmapView selectedMetric={selectedMetric} onMetricChange={setSelectedMetric} />
      </div>
      
      {/* Rack layout heatmap */}
      <RackLayoutSimple 
        racks={racks} 
        sensors={sensors} 
        metricType={selectedMetric}
        onRackClick={handleRackClick}
      />
      
      {/* Rack detail modal */}
      {selectedRack && selectedSensors.front && selectedSensors.back && (
        <RackDetailModal
          rack={selectedRack}
          frontSensor={selectedSensors.front}
          backSensor={selectedSensors.back}
          isOpen={!!selectedRack}
          onClose={() => setSelectedRack(null)}
        />
      )}
    </div>
  )
}