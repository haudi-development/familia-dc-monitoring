// ラックの位置から吸気側か排気側かを判定する関数
export function getSensorPosition(columnLabel: string, side: 'left' | 'right'): 'intake' | 'exhaust' {
  const col = columnLabel.charCodeAt(0) - 65 // A=0, B=1, ...
  
  // 各列の配置に基づいて判定
  // 吸気側通路: A-B, C-D, E-F, G-H, I-J, K-L, M-N, O-P
  // 排気側通路: Aの左, B-C, D-E, F-G, H-I, J-K, L-M, N-O, P-Q, Qの右
  
  // A列
  if (col === 0) {
    return side === 'left' ? 'exhaust' : 'intake' // 左:排気側, 右:A-B間(吸気側)
  }
  
  // Q列
  if (col === 16) {
    return side === 'left' ? 'intake' : 'intake' // 左:P-Q間(吸気側), 右:吸気側
  }
  
  // B,D,F,H,J,L,N,P列 (偶数列)
  if (col % 2 === 1) {
    return side === 'left' ? 'intake' : 'exhaust' // 左:吸気側, 右:排気側
  }
  
  // C,E,G,I,K,M,O列 (奇数列)
  return side === 'left' ? 'exhaust' : 'intake' // 左:排気側, 右:吸気側
}

// センサーデータに基づいて適切な位置を判定
export function determineSensorPositions(rack: { column_label: string }): { intake: 'left' | 'right', exhaust: 'left' | 'right' } {
  const col = rack.column_label.charCodeAt(0) - 65
  
  if (col === 0) { // A列
    return { intake: 'right', exhaust: 'left' }
  }
  
  if (col === 16) { // Q列
    return { intake: 'left', exhaust: 'right' }
  }
  
  if (col % 2 === 1) { // B,D,F,H,J,L,N,P列
    return { intake: 'left', exhaust: 'right' }
  }
  
  // C,E,G,I,K,M,O列
  return { intake: 'right', exhaust: 'left' }
}