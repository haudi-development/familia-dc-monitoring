'use client'

import { useState, useEffect } from 'react'
import { MetricCards } from '@/components/dashboard/MetricCards'
import { RackLayoutDual } from '@/components/dashboard/RackLayoutDual'
import { HeatmapView } from '@/components/dashboard/HeatmapView'
import { RackDetailModal } from '@/components/dashboard/RackDetailModal'
import { DCRoomSelector } from '@/components/dashboard/DCRoomSelector'
import { generateRackLayoutForRoom, generateDummySensorDataForRoom, updateSensorData } from '@/lib/dummy-data'
import { Rack, Sensor, MetricType, MetricCard } from '@/lib/types'

export default function DashboardPage() {
  const [selectedDC, setSelectedDC] = useState<string>('DC-001')
  const [selectedRoom, setSelectedRoom] = useState<string>('ROOM-001')
  const [racks, setRacks] = useState<Rack[]>([])
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('temperature')
  const [selectedRack, setSelectedRack] = useState<Rack | null>(null)
  const [selectedSensors, setSelectedSensors] = useState<{ intake: Sensor | null; exhaust: Sensor | null }>({
    intake: null,
    exhaust: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  
  // Initialize data on client side only
  useEffect(() => {
    setIsLoading(true)
    setRacks(generateRackLayoutForRoom(selectedRoom, selectedDC))
    setSensors(generateDummySensorDataForRoom(selectedRoom, selectedDC))
    setIsLoading(false)
  }, [selectedDC, selectedRoom])
  
  // Update sensor data every 60 seconds
  useEffect(() => {
    if (!isLoading) {
      const interval = setInterval(() => {
        setSensors(currentSensors => updateSensorData(currentSensors))
      }, 60000)
      
      return () => clearInterval(interval)
    }
  }, [isLoading])
  
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
      {/* Page title */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-gray-600 mt-1">リアルタイムセンサーデータの監視</p>
        </div>
        <DCRoomSelector
          selectedDC={selectedDC}
          selectedRoom={selectedRoom}
          onDCChange={setSelectedDC}
          onRoomChange={setSelectedRoom}
        />
      </div>
      
      {/* Metric cards */}
      <MetricCards metrics={calculateMetrics()} />
      
      {/* Heatmap controls */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">ラック配置図</h2>
        <HeatmapView selectedMetric={selectedMetric} onMetricChange={setSelectedMetric} />
      </div>
      
      {/* Rack layout heatmap */}
      <RackLayoutDual 
        racks={racks} 
        sensors={sensors} 
        metricType={selectedMetric}
        onRackClick={handleRackClick}
      />
      
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