import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hashToken } from '@/lib/auth-tokens'

// GET - Debug token information
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token parameter is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const tokenHash = hashToken(token)

    // Check if password_setup_tokens table exists and has data
    const { data: allTokens, error: tokensError } = await supabase
      .from('password_setup_tokens')
      .select('*')
      .limit(10)

    console.log('All tokens in database:', allTokens)
    console.log('Tokens error:', tokensError)

    // Check if ngo_users table exists and has data
    const { data: allUsers, error: usersError } = await supabase
      .from('ngo_users')
      .select('*')
      .limit(10)

    console.log('All users in database:', allUsers)
    console.log('Users error:', usersError)

    // Look for specific token
    const { data: tokenData, error: tokenError } = await supabase
      .from('password_setup_tokens')
      .select('*')
      .eq('token_hash', tokenHash)

    console.log('Specific token lookup:', { tokenData, tokenError })

    return NextResponse.json({
      debug: {
        tokenProvided: !!token,
        tokenHash,
        allTokensCount: allTokens?.length || 0,
        allUsersCount: allUsers?.length || 0,
        specificTokenFound: tokenData?.length > 0,
        tokensError: tokensError?.message,
        usersError: usersError?.message,
        tokenError: tokenError?.message,
        sampleTokens: allTokens?.slice(0, 3),
        sampleUsers: allUsers?.slice(0, 3)
      }
    })
  } catch (error) {
    console.error('Error in debug endpoint:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}


