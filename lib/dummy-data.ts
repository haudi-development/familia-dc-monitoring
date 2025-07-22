import { Sensor, Rack } from './types'
import { getSensorPosition, determineSensorPositions } from './rack-utils'

// ラック配置定義（17列構成）
const rackLayout: { [key: string]: { row: number; col: number; type?: 'poe_hub' | 'router' } } = {
  // Row 1
  'RACK-01': { row: 1, col: 1 },
  'RACK-02': { row: 1, col: 2 },
  'RACK-03': { row: 1, col: 3 },
  'RACK-04': { row: 1, col: 4 },
  'RACK-05': { row: 1, col: 5 },
  'RACK-06': { row: 1, col: 6 },
  'RACK-07': { row: 1, col: 7 },
  'RACK-08': { row: 1, col: 8 },
  'RACK-09': { row: 1, col: 9 },
  'RACK-10': { row: 1, col: 10 },
  'RACK-11': { row: 1, col: 11 },
  'RACK-12': { row: 1, col: 12 },
  'RACK-13': { row: 1, col: 13 },
  'RACK-14': { row: 1, col: 14 },
  'RACK-15': { row: 1, col: 15 },
  'RACK-16': { row: 1, col: 16 },
  'RACK-17': { row: 1, col: 17 },
  // Row 2
  'RACK-18': { row: 2, col: 1 },
  'RACK-19': { row: 2, col: 2 },
  'RACK-20': { row: 2, col: 3 },
  'RACK-21': { row: 2, col: 4 },
  'RACK-22': { row: 2, col: 5 },
  'RACK-23': { row: 2, col: 6 },
  'RACK-24': { row: 2, col: 7 },
  'RACK-25': { row: 2, col: 8 },
  'RACK-26': { row: 2, col: 9 },
  'RACK-27': { row: 2, col: 10 },
  'RACK-28': { row: 2, col: 11 },
  'RACK-29': { row: 2, col: 12 },
  'RACK-30': { row: 2, col: 13 },
  'RACK-31': { row: 2, col: 14 },
  'RACK-32': { row: 2, col: 15 },
  'RACK-33': { row: 2, col: 16 },
  'RACK-34': { row: 2, col: 17 },
  // Add more rows as needed up to 170 racks total
}

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
    const positions = determineSensorPositions(rack)
    
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