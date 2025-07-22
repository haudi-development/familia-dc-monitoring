// ラックの位置から吸気側か排気側かを判定する関数
export function getSensorPosition(columnLabel: string, side: 'left' | 'right'): 'intake' | 'exhaust' {
  const col = columnLabel.charCodeAt(0) - 65 // A=0, B=1, ...
  
  // 各列の配置に基づいて判定
  // 吸気側通路: A-B間, C-D間, E-F間, G-H間, I-J間, K-L間, M-N間, O-P間, Qの右
  // 排気側通路: Aの左, B-C間, D-E間, F-G間, H-I間, J-K間, L-M間, N-O間, P-Q間
  
  // A列 (col=0)
  if (col === 0) {
    return side === 'left' ? 'exhaust' : 'intake' // 左:排気側通路, 右:A-B間(吸気側通路)
  }
  
  // Q列 (col=16)
  if (col === 16) {
    return side === 'left' ? 'exhaust' : 'intake' // 左:P-Q間(排気側通路), 右:Qの右(吸気側通路)
  }
  
  // B,D,F,H,J,L,N,P列 (奇数インデックス: col=1,3,5,7,9,11,13,15)
  if (col % 2 === 1) {
    return side === 'left' ? 'intake' : 'exhaust' // 左:吸気側通路, 右:排気側通路
  }
  
  // C,E,G,I,K,M,O列 (偶数インデックス: col=2,4,6,8,10,12,14)
  return side === 'left' ? 'exhaust' : 'intake' // 左:排気側通路, 右:吸気側通路
}

// センサーデータに基づいて適切な位置を判定
export function determineSensorPositions(rack: { column_label: string }): { intake: 'left' | 'right', exhaust: 'left' | 'right' } {
  const col = rack.column_label.charCodeAt(0) - 65
  
  if (col === 0) { // A列: 左が排気、右が吸気
    return { intake: 'right', exhaust: 'left' }
  }
  
  if (col === 16) { // Q列: 左が排気、右が吸気
    return { intake: 'right', exhaust: 'left' }
  }
  
  if (col % 2 === 1) { // B,D,F,H,J,L,N,P列: 左が吸気、右が排気
    return { intake: 'left', exhaust: 'right' }
  }
  
  // C,E,G,I,K,M,O列: 左が排気、右が吸気
  return { intake: 'right', exhaust: 'left' }
}