import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hashToken, hashPassword } from '@/lib/auth-tokens'

// POST - Set password using setup token
export async function POST(request) {
  try {
    const body = await request.json()
    let { token, password } = body

    if (!token || !password) {
      return NextResponse.json({ 
        error: 'Token and password are required' 
      }, { status: 400 })
    }

    // Clean the token (remove any whitespace)
    token = token.trim()

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json({ 
        error: 'Password must be at least 8 characters long' 
      }, { status: 400 })
    }

    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return NextResponse.json({ 
        error: 'Password must contain uppercase, lowercase, number, and special character' 
      }, { status: 400 })
    }

    const supabase = await createClient()
    const tokenHash = hashToken(token)

    console.log('Password setup attempt:', {
      tokenReceived: !!token,
      tokenLength: token.length,
      hashLength: tokenHash.length
    })

    // Find and validate the token
    const { data: tokenData, error: tokenError } = await supabase
      .from('password_setup_tokens')
      .select('*')
      .eq('token_hash', tokenHash)
      .is('used_at', null)
      .single()

    if (tokenError || !tokenData) {
      console.error('Token validation failed:', tokenError?.message)
      return NextResponse.json({ 
        error: 'Invalid or expired setup token' 
      }, { status: 400 })
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(tokenData.expires_at)
    
    if (now > expiresAt) {
      console.log('Token has expired')
      return NextResponse.json({ 
        error: 'Setup token has expired. Please request a new one.' 
      }, { status: 400 })
    }

    // Hash the password
    const passwordHash = await hashPassword(password)

    // Update the NGO user with password and activate account
    const { data: userData, error: userError } = await supabase
      .from('ngo_users')
      .update({
        password_hash: passwordHash,
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('email', tokenData.email)
      .select('id, email, org_name, is_active')
      .single()

    if (userError || !userData) {
      console.error('Error updating NGO user:', userError)
      return NextResponse.json({ 
        error: 'Failed to activate account. Please contact support.' 
      }, { status: 500 })
    }

    // Mark the token as used
    await supabase
      .from('password_setup_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenData.id)


    // ✅ Step 5: Create Supabase Auth user (newly added)
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password,
      email_confirm: true
    })

    if (authError) {
      console.error('Error creating Supabase Auth user:', authError)
    } else {
      // Link the new auth user to ngo_users
      const { error: linkError } = await supabase
        .from('ngo_users')
        .update({ user_id: authUser.user.id })
        .eq('email', userData.email)

      if (linkError) {
        console.error('Error linking NGO user to auth.user_id:', linkError)
      } else {
        console.log('✅ Linked NGO user to auth.users:', {
          email: userData.email,
          user_id: authUser.user.id
        })
      }
    }

    console.log('Password setup successful:', {
      email: userData.email,
      isActive: userData.is_active
    })

    return NextResponse.json({ 
      success: true,
      message: 'Password set successfully. Your account is now active.',
      data: {
        email: userData.email,
        org_name: userData.org_name,
        is_active: userData.is_active
      }
    })
  } catch (error) {
    console.error('Error in POST /api/auth/setup-password:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}