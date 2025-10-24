import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendPasswordSetupEmail } from '@/lib/email'
import { generatePasswordSetupToken, hashToken } from '@/lib/auth-tokens'

// PUT - Approve NGO registration
export async function PUT(request, context) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { reviewNotes } = body

    const supabase = createAdminClient() 

    // First, get the NGO registration details
    const { data: registration, error: fetchError } = await supabase
      .from('ngo_registrations')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !registration) {
      console.error('Error fetching NGO registration:', fetchError)
      return NextResponse.json({ 
        error: 'NGO registration not found' 
      }, { status: 404 })
    }

    // Check if already approved
    if (registration.status === 'approved') {
      return NextResponse.json({ 
        error: 'This NGO has already been approved' 
      }, { status: 400 })
    }

    // Generate password setup token (raw token, not encoded yet)
    const setupToken = generatePasswordSetupToken()
    const tokenHash = hashToken(setupToken)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    console.log('Generated token details:', {
      tokenLength: setupToken.length,
      hashLength: tokenHash.length,
      expiresAt: expiresAt.toISOString()
    })

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('ngo_users')
      .select('id, is_active')
      .eq('email', registration.email)
      .maybeSingle()

    if (existingUser && existingUser.is_active) {
      return NextResponse.json({ 
        error: 'An active account already exists for this email' 
      }, { status: 400 })
    }

    // Start transaction-like operations
    // 1. Create/update NGO user
    let userId
    if (existingUser) {
      // Update existing inactive user
      const { data: updatedUser, error: updateError } = await supabase
        .from('ngo_users')
        .update({
          org_name: registration.org_name,
          registration_id: id,
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select('id')
        .single()

      if (updateError) {
        console.error('Error updating NGO user:', updateError)
        return NextResponse.json({ 
          error: 'Failed to update user account' 
        }, { status: 500 })
      }
      userId = updatedUser.id
    } else {
      // Create new user
      const { data: newUser, error: userError } = await supabase
        .from('ngo_users')
        .insert({
          email: registration.email,
          org_name: registration.org_name,
          registration_id: id,
          is_active: false
        })
        .select('id')
        .single()

      if (userError) {
        console.error('Error creating NGO user:', userError)
        return NextResponse.json({ 
          error: 'Failed to create user account' 
        }, { status: 500 })
      }
      userId = newUser.id
    }


    // 2. Delete any existing unused tokens for this email
    await supabase
      .from('password_setup_tokens')
      .delete()
      .eq('email', registration.email)
      .is('used_at', null)

    // 3. Create new password setup token
    const { error: tokenError } = await supabase
      .from('password_setup_tokens')
      .insert({
        email: registration.email,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString()
      })

    if (tokenError) {
      console.error('Error creating password setup token:', tokenError)
      return NextResponse.json({ 
        error: 'Failed to create setup token' 
      }, { status: 500 })
    }

    // 4. Update the NGO registration status to approved
    const { data: approvedRegistration, error: approveError } = await supabase
      .from('ngo_registrations')
      .update({
        status: 'approved',
        review_notes: reviewNotes,
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'admin'
      })
      .eq('id', id)
      .select()
      .single()

    if (approveError) {
      console.error('Error approving NGO registration:', approveError)
      return NextResponse.json({ 
        error: 'Failed to approve registration' 
      }, { status: 500 })
    }

    // 5. Send password setup email (pass raw token, email function will encode it)
    const emailResult = await sendPasswordSetupEmail(
      registration.email,
      registration.org_name,
      setupToken // Pass raw token
    )

    if (!emailResult.success) {
      console.error('Error sending password setup email:', emailResult.error)
      // Log but don't fail - admin can resend if needed
    }

    return NextResponse.json({ 
      success: true,
      data: approvedRegistration,
      emailSent: emailResult.success,
      emailError: emailResult.error || null
    })
  } catch (error) {
    console.error('Error in PUT /api/ngo/registrations/[id]/approve:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}