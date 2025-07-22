import { NextRequest, NextResponse } from 'next/server'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
  // Create response
  const response = NextResponse.json({ success: true })
  
  // Clear authentication cookie
  response.cookies.delete('auth-token')
  
  return response
}