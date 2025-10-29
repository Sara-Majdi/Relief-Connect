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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Plus, Edit, Trash2, Eye, DollarSign, Package, Users, Clock, CheckCircle, AlertTriangle, BarChart3, Loader2 } from "lucide-react"
import Link from "next/link"

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
  const [stats, setStats] = useState({
    totalRaised: 0,
    activeCampaigns: 0,
    totalDonors: 0,
    itemsReceived: 0
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

      console.log('Filtered campaigns for NGO:', data)
      console.log('Query error:', error)

      if (error) throw error

      setCampaigns(data || [])

      // Calculate statistics
      const totalRaised = data.reduce((sum, campaign) =>
        sum + (parseFloat(campaign.raised) || 0), 0)
      const totalDonors = data.reduce((sum, campaign) =>
        sum + (campaign.donors || 0), 0)

      let totalNeeded = 0
      let totalReceived = 0
      data.forEach(campaign => {
        if (campaign.needed_items && Array.isArray(campaign.needed_items)) {
          campaign.needed_items.forEach(item => {
            totalNeeded += item.needed || 0
            totalReceived += item.received || 0
          })
        }
      })
      const itemsReceivedPercentage = totalNeeded > 0 ?
        Math.round((totalReceived / totalNeeded) * 100) : 0

      setStats({
        totalRaised,
        activeCampaigns: data.length,
        totalDonors,
        itemsReceived: itemsReceivedPercentage
      })

      setLoading(false)
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      setLoading(false)
    }
  }

  const getAllNeededItems = () => {
    const items = []
    campaigns.forEach(campaign => {
      if (campaign.needed_items && Array.isArray(campaign.needed_items)) {
        campaign.needed_items.forEach((item, index) => {
          items.push({
            ...item,
            campaign_id: campaign.id,
            campaign_title: campaign.title,
            item_index: index
          })
        })
      }
    })
    return items
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

  const addNeededItem = async (campaignId, newItem) => {
    try {
      const campaign = campaigns.find(c => c.id === campaignId)
      if (!campaign) return

      const updatedItems = [...(campaign.needed_items || []), newItem]

      const { error } = await supabase
        .from('campaigns')
        .update({ needed_items: updatedItems })
        .eq('id', campaignId)

      if (error) throw error

      await fetchCampaigns(ngoInfo.id)
      setIsAddItemOpen(false)
    } catch (error) {
      console.error('Error adding item:', error)
      alert('Failed to add item. Please try again.')
    }
  }

  const updateNeededItem = async (campaignId, itemIndex, updatedItem) => {
    try {
      const campaign = campaigns.find(c => c.id === campaignId)
      if (!campaign) return

      const updatedItems = [...(campaign.needed_items || [])]
      updatedItems[itemIndex] = updatedItem

      const { error } = await supabase
        .from('campaigns')
        .update({ needed_items: updatedItems })
        .eq('id', campaignId)

      if (error) throw error

      await fetchCampaigns(ngoInfo.id)
      setIsEditItemOpen(false)
      setSelectedItem(null)
    } catch (error) {
      console.error('Error updating item:', error)
      alert('Failed to update item.')
    }
  }

  const deleteNeededItem = async (campaignId, itemIndex) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const campaign = campaigns.find(c => c.id === campaignId)
      if (!campaign) return

      const updatedItems = (campaign.needed_items || []).filter((_, index) => index !== itemIndex)

      const { error } = await supabase
        .from('campaigns')
        .update({ needed_items: updatedItems })
        .eq('id', campaignId)

      if (error) throw error

      await fetchCampaigns(ngoInfo.id)
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item.')
    }
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
        <Button asChild>
          <Link href="/ngo/campaigns/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="items">Needed Items</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">RM {stats.totalRaised.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Across all campaigns</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
                <p className="text-xs text-muted-foreground">Currently running</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDonors}</div>
                <p className="text-xs text-muted-foreground">Unique contributors</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Items Received</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.itemsReceived}%</div>
                <p className="text-xs text-muted-foreground">of requested items</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Summary</CardTitle>
              <CardDescription>Overview of your active campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No campaigns yet. Create your first campaign to get started!</p>
                  <Button className="mt-4" asChild>
                    <Link href="/ngo/campaigns/create">
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
                  <Link href="/ngo/campaigns/create">
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
                return (
                  <Card key={campaign.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{campaign.title}</CardTitle>
                          <CardDescription>{campaign.description?.substring(0, 50)}...</CardDescription>
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
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} />
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">RM {(parseFloat(campaign.raised) || 0).toLocaleString()}</span>
                          <span className="text-gray-500">of RM {(parseFloat(campaign.goal) || 0).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-gray-500">{campaign.donors || 0} donors</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/campaigns/${campaign.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/ngo/campaigns/${campaign.id}/edit`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="items" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Needed Items</h3>
              <p className="text-sm text-gray-500">Manage items needed for your campaigns</p>
            </div>
            <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
              <DialogTrigger asChild>
                <Button disabled={campaigns.length === 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item Request
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>Add Item Request</DialogTitle>
                  <DialogDescription>Add a new item that your campaign needs</DialogDescription>
                </DialogHeader>
                <AddItemForm
                  campaigns={campaigns}
                  onClose={() => setIsAddItemOpen(false)}
                  onAdd={addNeededItem}
                />
              </DialogContent>
            </Dialog>
          </div>

          {getAllNeededItems().length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">No items requested yet. Add items that your campaigns need.</p>
                {campaigns.length === 0 && (
                  <p className="text-sm text-gray-400">Create a campaign first before adding items.</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Needed</TableHead>
                      <TableHead>Received</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getAllNeededItems().map((item, idx) => {
                      const progress = item.needed > 0 ? Math.round((item.received / item.needed) * 100) : 0
                      return (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{item.item}</TableCell>
                          <TableCell>{item.campaign_title}</TableCell>
                          <TableCell>{item.needed}</TableCell>
                          <TableCell>{item.received}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={progress} className="w-16" />
                              <span className="text-sm">{progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              item.priority === 'critical' ? 'bg-red-600' :
                              item.priority === 'high' ? 'bg-amber-600' :
                              item.priority === 'medium' ? 'bg-blue-600' :
                              progress === 100 ? 'bg-green-600' : 'bg-gray-600'
                            }>
                              {progress === 100 ? 'Complete' : item.priority || 'Medium'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedItem({ ...item })
                                  setIsEditItemOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteNeededItem(item.campaign_id, item.item_index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          <Dialog open={isEditItemOpen} onOpenChange={setIsEditItemOpen}>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Edit Item Request</DialogTitle>
                <DialogDescription>Update item details and progress</DialogDescription>
              </DialogHeader>
              {selectedItem && (
                <EditItemForm
                  item={selectedItem}
                  onClose={() => {
                    setIsEditItemOpen(false)
                    setSelectedItem(null)
                  }}
                  onUpdate={(updatedItem) => updateNeededItem(selectedItem.campaign_id, selectedItem.item_index, updatedItem)}
                />
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="updates" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Campaign Updates</h3>
              <p className="text-sm text-gray-500">Share progress and updates with your donors</p>
            </div>
            <Dialog open={isAddUpdateOpen} onOpenChange={setIsAddUpdateOpen}>
              <DialogTrigger asChild>
                <Button disabled={campaigns.length === 0}>
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
                  onClose={() => setIsAddUpdateOpen(false)}
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
                <Card key={idx}>
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
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteUpdate(update.campaign_id, update.update_index)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                      <Button size="sm" variant="outline" asChild>
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
    </div>
  )
}

// Form Components
function AddItemForm({ campaigns, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    item: '',
    campaign_id: '',
    needed: '',
    received: 0,
    priority: 'medium',
    description: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.item || !formData.campaign_id || !formData.needed) {
      alert('Please fill in all required fields')
      return
    }

    const itemData = {
      item: formData.item,
      needed: parseInt(formData.needed),
      received: parseInt(formData.received),
      priority: formData.priority,
      description: formData.description
    }

    onAdd(formData.campaign_id, itemData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Item Name *</Label>
        <Input
          placeholder="e.g., Blankets, Water Bottles"
          value={formData.item}
          onChange={(e) => setFormData({ ...formData, item: e.target.value })}
          required
        />
      </div>

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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Quantity Needed *</Label>
          <Input
            type="number"
            placeholder="100"
            value={formData.needed}
            onChange={(e) => setFormData({ ...formData, needed: e.target.value })}
            required
            min="1"
          />
        </div>
        <div className="space-y-2">
          <Label>Already Received</Label>
          <Input
            type="number"
            placeholder="0"
            value={formData.received}
            onChange={(e) => setFormData({ ...formData, received: e.target.value })}
            min="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Priority</Label>
        <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          placeholder="Describe the item specifications..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Add Item</Button>
      </div>
    </form>
  )
}

function EditItemForm({ item, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    item: item.item || '',
    needed: item.needed || 0,
    received: item.received || 0,
    priority: item.priority || 'medium',
    description: item.description || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.item || !formData.needed) {
      alert('Please fill in all required fields')
      return
    }

    onUpdate({
      item: formData.item,
      needed: parseInt(formData.needed),
      received: parseInt(formData.received),
      priority: formData.priority,
      description: formData.description
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Item Name *</Label>
        <Input
          value={formData.item}
          onChange={(e) => setFormData({ ...formData, item: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Quantity Needed *</Label>
          <Input
            type="number"
            value={formData.needed}
            onChange={(e) => setFormData({ ...formData, needed: e.target.value })}
            required
            min="1"
          />
        </div>
        <div className="space-y-2">
          <Label>Received *</Label>
          <Input
            type="number"
            value={formData.received}
            onChange={(e) => setFormData({ ...formData, received: e.target.value })}
            required
            min="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Priority</Label>
        <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Update Item</Button>
      </div>
    </form>
  )
}

function AddUpdateForm({ campaigns, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    title: '',
    campaign_id: '',
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