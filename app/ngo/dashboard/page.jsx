"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Plus, Edit, Trash2, Eye, DollarSign, Package, Users, Clock, CheckCircle, AlertTriangle, BarChart3, Loader2, TrendingUp, MessageSquare, Calendar, Target } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function NGODashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [isEditItemOpen, setIsEditItemOpen] = useState(false)
  const [isAddUpdateOpen, setIsAddUpdateOpen] = useState(false)
  const [isEditUpdateOpen, setIsEditUpdateOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [ngoInfo, setNgoInfo] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedUpdate, setSelectedUpdate] = useState(null)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [isCampaignDetailOpen, setIsCampaignDetailOpen] = useState(false)
  const [isCampaignAnalyticsOpen, setIsCampaignAnalyticsOpen] = useState(false)
  const [stats, setStats] = useState({
    totalRaised: 0,
    activeCampaigns: 0,
    totalDonors: 0
  })

  useEffect(() => {
    checkNGOSession()
  }, [])

  const checkNGOSession = async () => {
    try {
      const response = await fetch('/api/auth/check-session')
      const data = await response.json()

      if (!data.isAuthenticated || !data.user) {
        router.push('/auth/ngo')
        return
      }

      console.log('=== DEBUG: NGO Session ===')
      console.log('NGO User Data:', data.user)
      console.log('NGO User ID:', data.user.id)
      console.log('NGO Org Name:', data.user.org_name)

      setNgoInfo(data.user)
      await fetchCampaigns(data.user.id)
    } catch (error) {
      console.error('Error checking NGO session:', error)
      router.push('/auth/ngo')
    }
  }

  const fetchCampaigns = async (ngoUserId) => {
    try {
      setLoading(true)

      console.log('=== DEBUG: Fetching campaigns ===')
      console.log('NGO User ID:', ngoUserId)

      // First, let's check ALL campaigns to see what's in the database
      const { data: allCampaigns, error: allError } = await supabase
        .from('campaigns')
        .select('id, title, ngo_user_id, ngo, organizer')

      console.log('All campaigns in database:', allCampaigns)
      console.log('Campaigns with ngo_user_id:', allCampaigns?.filter(c => c.ngo_user_id))

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('ngo_user_id', ngoUserId)
        .order('updated_at', { ascending: false })

      if (error) throw error

      setCampaigns(data || [])

      // Calculate statistics
      const totalRaised = data.reduce((sum, campaign) =>
        sum + (parseFloat(campaign.raised) || 0), 0)
      const totalDonors = data.reduce((sum, campaign) =>
        sum + (campaign.donors || 0), 0)

      setStats({
        totalRaised,
        activeCampaigns: data.length,
        totalDonors
      })

      setLoading(false)
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      setLoading(false)
    }
  }

  const getAllUpdates = () => {
    const updates = []
    campaigns.forEach(campaign => {
      if (campaign.updates && Array.isArray(campaign.updates)) {
        campaign.updates.forEach((update, index) => {
          updates.push({
            ...update,
            campaign_id: campaign.id,
            campaign_title: campaign.title,
            update_index: index
          })
        })
      }
    })
    return updates.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  const addUpdate = async (campaignId, newUpdate) => {
    try {
      const campaign = campaigns.find(c => c.id === campaignId)
      if (!campaign) return

      const updateWithDate = {
        id: Date.now().toString(),
        ...newUpdate,
        author: ngoInfo.org_name || 'NGO',
        date: new Date().toISOString()
      }

      const updatedUpdates = [...(campaign.updates || []), updateWithDate]

      const { error } = await supabase
        .from('campaigns')
        .update({ updates: updatedUpdates })
        .eq('id', campaignId)

      if (error) throw error

      await fetchCampaigns(ngoInfo.id)
      setIsAddUpdateOpen(false)
    } catch (error) {
      console.error('Error adding update:', error)
      alert('Failed to add update.')
    }
  }

  const updateCampaignUpdate = async (campaignId, updateIndex, updatedUpdate) => {
    try {
      const campaign = campaigns.find(c => c.id === campaignId)
      if (!campaign) return

      const updatedUpdates = [...(campaign.updates || [])]
      updatedUpdates[updateIndex] = {
        ...updatedUpdate,
        date: updatedUpdates[updateIndex].date
      }

      const { error } = await supabase
        .from('campaigns')
        .update({ updates: updatedUpdates })
        .eq('id', campaignId)

      if (error) throw error

      await fetchCampaigns(ngoInfo.id)
      setIsEditUpdateOpen(false)
      setSelectedUpdate(null)
    } catch (error) {
      console.error('Error updating update:', error)
      alert('Failed to update post.')
    }
  }

  const deleteUpdate = async (campaignId, updateIndex) => {
    if (!confirm('Are you sure you want to delete this update?')) return

    try {
      const campaign = campaigns.find(c => c.id === campaignId)
      if (!campaign) return

      const updatedUpdates = (campaign.updates || []).filter((_, index) => index !== updateIndex)

      const { error } = await supabase
        .from('campaigns')
        .update({ updates: updatedUpdates })
        .eq('id', campaignId)

      if (error) throw error

      await fetchCampaigns(ngoInfo.id)
    } catch (error) {
      console.error('Error deleting update:', error)
      alert('Failed to delete update.')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">NGO Dashboard</h1>
          <p className="text-gray-500">
            Welcome, <span className="font-semibold text-gray-700">{ngoInfo?.org_name || 'Organization'}</span>
          </p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all text-white">
          <Link href="/ngo/campaigns/create/payment">
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1.5 rounded-lg h-12 shadow-sm border border-gray-200">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all duration-200 rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="campaigns"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all duration-200 rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Campaigns
          </TabsTrigger>
          <TabsTrigger
            value="updates"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all duration-200 rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Updates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Total Raised</CardTitle>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">RM {stats.totalRaised.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">Across all campaigns</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Active Campaigns</CardTitle>
                <div className="p-2 bg-green-50 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.activeCampaigns}</div>
                <p className="text-xs text-gray-500 mt-1">Currently running</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Total Donors</CardTitle>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.totalDonors}</div>
                <p className="text-xs text-gray-500 mt-1">Unique contributors</p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-xl">Campaign Summary</CardTitle>
              <CardDescription>Overview of your active campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No campaigns yet. Create your first campaign to get started!</p>
                  <Button className="mt-4" asChild>
                    <Link href="/ngo/campaigns/create/payment">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Campaign
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.slice(0, 5).map((campaign) => {
                    const progress = campaign.goal > 0 ?
                      Math.round(((parseFloat(campaign.raised) || 0) / parseFloat(campaign.goal)) * 100) : 0
                    return (
                      <div key={campaign.id} className="flex items-center gap-4 border-b pb-4 last:border-0">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{campaign.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={progress} className="w-32 h-2" />
                            <span className="text-xs text-gray-500">{progress}%</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">RM {(parseFloat(campaign.raised) || 0).toLocaleString()}</p>
                          <p className="text-xs text-gray-500">of RM {(parseFloat(campaign.goal) || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          {campaigns.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500 mb-4">No campaigns yet. Create your first campaign to get started!</p>
                <Button asChild>
                  <Link href="/ngo/campaigns/create/payment">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => {
                const progress = campaign.goal > 0 ?
                  Math.round(((parseFloat(campaign.raised) || 0) / parseFloat(campaign.goal)) * 100) : 0
                const daysLeft = campaign.target_date ?
                  Math.max(0, Math.ceil((new Date(campaign.target_date) - new Date()) / (1000 * 60 * 60 * 24))) : 0
                return (
                  <Card key={campaign.id} className="hover:shadow-xl transition-all duration-200 border-l-4 border-l-blue-500">
                    {campaign.image_url ? (
                      <div className="relative h-40 overflow-hidden bg-gray-100">
                        <Image
                          src={campaign.image_url}
                          alt={campaign.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <div className="text-gray-400 text-sm">No image available</div>
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{campaign.title}</CardTitle>
                          <CardDescription className="line-clamp-2 mt-1">{campaign.description}</CardDescription>
                        </div>
                        <Badge className={
                          campaign.urgency === 'critical' ? 'bg-red-600' :
                          campaign.urgency === 'high' || campaign.urgency === 'urgent' ? 'bg-amber-600' :
                          'bg-blue-600'
                        }>
                          {campaign.urgency || 'Active'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress Section */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold text-blue-600">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span className="font-bold text-gray-900">RM {(parseFloat(campaign.raised) || 0).toLocaleString()}</span>
                          <span className="text-gray-500">of RM {(parseFloat(campaign.goal) || 0).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-purple-600" />
                          <div>
                            <p className="text-xs text-gray-500">Donors</p>
                            <p className="text-sm font-semibold">{campaign.donors || 0}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-orange-600" />
                          <div>
                            <p className="text-xs text-gray-500">Days Left</p>
                            <p className="text-sm font-semibold">{daysLeft}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCampaign(campaign)
                            setIsCampaignDetailOpen(true)
                          }}
                          className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-colors"
                        >
                          <Link href={`/ngo/campaigns/${campaign.id}/edit`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCampaign(campaign)
                            setIsCampaignAnalyticsOpen(true)
                          }}
                          className="hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 transition-colors"
                        >
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Analytics
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCampaign(campaign)
                            setIsAddUpdateOpen(true)
                          }}
                          className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 transition-colors"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Update
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="updates" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Campaign Updates</h3>
              <p className="text-sm text-gray-500">Share progress and updates with your donors</p>
            </div>
            <Dialog open={isAddUpdateOpen} onOpenChange={setIsAddUpdateOpen}>
              <DialogTrigger asChild>
                <Button disabled={campaigns.length === 0} className="bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Update
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>Post Campaign Update</DialogTitle>
                  <DialogDescription>Share news and progress with your donors</DialogDescription>
                </DialogHeader>
                <AddUpdateForm
                  campaigns={campaigns}
                  selectedCampaignId={selectedCampaign?.id}
                  onClose={() => {
                    setIsAddUpdateOpen(false)
                    setSelectedCampaign(null)
                  }}
                  onAdd={addUpdate}
                />
              </DialogContent>
            </Dialog>
          </div>

          {getAllUpdates().length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">No updates posted yet. Share your campaign progress with donors.</p>
                {campaigns.length === 0 && (
                  <p className="text-sm text-gray-400">Create a campaign first before posting updates.</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {getAllUpdates().map((update, idx) => (
                <Card key={idx} className="shadow-md hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{update.title}</CardTitle>
                        <CardDescription>
                          {update.campaign_title} • {new Date(update.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">Published</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap">
                      {update.description}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUpdate({ ...update })
                          setIsEditUpdateOpen(true)
                        }}
                        className="hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-colors"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteUpdate(update.campaign_id, update.update_index)}
                        className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                      <Button size="sm" variant="outline" asChild className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors">
                        <Link href={`/campaigns/${update.campaign_id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Public
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Dialog open={isEditUpdateOpen} onOpenChange={setIsEditUpdateOpen}>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Edit Campaign Update</DialogTitle>
                <DialogDescription>Update your campaign post</DialogDescription>
              </DialogHeader>
              {selectedUpdate && (
                <EditUpdateForm
                  update={selectedUpdate}
                  onClose={() => {
                    setIsEditUpdateOpen(false)
                    setSelectedUpdate(null)
                  }}
                  onUpdate={(updatedUpdate) => updateCampaignUpdate(selectedUpdate.campaign_id, selectedUpdate.update_index, updatedUpdate)}
                />
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>

      {/* Campaign Detail Sheet */}
      <Sheet open={isCampaignDetailOpen} onOpenChange={setIsCampaignDetailOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-white p-4">
          {selectedCampaign && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedCampaign.title}</SheetTitle>
                <SheetDescription>
                  Campaign Details & Overview
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 py-6">
                {/* Campaign Image */}
                {selectedCampaign.image_url && (
                  <div className="relative rounded-lg overflow-hidden h-64">
                    <Image
                      src={selectedCampaign.image_url}
                      alt={selectedCampaign.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <DollarSign className="h-8 w-8 mx-auto text-green-600 mb-2" />
                        <p className="text-2xl font-bold text-green-600">
                          RM {(parseFloat(selectedCampaign.raised) || 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">Raised</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Target className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                        <p className="text-2xl font-bold text-blue-600">
                          RM {(parseFloat(selectedCampaign.goal) || 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">Goal</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Users className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                        <p className="text-2xl font-bold text-purple-600">
                          {selectedCampaign.donors || 0}
                        </p>
                        <p className="text-sm text-gray-500">Donors</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <TrendingUp className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                        <p className="text-2xl font-bold text-orange-600">
                          {selectedCampaign.goal > 0 ? Math.round(((parseFloat(selectedCampaign.raised) || 0) / parseFloat(selectedCampaign.goal)) * 100) : 0}%
                        </p>
                        <p className="text-sm text-gray-500">Progress</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Campaign Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Description</p>
                      <p className="text-sm mt-1">{selectedCampaign.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Location</p>
                        <p className="text-sm mt-1">{selectedCampaign.location || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Disaster Type</p>
                        <p className="text-sm mt-1 capitalize">{selectedCampaign.disaster || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Urgency</p>
                        <Badge className={
                          selectedCampaign.urgency === 'critical' ? 'bg-red-600' :
                          selectedCampaign.urgency === 'high' || selectedCampaign.urgency === 'urgent' ? 'bg-amber-600' :
                          'bg-blue-600'
                        }>
                          {selectedCampaign.urgency || 'Active'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Beneficiaries</p>
                        <p className="text-sm mt-1">{selectedCampaign.beneficiaries || 0} families</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link href={`/ngo/campaigns/${selectedCampaign.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Campaign
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/campaigns/${selectedCampaign.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Public Page
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Campaign Analytics Sheet */}
      <Sheet open={isCampaignAnalyticsOpen} onOpenChange={setIsCampaignAnalyticsOpen}>
        <SheetContent className="bg-white w-full sm:max-w-2xl overflow-y-auto">
          {selectedCampaign && (
            <>
              <SheetHeader>
                <SheetTitle>Campaign Analytics</SheetTitle>
                <SheetDescription>
                  {selectedCampaign.title}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 py-6">
                {/* Performance Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Performance Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Funding Progress</span>
                        <span className="text-sm text-gray-500">
                          {selectedCampaign.goal > 0 ? Math.round(((parseFloat(selectedCampaign.raised) || 0) / parseFloat(selectedCampaign.goal)) * 100) : 0}%
                        </span>
                      </div>
                      <Progress
                        value={selectedCampaign.goal > 0 ? ((parseFloat(selectedCampaign.raised) || 0) / parseFloat(selectedCampaign.goal)) * 100 : 0}
                        className="h-3"
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">
                          RM {(parseFloat(selectedCampaign.raised) || 0).toLocaleString()} raised
                        </span>
                        <span className="text-xs text-gray-500">
                          RM {(parseFloat(selectedCampaign.goal) - parseFloat(selectedCampaign.raised) || 0).toLocaleString()} remaining
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Avg Donation</p>
                        <p className="text-lg font-bold text-blue-600">
                          RM {selectedCampaign.donors > 0 ? Math.round(parseFloat(selectedCampaign.raised) / selectedCampaign.donors).toLocaleString() : 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Total Donors</p>
                        <p className="text-lg font-bold text-purple-600">
                          {selectedCampaign.donors || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Days Left</p>
                        <p className="text-lg font-bold text-orange-600">
                          {selectedCampaign.target_date ?
                            Math.max(0, Math.ceil((new Date(selectedCampaign.target_date) - new Date()) / (1000 * 60 * 60 * 24)))
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Campaign Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Campaign Started</p>
                        <p className="text-xs text-gray-500">
                          {selectedCampaign.start_date ? new Date(selectedCampaign.start_date).toLocaleDateString('en-MY', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Current Progress</p>
                        <p className="text-xs text-gray-500">
                          {selectedCampaign.goal > 0 ? Math.round(((parseFloat(selectedCampaign.raised) || 0) / parseFloat(selectedCampaign.goal)) * 100) : 0}% of goal achieved
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Target Date</p>
                        <p className="text-xs text-gray-500">
                          {selectedCampaign.target_date ? new Date(selectedCampaign.target_date).toLocaleDateString('en-MY', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCampaignAnalyticsOpen(false)
                      setIsAddUpdateOpen(true)
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Post Update
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                  >
                    <Link href={`/ngo/campaigns/${selectedCampaign.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Campaign
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

// Form Components
function AddUpdateForm({ campaigns, selectedCampaignId, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    title: '',
    campaign_id: selectedCampaignId || '',
    description: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title || !formData.campaign_id || !formData.description) {
      alert('Please fill in all required fields')
      return
    }

    onAdd(formData.campaign_id, {
      title: formData.title,
      description: formData.description
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Campaign *</Label>
        <Select value={formData.campaign_id} onValueChange={(value) => setFormData({ ...formData, campaign_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select campaign" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {campaigns.map(campaign => (
              <SelectItem key={campaign.id} value={campaign.id}>{campaign.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Update Title *</Label>
        <Input
          placeholder="e.g., Relief Distribution Complete"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Description *</Label>
        <Textarea
          placeholder="Share details about your campaign progress..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          rows={6}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Post Update</Button>
      </div>
    </form>
  )
}

function EditUpdateForm({ update, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    title: update.title || '',
    description: update.description || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title || !formData.description) {
      alert('Please fill in all required fields')
      return
    }

    onUpdate({
      title: formData.title,
      description: formData.description
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Update Title *</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Description *</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          rows={6}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Update Post</Button>
      </div>
    </form>
  )
}