'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, Building2, Server } from 'lucide-react'
import { DATA_CENTERS, ROOMS } from '@/lib/constants'

interface DCRoomSelectorProps {
  selectedDC: string
  selectedRoom: string
  onDCChange: (dcId: string) => void
  onRoomChange: (roomId: string) => void
}

export function DCRoomSelector({ selectedDC, selectedRoom, onDCChange, onRoomChange }: DCRoomSelectorProps) {
  const [availableRooms, setAvailableRooms] = useState(Object.values(ROOMS).filter(room => room.dc_id === selectedDC))
  
  useEffect(() => {
    // Update available rooms when DC changes
    const newRooms = Object.values(ROOMS).filter(room => room.dc_id === selectedDC)
    setAvailableRooms(newRooms)
    
    // If current room is not in the new DC, select the first room
    if (!newRooms.some(room => room.room_id === selectedRoom) && newRooms.length > 0) {
      onRoomChange(newRooms[0].room_id)
    }
  }, [selectedDC, selectedRoom, onRoomChange])
  
  return (
    <div className="flex items-center space-x-3">
      {/* DC Selector */}
      <div className="relative">
        <label className="block text-xs text-gray-500 mb-1">データセンター</label>
        <div className="relative">
          <select
            value={selectedDC}
            onChange={(e) => onDCChange(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-md pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
          >
            {Object.values(DATA_CENTERS).map(dc => (
              <option key={dc.dc_id} value={dc.dc_id}>
                {dc.name}
              </option>
            ))}
          </select>
          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>
      
      {/* Room Selector */}
      <div className="relative">
        <label className="block text-xs text-gray-500 mb-1">ルーム</label>
        <div className="relative">
          <select
            value={selectedRoom}
            onChange={(e) => onRoomChange(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-md pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
          >
            {availableRooms.map(room => (
              <option key={room.room_id} value={room.room_id}>
                {room.name}
              </option>
            ))}
          </select>
          <Server className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  )
}