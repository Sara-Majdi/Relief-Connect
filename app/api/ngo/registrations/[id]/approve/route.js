import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PUT - Approve NGO registration
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { reviewNotes } = body

    const supabase = await createClient()

    // Update the NGO registration status to approved
    const { data, error } = await supabase
      .from('ngo_registrations')
      .update({
        status: 'approved',
        review_notes: reviewNotes,
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'admin' // In a real app, this would be the actual admin user ID
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error approving NGO registration:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in PUT /api/ngo/registrations/[id]/approve:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
