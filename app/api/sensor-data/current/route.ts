import { NextResponse } from 'next/server'
import { generateDummySensorData } from '@/lib/dummy-data'

// Store sensors in memory for consistent data during development
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

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    sensors: sensors,
  })
}