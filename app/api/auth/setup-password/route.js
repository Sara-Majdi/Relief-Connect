import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { hashToken } from '@/lib/auth-tokens'

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

    const supabase = createAdminClient()
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

    // Get the NGO user
    const { data: userData, error: fetchError } = await supabase
      .from('ngo_users')
      .select('id, email, org_name, is_active, user_id')
      .eq('email', tokenData.email)
      .single()

    if (fetchError || !userData) {
      console.error('Error fetching NGO user:', fetchError)
      return NextResponse.json({ 
        error: 'User account not found' 
      }, { status: 404 })
    }

    
    // Check if Auth user already exists
    let authUserId = userData.user_id

    if (!authUserId) {
      // Create Supabase Auth user with password
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: password,
        email_confirm: true
      })

      if (authError) {
        console.error('Error creating Supabase Auth user:', authError)
        return NextResponse.json({ 
          error: 'Failed to create authentication account' 
        }, { status: 500 })
      }

      authUserId = authUser.user.id
      console.log('✅ Created Auth user:', authUserId)
    } else {
      // Auth user already exists, just update their password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        authUserId,
        { password: password }
      )

      if (updateError) {
        console.error('Error updating Auth user password:', updateError)
        return NextResponse.json({ 
          error: 'Failed to update password' 
        }, { status: 500 })
      }

      console.log('✅ Updated Auth user password:', authUserId)
    }

    // Update the NGO user - activate account and link to auth user
    const { data: updatedUser, error: userError } = await supabase
      .from('ngo_users')
      .update({
        user_id: authUserId,
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('email', tokenData.email)
      .select('id, email, org_name, is_active')
      .single()

    if (userError || !updatedUser) {
      console.error('Error updating NGO user:', userError)
      return NextResponse.json({ 
        error: 'Failed to activate account' 
      }, { status: 500 })
    }
    

    // Mark the token as used
    await supabase
      .from('password_setup_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenData.id)

    console.log('✅ Password setup successful:', {
      email: updatedUser.email,
      authUserId: authUserId
    })


    return NextResponse.json({ 
      success: true,
      message: 'Password set successfully. Your account is now active.',
      data: {
        email: updatedUser.email,
        org_name: updatedUser.org_name,
        is_active: updatedUser.is_active
      }
    })
  } catch (error) {
    console.error('Error in POST /api/auth/setup-password:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}