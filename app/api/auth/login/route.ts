import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Simple authentication - In production, use proper authentication with hashed passwords
const VALID_CREDENTIALS = {
  username: 'admin',
  password: 'password123'
}

// Generate a session token
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body
    
    // Check credentials
    if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
      // Create response with authentication cookie
      const response = NextResponse.json({ success: true })
      
      // Generate session token
      const sessionToken = generateSessionToken()
      
      // Set HTTP-only cookie for authentication
      response.cookies.set('auth-token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: parseInt(process.env.SESSION_MAX_AGE || '604800'), // Default 1 week
        path: '/'
      })
      
      return response
    } else {
      return NextResponse.json(
        { error: 'ユーザー名またはパスワードが正しくありません' },
        { status: 401 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'ログイン処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}