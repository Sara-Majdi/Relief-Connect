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
        <h1 className="text-3xl font-bold mb-2">NGO Registration</h1>
        <p className="text-gray-500">Join ReliefConnect to create and manage disaster relief campaigns</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="mb-8">
        <div className="flex justify-between items-center relative">
          <div className="w-full absolute top-1/2 h-0.5 bg-gray-200"></div>
          <div className="flex justify-between w-full relative z-10">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                1
              </div>
              <span className="text-sm mt-2">Organization Info</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                2
              </div>
              <span className="text-sm mt-2">Documents</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                3
              </div>
              <span className="text-sm mt-2">Review</span>
            </div>
          </div>
        </div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Organization Information</CardTitle>
            <CardDescription>
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
          <CardFooter className="flex justify-end">
            <Button onClick={() => setStep(2)}>Continue</Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Document Verification</CardTitle>
            <CardDescription>
              Please upload the required documents for verification. All documents must be in PDF format.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="border rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-medium">Registration Certificate</h3>
                    <p className="text-sm text-gray-500">Official NGO registration certificate issued by the government</p>
                  </div>
                </div>
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
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
                  >
                    Browse Files
                  </Button>
                  {formData.registrationCert && (
                    <p className="text-sm text-green-600 mt-2">✓ {formData.registrationCert.name}</p>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-medium">Tax Exemption Certificate</h3>
                    <p className="text-sm text-gray-500">Tax exemption status document (if applicable)</p>
                  </div>
                </div>
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
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
                  >
                    Browse Files
                  </Button>
                  {formData.taxExemptionCert && (
                    <p className="text-sm text-green-600 mt-2">✓ {formData.taxExemptionCert.name}</p>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-medium">Annual Report</h3>
                    <p className="text-sm text-gray-500">Most recent annual report or financial statement</p>
                  </div>
                </div>
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
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
                  >
                    Browse Files
                  </Button>
                  {formData.annualReport && (
                    <p className="text-sm text-green-600 mt-2">✓ {formData.annualReport.name}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)}>Continue</Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Submit</CardTitle>
            <CardDescription>
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

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  By submitting this application, you confirm that all information provided is accurate and complete. 
                  Our team will review your application and may contact you for additional information. 
                  The verification process typically takes 3-5 business days.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700" 
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