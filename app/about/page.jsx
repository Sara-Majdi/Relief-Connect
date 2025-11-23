"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Users, Target, Shield, Zap, TrendingUp, CheckCircle, Globe, MessageCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 md:py-28">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
        <div className="container mx-auto px-4 md:px-6 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">About ReliefConnect</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
              Connecting Hearts, Saving Lives
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              A transparent platform empowering disaster relief efforts across Malaysia through verified NGOs and compassionate donors
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg">
                <Link href="/campaigns">
                  Browse Campaigns
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="/ngo/register">Become a Partner NGO</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-6"></div>
              <p className="text-xl text-gray-600">
                To bridge the gap between those in need and those who want to help, ensuring every donation reaches its intended destination with complete transparency
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="border-2 border-blue-100 hover:border-blue-300 transition-all hover:shadow-lg">
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Compassion</h3>
                  <p className="text-gray-600">
                    Every disaster victim deserves timely and adequate support
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-100 hover:border-purple-300 transition-all hover:shadow-lg">
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Transparency</h3>
                  <p className="text-gray-600">
                    Full accountability from campaign creation to fund utilization
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-100 hover:border-green-300 transition-all hover:shadow-lg">
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Impact</h3>
                  <p className="text-gray-600">
                    Maximizing the effectiveness of every ringgit donated
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Problem */}
              <div>
                <Badge className="mb-4 bg-red-100 text-red-700 border-red-200">The Problem</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Disaster Relief Challenges
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Lack of Transparency</h4>
                      <p className="text-gray-600">Donors often don't know where their money goes or how it's used</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Fragmented Efforts</h4>
                      <p className="text-gray-600">Multiple campaigns for the same disaster lead to inefficient resource allocation</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Trust Issues</h4>
                      <p className="text-gray-600">Concerns about fund misuse reduce willingness to donate</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Solution */}
              <div>
                <Badge className="mb-4 bg-green-100 text-green-700 border-green-200">Our Solution</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  How ReliefConnect Helps
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Verified NGOs Only</h4>
                      <p className="text-gray-600">All organizations are vetted and verified before they can create campaigns</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Real-time Updates</h4>
                      <p className="text-gray-600">Track exactly how funds are being used with regular campaign updates</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Transparent Tracking</h4>
                      <p className="text-gray-600">See detailed fund allocation and progress metrics for every campaign</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A simple, transparent process from disaster to relief
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative">
                <Card className="hover:shadow-xl transition-shadow border-2">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                      1
                    </div>
                    <h3 className="text-xl font-semibold mb-3">NGO Creates Campaign</h3>
                    <p className="text-gray-600 mb-4">
                      Verified NGOs create detailed campaigns with specific goals, timelines, and fund allocation plans
                    </p>
                    <div className="flex items-center text-blue-600 text-sm font-semibold">
                      <Target className="h-4 w-4 mr-2" />
                      Clear objectives
                    </div>
                  </CardContent>
                </Card>
                {/* Connector Arrow (hidden on mobile) */}
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <Card className="hover:shadow-xl transition-shadow border-2">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                      2
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Donors Contribute</h3>
                    <p className="text-gray-600 mb-4">
                      People donate to campaigns they care about, with secure payment processing and instant receipts
                    </p>
                    <div className="flex items-center text-purple-600 text-sm font-semibold">
                      <Heart className="h-4 w-4 mr-2" />
                      Secure donations
                    </div>
                  </CardContent>
                </Card>
                {/* Connector Arrow (hidden on mobile) */}
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              {/* Step 3 */}
              <div>
                <Card className="hover:shadow-xl transition-shadow border-2">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                      3
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Impact Delivered</h3>
                    <p className="text-gray-600 mb-4">
                      NGOs use funds as planned, provide regular updates, and donors see the real impact of their contributions
                    </p>
                    <div className="flex items-center text-green-600 text-sm font-semibold">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Track progress
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose ReliefConnect?</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto"></div>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">100% Verified NGOs</h3>
                <p className="text-gray-600">Every organization undergoes thorough verification before joining our platform</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Real-time Updates</h3>
                <p className="text-gray-600">Get instant notifications about campaign progress and fund utilization</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Transparent Tracking</h3>
                <p className="text-gray-600">Monitor exactly how your donations are being used with detailed breakdowns</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Community Driven</h3>
                <p className="text-gray-600">Join a growing community of compassionate Malaysians making a difference</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Easy Donations</h3>
                <p className="text-gray-600">Secure, hassle-free payment processing with multiple payment options</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nationwide Coverage</h3>
                <p className="text-gray-600">Supporting disaster relief efforts across all states in Malaysia</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of Malaysians who are making disaster relief more transparent and effective
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg">
                <Link href="/campaigns">
                  Start Donating
                  <Heart className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="/ngo/register">
                  Register Your NGO
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Have Questions?</h3>
            <p className="text-gray-600 mb-6">
              We're here to help! Reach out to us if you have any questions about using ReliefConnect or want to learn more about becoming a partner NGO.
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
