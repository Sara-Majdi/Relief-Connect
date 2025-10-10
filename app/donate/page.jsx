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

      const { url, error: checkoutError } = await response.json()
      
      if (checkoutError) {
        throw new Error(checkoutError)
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
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-500">Loading campaign details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !campaign) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button asChild className="w-full">
              <Link href="/campaigns">Back to Campaigns</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const finalAmount = getFinalAmount()
  const baseAmount = customAmount ? parseFloat(customAmount) : parseFloat(donationAmount)
  const tipAmount = baseAmount * (tipPercentage / 100)

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/campaigns/${campaignId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaign
          </Link>
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">Make a Donation</h1>
        <p className="text-gray-600">Support this important cause with your contribution</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Campaign Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Campaign Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {campaign?.image && (
                <Image
                  src={campaign.image}
                  alt={campaign.title}
                  width={300}
                  height={200}
                  className="w-full h-32 object-cover rounded-lg"
                />
              )}
              
              <div>
                <h3 className="font-semibold text-lg">{campaign?.title}</h3>
                <p className="text-sm text-gray-600">by {campaign?.ngo}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">RM {(campaign?.raised || 0).toLocaleString()}</span>
                  <span className="text-gray-500">of RM {(campaign?.goal || 0).toLocaleString()}</span>
                </div>
                <Progress 
                  value={campaign?.goal ? (campaign.raised / campaign.goal) * 100 : 0} 
                  className="h-2" 
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{campaign?.donors || 0} donors</span>
                  <span>{campaign?.goal ? Math.round((campaign.raised / campaign.goal) * 100) : 0}% funded</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">{campaign?.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Donation Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Donation Details
              </CardTitle>
              <CardDescription>
                Choose your donation amount and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Selection */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Donation Amount (RM)</Label>
                
                {/* Preset Amounts */}
                <div className="grid grid-cols-3 gap-3">
                  {PRESET_AMOUNTS.map((amount) => (
                    <Button
                      key={amount}
                      variant={donationAmount === amount.toString() ? "default" : "outline"}
                      onClick={() => handleAmountSelect(amount)}
                      className="h-12"
                    >
                      RM {amount}
                    </Button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="space-y-2">
                  <Label htmlFor="custom-amount">Or enter custom amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">RM</span>
                    <Input
                      id="custom-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => handleCustomAmount(e.target.value)}
                      className="pl-10"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Tip Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-medium">Add a tip to cover platform fees</Label>
                  <Info className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600">
                  Help us keep Relief Connect running by adding a small tip
                </p>
                
                <div className="grid grid-cols-5 gap-2">
                  {TIP_PERCENTAGES.map((percentage) => (
                    <Button
                      key={percentage}
                      variant={tipPercentage === percentage ? "default" : "outline"}
                      onClick={() => setTipPercentage(percentage)}
                      className="h-10"
                    >
                      {percentage === 0 ? 'No tip' : `${percentage}%`}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Recurring Donation */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-medium">Make it recurring</Label>
                  <Badge variant="outline" className="text-xs">Optional</Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="recurring"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="recurring" className="text-sm">
                      I want to make this a recurring donation
                    </Label>
                  </div>
                  
                  {isRecurring && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="interval">Frequency</Label>
                      <select
                        id="interval"
                        value={recurringInterval}
                        onChange={(e) => setRecurringInterval(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Summary */}
              <div className="space-y-3">
                <h3 className="font-semibold">Donation Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Base donation</span>
                    <span>RM {baseAmount.toFixed(2)}</span>
                  </div>
                  {tipAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Platform tip ({tipPercentage}%)</span>
                      <span>RM {tipAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>RM {finalAmount.toFixed(2)}</span>
                  </div>
                  {isRecurring && (
                    <div className="text-sm text-gray-600">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {recurringInterval} donation
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Donate Button */}
              <Button 
                onClick={handleDonate}
                disabled={processing || !baseAmount || baseAmount <= 0}
                className="w-full h-12 text-lg"
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Heart className="h-5 w-5 mr-2" />
                    {isRecurring ? `Donate RM ${finalAmount.toFixed(2)} ${recurringInterval}` : `Donate RM ${finalAmount.toFixed(2)}`}
                  </>
                )}
              </Button>

              <div className="text-xs text-gray-500 text-center">
                <CheckCircle className="h-4 w-4 inline mr-1" />
                Secure payment powered by Stripe
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
