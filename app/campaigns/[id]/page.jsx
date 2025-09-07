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
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"

export default function CampaignDetailPage({ params }) {
  const [activeTab, setActiveTab] = useState("overview")

  // Default campaign data shown until Supabase loads
  const defaultCampaign = {
    id: params.id,
    title: "Pahang Flood Relief",
    ngo: "Malaysian Relief Foundation",
    description:
      "Supporting communities affected by severe flooding in Pahang state with emergency supplies, temporary shelter, and long-term recovery assistance. The recent floods have displaced over 500 families and damaged critical infrastructure.",
    longDescription: `The recent flooding in Pahang has been one of the most severe in recent years, affecting multiple districts including Kuantan, Pekan, and Temerloh. Over 500 families have been displaced from their homes, with many losing their belongings and livelihoods.

Our comprehensive relief effort focuses on three key areas:
1. **Immediate Relief**: Providing emergency supplies, clean water, and temporary shelter
2. **Recovery Support**: Helping families rebuild their homes and restore their livelihoods  
3. **Community Resilience**: Strengthening flood preparedness for future disasters

Your donations will directly support affected families through verified distribution channels, ensuring aid reaches those who need it most.`,
    image: "/campaigns/pahang-flood.jpg",
    raised: 50000,
    goal: 100000,
    donors: 234,
    urgency: "urgent",
    disaster: "flood",
    state: "pahang",
    verified: true,
    startDate: "2024-01-10",
    targetDate: "2024-02-10",
    location: "Kuantan, Pekan, Temerloh - Pahang",
    beneficiaries: 500,
    updates: [
      {
        id: 1,
        date: "2024-01-16",
        title: "Emergency Supplies Distributed",
        content:
          "We have successfully distributed emergency food packages and clean water to 150 families in the Kuantan area. Thanks to your generous donations, we were able to provide immediate relief to those most in need.",
        image: "/placeholder.svg?height=200&width=400",
        author: "Relief Team Alpha",
      },
      {
        id: 2,
        date: "2024-01-15",
        title: "Temporary Shelter Established",
        content:
          "Three temporary shelter sites have been set up in community centers, providing safe accommodation for 200 displaced families. Each shelter is equipped with basic amenities and medical support.",
        image: "/placeholder.svg?height=200&width=400",
        author: "Shelter Coordination Team",
      },
    ],
    neededItems: [
      {
        id: "blankets",
        name: "Blankets",
        needed: 300,
        received: 180,
        priority: "high",
        specifications: "New or gently used, clean, suitable for all weather",
        recentDonations: [
          { donor: "Ahmad R.", quantity: 20, date: "2024-01-16", status: "delivered" },
          { donor: "Siti M.", quantity: 15, date: "2024-01-15", status: "in-transit" },
          { donor: "Anonymous", quantity: 25, date: "2024-01-15", status: "delivered" },
        ],
      },
      {
        id: "food",
        name: "Food Packages",
        needed: 500,
        received: 450,
        priority: "medium",
        specifications: "Non-perishable, halal-certified, family-sized portions",
        recentDonations: [
          { donor: "Lim K.H.", quantity: 50, date: "2024-01-16", status: "delivered" },
          { donor: "Fatimah A.", quantity: 30, date: "2024-01-15", status: "delivered" },
        ],
      },
      {
        id: "water",
        name: "Clean Water (Bottles)",
        needed: 1000,
        received: 600,
        priority: "critical",
        specifications: "Sealed bottles, 500ml-1.5L, unexpired",
        recentDonations: [
          { donor: "Corporate Donor", quantity: 200, date: "2024-01-16", status: "delivered" },
          { donor: "Community Group", quantity: 100, date: "2024-01-15", status: "in-transit" },
        ],
      },
    ],
    financialBreakdown: [
      { category: "Emergency Supplies", allocated: 40000, spent: 28000 },
      { category: "Temporary Shelter", allocated: 25000, spent: 18000 },
      { category: "Medical Support", allocated: 15000, spent: 8000 },
      { category: "Transportation", allocated: 10000, spent: 7000 },
      { category: "Administrative", allocated: 10000, spent: 5000 },
    ],
  }

  const [campaign, setCampaign] = useState(defaultCampaign)

  useEffect(() => {
    const fetchCampaign = async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", params.id)
        .single()

      if (data) {
        const mapped = {
          id: data.id ?? params.id,
          title: data.title ?? defaultCampaign.title,
          ngo: data.ngo ?? data.organizer ?? defaultCampaign.ngo,
          description: data.description ?? defaultCampaign.description,
          longDescription: data.long_description ?? data.longDescription ?? defaultCampaign.longDescription,
          image: data.image_url ?? data.image ?? defaultCampaign.image,
          raised: data.raised ?? defaultCampaign.raised,
          goal: data.goal ?? defaultCampaign.goal,
          donors: data.donors ?? defaultCampaign.donors,
          urgency: data.urgency ?? defaultCampaign.urgency,
          disaster: data.disaster ?? defaultCampaign.disaster,
          state: data.state ?? defaultCampaign.state,
          verified: data.verified ?? defaultCampaign.verified,
          startDate: data.start_date ?? data.startDate ?? defaultCampaign.startDate,
          targetDate: data.target_date ?? data.targetDate ?? defaultCampaign.targetDate,
          location: data.location ?? defaultCampaign.location,
          beneficiaries: data.beneficiaries ?? defaultCampaign.beneficiaries,
          updates: data.updates ?? defaultCampaign.updates,
          neededItems: data.needed_items ?? defaultCampaign.neededItems,
          financialBreakdown: data.financial_breakdown ?? defaultCampaign.financialBreakdown,
        }
        setCampaign({ ...defaultCampaign, ...mapped })
      }
    }
    fetchCampaign()
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
              />
              <Badge className="absolute top-4 right-4 bg-blue-600">
                <Clock className="mr-1 h-3 w-3" /> Urgent
              </Badge>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="mr-1 h-3 w-3" /> Verified NGO
              </Badge>
              <Badge variant="outline">{campaign.disaster}</Badge>
              <Badge variant="outline">{campaign.state}</Badge>
            </div>

            <h1 className="text-3xl font-bold mb-2">{campaign.title}</h1>
            <p className="text-gray-600 mb-4">by {campaign.ngo}</p>
            <p className="text-gray-700 mb-6">{campaign.description}</p>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{campaign.beneficiaries}</div>
                <div className="text-sm text-gray-500">Families Helped</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <MapPin className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-lg font-bold">3</div>
                <div className="text-sm text-gray-500">Districts</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-lg font-bold">30</div>
                <div className="text-sm text-gray-500">Days Active</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Heart className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{campaign.donors}</div>
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
                    <span className="font-medium">RM {campaign.raised.toLocaleString()}</span>
                    <span className="text-gray-500">of RM {campaign.goal.toLocaleString()}</span>
                  </div>
                  <Progress value={(campaign.raised / campaign.goal) * 100} className="h-3" />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{campaign.donors} donors</span>
                    <span>{Math.round((campaign.raised / campaign.goal) * 100)}% funded</span>
                  </div>
                </div>

                {/* Donation Buttons */}
                <div className="space-y-3">
                  <Button className="w-full" size="lg" asChild>
                    <Link href={`/donate?campaign=${campaign.id}&type=money`}>
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
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location:</span>
                    <span className="font-medium">{campaign.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Started:</span>
                    <span className="font-medium">{campaign.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Target Date:</span>
                    <span className="font-medium">{campaign.targetDate}</span>
                  </div>
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
                {campaign.longDescription.split("\n\n").map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="updates" className="space-y-6">
          <div className="space-y-6">
            {campaign.updates.map((update) => (
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
                  <Image
                    src={update.image || "/placeholder.svg"}
                    alt={update.title}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </CardContent>
              </Card>
            ))}
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
            {campaign.neededItems.map((item) => (
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
                      <span>{item.received} received</span>
                      <span>{item.needed} needed</span>
                    </div>
                    <Progress value={(item.received / item.needed) * 100} className="h-2" />
                    <div className="text-xs text-gray-500">{item.needed - item.received} items still needed</div>
                  </div>

                  {/* Recent Donations */}
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

                  <Button className="w-full" asChild>
                    <Link href={`/donate/items?campaign=${campaign.id}&item=${item.id}`}>
                      <Heart className="h-4 w-4 mr-2" />
                      Donate {item.name}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="finances" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Transparency</CardTitle>
              <CardDescription>See how donations are being used</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaign.financialBreakdown.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{category.category}</span>
                      <span className="text-sm text-gray-500">
                        RM {category.spent.toLocaleString()} / RM {category.allocated.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={(category.spent / category.allocated) * 100} className="h-2" />
                  </div>
                ))}
              </div>
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
                <div className="text-3xl font-bold text-blue-600 mb-2">500</div>
                <p className="text-gray-600">Families received emergency assistance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Items Distributed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">1,230</div>
                <p className="text-gray-600">Essential items delivered to communities</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shelter Provided</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-2">200</div>
                <p className="text-gray-600">Families housed in temporary shelters</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Medical Support</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 mb-2">150</div>
                <p className="text-gray-600">People received medical assistance</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Impact Stories</CardTitle>
              <CardDescription>Real stories from the communities we've helped</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-600 pl-4">
                  <p className="italic text-gray-700 mb-2">
                    "The relief team arrived just when we needed them most. My family lost everything in the flood, but
                    thanks to the donations, we had food, clean water, and a safe place to stay."
                  </p>
                  <p className="text-sm text-gray-500">- Aminah, Kuantan resident</p>
                </div>
                <div className="border-l-4 border-green-600 pl-4">
                  <p className="italic text-gray-700 mb-2">
                    "The blankets and warm clothes donated by generous people helped us get through the cold nights. We
                    are so grateful for the support during this difficult time."
                  </p>
                  <p className="text-sm text-gray-500">- Rahman, Pekan resident</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
