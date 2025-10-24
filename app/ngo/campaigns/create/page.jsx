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
import { ArrowLeft, Plus, Trash2, Upload, MapPin, Calendar, Users, DollarSign, Package } from "lucide-react"
import Link from "next/link"

export default function CreateCampaignPage() {
  const supabase = createClient();
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  //const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ngoInfo, setNgoInfo] = useState(null)

  // Check NGO authentication on mount
  useEffect(() => {
    const checkNGOSession = async () => {
      try {
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
    urgency: "",
    state: "",
    location: "",
    
    // Campaign Details
    startDate: "",
    targetDate: "",
    goal: "",
    beneficiaries: "",
    
    // Media
    image: null,
    imagePreview: null,
    
    // Financial Breakdown
    financialBreakdown: [
      { category: "Emergency Supplies", allocated: "", spent: "0" },
      { category: "Transportation", allocated: "", spent: "0" },
      { category: "Administrative", allocated: "", spent: "0" }
    ],
    
    // Needed Items
    neededItems: [
      { name: "", quantity: "", priority: "medium", description: "" }
    ]
  })




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

  //Adding new row to the table
  const addFinancialCategory = () => {
    setFormData(prev => ({
      ...prev,
      financialBreakdown: [...prev.financialBreakdown, { category: "", allocated: "", spent: "0" }]
    }))
  }

  //Remove row from the table
  const removeFinancialCategory = (index) => {
    setFormData(prev => ({
      ...prev,
      financialBreakdown: prev.financialBreakdown.filter((_, i) => i !== index)
    }))
  }

  const handleNeededItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      neededItems: prev.neededItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  //Add new empty array
  const addNeededItem = () => {
    setFormData(prev => ({
      ...prev,
      neededItems: [...prev.neededItems, { name: "", quantity: "", priority: "medium", description: "" }]
    }))
  }

  //Removes a needed item
  const removeNeededItem = (index) => {
    setFormData(prev => ({
      ...prev,
      neededItems: prev.neededItems.filter((_, i) => i !== index)
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


      // Upload image to bucket (optional - continue if upload fails)
      let imageUrl = null 
      if (formData.image) {
        try {
          const fileExt = formData.image.name.split('.').pop() // get file extension
          const fileName = `${Date.now()}.${fileExt}` // create unique file name using timestamp
          console.log('Attempting to upload image:', fileName)
          
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
        urgency: formData.urgency,
        disaster: formData.disaster,
        state: formData.state,
        location: formData.location,
        start_date: formData.startDate,
        target_date: formData.targetDate,
        beneficiaries: Number(formData.beneficiaries),
        image_url: imageUrl,
        verified: false,
        financial_breakdown: formData.financialBreakdown.filter(item => item.category && item.allocated),
        needed_items: formData.neededItems.filter(item => item.name && item.quantity),
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
          <Button variant="outline" size="sm" asChild>
            <Link href="/ngo/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Campaign</h1>
            <p className="text-gray-500">Set up a comprehensive disaster relief campaign</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 border-2">
          <TabsTrigger 
            value="basic" 
            className="data-[state=active]:bg-gray-400 data-[state=active]:text-black"
          >
              Basic Info
          </TabsTrigger>

          <TabsTrigger  
            value="details"
            className="data-[state=active]:bg-gray-400 data-[state=active]:text-black"
          >
            Campaign Details
          </TabsTrigger>

          <TabsTrigger 
            value="finances"
            className="data-[state=active]:bg-gray-400 data-[state=active]:text-black"
          >
              Finances
          </TabsTrigger>

          <TabsTrigger 
            value="items"
            className="data-[state=active]:bg-gray-400 data-[state=active]:text-black"
          >
              Needed Items
          </TabsTrigger>
          
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
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
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
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

              <div className="space-y-2">
                <Label htmlFor="image">Campaign Image</Label>
                <div className="space-y-4">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {formData.imagePreview && (
                    <div className="relative w-full h-48">
                      <img
                        src={formData.imagePreview}
                        alt="Campaign preview"
                        className="w-full h-full object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Breakdown Tab */}
        <TabsContent value="finances" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Breakdown</CardTitle>
              <CardDescription>How will the funds be allocated?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.financialBreakdown.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
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
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Financial Category
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Needed Items Tab */}
        <TabsContent value="items" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Needed Items</CardTitle>
              <CardDescription>What physical items do you need from donors?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.neededItems.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label>Item Name</Label>
                    <Input
                      placeholder="e.g., Blankets, Water Bottles"
                      value={item.name}
                      onChange={(e) => handleNeededItemChange(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity Needed</Label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={item.quantity}
                      onChange={(e) => handleNeededItemChange(index, 'quantity', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={item.priority} onValueChange={(value) => handleNeededItemChange(index, 'priority', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Item specifications"
                        value={item.description}
                        onChange={(e) => handleNeededItemChange(index, 'description', e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeNeededItem(index)}
                        disabled={formData.neededItems.length === 1}
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
                onClick={addNeededItem}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Needed Item
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t">
        <Button variant="outline" className="bg-red-500" asChild>
          <Link href="/ngo/dashboard">Cancel</Link>
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const tabs = ['basic', 'details', 'finances', 'items']
              const currentIndex = tabs.indexOf(activeTab)
              if (currentIndex > 0) {
                setActiveTab(tabs[currentIndex - 1])
              }
            }}
            disabled={activeTab === 'basic'}
          >
            Previous
          </Button>
          <Button
            className="bg-green-400"
            onClick={() => {
              const tabs = ['basic', 'details', 'finances', 'items']
              const currentIndex = tabs.indexOf(activeTab)
              if (currentIndex < tabs.length - 1) {
                setActiveTab(tabs[currentIndex + 1])
              } else {
                handleSubmit()
              }
            }}
            disabled={submitting}
          >
            {submitting ? "Creating..." : activeTab === 'items' ? "Create Campaign" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  )
}
