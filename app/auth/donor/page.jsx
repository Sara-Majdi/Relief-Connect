"use client"
import AuthForm from "@/components/AuthForm"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function DonorAuthPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Link
        href="/auth/role-select"
        className="absolute top-4 left-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to role selection
      </Link>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Donor Sign In</h1>
          <p className="text-gray-600">Sign in to support causes you care about</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <AuthForm userType="donor" />
        </div>
      </div>
    </div>
  )
}
