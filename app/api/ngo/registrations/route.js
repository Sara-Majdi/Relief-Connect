import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch NGO registrations (for admin dashboard)
export async function GET(request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('ngo_registrations')
      .select('*')
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching NGO registrations:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in GET /api/ngo/registrations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new NGO registration
export async function POST(request) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('ngo_registrations')
      .insert([{
        org_name: body.orgName,
        registration_number: body.registrationNumber,
        year_established: body.yearEstablished,
        org_type: body.orgType,
        address: body.address,
        city: body.city,
        state: body.state,
        postal_code: body.postalCode,
        description: body.description,
        website: body.website,
        email: body.email,
        phone: body.phone,
        focus_area: body.focusArea,
        registration_cert_url: body.registrationCertUrl,
        tax_exemption_cert_url: body.taxExemptionCertUrl,
        annual_report_url: body.annualReportUrl,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating NGO registration:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/ngo/registrations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
