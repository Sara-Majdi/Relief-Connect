"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AIInput } from "@/components/ui/ai-input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AITextarea } from "@/components/ui/ai-textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Plus, Trash2, Upload, MapPin, Calendar, Users, DollarSign, Package, TrendingUp } from "lucide-react"
import Link from "next/link"
import ItemAllocationForm from "@/components/campaign/ItemAllocationForm"
import MediaUploader from "@/components/campaign/MediaUploader"

export default function CreateCampaignPage() {
  const supabase = createClient();
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  //const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ngoInfo, setNgoInfo] = useState(null)

  // Check NGO authentication and payment verification on mount
  useEffect(() => {
    const checkNGOSession = async () => {
      try {
        // First, verify payment was completed
        const paymentVerified = sessionStorage.getItem('campaign_payment_verified')
        if (!paymentVerified) {
          console.log('No payment verification found, redirecting to payment page')
          router.push('/ngo/campaigns/create/payment')
          return
        }

        // Check NGO authentication
        const response = await fetch('/api/auth/check-session')
        const data = await response.json()

        if (!data.isAuthenticated || !data.user) {
          router.push('/auth/ngo')
          return
        }

        // Save the NGO info in state
        setFormData((prev) => ({
          ...prev,
          ngo_user_id: data.user.id,
          ngo: data.user.org_name
        }))
        setNgoInfo(data.user)
        setLoading(false)
      } catch (error) {
        console.error('Error checking NGO session:', error)
        router.push('/auth/ngo')
      }
    }

    checkNGOSession()
  }, [router])

  // Form state
  const [formData, setFormData] = useState({
    // Basic Information
    title: "",
    description: "",
    longDescription: "",
    disaster: "",
    state: "",
    location: "",
    
    // Campaign Details
    startDate: "",
    targetDate: "",
    goal: "",
    beneficiaries: "",
    
    // Media (Legacy - keep for backwards compatibility)
    image: null,
    imagePreview: null,

    // New Media Array for multiple files
    media: []
  })

  // Fundraising Items (monetary allocation per item)
  const [fundraisingItems, setFundraisingItems] = useState([])

  // AI Helper Functions
  const handleGenerateTitles = async () => {
    try {
      const response = await fetch('/api/ai/generate-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disaster: formData.disaster,
          location: formData.location,
          state: formData.state,
        }),
      });
      const data = await response.json();
      if (data.success) {
        return data.titles;
      }
      throw new Error(data.error || 'Failed to generate titles');
    } catch (error) {
      console.error('Error generating titles:', error);
      setError('Failed to generate AI suggestions. Please try again.');
      return [];
    }
  };

  const handleGenerateDescription = async (type) => {
    try {
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disaster: formData.disaster,
          location: formData.location,
          state: formData.state,
          beneficiaries: formData.beneficiaries,
          goal: formData.goal,
          title: formData.title,
          type,
        }),
      });
      const data = await response.json();
      if (data.success) {
        return data.description;
      }
      throw new Error(data.error || 'Failed to generate description');
    } catch (error) {
      console.error('Error generating description:', error);
      setError('Failed to generate AI content. Please try again.');
      return '';
    }
  };

  const handlePolishCopy = async (text, tone = 'professional') => {
    try {
      const response = await fetch('/api/ai/polish-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          tone,
          context: 'campaign description',
        }),
      });
      const data = await response.json();
      if (data.success) {
        return data.polished;
      }
      throw new Error(data.error || 'Failed to polish copy');
    } catch (error) {
      console.error('Error polishing copy:', error);
      setError('Failed to polish text. Please try again.');
      return text;
    }
  };

  const handleGenerateFundraisingItems = async () => {
    if (!formData.disaster) {
      setError('Please select disaster type first');
      return;
    }

    try {
      const response = await fetch('/api/ai/generate-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disaster: formData.disaster,
          count: 5,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setFundraisingItems(data.items);
      } else {
        throw new Error(data.error || 'Failed to generate items');
      }
    } catch (error) {
      console.error('Error generating fundraising items:', error);
      setError('Failed to generate fundraising items. Please try again.');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file, //stores uploaded image as file
        imagePreview: URL.createObjectURL(file) //preview of img
      }))
    }
  }

  //Check to see all required fill has been filled
  const validateForm = () => {
    const required = [
      'title', 'description', 'disaster', 'state',
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

      // Upload multiple media files to bucket
      const uploadedMedia = []
      let primaryImageUrl = null

      console.log('formData.media:', formData.media)
      console.log('formData.media length:', formData.media?.length)

      if (formData.media && formData.media.length > 0) {
        console.log(`Processing ${formData.media.length} media files...`)
        for (let i = 0; i < formData.media.length; i++) {
          const mediaItem = formData.media[i]
          console.log(`Media item ${i}:`, {
            hasFile: !!mediaItem.file,
            type: mediaItem.type,
            name: mediaItem.name,
            isPrimary: mediaItem.isPrimary
          })
          if (!mediaItem.file) {
            console.warn(`Skipping media ${i} - no file property`)
            continue
          }

          try {
            const fileExt = mediaItem.file.name.split('.').pop()
            const timestamp = Date.now()
            const fileName = `${timestamp}_${i}.${fileExt}`

            console.log(`Uploading media ${i + 1}/${formData.media.length}:`, fileName)

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
              media_url: publicUrl,
              media_type: mediaItem.type,
              file_name: mediaItem.file.name,
              file_size: mediaItem.file.size,
              mime_type: mediaItem.file.type,
              display_order: mediaItem.displayOrder || i,
              is_primary: mediaItem.isPrimary || i === 0
            })

            // Set primary image for backward compatibility
            if (mediaItem.isPrimary || i === 0) {
              primaryImageUrl = publicUrl
            }

            console.log(`Media ${i + 1} uploaded successfully:`, publicUrl)
          } catch (uploadError) {
            console.warn(`Error uploading media ${i + 1}:`, uploadError)
          }
        }
      }

      // Fallback to legacy single image upload if no new media
      let imageUrl = primaryImageUrl
      if (!imageUrl && formData.image) {
        try {
          const fileExt = formData.image.name.split('.').pop() // get file extension
          const fileName = `${Date.now()}.${fileExt}` // create unique file name using timestamp
          console.log('Attempting to upload legacy image:', fileName)

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('campaign-images')
            .upload(fileName, formData.image)

          if (uploadError) {
            console.warn('Image upload failed, continuing without image:', uploadError)
            imageUrl = null
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('campaign-images')
              .getPublicUrl(fileName)
            imageUrl = publicUrl
            console.log('Image uploaded successfully:', imageUrl)
          }
        } catch (uploadError) {
          console.warn('Image upload error, continuing without image:', uploadError)
          imageUrl = null
        }
      }


      // Create campaign using NGO user ID from session
      const campaignData = {
        title: formData.title,
        description: formData.description,
        long_description: formData.longDescription,
        goal: Number(formData.goal),
        raised: 0,
        disaster: formData.disaster,
        state: formData.state,
        location: formData.location,
        start_date: formData.startDate,
        target_date: formData.targetDate,
        beneficiaries: Number(formData.beneficiaries),
        image_url: imageUrl,
        verified: false,
        donors: 0,
        ngo_user_id: formData.ngo_user_id, // Use NGO user ID from session
        ngo: formData.ngo
      }

      console.log('Attempting to insert campaign:', campaignData)
      console.log('NGO User ID:', formData.ngo_user_id)
      console.log('NGO Name:', formData.ngo)

      // NGO user is already verified through session authentication
      console.log('NGO user verified through session:', {
        id: formData.ngo_user_id,
        name: formData.ngo
      })

      const { data, error: insertError } = await supabase
        .from("campaigns")
        .insert([campaignData])
        .select()
        .single()

      if (insertError) {
        console.error('Campaign insertion error:', insertError)
        throw insertError
      }

      // Insert campaign media into campaign_media table
      if (uploadedMedia.length > 0) {
        const mediaRecords = uploadedMedia.map(media => ({
          campaign_id: data.id,
          ...media
        }))

        console.log('Attempting to insert media records:', mediaRecords)

        const { data: insertedMedia, error: mediaError } = await supabase
          .from('campaign_media')
          .insert(mediaRecords)
          .select()

        if (mediaError) {
          console.error('Failed to insert campaign media:', mediaError)
          // Continue anyway - media upload is not critical
        } else {
          console.log(`Successfully inserted ${uploadedMedia.length} media files:`, insertedMedia)
        }
      } else {
        console.log('No media to insert - uploadedMedia array is empty')
      }

      // Create fundraising items if any
      if (fundraisingItems.length > 0) {
        for (const item of fundraisingItems) {
          // Skip items without name or target amount
          if (!item.name || !item.target_amount || parseFloat(item.target_amount) <= 0) {
            continue
          }

          try {
            const itemData = {
              campaign_id: data.id,
              name: item.name,
              description: item.description || null,
              target_amount: parseFloat(item.target_amount),
              quantity: item.quantity ? parseInt(item.quantity) : null,
              unit_cost: item.unit_cost ? parseFloat(item.unit_cost) : null,
              priority: item.priority || 'medium',
              category: item.category || null,
              image_url: item.image_url || null,
              display_order: item.display_order || 0,
              current_amount: 0,
              is_active: true
            }

            const { error: itemError } = await supabase
              .from('campaign_items')
              .insert([itemData])

            if (itemError) {
              console.error('Failed to create fundraising item:', item.name, itemError)
            }
          } catch (itemErr) {
            console.error('Error creating fundraising item:', itemErr)
          }
        }
      }

      // Clear payment verification token
      sessionStorage.removeItem('campaign_payment_verified')

      // Redirect to campaign detail page
      router.push(`/campaigns/${data.id}`)
    }
      catch (e) {
      setError(e.message || "Failed to create campaign")
      }
      finally {
      setSubmitting(false)
      }
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 md:px-6 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // No authentication required for now

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
            <h1 className="text-3xl font-bold text-gray-900">Create New Campaign</h1>
            <p className="text-gray-600">Set up a comprehensive disaster relief campaign</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg shadow-md animate-pulse">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1.5 rounded-lg h-14 shadow-sm border border-gray-200">
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
            value="fundraising"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all duration-200 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Fundraising Items
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
              {/* Instructions */}
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">
                  Fill in the disaster type, state, and location first to use the AI title generator.
                </p>
              </div>

              {/* Step 1: Disaster Type, State, Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="disaster">Disaster Type *</Label>
                  <Select value={formData.disaster} onValueChange={(value) => handleInputChange('disaster', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select disaster type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="flood">Flood</SelectItem>
                      <SelectItem value="landslide">Landslide</SelectItem>
                      <SelectItem value="drought">Drought</SelectItem>
                      <SelectItem value="fire">Fire</SelectItem>
                      <SelectItem value="earthquake">Earthquake</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
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

              {/* Step 2: Title with AI Generator */}
              <div className="space-y-2">
                <Label htmlFor="title">Campaign Title *</Label>
                <AIInput
                  id="title"
                  placeholder="e.g., Pahang Flood Relief 2024"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  onGenerate={handleGenerateTitles}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description *</Label>
                <AITextarea
                  id="description"
                  placeholder="Brief description of the situation and how donations will help"
                  className="min-h-[100px]"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  onGenerate={() => handleGenerateDescription('short')}
                  onPolish={handlePolishCopy}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longDescription">Detailed Description</Label>
                <AITextarea
                  id="longDescription"
                  placeholder="Comprehensive description with background, impact, and detailed plans"
                  className="min-h-[200px]"
                  value={formData.longDescription}
                  onChange={(e) => handleInputChange('longDescription', e.target.value)}
                  onGenerate={() => handleGenerateDescription('long')}
                  onPolish={handlePolishCopy}
                />
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

        {/* Fundraising Items Tab */}
        <TabsContent value="fundraising" className="space-y-6">
          <Card className="shadow-lg border-l-4 border-l-green-500 hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    Fundraising Items (Optional)
                  </CardTitle>
                  <CardDescription>
                    Break down your campaign goal into specific items for transparent fundraising.
                    Donors can choose to fund specific items or donate to the general campaign.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateFundraisingItems}
                  disabled={!formData.disaster}
                  className="hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-colors shrink-0"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  AI Suggest Items
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ItemAllocationForm
                campaignGoal={parseFloat(formData.goal) || 0}
                items={fundraisingItems}
                onChange={setFundraisingItems}
              />
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
              const tabs = ['basic', 'details', 'fundraising']
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
            className="bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            onClick={() => {
              const tabs = ['basic', 'details', 'fundraising']
              const currentIndex = tabs.indexOf(activeTab)
              if (currentIndex < tabs.length - 1) {
                setActiveTab(tabs[currentIndex + 1])
              } else {
                handleSubmit()
              }
            }}
            disabled={submitting}
          >
            {submitting ? "Creating..." : activeTab === 'fundraising' ? "Create Campaign" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  )
}
