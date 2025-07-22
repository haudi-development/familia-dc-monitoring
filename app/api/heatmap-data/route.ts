import { NextRequest, NextResponse } from 'next/server'
import { generateRackLayout, generateDummySensorData } from '@/lib/dummy-data'
import { MetricType } from '@/lib/types'

const racks = generateRackLayout()
let sensors = generateDummySensorData()

// Update sensors periodically
setInterval(() => {
  sensors = sensors.map(sensor => ({
    ...sensor,
    temperature: Math.round((sensor.temperature + (Math.random() - 0.5) * 0.5) * 10) / 10,
    humidity: Math.round(Math.max(30, Math.min(70, sensor.humidity + (Math.random() - 0.5) * 1)) * 10) / 10,
    airflow: Math.round(Math.max(80, sensor.airflow + (Math.random() - 0.5) * 5) * 10) / 10,
  }))
}, 60000)

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = (searchParams.get('type') || 'temperature') as MetricType
  
  // Create sensor map for quick lookup
  const sensorMap = new Map<string, { front: number; back: number }>()
  sensors.forEach(sensor => {
    const existing = sensorMap.get(sensor.rack_id) || { front: 0, back: 0 }
    const value = sensor[type]
    
    if (sensor.position === 'intake') {
      existing.front = value
    } else {
      existing.back = value
    }
    sensorMap.set(sensor.rack_id, existing)
  })
  
  // Build heatmap data
  const heatmapData = racks.map(rack => {
    const sensorValues = sensorMap.get(rack.rack_id) || { front: 0, back: 0 }
    return {
      rack_id: rack.rack_id,
      row: rack.row,
      col: rack.col,
      front_value: sensorValues.front,
      back_value: sensorValues.back,
      avg_value: (sensorValues.front + sensorValues.back) / 2,
    }
  })
  
  return NextResponse.json({
    type,
    data: heatmapData,
  })
}