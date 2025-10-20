import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendRejectionEmail } from '@/lib/email'

// PUT - Reject NGO registration
export async function PUT(request, context) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { reviewNotes } = body

    const supabase = await createClient()

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

    // Check if already processed
    if (registration.status === 'rejected') {
      return NextResponse.json({ 
        error: 'This NGO has already been rejected' 
      }, { status: 400 })
    }

    if (registration.status === 'approved') {
      return NextResponse.json({ 
        error: 'Cannot reject an already approved NGO' 
      }, { status: 400 })
    }

    // Update the NGO registration status to rejected
    const { data, error } = await supabase
      .from('ngo_registrations')
      .update({
        status: 'rejected',
        review_notes: reviewNotes,
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'admin'
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error rejecting NGO registration:', error)
      return NextResponse.json({ 
        error: 'Failed to reject registration' 
      }, { status: 500 })
    }

    // Send rejection email
    const emailResult = await sendRejectionEmail(
      registration.email,
      registration.org_name,
      reviewNotes
    )

    if (!emailResult.success) {
      console.error('Error sending rejection email:', emailResult.error)
      // Don't fail the rejection if email fails, just log it
    }

    return NextResponse.json({ 
      success: true,
      data,
      emailSent: emailResult.success,
      emailError: emailResult.error || null
    })
  } catch (error) {
    console.error('Error in PUT /api/ngo/registrations/[id]/reject:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}