"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Loader2, AlertCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import Confetti from 'react-confetti'

export default function CampaignPaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [paymentVerified, setPaymentVerified] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    // Set window dimensions for confetti
    setWindowDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    })

    if (!sessionId) {
      setError("No payment session found. Please try again.")
      setLoading(false)
      return
    }

    verifyPayment()
  }, [sessionId])

  const verifyPayment = async () => {
    try {
      const response = await fetch('/api/stripe/verify-campaign-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Payment verification failed')
      }

      setPaymentVerified(true)
      setShowConfetti(true)

      // Stop confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000)

    } catch (err) {
      console.error('Payment verification error:', err)
      setError(err.message || 'Failed to verify payment. Please contact support.')
    } finally {
      setLoading(false)
    }
  }

  const handleProceedToForm = () => {
    // Store payment verification token in sessionStorage
    sessionStorage.setItem('campaign_payment_verified', sessionId)
    router.push('/ngo/campaigns/create')
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-500">Verifying payment...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
              Payment Verification Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Button
                onClick={() => router.push('/ngo/campaigns/create/payment')}
                className="w-full"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/ngo/dashboard')}
                className="w-full"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <div className="container mx-auto max-w-2xl px-4">
        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-3xl mb-2">Payment Successful!</CardTitle>
            <p className="text-green-100">
              Your campaign creation fee has been processed
            </p>
          </CardHeader>

          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Payment Details */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Payment Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Amount Paid</p>
                    <p className="font-semibold text-lg">RM 10.00</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <p className="font-semibold text-green-600">Paid</p>
                  </div>
                </div>
              </div>

              {/* What's Next */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">What's Next?</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Fill in your campaign details (goal, description, timeline)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Upload campaign images and media</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Add fundraising items and allocation breakdown</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Submit for review and go live!</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="pt-4">
                <Button
                  onClick={handleProceedToForm}
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  Proceed to Create Campaign
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <p className="text-center text-sm text-gray-500 mt-4">
                  You can also access this form from your dashboard later
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Link */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Need help? <Link href="/contact" className="text-blue-600 hover:underline">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
