'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Server, Thermometer, Droplets, Wind, AlertCircle } from 'lucide-react'
import { DATA_CENTERS, ROOMS } from '@/lib/constants'

export default function RoomsPage() {
  const params = useParams()
  const dcId = params.dcId as string
  
  const dataCenter = DATA_CENTERS.find(dc => dc.dc_id === dcId)
  const rooms = ROOMS.filter(room => room.dc_id === dcId)
  
  // ダミーの統計データ
  const getRoomStats = (roomId: string) => {
    const avgTemp = 22 + Math.random() * 4
    const avgHumidity = 40 + Math.random() * 10
    const avgAirflow = 110 + Math.random() * 20
    const alerts = Math.floor(Math.random() * 5)
    
    return {
      avgTemp: avgTemp.toFixed(1),
      avgHumidity: avgHumidity.toFixed(1),
      avgAirflow: avgAirflow.toFixed(0),
      alerts,
      activeRacks: Math.floor(170 * (0.8 + Math.random() * 0.2))
    }
  }
  
  if (!dataCenter) {
    return <div>データセンターが見つかりません</div>
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link 
            href="/datacenters" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            データセンター一覧に戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{dataCenter.dc_name}</h1>
          <p className="text-gray-600 mt-1">ルーム一覧</p>
        </div>
      </div>
      
      {/* ルーム一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => {
          const stats = getRoomStats(room.room_id)
          
          return (
            <div
              key={room.room_id}
              className="bg-white rounded-lg shadow-sm border border-[var(--color-border)] hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Server className="w-6 h-6 text-[var(--color-primary)]" />
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{room.room_name}</h2>
                      <p className="text-sm text-gray-500">
                        稼働中: {stats.activeRacks}/{room.rack_count} ラック
                      </p>
                    </div>
                  </div>
                  {stats.alerts > 0 && (
                    <div className="flex items-center space-x-1 text-red-500">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">{stats.alerts}</span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
                      <Thermometer className="w-3 h-3" />
                      <span className="text-xs">温度</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{stats.avgTemp}°C</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
                      <Droplets className="w-3 h-3" />
                      <span className="text-xs">湿度</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{stats.avgHumidity}%</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
                      <Wind className="w-3 h-3" />
                      <span className="text-xs">風量</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{stats.avgAirflow}</p>
                  </div>
                </div>
                
                <Link
                  href={`/datacenters/${dcId}/rooms/${room.room_id}`}
                  className="block w-full text-center py-2 px-4 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)] transition-colors"
                >
                  詳細を見る
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}