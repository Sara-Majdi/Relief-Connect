"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Shield, Zap, TrendingUp, Loader2, AlertCircle, ArrowLeft, CreditCard } from "lucide-react"
import Link from "next/link"

export default function CampaignCreationPaymentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")
  const [ngoInfo, setNgoInfo] = useState(null)

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

      setNgoInfo(data.user)
      setLoading(false)
    } catch (error) {
      console.error('Error checking NGO session:', error)
      router.push('/auth/ngo')
    }
  }

  const handlePayment = async () => {
    setProcessing(true)
    setError("")

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-campaign-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ngoUserId: ngoInfo.id,
          ngoName: ngoInfo.org_name,
          ngoEmail: ngoInfo.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err) {
      console.error('Payment error:', err)
      setError(err.message || 'Failed to process payment. Please try again.')
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          asChild
          className="mb-6 hover:bg-white"
        >
          <Link href="/ngo/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Main Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">Campaign Creation Fee</CardTitle>
                <CardDescription className="text-blue-100">
                  One-time payment to create a new campaign
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {/* Price Display */}
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-4">
                <div className="text-5xl font-bold text-gray-900 mb-2">RM 10</div>
                <p className="text-gray-600">per campaign</p>
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-200">
                No hidden fees
              </Badge>
            </div>

            {/* Why This Fee Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Why We Charge This Fee
              </h3>
              <div className="grid gap-4">
                <div className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Quality Assurance</p>
                    <p className="text-sm text-gray-600">Ensures only serious, well-prepared campaigns are submitted</p>
                  </div>
                </div>

                <div className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Spam Prevention</p>
                    <p className="text-sm text-gray-600">Protects donors from fraudulent or low-quality campaigns</p>
                  </div>
                </div>

                <div className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Platform Sustainability</p>
                    <p className="text-sm text-gray-600">Helps maintain and improve the platform for all users</p>
                  </div>
                </div>

                <div className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                  <Zap className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Enhanced Support</p>
                    <p className="text-sm text-gray-600">Funds better verification and support services</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <Alert className="mb-8 border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Important:</strong> This fee is non-refundable, even if your campaign is rejected during review.
                Please ensure your campaign meets all guidelines before proceeding.
              </AlertDescription>
            </Alert>

            {/* What You Get */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">What You Get</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Create one complete campaign with unlimited updates
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Upload multiple images and media files
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Detailed analytics and donor tracking
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Platform visibility to thousands of donors
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Secure payment processing (0% platform fee on donations)
                </li>
              </ul>
            </div>

            {/* Error Display */}
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Payment Button */}
            <div className="space-y-4">
              <Button
                onClick={handlePayment}
                disabled={processing}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Pay RM 10 & Create Campaign
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-gray-500">
                Secure payment powered by Stripe
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Need help? <Link href="/contact" className="text-blue-600 hover:underline">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
