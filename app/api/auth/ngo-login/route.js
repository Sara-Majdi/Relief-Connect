import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST - NGO login
export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const supabase = await createClient()

    // First, authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password
    })

    if (authError || !authData.user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Now that we're authenticated, we can query ngo_users
    const { data: userData, error: userError } = await supabase
      .from('ngo_users')
      .select('*')
      .eq('user_id', authData.user.id)
      .single()

      if (userError || !userData) {
        console.error('User data error:', userError)
        // Sign out if we can't find the user data
        await supabase.auth.signOut()
        return NextResponse.json({ error: 'User profile not found' }, { status: 401 })
      }

    // Check if account is active
    if (!userData.is_active) {
      await supabase.auth.signOut()
      return NextResponse.json({ 
        error: 'Account not activated. Please check your email for the password setup link.' 
      }, { status: 401 })
    }

    // Get registration details
    const { data: registrationData, error: regError } = await supabase
      .from('ngo_registrations')
      .select('org_name, status')
      .eq('id', userData.registration_id)
      .single()

    if (regError || !registrationData) {
      console.error('Registration data error:', regError)
      await supabase.auth.signOut()
      return NextResponse.json({ error: 'Registration not found' }, { status: 401 })
    }

    // Check if registration is approved
    if (registrationData.status !== 'approved') {
      await supabase.auth.signOut()
      return NextResponse.json({ 
        error: 'Your NGO registration is not yet approved. Please wait for admin approval.' 
      }, { status: 401 })
    }

    // Create session data
    const userSession = {
      id: userData.id,
      email: userData.email,
      org_name: registrationData.org_name,
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

