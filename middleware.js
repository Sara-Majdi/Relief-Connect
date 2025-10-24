import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected NGO routes
  const isNGORoute = request.nextUrl.pathname.startsWith('/ngo')
    
  if (isNGORoute) {
    // Check for NGO session cookie first
    const cookieStore = await cookies()
    const ngoSessionCookie = cookieStore.get('ngo-session')
    
    if (ngoSessionCookie) {
      try {
        const ngoUser = JSON.parse(ngoSessionCookie.value)
        // Validate NGO session
        if (ngoUser.id && ngoUser.email) {
          // NGO is authenticated via cookie, allow access
          return supabaseResponse
        }
      } catch (error) {
        console.error('Error parsing NGO session cookie:', error)
      }
    }
    
    // If no valid NGO session, check Supabase auth
    if (!user) {
      // Redirect to login if accessing NGO routes without any auth
      const redirectUrl = new URL('/auth/ngo', request.url)
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If user is authenticated via Supabase, verify they are an NGO
    const { data: ngoUser, error } = await supabase
      .from('ngo_users')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (error || !ngoUser) {
      // User is not an NGO, redirect to home
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
