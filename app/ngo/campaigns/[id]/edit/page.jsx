"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Plus, Trash2, Upload, MapPin, Calendar, Users, DollarSign, Package, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import MediaUploader from "@/components/campaign/MediaUploader"

export default function EditCampaignPage({ params }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [user, setUser] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    // Basic Information
    title: "",
    description: "",
    longDescription: "",
    disaster: "",
    urgency: "",
    state: "",
    location: "",
    
    // Campaign Details
    startDate: "",
    targetDate: "",
    goal: "",
    beneficiaries: "",
    
    // Media (Legacy)
    image: null,
    imagePreview: null,
    existingImage: null,

    // New Media Array
    media: [],
    existingMedia: [],

    // Financial Breakdown
    financialBreakdown: []
  })

  const [mediaToDelete, setMediaToDelete] = useState([])

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true)
        setError(null)

        const supabase = createClient()
        
        // No authentication required for now
        setUser({ id: null, email: 'anonymous' })

        const { data, error } = await supabase
          .from("campaigns")
          .select("*")
          .eq("id", params.id)
          .single()

        if (error) throw error

        if (data) {
          // Fetch existing media
          const { data: mediaData, error: mediaError } = await supabase
            .from('campaign_media')
            .select('*')
            .eq('campaign_id', params.id)
            .order('display_order', { ascending: true })

          const existingMedia = mediaData || []

          setFormData({
            title: data.title || "",
            description: data.description || "",
            longDescription: data.long_description || "",
            disaster: data.disaster || "",
            urgency: data.urgency || "",
            state: data.state || "",
            location: data.location || "",
            startDate: data.start_date || "",
            targetDate: data.target_date || "",
            goal: data.goal?.toString() || "",
            beneficiaries: data.beneficiaries?.toString() || "",
            existingImage: data.image_url,
            existingMedia: existingMedia,
            media: existingMedia.map(m => ({
              id: m.id,
              preview: m.media_url,
              media_url: m.media_url,
              type: m.media_type,
              name: m.file_name,
              size: m.file_size,
              isPrimary: m.is_primary,
              displayOrder: m.display_order,
              existing: true
            })),
            financialBreakdown: data.financial_breakdown || [
              { category: "Emergency Supplies", allocated: "", spent: "0" },
              { category: "Transportation", allocated: "", spent: "0" },
              { category: "Administrative", allocated: "", spent: "0" }
            ]
          })
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
  }, [params.id])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFinancialBreakdownChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      financialBreakdown: prev.financialBreakdown.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const addFinancialCategory = () => {
    setFormData(prev => ({
      ...prev,
      financialBreakdown: [...prev.financialBreakdown, { category: "", allocated: "", spent: "0" }]
    }))
  }

  const removeFinancialCategory = (index) => {
    setFormData(prev => ({
      ...prev,
      financialBreakdown: prev.financialBreakdown.filter((_, i) => i !== index)
    }))
  }


  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }))
    }
  }

  const validateForm = () => {
    const required = [
      'title', 'description', 'disaster', 'urgency', 'state', 
      'location', 'startDate', 'targetDate', 'goal', 'beneficiaries'
    ]
    
    for (const field of required) {
      if (!formData[field]) {
        setError(`Please fill in the ${field} field`)
        return false
      }
    }

    if (isNaN(Number(formData.goal)) || Number(formData.goal) <= 0) {
      setError("Funding goal must be a positive number")
      return false
    }

    if (isNaN(Number(formData.beneficiaries)) || Number(formData.beneficiaries) <= 0) {
      setError("Number of beneficiaries must be a positive number")
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    setError("")

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    try {
      const supabase = createClient()

      // Handle media updates
      const uploadedMedia = []
      let primaryImageUrl = formData.existingImage

      // Track deleted media for removal from storage and database
      const existingMediaIds = formData.existingMedia.map(m => m.id)
      const currentMediaIds = formData.media.filter(m => m.existing && m.id).map(m => m.id)
      const deletedMediaIds = existingMediaIds.filter(id => !currentMediaIds.includes(id))

      // Delete removed media from database and storage
      if (deletedMediaIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('campaign_media')
          .delete()
          .in('id', deletedMediaIds)

        if (deleteError) {
          console.error('Error deleting media:', deleteError)
        }
      }

      // Upload new media files
      const newMedia = formData.media.filter(m => !m.existing && m.file)
      for (let i = 0; i < newMedia.length; i++) {
        const mediaItem = newMedia[i]

        try {
          const fileExt = mediaItem.file.name.split('.').pop()
          const timestamp = Date.now()
          const fileName = `${timestamp}_${i}.${fileExt}`

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('campaign-images')
            .upload(fileName, mediaItem.file, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) {
            console.warn(`Media upload ${i + 1} failed:`, uploadError)
            continue
          }

          const { data: { publicUrl } } = supabase.storage
            .from('campaign-images')
            .getPublicUrl(fileName)

          uploadedMedia.push({
            campaign_id: params.id,
            media_url: publicUrl,
            media_type: mediaItem.type,
            file_name: mediaItem.file.name,
            file_size: mediaItem.file.size,
            mime_type: mediaItem.file.type,
            display_order: mediaItem.displayOrder || i,
            is_primary: mediaItem.isPrimary || false
          })

          if (mediaItem.isPrimary) {
            primaryImageUrl = publicUrl
          }
        } catch (uploadError) {
          console.warn(`Error uploading media ${i + 1}:`, uploadError)
        }
      }

      // Insert new media into database
      if (uploadedMedia.length > 0) {
        const { error: mediaError } = await supabase
          .from('campaign_media')
          .insert(uploadedMedia)

        if (mediaError) {
          console.error('Failed to insert campaign media:', mediaError)
        }
      }

      // Update existing media (for primary flag and order changes)
      const existingMediaToUpdate = formData.media.filter(m => m.existing && m.id)
      for (const mediaItem of existingMediaToUpdate) {
        const { error: updateError } = await supabase
          .from('campaign_media')
          .update({
            is_primary: mediaItem.isPrimary,
            display_order: mediaItem.displayOrder
          })
          .eq('id', mediaItem.id)

        if (updateError) {
          console.error('Error updating media:', updateError)
        }

        if (mediaItem.isPrimary) {
          primaryImageUrl = mediaItem.media_url
        }
      }

      // Fallback to legacy single image upload if provided
      let imageUrl = primaryImageUrl
      if (formData.image) {
        const fileExt = formData.image.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('campaign-images')
          .upload(fileName, formData.image)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('campaign-images')
          .getPublicUrl(fileName)

        imageUrl = publicUrl
      }

      // Update campaign
      const { error: updateError } = await supabase
        .from("campaigns")
        .update({
          title: formData.title,
          description: formData.description,
          long_description: formData.longDescription,
          goal: Number(formData.goal),
          urgency: formData.urgency,
          disaster: formData.disaster,
          state: formData.state,
          location: formData.location,
          start_date: formData.startDate,
          target_date: formData.targetDate,
          beneficiaries: Number(formData.beneficiaries),
          image_url: imageUrl,
          financial_breakdown: formData.financialBreakdown.filter(item => item.category && item.allocated)
        })
        .eq("id", params.id)

      if (updateError) throw updateError

      // Redirect to campaign detail page
      router.push(`/campaigns/${params.id}`)
    } catch (e) {
      setError(e.message || "Failed to update campaign")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 md:px-6 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-500">Loading campaign data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 md:px-6 py-8">
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

  return (
    <div className="container mx-auto max-w-4xl px-4 md:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors border-2">
            <Link href="/ngo/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Campaign</h1>
            <p className="text-gray-600">Update your disaster relief campaign details</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg shadow-md animate-pulse">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1.5 rounded-lg h-14 shadow-sm border border-gray-200">
          <TabsTrigger
            value="basic"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all duration-200 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger
            value="details"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all duration-200 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Campaign Details
          </TabsTrigger>
          <TabsTrigger
            value="finances"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all duration-200 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" />
            Finances
          </TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card className="shadow-lg border-l-4 border-l-blue-500 hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
              <CardTitle className="text-xl flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                Basic Information
              </CardTitle>
              <CardDescription>Essential details about your campaign</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Campaign Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Pahang Flood Relief 2024"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="disaster">Disaster Type *</Label>
                  <Select value={formData.disaster} onValueChange={(value) => handleInputChange('disaster', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select disaster type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flood">Flood</SelectItem>
                      <SelectItem value="landslide">Landslide</SelectItem>
                      <SelectItem value="drought">Drought</SelectItem>
                      <SelectItem value="fire">Fire</SelectItem>
                      <SelectItem value="earthquake">Earthquake</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the situation and how donations will help"
                  className="min-h-[100px]"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longDescription">Detailed Description</Label>
                <Textarea
                  id="longDescription"
                  placeholder="Comprehensive description with background, impact, and detailed plans"
                  className="min-h-[200px]"
                  value={formData.longDescription}
                  onChange={(e) => handleInputChange('longDescription', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Johor">Johor</SelectItem>
                      <SelectItem value="Kedah">Kedah</SelectItem>
                      <SelectItem value="Kelantan">Kelantan</SelectItem>
                      <SelectItem value="Kuala Lumpur">Kuala Lumpur</SelectItem>
                      <SelectItem value="Labuan">Labuan</SelectItem>
                      <SelectItem value="Malacca">Malacca</SelectItem>
                      <SelectItem value="Negeri Sembilan">Negeri Sembilan</SelectItem>
                      <SelectItem value="Pahang">Pahang</SelectItem>
                      <SelectItem value="Penang">Penang</SelectItem>
                      <SelectItem value="Perak">Perak</SelectItem>
                      <SelectItem value="Perlis">Perlis</SelectItem>
                      <SelectItem value="Putrajaya">Putrajaya</SelectItem>
                      <SelectItem value="Sabah">Sabah</SelectItem>
                      <SelectItem value="Sarawak">Sarawak</SelectItem>
                      <SelectItem value="Selangor">Selangor</SelectItem>
                      <SelectItem value="Terengganu">Terengganu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Specific Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Kuantan, Pahang"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency Level *</Label>
                <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaign Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card className="shadow-lg border-l-4 border-l-green-500 hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-white">
              <CardTitle className="text-xl flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                Campaign Details
              </CardTitle>
              <CardDescription>Timeline and target information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetDate">Target End Date *</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => handleInputChange('targetDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goal">Funding Goal (RM) *</Label>
                  <Input
                    id="goal"
                    type="number"
                    placeholder="100000"
                    value={formData.goal}
                    onChange={(e) => handleInputChange('goal', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beneficiaries">Number of Beneficiaries *</Label>
                  <Input
                    id="beneficiaries"
                    type="number"
                    placeholder="150"
                    value={formData.beneficiaries}
                    onChange={(e) => handleInputChange('beneficiaries', e.target.value)}
                  />
                </div>
              </div>

              <MediaUploader
                media={formData.media}
                onChange={(media) => handleInputChange('media', media)}
                maxFiles={10}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Breakdown Tab */}
        <TabsContent value="finances" className="space-y-6">
          <Card className="shadow-lg border-l-4 border-l-purple-500 hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-white">
              <CardTitle className="text-xl flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                Financial Breakdown
              </CardTitle>
              <CardDescription>How will the funds be allocated?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.financialBreakdown.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border-2 border-purple-100 rounded-lg bg-purple-50/30 hover:border-purple-300 transition-colors">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      placeholder="e.g., Emergency Supplies"
                      value={item.category}
                      onChange={(e) => handleFinancialBreakdownChange(index, 'category', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Allocated Amount (RM)</Label>
                    <Input
                      type="number"
                      placeholder="50000"
                      value={item.allocated}
                      onChange={(e) => handleFinancialBreakdownChange(index, 'allocated', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Spent Amount (RM)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="0"
                        value={item.spent}
                        onChange={(e) => handleFinancialBreakdownChange(index, 'spent', e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFinancialCategory(index)}
                        disabled={formData.financialBreakdown.length === 1}
                        className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addFinancialCategory}
                className="w-full hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 transition-colors border-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Financial Category
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t-2">
        <Button variant="outline" className="bg-red-500 hover:bg-red-600 text-white border-red-600 hover:border-red-700 shadow-md hover:shadow-lg transition-all" asChild>
          <Link href="/ngo/dashboard">Cancel</Link>
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              const tabs = ['basic', 'details', 'finances']
              const currentIndex = tabs.indexOf(activeTab)
              if (currentIndex > 0) {
                setActiveTab(tabs[currentIndex - 1])
              }
            }}
            disabled={activeTab === 'basic'}
            className="hover:bg-gray-100 hover:border-gray-400 transition-colors border-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </Button>
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            onClick={() => {
              const tabs = ['basic', 'details', 'finances']
              const currentIndex = tabs.indexOf(activeTab)
              if (currentIndex < tabs.length - 1) {
                setActiveTab(tabs[currentIndex + 1])
              } else {
                handleSubmit()
              }
            }}
            disabled={submitting}
          >
            {submitting ? "Updating..." : activeTab === 'finances' ? "Update Campaign" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  )
}
