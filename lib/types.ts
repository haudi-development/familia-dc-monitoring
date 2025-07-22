export interface DataCenter {
  dc_id: string
  dc_name: string
  location: string
  room_count: number
}

export interface Room {
  room_id: string
  room_name: string
  dc_id: string
  rack_count: number
}

export interface Sensor {
  sensor_id: string
  rack_id: string
  room_id: string
  dc_id: string
  position: 'intake' | 'exhaust' // 吸気側 | 排気側
  temperature: number
  humidity: number
  airflow: number
}

export interface SensorData {
  timestamp: string
  sensors: Sensor[]
}

export interface Rack {
  rack_id: string
  room_id: string
  dc_id: string
  row: number
  col: number
  column_label: string
  rack_type: 'normal' | 'poe_hub' | 'router'
  x_coordinate: number
  y_coordinate: number
}

export interface HeatmapData {
  rack_id: string
  row: number
  col: number
  front_value: number
  back_value: number
  avg_value: number
}

export interface HeatmapResponse {
  type: 'temperature' | 'humidity' | 'airflow'
  data: HeatmapData[]
}

export type MetricType = 'temperature' | 'humidity' | 'airflow'

export interface MetricCard {
  title: string
  value: string | number
  unit: string
  trend?: 'up' | 'down' | 'stable'
  trendValue?: number
}

// Alert types
export interface AlertCondition {
  type: MetricType
  operator: '>' | '<' | '='
  value: number
  target: 'any' | 'room' | 'rack' | 'sensor'
  targetId?: string
}

export interface AlertAction {
  type: 'email' | 'webhook' | 'slack'
  config: Record<string, any>
}

export interface AlertRule {
  id: string
  name: string
  description: string
  enabled: boolean
  conditions: AlertCondition[]
  actions: AlertAction[]
  createdAt: Date
  lastTriggered: Date | null
  triggerCount: number
}