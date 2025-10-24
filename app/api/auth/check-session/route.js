import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('ngo-session')
    
    if (!sessionCookie) {
      return NextResponse.json({ isAuthenticated: false })
    }
    
    const user = JSON.parse(sessionCookie.value)
    
    // Basic validation
    if (!user.id || !user.email) {
      return NextResponse.json({ isAuthenticated: false })
    }
    
    return NextResponse.json({ 
      isAuthenticated: true, 
      user: {
        id: user.id,
        email: user.email,
        org_name: user.org_name,
        registration_id: user.registration_id
      }
    })
  } catch (error) {
    console.error('Error checking session:', error)
    return NextResponse.json({ isAuthenticated: false })
  }
}