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

export default function CampaignsPage() {
    const router = useRouter()

    const campaigns = [
        {
        id: "1",
        title: "Pahang Flood Relief",
        description:
            "Supporting communities affected by severe flooding in Pahang state with emergency supplies and shelter.",
        raised: 70000,
        goal: 100000,
        imageUrl: "/placeholder.svg?height=200&width=400",
        status: "Urgent",
        ngoVerified: true,
        type: "flood",
        },
        {
        id: "2",
        title: "Cameron Highlands Landslide Recovery",
        description: "Providing aid to families displaced by recent landslides in the Cameron Highlands region.",
        raised: 45000,
        goal: 100000,
        imageUrl: "/placeholder.svg?height=200&width=400",
        ngoVerified: true,
        type: "landslide",
        },
        {
        id: "3",
        title: "Kelantan Drought Response",
        description:
            "Delivering clean water and essential supplies to communities affected by severe drought in Kelantan.",
        raised: 25000,
        goal: 100000,
        imageUrl: "/placeholder.svg?height=200&width=400",
        status: "Critical",
        ngoVerified: true,
        type: "drought",
        },
        {
        id: "4",
        title: "Sabah Forest Fire Recovery",
        description: "Supporting communities and wildlife affected by forest fires in Sabah.",
        raised: 60000,
        goal: 100000,
        imageUrl: "/placeholder.svg?height=200&width=400",
        ngoVerified: true,
        type: "fire",
        },
        {
        id: "5",
        title: "Selangor Haze Relief",
        description: "Providing air purifiers and medical assistance to vulnerable communities affected by severe haze.",
        raised: 35000,
        goal: 100000,
        imageUrl: "/placeholder.svg?height=200&width=400",
        ngoVerified: true,
        type: "haze",
        },
        {
        id: "6",
        title: "Terengganu Coastal Community Support",
        description: "Helping fishing communities affected by coastal erosion and rising sea levels in Terengganu.",
        raised: 15000,
        goal: 100000,
        imageUrl: "/placeholder.svg?height=200&width=400",
        status: "Urgent",
        ngoVerified: true,
        type: "erosion",
        },
    ]


  return (
        <div className="container mx-auto w-full bg-amber-400 px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
            <h1 className="text-3xl font-bold mb-2">Disaster Relief Campaigns</h1>
            <p className="text-gray-500">Browse and support verified disaster relief campaigns across Malaysia</p>
            </div>
            <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
            <Select defaultValue="newest">
                <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="urgent">Most Urgent</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
                <SelectItem value="goal">Funding Goal</SelectItem>
                </SelectContent>
            </Select>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input placeholder="Search campaigns..." className="pl-10" />
            </div>
            </div>
            <div>
            <Tabs defaultValue="all">
                <TabsList className="w-full border-2">
                <TabsTrigger value="all" className="flex-1">
                    All
                </TabsTrigger>
                <TabsTrigger value="flood" className="flex-1">
                    Flood
                </TabsTrigger>
                <TabsTrigger value="landslide" className="flex-1">
                    Landslide
                </TabsTrigger>
                <TabsTrigger value="drought" className="flex-1">
                    Drought
                </TabsTrigger>
                </TabsList>
            </Tabs>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
            <Card key={campaign.id}>
                <CardHeader className="p-0">
                <div className="relative h-48 w-full">
                    <Image
                    src={campaign.imageUrl || "/placeholder.svg"}
                    fill
                    alt={campaign.title}
                    className="object-cover rounded-t-lg"
                    />
                    {campaign.status === "Urgent" && (
                    <Badge className="absolute top-2 right-2 bg-blue-600" variant="secondary">
                        <Clock className="mr-1 h-3 w-3" /> Urgent
                    </Badge>
                    )}
                    {campaign.status === "Critical" && (
                    <Badge className="absolute top-2 right-2 bg-amber-600" variant="secondary">
                        <AlertTriangle className="mr-1 h-3 w-3" /> Critical
                    </Badge>
                    )}
                </div>
                </CardHeader>
                <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                    {campaign.ngoVerified && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="mr-1 h-3 w-3" /> Verified NGO
                    </Badge>
                    )}
                </div>
                <CardTitle className="text-xl mb-2">{campaign.title}</CardTitle>
                <CardDescription className="line-clamp-2 mb-4">{campaign.description}</CardDescription>
                <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${(campaign.raised / campaign.goal) * 100}%` }}
                    ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                    <span className="font-medium">RM {campaign.raised} raised</span>
                    <span className="text-gray-500">of RM {campaign.goal}</span>
                    </div>
                </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-6 pt-4">
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/campaigns/${campaign.id}`}>Learn More</Link>
                </Button>
                <Button size="sm" onClick={() => router.push(`/donate?campaign=${campaign.id}`)}>
                    Donate
                </Button>
                </CardFooter>
            </Card>
            ))}
        </div>

        <div className="flex justify-center mt-8">
            <Button variant="outline">Load More</Button>
        </div>
        </div>
  )
}
