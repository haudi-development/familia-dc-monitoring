import { MetricType } from './types'

export function getHeatmapColor(value: number, type: MetricType): string {
  let ranges: { min: number; max: number; colors: string[] }
  
  switch (type) {
    case 'temperature':
      ranges = {
        min: 20,
        max: 35,
        colors: ['var(--color-heatmap-cold)', 'var(--color-heatmap-normal)', 'var(--color-heatmap-warm)', 'var(--color-heatmap-hot)', 'var(--color-heatmap-critical)']
      }
      break
    case 'humidity':
      ranges = {
        min: 30,
        max: 70,
        colors: ['var(--color-heatmap-critical)', 'var(--color-heatmap-hot)', 'var(--color-heatmap-normal)', 'var(--color-heatmap-hot)', 'var(--color-heatmap-critical)']
      }
      break
    case 'airflow':
      ranges = {
        min: 80,
        max: 150,
        colors: ['var(--color-heatmap-critical)', 'var(--color-heatmap-hot)', 'var(--color-heatmap-warm)', 'var(--color-heatmap-normal)', 'var(--color-heatmap-cold)']
      }
      break
  }
  
  const normalized = (value - ranges.min) / (ranges.max - ranges.min)
  const index = Math.min(Math.floor(normalized * ranges.colors.length), ranges.colors.length - 1)
  
  return ranges.colors[Math.max(0, index)]
}

export function formatMetricValue(value: number, type: MetricType): string {
  switch (type) {
    case 'temperature':
      return `${value.toFixed(1)}°C`
    case 'humidity':
      return `${value.toFixed(1)}%`
    case 'airflow':
      return `${value.toFixed(0)} CFM`
  }
}

export function getMetricUnit(type: MetricType): string {
  switch (type) {
    case 'temperature':
      return '°C'
    case 'humidity':
      return '%'
    case 'airflow':
      return 'CFM'
  }
}

export function getMetricLabel(type: MetricType): string {
  switch (type) {
    case 'temperature':
      return '温度'
    case 'humidity':
      return '湿度'
    case 'airflow':
      return '風量'
  }
}