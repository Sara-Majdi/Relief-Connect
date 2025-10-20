import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hashToken } from '@/lib/auth-tokens'

// GET - Validate password setup token
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    let token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ 
        error: 'Token is required' 
      }, { status: 400 })
    }

    // Decode and clean the token
    token = decodeURIComponent(token).trim()

    console.log('Token validation attempt:', {
      tokenReceived: !!token,
      tokenLength: token.length
    })

    const supabase = await createClient()
    const tokenHash = hashToken(token)

    // Find the token in the database
    const { data: tokenData, error: tokenError } = await supabase
      .from('password_setup_tokens')
      .select('*')
      .eq('token_hash', tokenHash)
      .is('used_at', null)
      .single()

    if (tokenError || !tokenData) {
      console.log('Token not found in database:', tokenError?.message)
      return NextResponse.json({ 
        error: 'Invalid or already used setup token' 
      }, { status: 400 })
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(tokenData.expires_at)
    
    if (now > expiresAt) {
      console.log('Token has expired:', {
        now: now.toISOString(),
        expiresAt: expiresAt.toISOString()
      })
      return NextResponse.json({ 
        error: 'Setup token has expired. Please contact support for a new link.' 
      }, { status: 400 })
    }

    // Get organization information from ngo_users table
    const { data: orgData, error: orgError } = await supabase
      .from('ngo_users')
      .select('id, email, org_name, is_active')
      .eq('email', tokenData.email)
      .single()

    if (orgError || !orgData) {
      console.log('Organization not found for email:', tokenData.email)
      return NextResponse.json({ 
        error: 'Organization account not found' 
      }, { status: 404 })
    }

    // Check if account is already active
    if (orgData.is_active) {
      return NextResponse.json({ 
        error: 'This account is already active. Please login instead.' 
      }, { status: 400 })
    }

    console.log('Token validation successful:', {
      email: orgData.email,
      orgName: orgData.org_name
    })

    return NextResponse.json({ 
      success: true,
      data: {
        email: orgData.email,
        org_name: orgData.org_name
      }
    })
  } catch (error) {
    console.error('Error in GET /api/auth/validate-setup-token:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}