"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
} from "lucide-react"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("ngo-applications")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [reviewNotes, setReviewNotes] = useState("")

  // Mock data for NGO applications
  const ngoApplications = [
    {
      id: 1,
      organizationName: "Malaysian Relief Foundation",
      registrationNumber: "REG-2024-001",
      type: "NGO",
      contactPerson: "Ahmad Ibrahim",
      email: "ahmad@mrf.org",
      phone: "+60123456789",
      submittedDate: "2024-01-15",
      status: "pending",
      documents: ["registration.pdf", "tax-cert.pdf", "bank-statement.pdf"],
    },
    {
      id: 2,
      organizationName: "Highland Relief Society",
      registrationNumber: "REG-2024-002",
      type: "Charity",
      contactPerson: "Sarah Lee",
      email: "sarah@highland.org",
      phone: "+60198765432",
      submittedDate: "2024-01-16",
      status: "pending",
      documents: ["registration.pdf", "financial-report.pdf"],
    },
    {
      id: 3,
      organizationName: "Community Aid Network",
      registrationNumber: "REG-2024-003",
      type: "Foundation",
      contactPerson: "Raj Kumar",
      email: "raj@can.org",
      phone: "+60187654321",
      submittedDate: "2024-01-14",
      status: "under-review",
      documents: ["registration.pdf", "tax-cert.pdf"],
    },
  ]

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

  const handleApprove = (applicationId) => {
    console.log("Approving application:", applicationId, "Notes:", reviewNotes)
    // Here you would call your API to approve the application
  }

  const handleReject = (applicationId) => {
    console.log("Rejecting application:", applicationId, "Notes:", reviewNotes)
    // Here you would call your API to reject the application
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
    <div className="flex justify-center">
        <div className="container px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-500">Manage NGO applications, donor accounts, and monitor platform activity</p>
            </div>
            <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
            </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ngo-applications">
                <Building2 className="h-4 w-4 mr-2" />
                NGO Applications
            </TabsTrigger>
            <TabsTrigger value="donor-accounts">
                <Users className="h-4 w-4 mr-2" />
                Donor Accounts
            </TabsTrigger>
            <TabsTrigger value="activity-logs">
                <Activity className="h-4 w-4 mr-2" />
                Activity Logs
            </TabsTrigger>
            </TabsList>

            {/* NGO Applications Tab */}
            <TabsContent value="ngo-applications" className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                <h3 className="text-lg font-semibold">NGO Applications</h3>
                <p className="text-sm text-gray-500">Review and approve NGO registration applications</p>
                </div>
                <div className="flex gap-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                    />
                </div>
                <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                    <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under-review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Organization</TableHead>
                        <TableHead>Contact Person</TableHead>
                        <TableHead>Registration No.</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {ngoApplications.map((app) => (
                        <TableRow key={app.id}>
                        <TableCell>
                            <div>
                            <p className="font-medium">{app.organizationName}</p>
                            <p className="text-sm text-gray-500">{app.type}</p>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div>
                            <p className="text-sm">{app.contactPerson}</p>
                            <p className="text-xs text-gray-500">{app.email}</p>
                            </div>
                        </TableCell>
                        <TableCell>{app.registrationNumber}</TableCell>
                        <TableCell>{app.submittedDate}</TableCell>
                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                        <TableCell>
                            <Dialog>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => setSelectedApplication(app)}>
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
                                <DialogHeader>
                                <DialogTitle>Review Application</DialogTitle>
                                <DialogDescription>
                                    Review the NGO application details and supporting documents
                                </DialogDescription>
                                </DialogHeader>
                                {selectedApplication && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium">Organization Name</Label>
                                        <p className="text-sm mt-1">{selectedApplication.organizationName}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Registration Number</Label>
                                        <p className="text-sm mt-1">{selectedApplication.registrationNumber}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Organization Type</Label>
                                        <p className="text-sm mt-1">{selectedApplication.type}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Contact Person</Label>
                                        <p className="text-sm mt-1">{selectedApplication.contactPerson}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Email</Label>
                                        <p className="text-sm mt-1">{selectedApplication.email}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Phone</Label>
                                        <p className="text-sm mt-1">{selectedApplication.phone}</p>
                                    </div>
                                    </div>

                                    <div>
                                    <Label className="text-sm font-medium mb-2 block">Submitted Documents</Label>
                                    <div className="space-y-2">
                                        {selectedApplication.documents.map((doc, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                                            <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm">{doc}</span>
                                            </div>
                                            <Button size="sm" variant="ghost">
                                            <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        ))}
                                    </div>
                                    </div>

                                    <div>
                                    <Label htmlFor="review-notes">Review Notes</Label>
                                    <Textarea
                                        id="review-notes"
                                        placeholder="Add notes about your decision..."
                                        value={reviewNotes}
                                        onChange={(e) => setReviewNotes(e.target.value)}
                                        className="mt-2"
                                    />
                                    </div>

                                    <div className="flex gap-2">
                                    <Button
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        onClick={() => handleApprove(selectedApplication.id)}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve Application
                                    </Button>
                                    <Button
                                        className="flex-1 bg-red-600 hover:bg-red-700"
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
                </CardContent>
            </Card>
            </TabsContent>

            {/* Donor Accounts Tab */}
            <TabsContent value="donor-accounts" className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                <h3 className="text-lg font-semibold">Donor Accounts</h3>
                <p className="text-sm text-gray-500">Manage and monitor donor accounts</p>
                </div>
                <div className="flex gap-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                    placeholder="Search donors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                    />
                </div>
                <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                    <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">All Donors</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
                    <CardTitle className="text-sm font-medium">Verified Donors</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">12,456</div>
                    <p className="text-xs text-muted-foreground">78.6% of total</p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Donors</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">8,923</div>
                    <p className="text-xs text-muted-foreground">Donated in last 30 days</p>
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
                        <TableHead>Donor Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Total Donations</TableHead>
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
                                {donor.verified && <CheckCircle className="h-3 w-3 text-green-600 inline" />}
                            </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="text-sm">
                            <div className="flex items-center gap-1 mb-1">
                                <Mail className="h-3 w-3 text-gray-400" />
                                <span>{donor.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <span>{donor.phone}</span>
                            </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <span className="font-medium">{donor.totalDonations}</span>
                        </TableCell>
                        <TableCell>{donor.donationCount}</TableCell>
                        <TableCell>{donor.joinedDate}</TableCell>
                        <TableCell>{getStatusBadge(donor.status)}</TableCell>
                        <TableCell>
                            <Dialog>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                <UserCog className="h-4 w-4 mr-1" />
                                Manage
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white">
                                <DialogHeader>
                                <DialogTitle>Manage Donor Account</DialogTitle>
                                <DialogDescription>View details and manage {donor.name}'s account</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium">Account Status</Label>
                                    <Select defaultValue={donor.status}>
                                    <SelectTrigger className="mt-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-2">
                                    <Button className="flex-1 bg-transparent" variant="outline">
                                    View Donation History
                                    </Button>
                                    <Button className="flex-1 bg-transparent" variant="outline">
                                    Send Message
                                    </Button>
                                </div>
                                <Button className="w-full" variant="destructive">
                                    Suspend Account
                                </Button>
                                </div>
                            </DialogContent>
                            </Dialog>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
            </TabsContent>

            {/* Activity Logs Tab */}
            <TabsContent value="activity-logs" className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                <h3 className="text-lg font-semibold">Activity Logs</h3>
                <p className="text-sm text-gray-500">Monitor all platform activities and administrative actions</p>
                </div>
                <div className="flex gap-2">
                <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                    <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">All Activities</SelectItem>
                    <SelectItem value="approval">Approvals</SelectItem>
                    <SelectItem value="verification">Verifications</SelectItem>
                    <SelectItem value="alert">Alerts</SelectItem>
                    <SelectItem value="suspension">Suspensions</SelectItem>
                    <SelectItem value="report">Reports</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Logs
                </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-6">
                <div className="space-y-4">
                    {activityLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                        <div className="mt-1">{getActivityIcon(log.type)}</div>
                        <div className="flex-1">
                        <div className="flex items-start justify-between">
                            <div>
                            <p className="font-medium">{log.action}</p>
                            <p className="text-sm text-gray-500 mt-1">{log.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
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
                        </div>
                    </div>
                    ))}
                </div>
                </CardContent>
            </Card>
            </TabsContent>
        </Tabs>
        </div>
    </div>
  )
}
