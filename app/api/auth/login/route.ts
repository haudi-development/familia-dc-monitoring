import { NextRequest, NextResponse } from 'next/server'

// Simple authentication - In production, use proper authentication with hashed passwords
const VALID_CREDENTIALS = {
  username: 'admin',
  password: 'password123'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body
    
    // Check credentials
    if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
      // Create response with authentication cookie
      const response = NextResponse.json({ success: true })
      
      // Set HTTP-only cookie for authentication
      response.cookies.set('auth-token', 'demo-auth-token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 1 week
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