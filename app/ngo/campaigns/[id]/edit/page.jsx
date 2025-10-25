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
    
    // Media
    image: null,
    imagePreview: null,
    existingImage: null,
    
    // Financial Breakdown
    financialBreakdown: [],
    
    // Needed Items
    neededItems: []
  })

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
            financialBreakdown: data.financial_breakdown || [
              { category: "Emergency Supplies", allocated: "", spent: "0" },
              { category: "Transportation", allocated: "", spent: "0" },
              { category: "Administrative", allocated: "", spent: "0" }
            ],
            neededItems: data.needed_items || [
              { name: "", quantity: "", priority: "medium", description: "" }
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

  const handleNeededItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      neededItems: prev.neededItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const addNeededItem = () => {
    setFormData(prev => ({
      ...prev,
      neededItems: [...prev.neededItems, { name: "", quantity: "", priority: "medium", description: "" }]
    }))
  }

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

      // Upload new image if provided
      let imageUrl = formData.existingImage
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
          financial_breakdown: formData.financialBreakdown.filter(item => item.category && item.allocated),
          needed_items: formData.neededItems.filter(item => item.name && item.quantity),
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
          <Button variant="outline" size="sm" asChild>
            <Link href="/ngo/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Campaign</h1>
            <p className="text-gray-500">Update your disaster relief campaign details</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="details">Campaign Details</TabsTrigger>
          <TabsTrigger value="finances">Finances</TabsTrigger>
          <TabsTrigger value="items">Needed Items</TabsTrigger>
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
                  {formData.existingImage && !formData.imagePreview && (
                    <div className="relative w-full h-48">
                      <Image
                        src={formData.existingImage}
                        alt="Current campaign image"
                        className="w-full h-full object-cover rounded-lg border"
                        unoptimized
      
                      />
                    </div>
                  )}
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
                        alt="New campaign preview"
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
        <Button variant="outline" asChild>
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
            {submitting ? "Updating..." : activeTab === 'items' ? "Update Campaign" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  )
}
