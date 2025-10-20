import { NextResponse } from 'next/server'

// POST - NGO logout
export async function POST() {
  try {
    const response = NextResponse.json({ 
      success: true,
      message: 'Logged out successfully'
    })

    // Clear the session cookie
    response.cookies.set('ngo-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    })

    return response
  } catch (error) {
    console.error('Error in POST /api/auth/ngo-logout:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

