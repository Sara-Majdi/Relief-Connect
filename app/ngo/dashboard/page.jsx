"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Package,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
} from "lucide-react"
import Link from "next/link"

export default function NGODashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [ngoInfo, setNgoInfo] = useState(null)

  // Check NGO authentication on mount
  useEffect(() => {
    const checkNGOSession = async () => {
      try {
        const response = await fetch('/api/auth/check-session')
        const data = await response.json()
        
        if (!data.isAuthenticated || !data.user) {
          router.push('/auth/ngo')
          return
        }
        
        setNgoInfo(data.user)
        setLoading(false)
      } catch (error) {
        console.error('Error checking NGO session:', error)
        router.push('/auth/ngo')
      }
    }

    checkNGOSession()
  }, [router])

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-12">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container  mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">NGO Dashboard</h1>
          <p className="text-gray-500">Manage your disaster relief campaigns and track donations</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/ngo/campaigns/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="items">Needed Items</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">RM 185,000</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">2 urgent, 1 ongoing</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">+89 new this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Items Received</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89%</div>
                <p className="text-xs text-muted-foreground">of requested items</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest donations and campaign updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New donation received</p>
                    <p className="text-xs text-gray-500">RM 500 donated to Pahang Flood Relief • 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Campaign update posted</p>
                    <p className="text-xs text-gray-500">Added photos from relief distribution • 4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Item request fulfilled</p>
                    <p className="text-xs text-gray-500">100 blankets received for Cameron Highlands • 1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Campaign Card 1 */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Pahang Flood Relief</CardTitle>
                    <CardDescription>Emergency flood response</CardDescription>
                  </div>
                  <Badge className="bg-blue-600">
                    <Clock className="mr-1 h-3 w-3" /> Urgent
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>70%</span>
                  </div>
                  <Progress value={70} />
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">RM 70,000</span>
                    <span className="text-gray-500">of RM 100,000</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/campaigns/1">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/ngo/campaigns/1/edit">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Card 2 */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Cameron Highlands Recovery</CardTitle>
                    <CardDescription>Landslide recovery support</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <CheckCircle className="mr-1 h-3 w-3" /> Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>45%</span>
                  </div>
                  <Progress value={45} />
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">RM 45,000</span>
                    <span className="text-gray-500">of RM 100,000</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/campaigns/2">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/ngo/campaigns/2/edit">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Card 3 */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Kelantan Drought Response</CardTitle>
                    <CardDescription>Water and supplies distribution</CardDescription>
                  </div>
                  <Badge className="bg-amber-600">
                    <AlertTriangle className="mr-1 h-3 w-3" /> Critical
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>25%</span>
                  </div>
                  <Progress value={25} />
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">RM 25,000</span>
                    <span className="text-gray-500">of RM 100,000</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/campaigns/3">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/ngo/campaigns/3/edit">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="items" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Needed Items</h3>
              <p className="text-sm text-gray-500">Manage items needed for your campaigns</p>
            </div>
            <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item Request
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>Add Item Request</DialogTitle>
                  <DialogDescription>Add a new item that your campaign needs from donors.</DialogDescription>
                </DialogHeader>
                <AddItemForm onClose={() => setIsAddItemOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Needed</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Blankets</TableCell>
                    <TableCell>Cameron Highlands Recovery</TableCell>
                    <TableCell>200</TableCell>
                    <TableCell>150</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={75} className="w-16" />
                        <span className="text-sm">75%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-amber-600">High</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Water Bottles</TableCell>
                    <TableCell>Kelantan Drought Response</TableCell>
                    <TableCell>1000</TableCell>
                    <TableCell>300</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={30} className="w-16" />
                        <span className="text-sm">30%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-red-600">Critical</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Food Packages</TableCell>
                    <TableCell>Pahang Flood Relief</TableCell>
                    <TableCell>500</TableCell>
                    <TableCell>500</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={100} className="w-16" />
                        <span className="text-sm">100%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-600">Complete</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="updates" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Campaign Updates</h3>
              <p className="text-sm text-gray-500">Share progress and updates with your donors</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post Update
            </Button>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Relief Distribution Complete</CardTitle>
                    <CardDescription>Pahang Flood Relief • 2 hours ago</CardDescription>
                  </div>
                  <Badge variant="outline">Published</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  We have successfully distributed emergency supplies to 150 families affected by the flooding in
                  Pahang. Thanks to your generous donations, we were able to provide food packages, clean water, and
                  temporary shelter materials.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    View Public
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Urgent: More Blankets Needed</CardTitle>
                    <CardDescription>Cameron Highlands Recovery • 1 day ago</CardDescription>
                  </div>
                  <Badge variant="outline">Published</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Due to the cold weather in the highlands, we urgently need more blankets for the displaced families.
                  We still need 50 more blankets to ensure everyone stays warm during the night.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    View Public
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

  
  function AddItemForm({ onClose }) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="item-name">Item Name</Label>
          <Input id="item-name" placeholder="e.g., Blankets, Water Bottles" />
        </div>
  
        <div className="space-y-2">
          <Label htmlFor="campaign-select">Campaign</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select campaign" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="pahang">Pahang Flood Relief</SelectItem>
              <SelectItem value="cameron">Cameron Highlands Recovery</SelectItem>
              <SelectItem value="kelantan">Kelantan Drought Response</SelectItem>
            </SelectContent>
          </Select>
        </div>
  
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity Needed</Label>
            <Input id="quantity" type="number" placeholder="100" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
  
        <div className="space-y-2">
          <Label htmlFor="item-description">Description</Label>
          <Textarea id="item-description" placeholder="Describe the item specifications or requirements" />
        </div>
  
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>Add Item</Button>
        </div>
      </div>
    )
  }
