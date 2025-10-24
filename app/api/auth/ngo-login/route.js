import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyPassword } from '@/lib/auth-tokens'

// POST - NGO login
export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Find the NGO user
    const { data: userData, error: userError } = await supabase
      .from('ngo_users')
      .select(`
        *,
        ngo_registrations!inner (
          org_name,
          status
        )
      `)
      .eq('email', email.toLowerCase())
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Check if account is active
    if (!userData.is_active) {
      return NextResponse.json({ 
        error: 'Account not activated. Please check your email for the password setup link.' 
      }, { status: 401 })
    }

    // Check if registration is approved
    if (userData.ngo_registrations.status !== 'approved') {
      return NextResponse.json({ 
        error: 'Your NGO registration is not yet approved. Please wait for admin approval.' 
      }, { status: 401 })
    }

    // Verify password
    if (!userData.password_hash) {
      return NextResponse.json({ error: 'Password not set. Please use the setup link from your email.' }, { status: 401 })
    }

    const isValidPassword = await verifyPassword(password, userData.password_hash)
    
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Create session (you might want to use JWT tokens or Supabase auth here)
    // For now, we'll return the user data
    const userSession = {
      id: userData.id,
      email: userData.email,
      org_name: userData.ngo_registrations.org_name,
      registration_id: userData.registration_id,
      is_active: userData.is_active,
      login_time: new Date().toISOString()
    }

    // In a real app, you'd set a secure session cookie or JWT token here
    const response = NextResponse.json({ 
      success: true,
      user: userSession,
      message: 'Login successful'
    })

    // Set a secure session cookie (you might want to use a more secure session management)
    response.cookies.set('ngo-session', JSON.stringify(userSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error) {
    console.error('Error in POST /api/auth/ngo-login:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

