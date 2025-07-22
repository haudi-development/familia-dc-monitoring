export const DATA_CENTERS = [
  {
    dc_id: 'DC-001',
    dc_name: '東京第1データセンター',
    location: '東京都',
    room_count: 5
  },
  {
    dc_id: 'DC-002',
    dc_name: '東京第2データセンター',
    location: '東京都',
    room_count: 4
  }
]

export const ROOMS = [
  // DC-001のルーム
  { room_id: 'ROOM-001', room_name: '1F-A室', dc_id: 'DC-001', rack_count: 170 },
  { room_id: 'ROOM-002', room_name: '1F-B室', dc_id: 'DC-001', rack_count: 170 },
  { room_id: 'ROOM-003', room_name: '2F-A室', dc_id: 'DC-001', rack_count: 170 },
  { room_id: 'ROOM-004', room_name: '2F-B室', dc_id: 'DC-001', rack_count: 170 },
  { room_id: 'ROOM-005', room_name: '3F-A室', dc_id: 'DC-001', rack_count: 170 },
  // DC-002のルーム
  { room_id: 'ROOM-006', room_name: '1F-サーバールーム', dc_id: 'DC-002', rack_count: 170 },
  { room_id: 'ROOM-007', room_name: '2F-サーバールーム', dc_id: 'DC-002', rack_count: 170 },
  { room_id: 'ROOM-008', room_name: '3F-サーバールーム', dc_id: 'DC-002', rack_count: 170 },
  { room_id: 'ROOM-009', room_name: '4F-サーバールーム', dc_id: 'DC-002', rack_count: 170 },
]

export const COLUMN_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q']