"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, LogOut, LayoutDashboard, Heart, Plus, Settings, Building2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function MainNav() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [organizationName, setOrganizationName] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const init = async () => {
      try {
        // First, check for NGO session cookie
        const ngoSessionCheck = await fetch('/api/auth/check-session')
        const ngoData = await ngoSessionCheck.json()
        
        if (ngoData.isAuthenticated && ngoData.user) {
          if (mounted) {
            setUser({ email: ngoData.user.email })
            setUserRole('ngo')
            setOrganizationName(ngoData.user.org_name || null)
          }
        } else {
          // If no NGO session, check for Supabase donor auth
          const { data: { user } } = await supabase.auth.getUser()
          if (mounted && user) {
            setUser(user)
            setUserRole('donor')
            setOrganizationName(null)
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    init()

    // Listen for Supabase auth changes (for donors)
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Only update if it's a donor session (NGO uses cookies, not Supabase Auth)
      if (session?.user) {
        setUser(session.user)
        setUserRole('donor')
        setOrganizationName(null)
      } else if (!session) {
        // Check if there's still an NGO session
        const ngoCheck = await fetch('/api/auth/check-session')
        const ngoData = await ngoCheck.json()
        
        if (!ngoData.isAuthenticated) {
          setUser(null)
          setUserRole(null)
          setOrganizationName(null)
        }
      }
    })
    
    return () => {
      mounted = false
      sub.subscription?.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    if (userRole === 'ngo') {
      // NGO logout - clear session cookie
      await fetch('/api/auth/ngo-logout', { method: 'POST' })
    } else {
      // Donor logout - Supabase auth
      await supabase.auth.signOut()
    }
    
    setUser(null)
    setUserRole(null)
    setOrganizationName(null)
    router.refresh()
    router.push("/")
  }

  const handleSignIn = async () => {
    router.push("/auth/role-select")
  }

  // Get display initial for avatar
  const getDisplayInitial = () => {
    if (userRole === 'ngo' && organizationName) {
      return organizationName[0]?.toUpperCase()
    }
    return user?.email?.[0]?.toUpperCase() || '?'
  }

  // Get avatar background color based on role
  const getAvatarColor = () => {
    if (userRole === 'ngo') {
      return 'bg-indigo-100 text-indigo-700'
    }
    return 'bg-blue-100 text-blue-700'
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">ReliefConnect</span>
          </Link>
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Campaigns</NavigationMenuTrigger>
                <NavigationMenuContent className="bg-white">
                  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-blue-500 to-blue-700 p-6 no-underline outline-none focus:shadow-md"
                          href="/campaigns"
                        >
                          <div className="mt-4 mb-2 text-lg font-medium text-white">Active Campaigns</div>
                          <p className="text-sm leading-tight text-white/90">
                            Browse all active disaster relief campaigns across Malaysia
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    
                    
                    
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link href="/about">About Us</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Show "For NGOs" link only if user is not logged in as NGO */}
              {userRole !== 'ngo' && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link href="/ngo/register">For NGOs</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            {loading ? null : (
              user ? (
                <DropdownMenu>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="rounded-full relative">
                            <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${getAvatarColor()}`}>
                              {getDisplayInitial()}
                            </span>
                            {/* NGO Badge Indicator */}
                            {userRole === 'ngo' && (
                              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 border-2 border-white">
                                <Building2 className="h-2.5 w-2.5 text-white" />
                              </span>
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-gray-900 text-white">
                        <p>{userRole === 'ngo' && organizationName ? organizationName : user?.email}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <DropdownMenuContent align="end" className="bg-white w-56">
                    {/* NGO Menu Items */}
                    {userRole === 'ngo' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/ngo/dashboard">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/ngo/campaigns">
                            <Heart className="mr-2 h-4 w-4" />
                            My Campaigns
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/ngo/campaigns/create/payment">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Campaign
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/ngo/profile">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    {/* Donor Menu Items */}
                    {userRole === 'donor' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/donor/profile">
                            <User className="mr-2 h-4 w-4" />
                            Profile
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="outline" onClick={handleSignIn} className="cursor-pointer">
                  Sign in
                </Button>
              )
            )}
          </div>
          
          {/* Mobile Menu */}
          <div className="flex md:hidden items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white">
                <nav className="flex flex-col mx-auto gap-4 mt-8">
                  <Link href="/campaigns" className="text-lg font-medium">
                    Campaigns
                  </Link>
                  <Link href="/about" className="text-lg font-medium">
                    About Us
                  </Link>
                  
                  {/* Show "For NGOs" only if not logged in as NGO */}
                  {userRole !== 'ngo' && (
                    <Link href="/ngo/register" className="text-lg font-medium">
                      For NGOs
                    </Link>
                  )}

                  {loading ? null : (
                    user ? (
                      <>
                        <div className="border-t pt-4 mt-2">
                          {/* NGO Mobile Menu */}
                          {userRole === 'ngo' && (
                            <>
                              <Link href="/ngo/dashboard" className="text-lg font-medium block mb-4">
                                Dashboard
                              </Link>
                              <Link href="/ngo/campaigns" className="text-lg font-medium block mb-4">
                                My Campaigns
                              </Link>
                              <Link href="/ngo/campaigns/create/payment" className="text-lg font-medium block mb-4">
                                Create Campaign
                              </Link>
                              <Link href="/ngo/profile" className="text-lg font-medium block mb-4">
                                Settings
                              </Link>
                            </>
                          )}

                          {/* Donor Mobile Menu */}
                          {userRole === 'donor' && (
                            <>
                              <Link href="/donor/profile" className="text-lg font-medium block mb-4">
                                Profile
                              </Link>
                            </>
                          )}
                        </div>
                        
                        <Button variant="outline" onClick={handleSignOut} className="mt-2 bg-transparent">
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" onClick={handleSignIn} className="mt-2 bg-transparent">
                        Sign in
                      </Button>
                    )
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}