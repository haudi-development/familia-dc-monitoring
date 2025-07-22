export const DATA_CENTERS: Record<string, {
  dc_id: string
  name: string
  location: string
  room_count: number
  rooms: string[]
}> = {
  'DC-001': {
    dc_id: 'DC-001',
    name: '東京第1データセンター',
    location: '東京都',
    room_count: 5,
    rooms: ['ROOM-001', 'ROOM-002', 'ROOM-003', 'ROOM-004', 'ROOM-005']
  },
  'DC-002': {
    dc_id: 'DC-002',
    name: '東京第2データセンター',
    location: '東京都',
    room_count: 4,
    rooms: ['ROOM-006', 'ROOM-007', 'ROOM-008', 'ROOM-009']
  }
}

export const ROOMS: Record<string, {
  room_id: string
  name: string
  dc_id: string
  rack_count: number
}> = {
  'ROOM-001': { room_id: 'ROOM-001', name: '1F-A室', dc_id: 'DC-001', rack_count: 170 },
  'ROOM-002': { room_id: 'ROOM-002', name: '1F-B室', dc_id: 'DC-001', rack_count: 170 },
  'ROOM-003': { room_id: 'ROOM-003', name: '2F-A室', dc_id: 'DC-001', rack_count: 170 },
  'ROOM-004': { room_id: 'ROOM-004', name: '2F-B室', dc_id: 'DC-001', rack_count: 170 },
  'ROOM-005': { room_id: 'ROOM-005', name: '3F-A室', dc_id: 'DC-001', rack_count: 170 },
  'ROOM-006': { room_id: 'ROOM-006', name: '1F-サーバールーム', dc_id: 'DC-002', rack_count: 170 },
  'ROOM-007': { room_id: 'ROOM-007', name: '2F-サーバールーム', dc_id: 'DC-002', rack_count: 170 },
  'ROOM-008': { room_id: 'ROOM-008', name: '3F-サーバールーム', dc_id: 'DC-002', rack_count: 170 },
  'ROOM-009': { room_id: 'ROOM-009', name: '4F-サーバールーム', dc_id: 'DC-002', rack_count: 170 },
}

export const COLUMN_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q']