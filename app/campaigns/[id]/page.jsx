"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle,
  Clock,
  Heart,
  Share2,
  MapPin,
  Calendar,
  Users,
  Package,
  DollarSign,
  Truck,
  Download,
  Loader2,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"

export default function CampaignDetailPage({ params }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from("campaigns")
          .select("*")
          .eq("id", params.id)
          .single()

        if (error) {
          throw error
        }

        if (data) {
          // Map Supabase data to component structure
          const mappedCampaign = {
            id: data.id,
            title: data.title,
            ngo: data.ngo || data.organizer,
            description: data.description,
            longDescription: data.long_description || data.longDescription,
            image: data.image_url || data.image,
            raised: data.raised || 0,
            goal: data.goal,
            donors: data.donors || 0,
            urgency: data.urgency,
            disaster: data.disaster,
            state: data.state,
            verified: data.verified || false,
            startDate: data.start_date || data.startDate,
            targetDate: data.target_date || data.targetDate,
            location: data.location,
            beneficiaries: data.beneficiaries || 0,
            updates: data.updates || [],
            neededItems: data.needed_items || data.neededItems || [],
            financialBreakdown: data.financial_breakdown || data.financialBreakdown || [],
          }
          setCampaign(mappedCampaign)
        }
      } catch (err) {
        console.error("Error fetching campaign:", err)
        setError(err.message || "Failed to load campaign data")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchCampaign()
    }

    // Set up real-time subscription for campaign updates
    const subscription = supabase
      .channel(`campaign-${params.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'campaigns',
          filter: `id=eq.${params.id}`
        },
        (payload) => {
          console.log('Campaign updated in real-time:', payload)
          // Update the campaign state with new data
          if (payload.new) {
            const data = payload.new
            const mappedCampaign = {
              id: data.id,
              title: data.title,
              ngo: data.ngo || data.organizer,
              description: data.description,
              longDescription: data.long_description || data.longDescription,
              image: data.image_url || data.image,
              raised: data.raised || 0,
              goal: data.goal,
              donors: data.donors || 0,
              urgency: data.urgency,
              disaster: data.disaster,
              state: data.state,
              verified: data.verified || false,
              startDate: data.start_date || data.startDate,
              targetDate: data.target_date || data.targetDate,
              location: data.location,
              beneficiaries: data.beneficiaries || 0,
              updates: data.updates || [],
              neededItems: data.needed_items || data.neededItems || [],
              financialBreakdown: data.financial_breakdown || data.financialBreakdown || [],
            }
            setCampaign(mappedCampaign)
          }
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [params.id])

  const getStatusBadge = (status) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-green-600">Delivered</Badge>
      case "in-transit":
        return <Badge className="bg-blue-600">In Transit</Badge>
      case "processing":
        return <Badge className="bg-amber-600">Processing</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "critical":
        return <Badge className="bg-red-600">Critical</Badge>
      case "high":
        return <Badge className="bg-amber-600">High</Badge>
      case "medium":
        return <Badge className="bg-blue-600">Medium</Badge>
      default:
        return <Badge variant="outline">Low</Badge>
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto w-full px-4 md:px-6 py-8 md:py-12">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-500">Loading campaign details...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto w-full px-4 md:px-6 py-8 md:py-12">
        <div className="flex items-center justify-center min-h-96">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Error Loading Campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // No campaign found
  if (!campaign) {
    return (
      <div className="container mx-auto w-full px-4 md:px-6 py-8 md:py-12">
        <div className="flex items-center justify-center min-h-96">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Campaign Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                The campaign you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild className="w-full">
                <Link href="/campaigns">View All Campaigns</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto w-full px-4 md:px-6 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/campaigns" className="hover:text-blue-600">
            Campaigns
          </Link>
          <span>›</span>
          <span>{campaign.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="relative mb-6">
              <Image
                src={campaign.image || "/placeholder.svg"}
                alt={campaign.title}
                width={800}
                height={400}
                className="w-full h-64 md:h-80 object-cover rounded-lg"
                unoptimized
              />
              {campaign.urgency === "urgent" && (
                <Badge className="absolute top-4 right-4 bg-blue-600">
                  <Clock className="mr-1 h-3 w-3" /> Urgent
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 mb-4">
              {campaign.verified && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="mr-1 h-3 w-3" /> Verified NGO
                </Badge>
              )}
              {campaign.disaster && <Badge variant="outline">{campaign.disaster}</Badge>}
              {campaign.state && <Badge variant="outline">{campaign.state}</Badge>}
            </div>

            <h1 className="text-3xl font-bold mb-2">{campaign.title}</h1>
            <p className="text-gray-600 mb-4">by {campaign.ngo}</p>
            <p className="text-gray-700 mb-6">{campaign.description}</p>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{campaign.beneficiaries || 0}</div>
                <div className="text-sm text-gray-500">Families Helped</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <MapPin className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-lg font-bold">-</div>
                <div className="text-sm text-gray-500">Districts</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-lg font-bold">-</div>
                <div className="text-sm text-gray-500">Days Active</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Heart className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{campaign.donors || 0}</div>
                <div className="text-sm text-gray-500">Donors</div>
              </div>
            </div>
          </div>

          {/* Donation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Support This Campaign
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">RM {(parseFloat(campaign.raised) || 0).toLocaleString()}</span>
                    <span className="text-gray-500">of RM {(parseFloat(campaign.goal) || 0).toLocaleString()}</span>
                  </div>
                  <Progress value={campaign.goal > 0 ? Math.min(((parseFloat(campaign.raised) || 0) / parseFloat(campaign.goal)) * 100, 100) : 0} className="h-3" />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{campaign.donors || 0} {campaign.donors === 1 ? 'donor' : 'donors'}</span>
                    <span>{campaign.goal > 0 ? Math.round(((parseFloat(campaign.raised) || 0) / parseFloat(campaign.goal)) * 100) : 0}% funded</span>
                  </div>
                </div>

                {/* Donation Buttons */}
                <div className="space-y-3">
                  <Button className="w-full" size="lg" asChild>
                    <Link href={`/donate?campaign=${campaign.id}`}>
                      <Heart className="h-4 w-4 mr-2" />
                      Donate Money
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" size="lg" asChild>
                    <Link href={`/donate/items?campaign=${campaign.id}`}>
                      <Package className="h-4 w-4 mr-2" />
                      Donate Items
                    </Link>
                  </Button>
                </div>

                {/* Share */}
                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Campaign
                  </Button>
                </div>

                {/* Campaign Info */}
                <div className="pt-4 border-t space-y-3 text-sm">
                  {campaign.location && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Location:</span>
                      <span className="font-medium">{campaign.location}</span>
                    </div>
                  )}
                  {campaign.startDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Started:</span>
                      <span className="font-medium">{campaign.startDate}</span>
                    </div>
                  )}
                  {campaign.targetDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Target Date:</span>
                      <span className="font-medium">{campaign.targetDate}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="items">Needed Items</TabsTrigger>
          <TabsTrigger value="finances">Finances</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About This Campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {campaign.longDescription ? (
                  campaign.longDescription.split("\n\n").map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-500">No detailed description available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="updates" className="space-y-6">
          <div className="space-y-6">
            {campaign.updates && campaign.updates.length > 0 ? (
              campaign.updates.map((update) => (
                <Card key={update.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{update.title}</CardTitle>
                        <CardDescription>
                          {update.date} • by {update.author}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">New</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{update.content}</p>
                    {update.image && (
                      <Image
                        src={update.image}
                        alt={update.title}
                        width={400}
                        height={200}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No updates available for this campaign yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="items" className="space-y-6">
          <Alert>
            <Package className="h-4 w-4" />
            <AlertDescription>
              Track physical item donations in real-time. See what's needed, what's been donated, and delivery status.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            {campaign.neededItems && campaign.neededItems.length > 0 ? (
              campaign.neededItems.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <CardDescription>{item.specifications}</CardDescription>
                      </div>
                      {getPriorityBadge(item.priority)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.received || 0} received</span>
                        <span>{item.needed || 0} needed</span>
                      </div>
                      <Progress value={item.needed ? ((item.received || 0) / item.needed) * 100 : 0} className="h-2" />
                      <div className="text-xs text-gray-500">
                        {(item.needed || 0) - (item.received || 0)} items still needed
                      </div>
                    </div>

                    {/* Recent Donations */}
                    {item.recentDonations && item.recentDonations.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Recent Donations</h4>
                        <div className="space-y-2">
                          {item.recentDonations.map((donation, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Package className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium">{donation.donor}</p>
                                  <p className="text-sm text-gray-500">
                                    {donation.quantity} items • {donation.date}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(donation.status)}
                                {donation.status === "in-transit" && (
                                  <Button size="sm" variant="outline">
                                    <Truck className="h-4 w-4 mr-1" />
                                    Track
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button className="w-full" asChild>
                      <Link href={`/donate/items?campaign=${campaign.id}&item=${item.id}`}>
                        <Heart className="h-4 w-4 mr-2" />
                        Donate {item.name}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No item requirements specified for this campaign.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="finances" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Transparency</CardTitle>
              <CardDescription>See how donations are being used</CardDescription>
            </CardHeader>
            <CardContent>
              {campaign.financialBreakdown && campaign.financialBreakdown.length > 0 ? (
                <div className="space-y-4">
                  {campaign.financialBreakdown.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category.category}</span>
                        <span className="text-sm text-gray-500">
                          RM {(category.spent || 0).toLocaleString()} / RM {(category.allocated || 0).toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={category.allocated ? ((category.spent || 0) / category.allocated) * 100 : 0} 
                        className="h-2" 
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Financial breakdown not yet available.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Documents</CardTitle>
              <CardDescription>Download detailed financial reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Monthly Financial Report - January 2024
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Expense Receipts and Documentation
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Audit Report - Q4 2023
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Families Helped</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">{campaign.beneficiaries || 0}</div>
                <p className="text-gray-600">Families received emergency assistance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Items Distributed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {campaign.neededItems ? 
                    campaign.neededItems.reduce((total, item) => total + (item.received || 0), 0) : 
                    0
                  }
                </div>
                <p className="text-gray-600">Essential items delivered to communities</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Raised</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  RM {(campaign.raised || 0).toLocaleString()}
                </div>
                <p className="text-gray-600">Amount raised from donations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Donors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 mb-2">{campaign.donors || 0}</div>
                <p className="text-gray-600">People who contributed to this campaign</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Impact Stories</CardTitle>
              <CardDescription>Real stories from the communities we've helped</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Impact stories will be shared as the campaign progresses.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}