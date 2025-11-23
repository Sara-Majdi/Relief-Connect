"use client";

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, FileText, Upload, Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"

export default function NGORegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    // Organization Information
    orgName: "",
    registrationNumber: "",
    yearEstablished: "",
    orgType: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    description: "",
    website: "",
    email: "",
    phone: "",
    focusArea: "",
    
    // Documents
    registrationCert: null,
    taxExemptionCert: null,
    annualReport: null,
    
    // Document URLs (after upload)
    registrationCertUrl: null,
    taxExemptionCertUrl: null,
    annualReportUrl: null
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileUpload = async (file, field) => {
    if (!file) return null

    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `ngo-docs/${Date.now()}-${field}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('ngo-documents')
        .upload(fileName, file)
      
      if (error) throw error
      
      const { data: { publicUrl } } = supabase.storage
        .from('ngo-documents')
        .getPublicUrl(fileName)
      
      return publicUrl
    } catch (err) {
      console.error(`Error uploading ${field}:`, err)
      setError(`Failed to upload ${field}`)
      return null
    }
  }

  const validateForm = () => {
    const required = [
      'orgName', 'registrationNumber', 'yearEstablished', 'orgType',
      'address', 'city', 'state', 'postalCode', 'email', 'phone'
    ]
    
    for (const field of required) {
      if (!formData[field]) {
        setError(`Please fill in the ${field} field`)
        return false
      }
    }

    if (isNaN(Number(formData.yearEstablished)) || Number(formData.yearEstablished) < 1900 || Number(formData.yearEstablished) > new Date().getFullYear()) {
      setError("Please enter a valid year")
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

      // Upload documents if provided
      const registrationCertUrl = formData.registrationCert ? 
        await handleFileUpload(formData.registrationCert, 'registration-cert') : null
      const taxExemptionCertUrl = formData.taxExemptionCert ? 
        await handleFileUpload(formData.taxExemptionCert, 'tax-exemption-cert') : null
      const annualReportUrl = formData.annualReport ? 
        await handleFileUpload(formData.annualReport, 'annual-report') : null

      // Submit NGO registration via API
      const response = await fetch('/api/ngo/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orgName: formData.orgName,
          registrationNumber: formData.registrationNumber,
          yearEstablished: Number(formData.yearEstablished),
          orgType: formData.orgType,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          description: formData.description,
          website: formData.website,
          email: formData.email,
          phone: formData.phone,
          focusArea: formData.focusArea,
          registrationCertUrl,
          taxExemptionCertUrl,
          annualReportUrl
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit registration')
      }

      // Redirect to success page or dashboard
      router.push('/ngo/dashboard?registered=true')
    } catch (e) {
      console.error("NGO registration error:", e)
      setError(e.message || "Failed to submit registration")
    } finally {
      setSubmitting(false)
    }
  }

  
  return (
    <div className="container px-4 md:px-6 py-8 md:py-12 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-yellow-600 bg-clip-text text-transparent">NGO Registration</h1>
        <p className="text-gray-600 text-lg">Join ReliefConnect to create and manage disaster relief campaigns</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg shadow-md animate-pulse">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      <div className="mb-10">
        <div className="flex justify-between items-center relative">
          <div className="w-full absolute top-1/2 h-1 bg-gray-200 rounded"></div>
          <div className={`absolute top-1/2 h-1 bg-gradient-to-r from-blue-600 to-yellow-600 rounded transition-all duration-500`} style={{width: `${((step - 1) / 2) * 100}%`}}></div>
          <div className="flex justify-between w-full relative z-10">
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold shadow-lg transition-all duration-300 ${step >= 1 ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white scale-110' : 'bg-white border-2 border-gray-300 text-gray-500'}`}>
                {step > 1 ? <CheckCircle className="h-6 w-6" /> : '1'}
              </div>
              <span className={`text-sm mt-2 font-medium ${step >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>Organization Info</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold shadow-lg transition-all duration-300 ${step >= 2 ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white scale-110' : 'bg-white border-2 border-gray-300 text-gray-500'}`}>
                {step > 2 ? <CheckCircle className="h-6 w-6" /> : '2'}
              </div>
              <span className={`text-sm mt-2 font-medium ${step >= 2 ? 'text-yellow-600' : 'text-gray-500'}`}>Documents</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold shadow-lg transition-all duration-300 ${step >= 3 ? 'bg-gradient-to-r from-green-600 to-green-500 text-white scale-110' : 'bg-white border-2 border-gray-300 text-gray-500'}`}>
                {step > 3 ? <CheckCircle className="h-6 w-6" /> : '3'}
              </div>
              <span className={`text-sm mt-2 font-medium ${step >= 3 ? 'text-green-600' : 'text-gray-500'}`}>Review</span>
            </div>
          </div>
        </div>
      </div>

      {step === 1 && (
        <Card className="shadow-xl border-l-4 border-l-blue-500 hover:shadow-2xl transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              Organization Information
            </CardTitle>
            <CardDescription className="text-base">
              Please provide details about your NGO. All information will be verified.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name *</Label>
                <Input 
                  id="org-name" 
                  placeholder="Enter your organization's name" 
                  value={formData.orgName}
                  onChange={(e) => handleInputChange('orgName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registration-number">Registration Number *</Label>
                <Input 
                  id="registration-number" 
                  placeholder="Official registration number" 
                  value={formData.registrationNumber}
                  onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="year-established">Year Established *</Label>
                <Input 
                  id="year-established" 
                  type="number" 
                  placeholder="YYYY" 
                  value={formData.yearEstablished}
                  onChange={(e) => handleInputChange('yearEstablished', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-type">Organization Type *</Label>
                <Select value={formData.orgType} onValueChange={(value) => handleInputChange('orgType', value)}>
                  <SelectTrigger id="org-type">
                    <SelectValue placeholder="Select organization type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="non-profit">Non-Profit Organization</SelectItem>
                    <SelectItem value="charity">Charity</SelectItem>
                    <SelectItem value="foundation">Foundation</SelectItem>
                    <SelectItem value="social-enterprise">Social Enterprise</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-address">Address *</Label>
              <Textarea 
                id="org-address" 
                placeholder="Enter your organization's address" 
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input 
                  id="city" 
                  placeholder="City" 
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                  <SelectTrigger id="state">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="johor">Johor</SelectItem>
                    <SelectItem value="kedah">Kedah</SelectItem>
                    <SelectItem value="kelantan">Kelantan</SelectItem>
                    <SelectItem value="melaka">Melaka</SelectItem>
                    <SelectItem value="negeri-sembilan">Negeri Sembilan</SelectItem>
                    <SelectItem value="pahang">Pahang</SelectItem>
                    <SelectItem value="perak">Perak</SelectItem>
                    <SelectItem value="perlis">Perlis</SelectItem>
                    <SelectItem value="pulau-pinang">Pulau Pinang</SelectItem>
                    <SelectItem value="sabah">Sabah</SelectItem>
                    <SelectItem value="sarawak">Sarawak</SelectItem>
                    <SelectItem value="selangor">Selangor</SelectItem>
                    <SelectItem value="terengganu">Terengganu</SelectItem>
                    <SelectItem value="kuala-lumpur">Kuala Lumpur</SelectItem>
                    <SelectItem value="labuan">Labuan</SelectItem>
                    <SelectItem value="putrajaya">Putrajaya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal-code">Postal Code *</Label>
                <Input 
                  id="postal-code" 
                  placeholder="Postal code" 
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="org-description">Organization Description</Label>
              <Textarea 
                id="org-description" 
                placeholder="Describe your organization's mission, vision, and activities" 
                className="min-h-[120px]"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website" 
                  type="url" 
                  placeholder="https://www.example.org" 
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="contact@organization.org" 
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input 
                  id="phone" 
                  placeholder="+60 12 345 6789" 
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="focus-area">Primary Focus Area</Label>
                <Select value={formData.focusArea} onValueChange={(value) => handleInputChange('focusArea', value)}>
                  <SelectTrigger id="focus-area">
                    <SelectValue placeholder="Select focus area" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="flood-relief">Flood Relief</SelectItem>
                    <SelectItem value="landslide-recovery">Landslide Recovery</SelectItem>
                    <SelectItem value="drought-response">Drought Response</SelectItem>
                    <SelectItem value="fire-recovery">Fire Recovery</SelectItem>
                    <SelectItem value="general-disaster">General Disaster Relief</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end bg-gray-50">
            <Button onClick={() => setStep(2)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all px-8">Continue</Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card className="shadow-xl border-l-4 border-l-yellow-500 hover:shadow-2xl transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Upload className="h-6 w-6 text-yellow-600" />
              </div>
              Document Verification
            </CardTitle>
            <CardDescription className="text-base">
              Please upload the required documents for verification. All documents must be in PDF format.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="border-2 border-blue-200 rounded-lg p-6 space-y-4 bg-blue-50/30 hover:border-blue-400 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Registration Certificate</h3>
                    <p className="text-sm text-gray-600">Official NGO registration certificate issued by the government</p>
                  </div>
                </div>
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-blue-50 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium mb-1">Drag and drop your file here</p>
                  <p className="text-xs text-gray-500 mb-4">PDF only, max 5MB</p>
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleInputChange('registrationCert', e.target.files[0])}
                    className="hidden"
                    id="registration-cert"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => document.getElementById('registration-cert').click()}
                    className="hover:bg-blue-100 hover:text-blue-600 hover:border-blue-400 transition-colors"
                  >
                    Browse Files
                  </Button>
                  {formData.registrationCert && (
                    <div className="flex items-center gap-2 mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-green-700 font-medium">{formData.registrationCert.name}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-2 border-yellow-200 rounded-lg p-6 space-y-4 bg-yellow-50/30 hover:border-yellow-400 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <FileText className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Tax Exemption Certificate</h3>
                    <p className="text-sm text-gray-600">Tax exemption status document (if applicable)</p>
                  </div>
                </div>
                <div className="border-2 border-dashed border-yellow-300 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-yellow-50 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium mb-1">Drag and drop your file here</p>
                  <p className="text-xs text-gray-500 mb-4">PDF only, max 5MB</p>
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleInputChange('taxExemptionCert', e.target.files[0])}
                    className="hidden"
                    id="tax-exemption-cert"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => document.getElementById('tax-exemption-cert').click()}
                    className="hover:bg-yellow-100 hover:text-yellow-600 hover:border-yellow-400 transition-colors"
                  >
                    Browse Files
                  </Button>
                  {formData.taxExemptionCert && (
                    <div className="flex items-center gap-2 mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-green-700 font-medium">{formData.taxExemptionCert.name}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-2 border-green-200 rounded-lg p-6 space-y-4 bg-green-50/30 hover:border-green-400 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FileText className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Annual Report</h3>
                    <p className="text-sm text-gray-600">Most recent annual report or financial statement</p>
                  </div>
                </div>
                <div className="border-2 border-dashed border-green-300 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-green-50 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium mb-1">Drag and drop your file here</p>
                  <p className="text-xs text-gray-500 mb-4">PDF only, max 5MB</p>
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleInputChange('annualReport', e.target.files[0])}
                    className="hidden"
                    id="annual-report"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => document.getElementById('annual-report').click()}
                    className="hover:bg-green-100 hover:text-green-600 hover:border-green-400 transition-colors"
                  >
                    Browse Files
                  </Button>
                  {formData.annualReport && (
                    <div className="flex items-center gap-2 mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-green-700 font-medium">{formData.annualReport.name}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between bg-gray-50">
            <Button variant="outline" onClick={() => setStep(1)} className="hover:bg-gray-100 hover:border-gray-400 transition-colors border-2">Back</Button>
            <Button onClick={() => setStep(3)} className="bg-yellow-600 hover:bg-yellow-700 text-white shadow-md hover:shadow-lg transition-all px-8">Continue</Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && (
        <Card className="shadow-xl border-l-4 border-l-green-500 hover:shadow-2xl transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-green-50 to-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              Review & Submit
            </CardTitle>
            <CardDescription className="text-base">
              Please review your information before submitting your application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg mb-2">Organization Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Organization Name</p>
                    <p className="font-medium">{formData.orgName || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Registration Number</p>
                    <p className="font-medium">{formData.registrationNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Year Established</p>
                    <p className="font-medium">{formData.yearEstablished || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Organization Type</p>
                    <p className="font-medium">{formData.orgType || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-lg mb-2">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{formData.address || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">City, State, Postal Code</p>
                    <p className="font-medium">{`${formData.city || ''}, ${formData.state || ''}, ${formData.postalCode || ''}`}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{formData.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{formData.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-lg mb-2">Uploaded Documents</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p>Registration Certificate</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p>Tax Exemption Certificate</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p>Annual Report</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-yellow-50 p-6 rounded-lg border-2 border-blue-200">
                <p className="text-sm text-blue-800 leading-relaxed">
                  <strong>Important:</strong> By submitting this application, you confirm that all information provided is accurate and complete.
                  Our team will review your application and may contact you for additional information.
                  The verification process typically takes <strong>3-5 business days</strong>.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between bg-gray-50">
            <Button variant="outline" onClick={() => setStep(2)} className="hover:bg-gray-100 hover:border-gray-400 transition-colors border-2">Back</Button>
            <Button
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white s shadow-lg hover:shadow-xl transition-all px-8"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}