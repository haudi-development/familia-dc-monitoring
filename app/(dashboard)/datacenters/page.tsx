'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, Server, Thermometer, Droplets, Wind, AlertCircle } from 'lucide-react'
import { DATA_CENTERS, ROOMS } from '@/lib/constants'

export default function DataCentersPage() {
  const [selectedDC, setSelectedDC] = useState<string | null>(null)
  
  // ダミーの統計データ
  const getDCStats = (dcId: string) => {
    const rooms = ROOMS.filter(room => room.dc_id === dcId)
    const totalRacks = rooms.reduce((sum, room) => sum + room.rack_count, 0)
    const avgTemp = 23.5 + Math.random() * 2
    const avgHumidity = 45 + Math.random() * 5
    const avgAirflow = 120 + Math.random() * 10
    const alerts = Math.floor(Math.random() * 10)
    
    return {
      roomCount: rooms.length,
      totalRacks,
      avgTemp: avgTemp.toFixed(1),
      avgHumidity: avgHumidity.toFixed(1),
      avgAirflow: avgAirflow.toFixed(0),
      alerts
    }
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">データセンター管理</h1>
        <p className="text-gray-600 mt-1">全データセンターの概要</p>
      </div>
      
      {/* DC一覧 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {DATA_CENTERS.map(dc => {
          const stats = getDCStats(dc.dc_id)
          const isSelected = selectedDC === dc.dc_id
          
          return (
            <div
              key={dc.dc_id}
              className={`bg-white rounded-lg shadow-sm border-2 transition-all cursor-pointer ${
                isSelected ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]'
              }`}
              onClick={() => setSelectedDC(dc.dc_id)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-8 h-8 text-[var(--color-primary)]" />
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{dc.dc_name}</h2>
                      <p className="text-sm text-gray-500">{dc.location}</p>
                    </div>
                  </div>
                  {stats.alerts > 0 && (
                    <div className="flex items-center space-x-1 text-red-500">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">{stats.alerts}</span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded p-3">
                    <div className="flex items-center space-x-2 text-gray-600 mb-1">
                      <Server className="w-4 h-4" />
                      <span className="text-xs">ルーム数</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{stats.roomCount}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <div className="flex items-center space-x-2 text-gray-600 mb-1">
                      <Server className="w-4 h-4" />
                      <span className="text-xs">総ラック数</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{stats.totalRacks}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
                      <Thermometer className="w-3 h-3" />
                      <span className="text-xs">平均温度</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{stats.avgTemp}°C</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
                      <Droplets className="w-3 h-3" />
                      <span className="text-xs">平均湿度</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{stats.avgHumidity}%</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
                      <Wind className="w-3 h-3" />
                      <span className="text-xs">平均風量</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{stats.avgAirflow} CFM</p>
                  </div>
                </div>
                
                <Link
                  href={`/datacenters/${dc.dc_id}/rooms`}
                  className="block w-full text-center py-2 px-4 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)] transition-colors"
                >
                  ルーム一覧を見る
                </Link>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* 選択されたDCのルーム一覧 */}
      {selectedDC && (
        <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border)] p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {DATA_CENTERS.find(dc => dc.dc_id === selectedDC)?.dc_name} - ルーム一覧
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROOMS.filter(room => room.dc_id === selectedDC).map(room => (
              <Link
                key={room.room_id}
                href={`/datacenters/${selectedDC}/rooms/${room.room_id}`}
                className="border border-gray-200 rounded-lg p-4 hover:border-[var(--color-primary)] hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{room.room_name}</h4>
                  <Server className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600">ラック数: {room.rack_count}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}