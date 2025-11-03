"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Building2,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Search,
  UserCog,
  Activity,
  AlertTriangle,
  Mail,
  Phone,
  DollarSign,
  ArrowUpRight,
  BarChart3,
} from "lucide-react"
import AnalyticsSection from "@/components/analytics/AnalyticsSection"

export default function AdminDashboard() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState(tabParam || "overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [ngoApplications, setNgoApplications] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  // Fetch NGO applications when the NGO Applications tab is active
  useEffect(() => {
    if (activeTab === "ngo-applications") {
      fetchNgoApplications()
    }
  }, [activeTab])

  const fetchNgoApplications = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ngo/registrations?status=all')
      const result = await response.json()
      
      if (response.ok) {
        setNgoApplications(result.data || [])
      } else {
        console.error('Error fetching NGO applications:', result.error)
        setNgoApplications([])
      }
    } catch (error) {
      console.error('Error fetching NGO applications:', error)
      setNgoApplications([])
    } finally {
      setLoading(false)
    }
  }


  // Mock data for donor accounts
  const donorAccounts = [
    {
      id: 1,
      name: "Ahmad Rahman",
      email: "ahmad.rahman@email.com",
      phone: "+60123456789",
      totalDonations: "RM 5,400",
      donationCount: 12,
      joinedDate: "2023-06-15",
      status: "active",
      verified: true,
    },
    {
      id: 2,
      name: "Siti Nurhaliza",
      email: "siti.n@email.com",
      phone: "+60198765432",
      totalDonations: "RM 3,200",
      donationCount: 8,
      joinedDate: "2023-08-20",
      status: "active",
      verified: true,
    },
    {
      id: 3,
      name: "John Tan",
      email: "john.tan@email.com",
      phone: "+60187654321",
      totalDonations: "RM 1,800",
      donationCount: 5,
      joinedDate: "2023-11-05",
      status: "active",
      verified: false,
    },
    {
      id: 4,
      name: "Lisa Wong",
      email: "lisa.wong@email.com",
      phone: "+60176543210",
      totalDonations: "RM 8,900",
      donationCount: 18,
      joinedDate: "2023-03-10",
      status: "active",
      verified: true,
    },
  ]

  // Mock data for activity logs
  const activityLogs = [
    {
      id: 1,
      action: "NGO Application Approved",
      description: "Mercy Malaysia application approved",
      user: "Admin John",
      timestamp: "2024-01-16 10:30 AM",
      type: "approval",
    },
    {
      id: 2,
      action: "Donor Account Verified",
      description: "Ahmad Rahman account verified",
      user: "Admin Sarah",
      timestamp: "2024-01-16 09:15 AM",
      type: "verification",
    },
    {
      id: 3,
      action: "Campaign Flagged",
      description: "Suspicious activity on Campaign #45",
      user: "System",
      timestamp: "2024-01-16 08:45 AM",
      type: "alert",
    },
    {
      id: 4,
      action: "Report Generated",
      description: "Monthly donation report created",
      user: "Admin John",
      timestamp: "2024-01-15 11:00 PM",
      type: "report",
    },
    {
      id: 5,
      action: "Donor Account Suspended",
      description: "Suspicious donation pattern detected",
      user: "Admin Sarah",
      timestamp: "2024-01-15 04:20 PM",
      type: "suspension",
    },
  ]

  const handleApprove = async (applicationId) => {
    try {
      const response = await fetch(`/api/ngo/registrations/${applicationId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewNotes: reviewNotes
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Refresh the applications list
        await fetchNgoApplications()
        setReviewNotes("")
        setSelectedApplication(null)
        
        // Show email status
        const message = result.emailSent 
          ? 'NGO application approved successfully! Password setup email sent.'
          : 'NGO application approved successfully! However, email sending failed: ' + result.emailError
        
        alert(message)
      } else {
        alert('Error approving application: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error approving application:', error)
      alert('Error approving application: ' + error.message)
    }
  }

  const handleReject = async (applicationId) => {
    try {
      const response = await fetch(`/api/ngo/registrations/${applicationId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewNotes: reviewNotes
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Refresh the applications list
        await fetchNgoApplications()
        setReviewNotes("")
        setSelectedApplication(null)
        
        // Show email status
        const message = result.emailSent 
          ? 'NGO application rejected. Rejection email sent.'
          : 'NGO application rejected. However, email sending failed: ' + result.emailError
        
        alert(message)
      } else {
        alert('Error rejecting application: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error rejecting application:', error)
      alert('Error rejecting application: ' + error.message)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-amber-600", label: "Pending" },
      "under-review": { color: "bg-blue-600", label: "Under Review" },
      approved: { color: "bg-green-600", label: "Approved" },
      rejected: { color: "bg-red-600", label: "Rejected" },
      active: { color: "bg-green-600", label: "Active" },
      suspended: { color: "bg-red-600", label: "Suspended" },
    }
    const config = statusConfig[status] || { color: "bg-gray-600", label: status }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case "approval":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "verification":
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-amber-600" />
      case "suspension":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "report":
        return <FileText className="h-4 w-4 text-gray-600" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 pb-12">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-slate-600 mt-1">Manage platform operations and monitor activities</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="shadow-sm hover:shadow">
                <Activity className="mr-2 h-4 w-4" />
                Activity
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pt-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white p-1 shadow-sm border border-slate-200">
            {/*
            <TabsTrigger value="overview">Overview</TabsTrigger>
            */}
            <TabsTrigger
              value="ngo-applications"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Building2 className="h-4 w-4 mr-2" />
              NGO Applications
            </TabsTrigger>
            {/*
            <TabsTrigger value="donor-accounts">Donor Accounts</TabsTrigger>
            <TabsTrigger value="activity-logs">Activity Logs</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            */}
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

        {/* Overview Tab */}
        {/*
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total NGOs</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">127</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">+12</span> from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89</div>
                <p className="text-xs text-muted-foreground mt-1">23 pending approval</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">RM 2.4M</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">+18%</span> from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Platform Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15,847</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">+234</span> this week
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest actions on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-start gap-4">
                      <div className="mt-1">{getActivityIcon(log.type)}</div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{log.action}</p>
                        <p className="text-sm text-muted-foreground">{log.description}</p>
                        <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Pending Actions</CardTitle>
                <CardDescription>Items requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                      <Building2 className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">NGO Applications</p>
                      <p className="text-xs text-muted-foreground">3 pending review</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                      <AlertTriangle className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Flagged Accounts</p>
                      <p className="text-xs text-muted-foreground">2 need verification</p>
                    </div>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        */}

        {/* NGO Applications Tab */}
        <TabsContent value="ngo-applications" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs font-medium uppercase text-slate-600">Pending Review</CardDescription>
                <CardTitle className="text-3xl font-bold text-amber-600">
                  {ngoApplications.filter(app => app.status === 'pending').length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs font-medium uppercase text-slate-600">Approved</CardDescription>
                <CardTitle className="text-3xl font-bold text-green-600">
                  {ngoApplications.filter(app => app.status === 'approved').length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs font-medium uppercase text-slate-600">Rejected</CardDescription>
                <CardTitle className="text-3xl font-bold text-red-600">
                  {ngoApplications.filter(app => app.status === 'rejected').length}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>NGO Applications</CardTitle>
                  <CardDescription>Review and approve NGO registration applications</CardDescription>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {ngoApplications.length} Total
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by organization name, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-300 focus:border-blue-500"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-48 border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under-review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Applications Table */}
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading NGO applications...</p>
                </div>
              ) : ngoApplications.length === 0 ? (
                <div className="p-12 text-center">
                  <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">No NGO applications found</p>
                  <p className="text-sm text-slate-500 mt-1">New applications will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="font-semibold text-slate-700">Organization</TableHead>
                        <TableHead className="font-semibold text-slate-700">Contact</TableHead>
                        <TableHead className="font-semibold text-slate-700">Registration No.</TableHead>
                        <TableHead className="font-semibold text-slate-700">Submitted</TableHead>
                        <TableHead className="font-semibold text-slate-700">Status</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ngoApplications.map((app) => (
                        <TableRow key={app.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell>
                            <div>
                              <p className="font-medium text-slate-900">{app.org_name}</p>
                              <p className="text-sm text-slate-500">{app.org_type}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-sm">
                                <Mail className="h-3.5 w-3.5 text-slate-400" />
                                <span className="text-slate-600">{app.email}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs">
                                <Phone className="h-3 w-3 text-slate-400" />
                                <span className="text-slate-500">{app.phone}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm text-slate-700">{app.registration_number}</TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {new Date(app.created_at).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </TableCell>
                          <TableCell>{getStatusBadge(app.status)}</TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedApplication(app)}
                                  className="shadow-sm hover:shadow hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                                >
                                  <Eye className="h-4 w-4 mr-1.5" />
                                  Review
                                </Button>
                              </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
                              <DialogHeader className="border-b pb-4">
                                <DialogTitle className="text-2xl font-bold text-slate-900">Review Application</DialogTitle>
                                <DialogDescription className="text-slate-600">
                                  Review the NGO application details and supporting documents
                                </DialogDescription>
                              </DialogHeader>
                              {selectedApplication && (
                                <div className="space-y-6 pt-4">
                                  {/* Organization Info */}
                                  <div className="bg-gradient-to-br from-blue-50 to-slate-50 p-4 rounded-lg border border-blue-100">
                                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                      <Building2 className="h-5 w-5 text-blue-600" />
                                      Organization Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="bg-white p-3 rounded border border-slate-200">
                                        <Label className="text-xs font-semibold text-slate-500 uppercase">Organization Name</Label>
                                        <p className="text-sm mt-1.5 font-medium text-slate-900">{selectedApplication.org_name}</p>
                                      </div>
                                      <div className="bg-white p-3 rounded border border-slate-200">
                                        <Label className="text-xs font-semibold text-slate-500 uppercase">Registration Number</Label>
                                        <p className="text-sm mt-1.5 font-mono text-slate-900">{selectedApplication.registration_number}</p>
                                      </div>
                                      <div className="bg-white p-3 rounded border border-slate-200">
                                        <Label className="text-xs font-semibold text-slate-500 uppercase">Organization Type</Label>
                                        <p className="text-sm mt-1.5 text-slate-900">{selectedApplication.org_type}</p>
                                      </div>
                                      <div className="bg-white p-3 rounded border border-slate-200">
                                        <Label className="text-xs font-semibold text-slate-500 uppercase">Year Established</Label>
                                        <p className="text-sm mt-1.5 text-slate-900">{selectedApplication.year_established}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Contact Info */}
                                  <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-4 rounded-lg border border-slate-200">
                                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                      <Mail className="h-5 w-5 text-slate-600" />
                                      Contact Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="bg-white p-3 rounded border border-slate-200">
                                        <Label className="text-xs font-semibold text-slate-500 uppercase">Email</Label>
                                        <p className="text-sm mt-1.5 text-slate-900">{selectedApplication.email}</p>
                                      </div>
                                      <div className="bg-white p-3 rounded border border-slate-200">
                                        <Label className="text-xs font-semibold text-slate-500 uppercase">Phone</Label>
                                        <p className="text-sm mt-1.5 text-slate-900">{selectedApplication.phone}</p>
                                      </div>
                                    </div>
                                    <div className="mt-3 bg-white p-3 rounded border border-slate-200">
                                      <Label className="text-xs font-semibold text-slate-500 uppercase">Address</Label>
                                      <p className="text-sm mt-1.5 text-slate-900">{selectedApplication.address}</p>
                                      <p className="text-sm text-slate-600">{selectedApplication.city}, {selectedApplication.state} {selectedApplication.postal_code}</p>
                                    </div>
                                  </div>

                                  {/* Description */}
                                  {selectedApplication.description && (
                                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                      <Label className="text-xs font-semibold text-amber-900 uppercase flex items-center gap-2 mb-2">
                                        <FileText className="h-4 w-4" />
                                        Description
                                      </Label>
                                      <p className="text-sm text-slate-700 leading-relaxed">{selectedApplication.description}</p>
                                    </div>
                                  )}

                                  {/* Documents */}
                                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <Label className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                      <FileText className="h-5 w-5 text-slate-600" />
                                      Submitted Documents
                                    </Label>
                                    <div className="space-y-2">
                                      {selectedApplication.registration_cert_url && (
                                        <div className="flex items-center justify-between p-3 bg-white border border-slate-300 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all">
                                          <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 rounded">
                                              <FileText className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <span className="text-sm font-medium text-slate-900">Registration Certificate</span>
                                          </div>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => window.open(selectedApplication.registration_cert_url, '_blank')}
                                            className="hover:bg-blue-50 hover:text-blue-700"
                                          >
                                            <Download className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      )}
                                      {selectedApplication.tax_exemption_cert_url && (
                                        <div className="flex items-center justify-between p-3 bg-white border border-slate-300 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all">
                                          <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 rounded">
                                              <FileText className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <span className="text-sm font-medium text-slate-900">Tax Exemption Certificate</span>
                                          </div>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => window.open(selectedApplication.tax_exemption_cert_url, '_blank')}
                                            className="hover:bg-blue-50 hover:text-blue-700"
                                          >
                                            <Download className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      )}
                                      {selectedApplication.annual_report_url && (
                                        <div className="flex items-center justify-between p-3 bg-white border border-slate-300 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all">
                                          <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 rounded">
                                              <FileText className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <span className="text-sm font-medium text-slate-900">Annual Report</span>
                                          </div>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => window.open(selectedApplication.annual_report_url, '_blank')}
                                            className="hover:bg-blue-50 hover:text-blue-700"
                                          >
                                            <Download className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      )}
                                      {!selectedApplication.registration_cert_url && !selectedApplication.tax_exemption_cert_url && !selectedApplication.annual_report_url && (
                                        <div className="text-center py-6">
                                          <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                                          <p className="text-sm text-slate-500">No documents uploaded</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Review Notes */}
                                  <div className="border-t pt-4">
                                    <Label htmlFor="review-notes" className="text-sm font-semibold text-slate-900 mb-2 block">
                                      Review Notes
                                    </Label>
                                    <Textarea
                                      id="review-notes"
                                      placeholder="Add notes about your decision (optional)..."
                                      value={reviewNotes}
                                      onChange={(e) => setReviewNotes(e.target.value)}
                                      className="mt-2 min-h-[100px] border-slate-300 focus:border-blue-500"
                                    />
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex gap-3 pt-2 border-t">
                                    <Button
                                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transition-all"
                                      onClick={() => handleApprove(selectedApplication.id)}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve Application
                                    </Button>
                                    <Button
                                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-md hover:shadow-lg transition-all"
                                      onClick={() => handleReject(selectedApplication.id)}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject Application
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Donor Accounts Tab */}
        {/*
        <TabsContent value="donor-accounts" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Donor Accounts</h3>
              <p className="text-sm text-muted-foreground">Manage and monitor donor accounts</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15,847</div>
                <p className="text-xs text-muted-foreground">+234 this week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,456</div>
                <p className="text-xs text-muted-foreground">78.6% of total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8,923</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Donation</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">RM 385</div>
                <p className="text-xs text-muted-foreground">Per donor</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donor</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Donations</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donorAccounts.map((donor) => (
                    <TableRow key={donor.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">{donor.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-medium">{donor.name}</p>
                            {donor.verified && <CheckCircle className="h-3 w-3 text-green-600 inline ml-1" />}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{donor.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{donor.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{donor.totalDonations}</TableCell>
                      <TableCell>{donor.donationCount}</TableCell>
                      <TableCell>{donor.joinedDate}</TableCell>
                      <TableCell>{getStatusBadge(donor.status)}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <UserCog className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        */}

        {/* Activity Logs Tab */}
        {/* 
        <TabsContent value="activity-logs" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Activity Logs</h3>
              <p className="text-sm text-muted-foreground">Monitor platform activities and administrative actions</p>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="mt-1">{getActivityIcon(log.type)}</div>
                    <div className="flex-1">
                      <p className="font-medium">{log.action}</p>
                      <p className="text-sm text-muted-foreground mt-1">{log.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <UserCog className="h-3 w-3" />
                          {log.user}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {log.timestamp}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        */}

        {/* Reports Tab */}
        {/*
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Reports</CardTitle>
              <CardDescription>Create detailed reports for platform analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Reports feature coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        */}

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsSection />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
