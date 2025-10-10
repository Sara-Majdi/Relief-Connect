"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Download, Heart, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { PDFDownloadLink } from '@react-pdf/renderer'
import ReceiptDocument from '@/components/ReceiptDocument'

export default function DonationSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  
  const [donationData, setDonationData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDonationData = async () => {
      if (!sessionId) {
        setError('No session ID provided')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/donation/session/${sessionId}`)
        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }
        
        setDonationData(data)
      } catch (err) {
        console.error('Error fetching donation data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDonationData()
  }, [sessionId])

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading donation details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !donationData) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              {error || 'Unable to load donation details'}
            </p>
            <Button asChild>
              <Link href="/campaigns">Back to Campaigns</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You!</h1>
        <p className="text-gray-600 text-lg">
          Your donation has been successfully processed
        </p>
      </div>

      {/* Donation Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Donation Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Campaign</p>
              <p className="font-semibold">{donationData.campaignTitle}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Organization</p>
              <p className="font-semibold">{donationData.ngoName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="font-semibold text-lg">RM {donationData.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <Badge variant={donationData.isRecurring ? "default" : "outline"}>
                {donationData.isRecurring ? 'Recurring' : 'One-time'}
              </Badge>
            </div>
          </div>

          {donationData.tipAmount > 0 && (
            <div className="pt-4 border-t">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Platform tip</span>
                <span className="text-sm">RM {donationData.tipAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>RM {(donationData.amount + (donationData.tipAmount || 0)).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receipt Download */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download Receipt
          </CardTitle>
          <CardDescription>
            Keep this receipt for your tax records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PDFDownloadLink
            document={
              <ReceiptDocument 
                donor={{ 
                  name: donationData.donorName || 'Anonymous Donor', 
                  email: donationData.donorEmail 
                }} 
                donation={{
                  id: donationData.donationId,
                  date: new Date().toISOString().slice(0, 10),
                  amount: donationData.amount,
                  cause: donationData.campaignTitle,
                  receipt: donationData.receiptNumber
                }} 
                organization={{ name: donationData.ngoName }} 
              />
            }
            fileName={`receipt-${donationData.receiptNumber}.pdf`}
          >
            {({ loading }) => (
              <Button className="w-full" disabled={loading}>
                <Download className="h-4 w-4 mr-2" />
                {loading ? 'Generating Receipt...' : 'Download Receipt'}
              </Button>
            )}
          </PDFDownloadLink>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-blue-600">1</span>
            </div>
            <div>
              <p className="font-medium">Receipt sent to your email</p>
              <p className="text-sm text-gray-600">
                A confirmation email with your receipt has been sent to {donationData.donorEmail}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-blue-600">2</span>
            </div>
            <div>
              <p className="font-medium">Track your impact</p>
              <p className="text-sm text-gray-600">
                Follow the campaign's progress and see how your donation is being used
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-blue-600">3</span>
            </div>
            <div>
              <p className="font-medium">Stay updated</p>
              <p className="text-sm text-gray-600">
                Receive updates about the campaign's impact and future opportunities to help
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild className="flex-1">
          <Link href={`/campaigns/${donationData.campaignId}`}>
            <ArrowRight className="h-4 w-4 mr-2" />
            View Campaign
          </Link>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href="/donor/profile">
            View My Donations
          </Link>
        </Button>
      </div>
    </div>
  )
}
