"use client"
import Link from "next/link"
import { Users, Building2 } from "lucide-react"

export default function RoleSelectPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to ReliefConnect</h1>
          <p className="text-lg text-gray-600">Choose your account type to continue</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Donor Option */}
          <Link href="/auth/donor">
            <div className="group cursor-pointer rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl hover:scale-105 border-2 border-transparent hover:border-blue-500">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="rounded-full bg-blue-100 p-6 group-hover:bg-blue-500 transition-colors">
                  <Users className="h-12 w-12 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">I'm a Donor</h2>
                <p className="text-gray-600">Support causes you care about and make a difference in communities</p>
                <div className="mt-4 text-blue-600 font-semibold group-hover:text-blue-700">Continue as Donor →</div>
              </div>
            </div>
          </Link>

          {/* Organization Option */}
          <Link href="/auth/ngo">
            <div className="group cursor-pointer rounded-2xl bg-white p-8 shadow-lg transition-all hover:shadow-xl hover:scale-105 border-2 border-transparent hover:border-indigo-500">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="rounded-full bg-indigo-100 p-6 group-hover:bg-indigo-500 transition-colors">
                  <Building2 className="h-12 w-12 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">I'm an Organization</h2>
                <p className="text-gray-600">Connect with donors and manage your relief initiatives effectively</p>
                <div className="mt-4 text-indigo-600 font-semibold group-hover:text-indigo-700">
                  Continue as Organization →
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
