"use client"

import Image from "next/image";
import styles from "./page.module.css";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { AlertTriangle, ArrowRight, CheckCircle, Clock, Heart, Shield, Droplets, Users, HandHeart } from "lucide-react"
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"


export default function Home() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState([])
  const supabase = createClient()

  //Fetching Campaigns
  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data, error } = await supabase
      .from("campaigns")
      .select("*")

      if (error) {
        console.error('Error fetching campaigns:', error)
        return
      }

      if (data) {
        const mapped = data.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          raised: Number(c.raised ?? 0),
          goal: Number(c.goal ?? 0),
          imageUrl: c.image_url ?? c.image ?? "/placeholder.svg",
          status: c.urgency === "critical" ? "Critical" : c.urgency === "urgent" ? "Urgent" : undefined,
          ngoVerified: Boolean(c.verified),
          type: c.disaster,
          created_at: c.created_at,
          urgency: c.urgency,
        }))
        setCampaigns(mapped)
      }   
    } 
    fetchCampaigns()
}, [supabase])




  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center w-full min-h-screen py-20 md:py-32 bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 text-white overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="container p-6 grid lg:grid-cols-2 gap-12 items-center justify-center relative z-10">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
                Connecting Hearts for{" "}
                <motion.span
                  className="text-cyan-300"
                  animate={{
                    textShadow: [
                      "0 0 20px rgba(103, 232, 249, 0.5)",
                      "0 0 40px rgba(103, 232, 249, 0.8)",
                      "0 0 20px rgba(103, 232, 249, 0.5)",
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Malaysian Disaster Relief
                </motion.span>
              </h1>
            </motion.div>

            <motion.p
              className="max-w-xl text-lg text-blue-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              ReliefConnect bridges verified NGOs with donors to streamline
              disaster relief efforts across Malaysia. Join thousands making a real difference.
            </motion.p>

            <motion.div
              className="flex gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-white text-blue-900 hover:bg-blue-50 border-0" size="lg" asChild>
                  <Link href="/campaigns">
                    <Heart className="mr-2 h-5 w-5" />
                    Donate Now
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-white border-white hover:bg-white hover:text-blue-900"
                  asChild
                >
                  <Link href="/ngo/register">Register as NGO</Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-4 pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <div className="text-center">
                <motion.div
                  className="text-3xl font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: "spring", stiffness: 200 }}
                >
                  500+
                </motion.div>
                <div className="text-sm text-blue-200">Active Campaigns</div>
              </div>
              <div className="text-center">
                <motion.div
                  className="text-3xl font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
                >
                  10K+
                </motion.div>
                <div className="text-sm text-blue-200">Donors</div>
              </div>
              <div className="text-center">
                <motion.div
                  className="text-3xl font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.4, type: "spring", stiffness: 200 }}
                >
                  RM5M+
                </motion.div>
                <div className="text-sm text-blue-200">Raised</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-2xl opacity-30"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              whileHover={{ scale: 1.02, rotate: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Image
                src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1600&auto=format&fit=crop&q=80"
                width={600}
                height={600}
                alt="Relief workers helping disaster victims"
                className="rounded-2xl shadow-2xl object-cover relative z-10"
                priority
              />
            </motion.div>

            {/* Floating badges */}
            <motion.div
              className="absolute -top-4 -right-4 bg-white text-blue-900 px-4 py-2 rounded-full shadow-xl font-semibold z-20"
              animate={{
                y: [0, -10, 0],
              }}
              drag
              dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
              dragElastic={0.2}
              whileDrag={{ scale: 1.1, cursor: "grabbing" }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Users className="inline mr-2 h-4 w-4" />
              100% Verified
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 bg-cyan-500 text-white px-4 py-2 rounded-full shadow-xl font-semibold z-20"
              animate={{
                y: [0, 10, 0],
              }}
              drag
              dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
              dragElastic={0.2}
              whileDrag={{ scale: 1.1, cursor: "grabbing" }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            >
              <Shield className="inline mr-2 h-4 w-4" />
              Secure Donations
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Active Campaigns Section */}
      <section className="w-full py-12 md:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            className="flex flex-col items-center justify-center space-y-4 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-2">
              <motion.h2
                className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Active Relief Campaigns
              </motion.h2>
              <motion.p
                className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Support these verified campaigns to help communities affected by disasters in Malaysia.
              </motion.p>
            </div>
          </motion.div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
            {campaigns.slice(0, 3).map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
              >
                <Card className="h-full overflow-hidden border-2 hover:border-blue-300 hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="p-0">
                    <motion.div
                      className="relative h-48 w-full overflow-hidden"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Image
                        src={campaign.imageUrl || "/placeholder.svg?height=200&width=400"}
                        fill
                        alt={campaign.title}
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      {campaign.status === "Urgent" && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5, type: "spring" }}
                        >
                          <Badge className="absolute top-2 right-2 bg-blue-600" variant="secondary">
                            <Clock className="mr-1 h-3 w-3" /> Urgent
                          </Badge>
                        </motion.div>
                      )}
                      {campaign.status === "Critical" && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5, type: "spring" }}
                        >
                          <Badge className="absolute top-2 right-2 bg-amber-600 animate-pulse" variant="secondary">
                            <AlertTriangle className="mr-1 h-3 w-3" /> Critical
                          </Badge>
                        </motion.div>
                      )}
                    </motion.div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      {campaign.ngoVerified && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3, type: "spring" }}
                        >
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="mr-1 h-3 w-3" /> Verified NGO
                          </Badge>
                        </motion.div>
                      )}
                    </div>
                    <CardTitle className="text-xl mb-2">{campaign.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mb-4">{campaign.description}</CardDescription>
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                          className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2.5 rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${Math.min(((campaign.raised / campaign.goal) * 100), 100)}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">RM {campaign.raised.toLocaleString()} raised</span>
                        <span className="text-gray-500">of RM {campaign.goal.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t p-6 pt-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/campaigns/${campaign.id}`}>Learn More</Link>
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="sm" onClick={() => router.push(`/donate?campaign=${campaign.id}`)}>
                        <Heart className="mr-1 h-4 w-4" />
                        Donate
                      </Button>
                    </motion.div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
          <motion.div
            className="flex justify-center mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="lg" asChild>
                <Link href="/campaigns">
                  View All Campaigns <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>


      {/* Explanation Section */}
      <section className="relative w-full py-12 md:py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 flex items-center justify-center overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border-4 border-blue-500 rounded-full" />
          <div className="absolute bottom-10 right-10 w-32 h-32 border-4 border-cyan-500 rounded-full" />
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <motion.div
            className="flex flex-col items-center justify-center space-y-4 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-2">
              <motion.h2
                className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                How ReliefConnect Works
              </motion.h2>
              <motion.p
                className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Our platform connects verified NGOs with donors to ensure efficient disaster relief in Malaysia.
              </motion.p>
            </div>
          </motion.div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 mt-12">
            {[
              {
                icon: Shield,
                title: "NGO Verification",
                description: "We verify all NGOs on our platform to ensure your donations reach legitimate organizations.",
                color: "blue",
                delay: 0.2
              },
              {
                icon: Heart,
                title: "Transparent Donations",
                description: "Track your donations and see the real-time impact of your contribution on affected communities.",
                color: "pink",
                delay: 0.4
              },
              {
                icon: CheckCircle,
                title: "Secure Payments",
                description: "Our secure payment gateway ensures your donations are processed safely and reach the intended campaigns.",
                color: "green",
                delay: 0.6
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center space-y-4 text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: item.delay, duration: 0.5 }}
              >
                <motion.div
                  className={`flex h-16 w-16 items-center justify-center rounded-full bg-${item.color}-100 relative`}
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className={`absolute inset-0 rounded-full bg-${item.color}-200`}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <item.icon className={`h-8 w-8 text-${item.color}-600 relative z-10`} />
                </motion.div>
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: item.delay + 0.2, duration: 0.5 }}
                >
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="text-gray-500">{item.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Additional visual separator */}
          <motion.div
            className="flex items-center justify-center mt-16 gap-4"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="h-1 w-16 bg-gradient-to-r from-transparent to-blue-500 rounded" />
            <Droplets className="h-6 w-6 text-blue-600" />
            <div className="h-1 w-16 bg-gradient-to-l from-transparent to-blue-500 rounded" />
          </motion.div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="relative w-full py-12 md:py-24 bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-600 text-white flex items-center justify-center overflow-hidden">
        {/* Animated background patterns */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full opacity-10"
          initial={{ backgroundPosition: "0% 0%" }}
          animate={{ backgroundPosition: "100% 100%" }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "50px 50px"
          }}
        />

        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <motion.div
              className="flex flex-col justify-center space-y-4"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="space-y-2">
                <motion.h2
                  className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  Join the Relief Effort
                </motion.h2>
                <motion.p
                  className="max-w-[600px] text-blue-100 md:text-xl"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  Whether you're an NGO working on disaster relief or a donor looking to help, ReliefConnect makes it
                  easy to make a difference.
                </motion.p>
              </div>
              <motion.div
                className="flex flex-col gap-2 min-[400px]:flex-row"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="secondary" size="lg" asChild className="bg-white text-blue-900 hover:bg-blue-50">
                    <Link href="/donate">
                      <HandHeart className="mr-2 h-5 w-5" />
                      Donate Now
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    className="bg-transparent text-white border-white hover:bg-white hover:text-blue-900"
                    size="lg"
                    asChild
                  >
                    <Link href="/ngo/register">Register as NGO</Link>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            <div className="space-y-4">
              <motion.div
                className="bg-blue-700/50 backdrop-blur-sm p-6 rounded-lg border border-blue-500/30 hover:bg-blue-700/70 transition-all"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                whileHover={{ scale: 1.02, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
              >
                <motion.h3
                  className="text-xl font-bold mb-2 flex items-center"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <Heart className="mr-2 h-5 w-5 text-pink-300" />
                  For Donors
                </motion.h3>
                <ul className="space-y-2">
                  {[
                    "Browse campaigns by disaster type, location, or urgency",
                    "Make secure monetary donations to verified NGOs",
                    "Track donation impact via real-time updates"
                  ].map((text, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <CheckCircle className="mr-2 h-5 w-5 text-cyan-300 mt-0.5 flex-shrink-0" />
                      <span>{text}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                className="bg-blue-700/50 backdrop-blur-sm p-6 rounded-lg border border-blue-500/30 hover:bg-blue-700/70 transition-all"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6 }}
                whileHover={{ scale: 1.02, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
              >
                <motion.h3
                  className="text-xl font-bold mb-2 flex items-center"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                >
                  <Users className="mr-2 h-5 w-5 text-cyan-300" />
                  For NGOs
                </motion.h3>
                <ul className="space-y-2">
                  {[
                    "Create and manage disaster relief campaigns",
                    "Receive secure donations and provide updates",
                    "Build trust with donors through verification"
                  ].map((text, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                    >
                      <CheckCircle className="mr-2 h-5 w-5 text-cyan-300 mt-0.5 flex-shrink-0" />
                      <span>{text}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Floating particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </section>

    </div>
  );
}
