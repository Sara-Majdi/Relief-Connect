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
  Truck,
  Download,
  Loader2,
  AlertTriangle, 
  DollarSign
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import ItemProgressCards from "@/components/campaign/ItemProgressCards"
import AllocationBreakdown from "@/components/campaign/AllocationBreakdown"
import ItemDonationModal from "@/components/donation/ItemDonationModal"
import { } from 'lucide-react';

export default function CampaignDetailPage({ params }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [fundraisingItems, setFundraisingItems] = useState([])
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return null
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-MY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (e) {
      return dateString
    }
  }

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
            financialBreakdown: data.financial_breakdown || data.financialBreakdown || [],
            financialDocuments: data.financial_documents || data.financialDocuments || [],
            createdAt: data.created_at || data.createdAt,
          }
          setCampaign(mappedCampaign)
        }

        // Fetch fundraising items via API
        try {
          const itemsResponse = await fetch(`/api/campaigns/${params.id}/items-public`)
          const itemsResult = await itemsResponse.json()

          if (itemsResult.success && itemsResult.items) {
            setFundraisingItems(itemsResult.items)
          }
        } catch (itemsError) {
          console.error('Error fetching fundraising items:', itemsError)
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
              financialBreakdown: data.financial_breakdown || data.financialBreakdown || [],
              financialDocuments: data.financial_documents || data.financialDocuments || [],
              createdAt: data.created_at || data.createdAt,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto w-full px-4 md:px-6 py-8 md:py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/campaigns" className="hover:text-blue-600 transition-colors font-medium">
            Campaigns
          </Link>
          <span>›</span>
          <span className="text-gray-700 truncate max-w-xs">{campaign.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative mb-6 rounded-xl overflow-hidden shadow-2xl group">
              <Image
                src={campaign.image || "/placeholder.svg"}
                alt={campaign.title}
                width={800}
                height={400}
                className="w-full h-72 md:h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              {campaign.urgency === "urgent" && (
                <Badge className="absolute top-4 right-4 bg-blue-600 shadow-lg animate-pulse text-base px-4 py-2">
                  <Clock className="mr-2 h-4 w-4" /> Urgent
                </Badge>
              )}
              {campaign.urgency === "critical" && (
                <Badge className="absolute top-4 right-4 bg-red-600 shadow-lg animate-pulse text-base px-4 py-2">
                  <AlertTriangle className="mr-2 h-4 w-4" /> Critical
                </Badge>
              )}
            </div>

            {/* Campaign Header Card */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {campaign.verified && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 shadow-sm px-3 py-1">
                      <CheckCircle className="mr-1 h-4 w-4" /> Verified NGO
                    </Badge>
                  )}
                  {campaign.disaster && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                      {campaign.disaster}
                    </Badge>
                  )}
                  {campaign.state && (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
                      <MapPin className="mr-1 h-3 w-3" /> {campaign.state}
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {campaign.title}
                </h1>
                <p className="text-gray-600 mb-3 flex items-center gap-2">
                  <span className="font-medium">by</span>
                  <span className="font-semibold text-gray-900">{campaign.ngo}</span>
                </p>
                <p className="text-gray-700 text-lg leading-relaxed">{campaign.description}</p>
              </CardContent>
            </Card>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border-0 bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">{campaign.beneficiaries || 0}</div>
                  <div className="text-sm text-gray-600 font-medium">Families Helped</div>
                </CardContent>
              </Card>
              <Card className="text-center shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border-0 bg-gradient-to-br from-green-50 to-white">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {campaign.location ? campaign.location.split(',').length : 1}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Locations</div>
                </CardContent>
              </Card>
              <Card className="text-center shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border-0 bg-gradient-to-br from-purple-50 to-white">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {campaign.startDate ? Math.ceil((new Date() - new Date(campaign.startDate)) / (1000 * 60 * 60 * 24)) : 0}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Days Active</div>
                </CardContent>
              </Card>
              <Card className="text-center shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border-0 bg-gradient-to-br from-red-50 to-white">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="text-3xl font-bold text-red-600 mb-1">{campaign.donors || 0}</div>
                  <div className="text-sm text-gray-600 font-medium">Generous Donors</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Donation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 shadow-xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <CardTitle className="flex items-center gap-2 text-white mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <span className="text-xl">Support This Campaign</span>
                </CardTitle>
                <p className="text-blue-100 text-sm">Every contribution makes a difference</p>
              </div>

              <CardContent className="p-6 space-y-6">
                {/* Progress */}
                <div className="space-y-4">
                  <div className="text-center pb-4 border-b">
                    <div className="text-4xl font-bold text-gray-900 mb-1">
                      RM {(parseFloat(campaign.raised) || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 mb-3">
                      raised of RM {(parseFloat(campaign.goal) || 0).toLocaleString()} goal
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner mb-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-4 rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: `${campaign.goal > 0 ? Math.min(((parseFloat(campaign.raised) || 0) / parseFloat(campaign.goal)) * 100, 100) : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Heart className="h-3 w-3 text-red-500" />
                        {campaign.donors || 0} {campaign.donors === 1 ? 'donor' : 'donors'}
                      </span>
                      <span className="font-semibold text-blue-600">
                        {campaign.goal > 0 ? Math.round(((parseFloat(campaign.raised) || 0) / parseFloat(campaign.goal)) * 100) : 0}% funded
                      </span>
                    </div>
                  </div>

                  {/* Donation Buttons */}
                  <div className="space-y-3">
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                      size="lg"
                      onClick={() => {
                        setSelectedItem(null)
                        setIsDonationModalOpen(true)
                      }}
                    >
                      <Heart className="h-5 w-5 mr-2" />
                      Donate Money
                    </Button>
                  </div>

                  {/* Share */}
                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full border-2 hover:bg-gray-50 transition-colors">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Campaign
                    </Button>
                  </div>

                  {/* Campaign Info */}
                  <div className="pt-4 border-t space-y-4">
                    <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Campaign Details</h3>
                    {campaign.location && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-0.5">Location</div>
                          <div className="font-medium text-gray-900">{campaign.location}</div>
                        </div>
                      </div>
                    )}
                    {campaign.startDate && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-0.5">Started</div>
                          <div className="font-medium text-gray-900">{formatDate(campaign.startDate) || campaign.startDate}</div>
                        </div>
                      </div>
                    )}
                    {campaign.targetDate && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Clock className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-0.5">Target Date</div>
                          <div className="font-medium text-gray-900">{formatDate(campaign.targetDate) || campaign.targetDate}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Detailed Tabs */}
      <div className="container mx-auto w-full px-4 md:px-6 pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-white shadow-lg border-0 h-14 p-1.5">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all rounded-lg font-medium text-xs md:text-sm"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="updates"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all rounded-lg font-medium text-xs md:text-sm"
            >
              Updates
            </TabsTrigger>
            <TabsTrigger
              value="fundraising"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all rounded-lg font-medium text-xs md:text-sm"
            >
              Fund Items
            </TabsTrigger>
            <TabsTrigger
              value="breakdown"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all rounded-lg font-medium text-xs md:text-sm"
            >
              Breakdown
            </TabsTrigger>
            <TabsTrigger
              value="finances"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all rounded-lg font-medium text-xs md:text-sm"
            >
              Finances
            </TabsTrigger>
            <TabsTrigger
              value="impact"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all rounded-lg font-medium text-xs md:text-sm"
            >
              Impact
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  About This Campaign
                </CardTitle>
                <CardDescription>Detailed information about the disaster relief efforts</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="prose max-w-none">
                  {campaign.longDescription ? (
                    campaign.longDescription.split("\n\n").map((paragraph, index) => (
                      <p key={index} className="mb-4 text-gray-700 leading-relaxed text-lg">
                        {paragraph}
                      </p>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-lg">No detailed description available.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="updates" className="space-y-6">
            <div className="space-y-6">
              {campaign.updates && campaign.updates.length > 0 ? (
                campaign.updates.map((update, index) => (
                  <Card key={update.id || index} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{update.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {update.date ? new Date(update.date).toLocaleDateString('en-MY', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }) : 'Recent'} • by {update.author || campaign.ngo}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className="bg-green-600">New</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-gray-700 mb-4 whitespace-pre-wrap text-lg leading-relaxed">
                        {update.description || update.content}
                      </p>
                      {update.image && (
                        <Image
                          src={update.image}
                          alt={update.title}
                          width={600}
                          height={300}
                          className="w-full h-64 object-cover rounded-lg shadow-md"
                        />
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="shadow-lg border-0">
                  <CardContent className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">No updates available for this campaign yet.</p>
                    <p className="text-gray-400 text-sm mt-2">Check back soon for progress updates!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="fundraising" className="space-y-6">
            {fundraisingItems.length > 0 ? (
              <ItemProgressCards
                items={fundraisingItems}
                onDonateToItem={(item) => {
                  setSelectedItem(item)
                  setIsDonationModalOpen(true)
                }}
                showFilters={true}
              />
            ) : (
              <Card className="shadow-lg border-0">
                <CardContent className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">No fundraising items set up for this campaign.</p>
                  <p className="text-gray-400 text-sm mt-2">You can still donate to the general campaign fund!</p>
                  <Button
                    className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => setIsDonationModalOpen(true)}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Donate to Campaign
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-6">
            {fundraisingItems.length > 0 ? (
              <AllocationBreakdown
                campaign={campaign}
                items={fundraisingItems}
              />
            ) : (
              <Card className="shadow-lg border-0">
                <CardContent className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">No allocation breakdown available.</p>
                  <p className="text-gray-400 text-sm mt-2">This campaign uses traditional fundraising without item breakdowns.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="finances" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="border-b bg-gradient-to-r from-green-50 to-blue-50">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  Financial Transparency
                </CardTitle>
                <CardDescription>See how donations are being allocated and spent</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {campaign.financialBreakdown && campaign.financialBreakdown.length > 0 ? (
                  <div className="space-y-6">
                    {campaign.financialBreakdown.map((category, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-lg text-gray-900">{category.category}</span>
                          <span className="text-sm font-medium text-gray-700 bg-white px-3 py-1 rounded-full shadow-sm">
                            RM {(category.spent || 0).toLocaleString()} / RM {(category.allocated || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                          <div
                            className="bg-gradient-to-r from-green-600 to-blue-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${category.allocated ? Math.min(((category.spent || 0) / category.allocated) * 100, 100) : 0}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-600">
                          {category.allocated ? Math.round(((category.spent || 0) / category.allocated) * 100) : 0}% utilized
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">Financial breakdown not yet available.</p>
                    <p className="text-gray-400 text-sm mt-2">Will be updated as the campaign progresses.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Download className="h-5 w-5 text-purple-600" />
                  </div>
                  Financial Documents
                </CardTitle>
                <CardDescription>Download detailed financial reports and documentation</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {campaign.financialDocuments && campaign.financialDocuments.length > 0 ? (
                  <div className="space-y-3">
                    {campaign.financialDocuments.map((doc, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start border-2 hover:bg-purple-50 hover:border-purple-300 transition-colors"
                        asChild
                      >
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" download>
                          <Download className="h-4 w-4 mr-2" />
                          {doc.name || doc.title}
                        </a>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Download className="h-8 w-8 text-purple-400" />
                    </div>
                    <p className="text-gray-500 text-lg">No financial documents available yet.</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Documents will be uploaded as the campaign progresses.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="impact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all hover:-translate-y-1">
                <CardHeader>
                  <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-center text-gray-700">Families Helped</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-5xl font-bold text-blue-600 mb-3">{campaign.beneficiaries || 0}</div>
                  <p className="text-gray-700 font-medium">Families received emergency assistance</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all hover:-translate-y-1">
                <CardHeader>
                  <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <DollarSign className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-center text-gray-700">Total Raised</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-5xl font-bold text-purple-600 mb-3">
                    RM {(campaign.raised || 0).toLocaleString()}
                  </div>
                  <p className="text-gray-700 font-medium">Amount raised from donations</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-br from-red-50 to-pink-100 hover:shadow-xl transition-all hover:-translate-y-1">
                <CardHeader>
                  <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Heart className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-center text-gray-700">Generous Donors</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-5xl font-bold text-red-600 mb-3">{campaign.donors || 0}</div>
                  <p className="text-gray-700 font-medium">People who contributed to this campaign</p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-lg border-0">
              <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Heart className="h-5 w-5 text-indigo-600" />
                  </div>
                  Impact Stories
                </CardTitle>
                <CardDescription>Real stories from the communities we've helped</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-16">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-indigo-600" />
                </div>
                <p className="text-gray-500 text-lg">Impact stories will be shared as the campaign progresses.</p>
                <p className="text-gray-400 text-sm mt-2">Check back soon for inspiring stories from beneficiaries!</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Item Donation Modal */}
      <ItemDonationModal
        isOpen={isDonationModalOpen}
        onClose={() => {
          setIsDonationModalOpen(false)
          setSelectedItem(null)
        }}
        campaign={{
          ...campaign,
          items: fundraisingItems
        }}
        selectedItem={selectedItem}
        onSubmit={async (donationData) => {
          // Create Stripe checkout session
          const response = await fetch('/api/checkout/donation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              campaignId: campaign.id,
              campaignTitle: campaign.title,
              ngoName: campaign.ngo,
              amount: Math.round(donationData.total_amount * 100), // Convert to cents
              tipPercentage: donationData.tip_amount > 0 ? (donationData.tip_amount / donationData.amount) * 100 : 0,
              isRecurring: donationData.is_recurring || false,
              recurringInterval: donationData.recurring_interval || 'monthly',
              // Item-specific fields
              itemId: donationData.item_id || null,
              itemName: selectedItem?.name || null,
              allocationType: donationData.allocation_type || 'general'
            })
          })

          const { url } = await response.json()

          // Redirect to Stripe Checkout
          if (url) {
            window.location.href = url
          }
        }}
      />
    </div>
  )
}