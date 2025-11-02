"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, CheckCircle, Clock, Filter, Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useEffect, useState } from "react"
import { createClient } from '@/lib/supabase/client'

export default function CampaignsPage() {
    const router = useRouter()
    const [campaigns, setCampaigns] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedDisasterType, setSelectedDisasterType] = useState("all")
    const [sortBy, setSortBy] = useState("newest")

    const supabase = createClient()

    // Fetching Campaigns
    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
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
            } catch (err) {
                console.error('Unexpected error:', err)
            }
        }

        fetchCampaigns()
    }, [supabase])

    // Filter and search campaigns
    const filteredCampaigns = useMemo(() => {
        let filtered = campaigns

        // Filter by disaster type
        if (selectedDisasterType !== "all") {
            filtered = filtered.filter(campaign => 
                campaign.type?.toLowerCase() === selectedDisasterType.toLowerCase()
            )
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim()
            filtered = filtered.filter(campaign =>
                campaign.title?.toLowerCase().includes(query) ||
                campaign.description?.toLowerCase().includes(query) ||
                campaign.type?.toLowerCase().includes(query)
            )
        }

        // Sort campaigns
        return filtered.sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.created_at) - new Date(a.created_at)
                case "urgent":
                    const urgencyOrder = { "critical": 3, "urgent": 2, "normal": 1 }
                    return (urgencyOrder[b.urgency] || 1) - (urgencyOrder[a.urgency] || 1)
                case "progress":
                    const progressA = (a.raised / a.goal) * 100
                    const progressB = (b.raised / b.goal) * 100
                    return progressB - progressA
                case "goal":
                    return b.goal - a.goal
                default:
                    return 0
            }
        })
    }, [campaigns, searchQuery, selectedDisasterType, sortBy])

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value)
    }

    // Handle disaster type filter change
    const handleDisasterTypeChange = (value) => {
        setSelectedDisasterType(value)
    }

    // Handle sort change
    const handleSortChange = (value) => {
        setSortBy(value)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 md:py-20 shadow-lg">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
                            Make a Difference Today
                        </h1>
                        <p className="text-lg md:text-xl text-blue-100 mb-6">
                            Support verified disaster relief campaigns and help communities across Malaysia
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 text-sm">
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                <CheckCircle className="h-4 w-4" />
                                <span>100% Verified NGOs</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                <AlertTriangle className="h-4 w-4" />
                                <span>Real-time Updates</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                <Clock className="h-4 w-4" />
                                <span>Transparent Tracking</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto w-full px-4 md:px-6 py-8 md:py-12">
                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 -mt-20">
                    <Card className="text-center shadow-lg hover:shadow-xl transition-shadow bg-white/95 backdrop-blur">
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-blue-600 mb-1">{filteredCampaigns.length}</div>
                            <div className="text-sm text-gray-600">Active Campaigns</div>
                        </CardContent>
                    </Card>
                    {/* 
                    <Card className="text-center shadow-lg hover:shadow-xl transition-shadow bg-white/95 backdrop-blur">
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-green-600 mb-1">
                                {filteredCampaigns.filter(c => c.ngoVerified).length}
                            </div>
                            <div className="text-sm text-gray-600">Verified NGOs</div>
                        </CardContent>
                    </Card>
                    */}
                    <Card className="text-center shadow-lg hover:shadow-xl transition-shadow bg-white/95 backdrop-blur">
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-orange-600 mb-1">
                                {filteredCampaigns.filter(c => c.urgency === "critical" || c.urgency === "urgent").length}
                            </div>
                            <div className="text-sm text-gray-600">Urgent Cases</div>
                        </CardContent>
                    </Card>
                    
                    <Card className="text-center shadow-lg hover:shadow-xl transition-shadow bg-white/95 backdrop-blur">
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-purple-600 mb-1">
                                RM {filteredCampaigns.reduce((sum, c) => sum + c.raised, 0).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Total Raised</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters Section */}
                <Card className="mb-8 shadow-md border-0">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-semibold mb-1">Browse Campaigns</h2>
                                <p className="text-sm text-gray-500">
                                    Showing {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Select value={sortBy} onValueChange={handleSortChange}>
                                    <SelectTrigger className="w-[180px] border-2 hover:border-blue-300 transition-colors">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem value="newest">Newest First</SelectItem>
                                        <SelectItem value="urgent">Most Urgent</SelectItem>
                                        <SelectItem value="progress">Progress</SelectItem>
                                        <SelectItem value="goal">Funding Goal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Search campaigns by title, description, or disaster type..."
                                        className="pl-10 border-2 hover:border-blue-300 focus:border-blue-500 transition-colors"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <Tabs defaultValue="all" value={selectedDisasterType} onValueChange={handleDisasterTypeChange}>
                                    <TabsList className="w-full border-2 bg-gray-50">
                                        <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-white">
                                            All
                                        </TabsTrigger>
                                        <TabsTrigger value="flood" className="flex-1 data-[state=active]:bg-blue-100">
                                            Flood
                                        </TabsTrigger>
                                        <TabsTrigger value="landslide" className="flex-1 data-[state=active]:bg-orange-100">
                                            Landslide
                                        </TabsTrigger>
                                        <TabsTrigger value="drought" className="flex-1 data-[state=active]:bg-yellow-100">
                                            Drought
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                    {/* Show no results message */}
                {filteredCampaigns.length === 0 && (searchQuery || selectedDisasterType !== "all") && (
                    <Card className="text-center py-12 shadow-md">
                        <CardContent>
                            <div className="text-gray-400 mb-2">
                                <Search className="h-16 w-16 mx-auto mb-4" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns found</h3>
                            <p className="text-gray-500 mb-6">
                                Try adjusting your search terms or filters to find what you're looking for.
                            </p>
                            <Button
                                onClick={() => {
                                    setSearchQuery("")
                                    setSelectedDisasterType("all")
                                }}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                Clear Filters
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCampaigns.map((campaign) => (
                        <Card key={campaign.id} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg overflow-hidden">
                            <CardHeader className="p-0">
                                <div className="relative h-52 w-full overflow-hidden">
                                    <Image
                                        src={campaign.imageUrl || "/placeholder.svg"}
                                        fill
                                        alt={campaign.title}
                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    {campaign.status === "Urgent" && (
                                        <Badge className="absolute top-3 right-3 bg-blue-600 shadow-lg animate-pulse">
                                            <Clock className="mr-1 h-3 w-3" /> Urgent
                                        </Badge>
                                    )}
                                    {campaign.status === "Critical" && (
                                        <Badge className="absolute top-3 right-3 bg-red-600 shadow-lg animate-pulse">
                                            <AlertTriangle className="mr-1 h-3 w-3" /> Critical
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    {campaign.ngoVerified && (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 shadow-sm">
                                            <CheckCircle className="mr-1 h-3 w-3" /> Verified NGO
                                        </Badge>
                                    )}
                                    {campaign.type && (
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                            {campaign.type}
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="text-xl mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                                    {campaign.title}
                                </CardTitle>
                                <CardDescription className="line-clamp-2 mb-4 text-gray-600">
                                    {campaign.description}
                                </CardDescription>
                                <div className="space-y-3">
                                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                                        <div
                                            className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                                            style={{ width: `${campaign.goal > 0 ? Math.min(((parseFloat(campaign.raised) || 0) / parseFloat(campaign.goal)) * 100, 100) : 0}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="font-semibold text-gray-900">
                                            RM {(parseFloat(campaign.raised) || 0).toLocaleString()}
                                        </span>
                                        <span className="text-gray-500">
                                            of RM {(parseFloat(campaign.goal) || 0).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="pt-2 text-xs text-gray-500">
                                        {campaign.goal > 0 ? Math.round(((parseFloat(campaign.raised) || 0) / parseFloat(campaign.goal)) * 100) : 0}% funded
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex gap-3 border-t bg-gray-50 p-4">
                                <Button variant="outline" size="sm" className="flex-1 hover:bg-white hover:border-blue-400 hover:text-blue-600 transition-colors" asChild>
                                    <Link href={`/campaigns/${campaign.id}`}>Learn More</Link>
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all"
                                    onClick={() => router.push(`/donate?campaign=${campaign.id}`)}
                                >
                                    Donate Now
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {filteredCampaigns.length > 0 && (
                    <div className="flex justify-center mt-12">
                        <Button
                            variant="outline"
                            size="lg"
                            className="px-8 border-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent transition-all shadow-md"
                        >
                            Load More Campaigns
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}