"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function CreateCampaignRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to payment page
    router.push('/ngo/campaigns/create/payment')
  }, [router])

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-500">Redirecting to payment...</p>
        </div>
      </div>
    </div>
  )
}
