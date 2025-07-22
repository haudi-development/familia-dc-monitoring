import { Sensor, Rack } from './types'
import { determineSensorPositions } from './rack-utils'


// Generate full rack layout for a specific room
export function generateRackLayoutForRoom(roomId: string, dcId: string): Rack[] {
  const racks: Rack[] = []
  const columnLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q']
  
  // 17列 × 10行のラックを生成
  for (let row = 1; row <= 10; row++) {
    for (let col = 1; col <= 17; col++) {
      const columnLabel = columnLabels[col - 1]
      const rack_id = `${roomId}-${columnLabel}${String(row).padStart(2, '0')}`
      
      racks.push({
        rack_id,
        room_id: roomId,
        dc_id: dcId,
        row,
        col,
        column_label: columnLabel,
        rack_type: 'normal',
        x_coordinate: col * 60,
        y_coordinate: row * 50,
      })
    }
  }
  
  return racks
}

// Generate full rack layout (for backward compatibility)
export function generateRackLayout(): Rack[] {
  return generateRackLayoutForRoom('ROOM-001', 'DC-001')
}

// Generate temperature with realistic patterns
function generateTemperature(baseTemp: number, position: 'intake' | 'exhaust', row: number, col: number): number {
  // Exhaust sensors typically 3-5°C warmer than intake
  const positionOffset = position === 'exhaust' ? Math.random() * 2 + 3 : 0
  
  // Center racks tend to be warmer
  const centerDistance = Math.sqrt(Math.pow(row - 5, 2) + Math.pow(col - 9, 2))
  const centerOffset = Math.max(0, 5 - centerDistance * 0.3)
  
  // Add some random variation
  const randomVariation = (Math.random() - 0.5) * 2
  
  return Math.round((baseTemp + positionOffset + centerOffset + randomVariation) * 10) / 10
}

// Generate humidity with realistic patterns
function generateHumidity(baseHumidity: number, temperature: number): number {
  // Higher temperature typically means lower humidity
  const tempOffset = (temperature - 25) * -0.5
  const randomVariation = (Math.random() - 0.5) * 5
  
  return Math.round(Math.max(30, Math.min(70, baseHumidity + tempOffset + randomVariation)) * 10) / 10
}

// Generate airflow with realistic patterns
function generateAirflow(baseAirflow: number, position: 'intake' | 'exhaust', temperature: number): number {
  // Intake typically has higher airflow
  const positionOffset = position === 'intake' ? Math.random() * 20 + 10 : 0
  
  // Higher temperature areas might have increased airflow
  const tempOffset = (temperature - 25) * 2
  
  const randomVariation = (Math.random() - 0.5) * 20
  
  return Math.round(Math.max(80, baseAirflow + positionOffset + tempOffset + randomVariation) * 10) / 10
}

// Generate dummy sensor data for a specific room
export function generateDummySensorDataForRoom(roomId: string, dcId: string): Sensor[] {
  const sensors: Sensor[] = []
  const racks = generateRackLayoutForRoom(roomId, dcId)
  
  // Base values
  const baseTemp = 23
  const baseHumidity = 45
  const baseAirflow = 120
  
  for (const rack of racks) {
    // Determine sensor positions based on rack location
    determineSensorPositions(rack)
    
    // Intake sensor
    const intakeTemp = generateTemperature(baseTemp, 'intake', rack.row, rack.col)
    const intakeHumidity = generateHumidity(baseHumidity, intakeTemp)
    const intakeAirflow = generateAirflow(baseAirflow, 'intake', intakeTemp)
    
    sensors.push({
      sensor_id: `${rack.rack_id}-INTAKE`,
      rack_id: rack.rack_id,
      room_id: roomId,
      dc_id: dcId,
      position: 'intake',
      temperature: intakeTemp,
      humidity: intakeHumidity,
      airflow: intakeAirflow,
    })
    
    // Exhaust sensor
    const exhaustTemp = generateTemperature(baseTemp, 'exhaust', rack.row, rack.col)
    const exhaustHumidity = generateHumidity(baseHumidity, exhaustTemp)
    const exhaustAirflow = generateAirflow(baseAirflow, 'exhaust', exhaustTemp)
    
    sensors.push({
      sensor_id: `${rack.rack_id}-EXHAUST`,
      rack_id: rack.rack_id,
      room_id: roomId,
      dc_id: dcId,
      position: 'exhaust',
      temperature: exhaustTemp,
      humidity: exhaustHumidity,
      airflow: exhaustAirflow,
    })
  }
  
  return sensors
}

// Generate dummy sensor data (for backward compatibility)
export function generateDummySensorData(): Sensor[] {
  return generateDummySensorDataForRoom('ROOM-001', 'DC-001')
}

// Update sensor data with realistic variations
export function updateSensorData(currentSensors: Sensor[]): Sensor[] {
  return currentSensors.map(sensor => {
    // Small random variations
    const tempDelta = (Math.random() - 0.5) * 0.5
    const humidityDelta = (Math.random() - 0.5) * 1
    const airflowDelta = (Math.random() - 0.5) * 5
    
    return {
      ...sensor,
      temperature: Math.round((sensor.temperature + tempDelta) * 10) / 10,
      humidity: Math.round(Math.max(30, Math.min(70, sensor.humidity + humidityDelta)) * 10) / 10,
      airflow: Math.round(Math.max(80, sensor.airflow + airflowDelta) * 10) / 10,
    }
  })
}