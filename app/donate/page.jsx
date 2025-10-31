"use client"

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Heart, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  ArrowLeft,
  Loader2,
  Info
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { Suspense } from "react"

const PRESET_AMOUNTS = [50, 100, 200, 500, 1000]
const TIP_PERCENTAGES = [0, 5, 10, 15, 20]

export default function DonatePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const campaignId = searchParams.get('campaign')
  
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)
  
  // Donation form state
  const [donationAmount, setDonationAmount] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [tipPercentage, setTipPercentage] = useState(0)
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringInterval, setRecurringInterval] = useState('monthly')

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!campaignId) {
        setError('No campaign specified')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', campaignId)
          .single()

        if (error) throw error
        setCampaign(data)
      } catch (err) {
        console.error('Error fetching campaign:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCampaign()
  }, [campaignId])

  const handleAmountSelect = (amount) => {
    setDonationAmount(amount.toString())
    setCustomAmount('')
  }

  const handleCustomAmount = (value) => {
    setCustomAmount(value)
    setDonationAmount('')
  }

  const getFinalAmount = () => {
    const baseAmount = customAmount ? parseFloat(customAmount) : parseFloat(donationAmount)
    const tipAmount = baseAmount * (tipPercentage / 100)
    return baseAmount + tipAmount
  }

  const handleDonate = async () => {
    const amount = getFinalAmount()
    
    if (!amount || amount <= 0) {
      setError('Please select a valid donation amount')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      console.log('Creating checkout session with data:', {
        campaignId,
        amount: Math.round(amount * 100),
        tipPercentage,
        isRecurring,
        recurringInterval,
        campaignTitle: campaign?.title,
        ngoName: campaign?.ngo
      })

      // Create checkout session
      const response = await fetch('/api/checkout/donation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          amount: Math.round(amount * 100), // Convert to cents
          tipPercentage,
          isRecurring,
          recurringInterval,
          campaignTitle: campaign?.title,
          ngoName: campaign?.ngo
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const { url, error: checkoutError } = await response.json()
      console.log('Checkout response:', { url: url ? 'URL received' : 'No URL', checkoutError })
      
      if (checkoutError) {
        throw new Error(checkoutError)
      }

      if (!url) {
        throw new Error('No checkout URL received from server')
      }

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (err) {
      console.error('Error creating checkout session:', err)
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-gray-600 text-lg font-medium">Loading campaign details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <Card className="max-w-md mx-auto shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
              <CardTitle className="text-red-600 text-2xl">Error</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-4">{error}</p>
              <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Link href="/campaigns">Back to Campaigns</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const finalAmount = getFinalAmount()
  const baseAmount = customAmount ? parseFloat(customAmount) : parseFloat(donationAmount)
  const tipAmount = baseAmount * (tipPercentage / 100)

  return (
    <Suspense fallback={<div className="text-center p-8 text-gray-500">Loading donation page...</div>}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 md:py-16 shadow-lg">
          <div className="container mx-auto max-w-6xl px-4">
            <Button variant="ghost" asChild className="mb-6 text-white hover:bg-white/20 border border-white/30">
              <Link href={`/campaigns/${campaignId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Campaign
              </Link>
            </Button>

            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-3">Make a Difference</h1>
              <p className="text-lg md:text-xl text-blue-100">
                Your generous donation helps us create lasting impact in communities facing disasters
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>100% Secure</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                  <Heart className="h-4 w-4" />
                  <span>Tax Deductible</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                  <DollarSign className="h-4 w-4" />
                  <span>Transparent Tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Campaign Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4 shadow-xl border-0 overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 text-white">
                  <CardTitle className="flex items-center gap-2 text-white text-xl mb-2">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Heart className="h-5 w-5" />
                    </div>
                    <span>Campaign Summary</span>
                  </CardTitle>
                  <p className="text-red-100 text-sm">You're supporting an amazing cause</p>
                </div>
                <CardContent className="space-y-4 p-6">
                  {campaign?.image && (
                    <div className="relative rounded-xl overflow-hidden shadow-lg group">
                      <Image
                        src={campaign.image}
                        alt={campaign.title}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div>
                    <h3 className="font-bold text-xl text-gray-900 mb-1">{campaign?.title}</h3>
                    <p className="text-sm text-gray-600">by <span className="font-medium text-gray-900">{campaign?.ngo}</span></p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-gray-900">RM {(campaign?.raised || 0).toLocaleString()}</span>
                      <span className="text-gray-500">of RM {(campaign?.goal || 0).toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-red-600 to-pink-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${campaign?.goal ? Math.min((campaign.raised / campaign.goal) * 100, 100) : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Heart className="h-3 w-3 text-red-500" />
                        {campaign?.donors || 0} donors
                      </span>
                      <span className="font-semibold text-red-600">
                        {campaign?.goal ? Math.round((campaign.raised / campaign.goal) * 100) : 0}% funded
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-700 leading-relaxed">{campaign?.description}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Donation Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-xl border-0">
                <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50 p-6">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    Donation Details
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Choose your donation amount and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 p-6 md:p-8">
                  {/* Amount Selection */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-gray-900">Select Donation Amount (RM)</Label>

                    {/* Preset Amounts */}
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                      {PRESET_AMOUNTS.map((amount) => (
                        <Button
                          key={amount}
                          variant={donationAmount === amount.toString() ? "default" : "outline"}
                          onClick={() => handleAmountSelect(amount)}
                          className={`h-16 text-lg font-semibold transition-all ${
                            donationAmount === amount.toString()
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg scale-105'
                              : 'border-2 hover:border-blue-400 hover:bg-blue-50'
                          }`}
                        >
                          RM {amount}
                        </Button>
                      ))}
                    </div>

                    {/* Custom Amount */}
                    <div className="space-y-2 pt-2">
                      <Label htmlFor="custom-amount" className="text-base font-medium text-gray-700">
                        Or enter custom amount
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-semibold text-lg">
                          RM
                        </span>
                        <Input
                          id="custom-amount"
                          type="number"
                          placeholder="Enter any amount"
                          value={customAmount}
                          onChange={(e) => handleCustomAmount(e.target.value)}
                          className={`pl-14 h-14 text-lg border-2 transition-colors ${
                            customAmount ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-300'
                          }`}
                          min="1"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Tip Selection */}
                  <div className="space-y-4 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Label className="text-lg font-semibold text-gray-900">Add a tip to cover platform fees</Label>
                      <div className="group relative">
                        <Info className="h-5 w-5 text-blue-600 cursor-help" />
                        <div className="hidden group-hover:block absolute left-0 top-6 bg-gray-900 text-white text-xs rounded-lg p-3 w-64 z-10 shadow-xl">
                          Tips help us maintain the platform and ensure 100% of your donation reaches the campaign
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">
                      Help us keep Relief Connect running by adding a small tip to cover operational costs
                    </p>

                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                      {TIP_PERCENTAGES.map((percentage) => (
                        <Button
                          key={percentage}
                          variant={tipPercentage === percentage ? "default" : "outline"}
                          onClick={() => setTipPercentage(percentage)}
                          className={`h-12 font-semibold transition-all ${
                            tipPercentage === percentage
                              ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg'
                              : 'border-2 hover:border-green-400 hover:bg-green-50'
                          }`}
                        >
                          {percentage === 0 ? 'No tip' : `${percentage}%`}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Recurring Donation */}
                  <div className="space-y-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Label className="text-lg font-semibold text-gray-900">Make it recurring</Label>
                      <Badge variant="outline" className="bg-white text-purple-700 border-purple-300">Optional</Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border-2 hover:border-purple-300 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          id="recurring"
                          checked={isRecurring}
                          onChange={(e) => setIsRecurring(e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <Label htmlFor="recurring" className="text-base font-medium cursor-pointer flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-600" />
                          I want to make this a recurring donation
                        </Label>
                      </div>

                      {isRecurring && (
                        <div className="ml-4 space-y-3 animate-in fade-in duration-300">
                          <Label htmlFor="interval" className="text-base font-medium text-gray-700">Select Frequency</Label>
                          <select
                            id="interval"
                            value={recurringInterval}
                            onChange={(e) => setRecurringInterval(e.target.value)}
                            className="w-full p-3 border-2 border-purple-300 rounded-lg bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-base font-medium"
                          >
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly (Every 3 months)</option>
                            <option value="yearly">Yearly</option>
                          </select>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Info className="h-4 w-4 text-purple-600" />
                            Recurring donations provide consistent support to ongoing relief efforts
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Summary */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                      Donation Summary
                    </h3>
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl space-y-3 shadow-md border-2 border-blue-100">
                      <div className="flex justify-between text-base">
                        <span className="text-gray-700">Base donation</span>
                        <span className="font-semibold text-gray-900">RM {baseAmount.toFixed(2)}</span>
                      </div>
                      {tipAmount > 0 && (
                        <div className="flex justify-between text-base">
                          <span className="text-gray-700">Platform tip ({tipPercentage}%)</span>
                          <span className="font-semibold text-green-600">+ RM {tipAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator className="bg-blue-200" />
                      <div className="flex justify-between font-bold text-2xl pt-2">
                        <span className="text-gray-900">Total Amount</span>
                        <span className="text-blue-600">RM {finalAmount.toFixed(2)}</span>
                      </div>
                      {isRecurring && (
                        <div className="text-sm text-purple-700 bg-purple-100 p-3 rounded-lg flex items-center gap-2 font-medium">
                          <Calendar className="h-4 w-4" />
                          <span className="capitalize">{recurringInterval}</span> recurring donation
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 shadow-md animate-pulse">
                      <p className="text-red-700 font-medium flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Donate Button */}
                  <Button
                    onClick={handleDonate}
                    disabled={processing || !baseAmount || baseAmount <= 0}
                    className="w-full h-16 text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                        Processing your donation...
                      </>
                    ) : (
                      <>
                        <Heart className="h-6 w-6 mr-2 fill-current" />
                        {isRecurring
                          ? `Donate RM ${finalAmount.toFixed(2)} ${recurringInterval}`
                          : `Donate RM ${finalAmount.toFixed(2)} Now`}
                      </>
                    )}
                  </Button>

                  <div className="text-center space-y-2 pt-2">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Secure payment powered by Stripe</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Your payment information is encrypted and secure. We never store your card details.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  )
}
