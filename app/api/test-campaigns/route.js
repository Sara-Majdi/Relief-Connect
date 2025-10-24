import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test if campaigns table exists and get its structure
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .limit(1)
    
    if (error) {
      return Response.json({ 
        success: false, 
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
    }
    
    return Response.json({ 
      success: true, 
      message: 'Campaigns table exists and is accessible',
      sampleData: data
    })
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    })
  }
}

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Try to insert a simple test campaign
    const testCampaign = {
      title: 'Test Campaign',
      description: 'This is a test campaign',
      goal: 1000,
      urgency: 'medium',
      disaster: 'test',
      state: 'Test State',
      location: 'Test Location',
      start_date: '2024-01-01',
      target_date: '2024-12-31',
      beneficiaries: 10,
      verified: false,
      donors: 0
    }
    
    const { data, error } = await supabase
      .from('campaigns')
      .insert([testCampaign])
      .select()
      .single()
    
    if (error) {
      return Response.json({ 
        success: false, 
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
    }
    
    return Response.json({ 
      success: true, 
      message: 'Test campaign created successfully',
      campaign: data
    })
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    })
  }
}
