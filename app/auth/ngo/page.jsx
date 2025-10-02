"use client"
import AuthForm from "@/components/AuthForm"
import Link from "next/link"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function NGOAuthPage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Organization Sign In</h1>
          <p className="text-gray-600">Access your organization dashboard</p>
        </div>

        {/* Warning for approved organizations only */}
        <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-900 mb-1">For Approved Organizations Only</p>
            <p className="text-amber-800">
              This page is for organizations that have already been approved by our admin team.
            </p>
            <Link href="/ngo/register" className="text-amber-900 underline font-medium mt-2 inline-block">
              New organization? Register here →
            </Link>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-lg">
            <AuthForm userType="ngo" authType={authType} />
        </div>
      </div>
    </div>
  )
}
