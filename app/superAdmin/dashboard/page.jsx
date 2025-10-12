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
import { Switch } from "@/components/ui/switch"
import {
  UserPlus,
  Users,
  Activity,
  Shield,
  Edit,
  Trash2,
  Eye,
  Search,
  Download,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
} from "lucide-react"

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState("admins")
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  })

  // Mock data for admin accounts
  const adminAccounts = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@reliefconnect.com",
      role: "admin",
      status: "active",
      createdDate: "2023-06-15",
      lastLogin: "2024-01-16 10:30 AM",
      actionsCount: 145,
    },
    {
      id: 2,
      name: "Sarah Lee",
      email: "sarah.lee@reliefconnect.com",
      role: "admin",
      status: "active",
      createdDate: "2023-08-20",
      lastLogin: "2024-01-16 09:15 AM",
      actionsCount: 98,
    },
    {
      id: 3,
      name: "Michael Chen",
      email: "michael.chen@reliefconnect.com",
      role: "admin",
      status: "inactive",
      createdDate: "2023-11-05",
      lastLogin: "2024-01-10 03:45 PM",
      actionsCount: 52,
    },
  ]

  // Mock data for system statistics
  const systemStats = [
    {
      label: "Total Admins",
      value: "8",
      change: "+2 this month",
      icon: Users,
    },
    {
      label: "Active Sessions",
      value: "5",
      change: "Currently online",
      icon: Activity,
    },
    {
      label: "Total Actions",
      value: "1,247",
      change: "+45 today",
      icon: BarChart3,
    },
    {
      label: "System Uptime",
      value: "99.9%",
      change: "Last 30 days",
      icon: Shield,
    },
  ]

  // Mock data for activity monitoring
  const activityMonitoring = [
    {
      id: 1,
      admin: "John Smith",
      action: "Approved NGO Application",
      target: "Malaysian Relief Foundation",
      timestamp: "2024-01-16 10:30 AM",
      status: "success",
      ipAddress: "203.0.113.45",
    },
    {
      id: 2,
      admin: "Sarah Lee",
      action: "Suspended Donor Account",
      target: "Suspicious User #12345",
      timestamp: "2024-01-16 09:15 AM",
      status: "warning",
      ipAddress: "203.0.113.67",
    },
    {
      id: 3,
      admin: "Michael Chen",
      action: "Generated Report",
      target: "Monthly Donation Summary",
      timestamp: "2024-01-15 11:00 PM",
      status: "success",
      ipAddress: "203.0.113.89",
    },
    {
      id: 4,
      admin: "John Smith",
      action: "Failed Login Attempt",
      target: "Admin Portal",
      timestamp: "2024-01-15 08:20 PM",
      status: "error",
      ipAddress: "198.51.100.23",
    },
    {
      id: 5,
      admin: "Sarah Lee",
      action: "Updated System Settings",
      target: "Email Notification Preferences",
      timestamp: "2024-01-15 04:15 PM",
      status: "success",
      ipAddress: "203.0.113.67",
    },
  ]

  const handleCreateAdmin = () => {
    console.log("Creating new admin:", newAdmin)
    setIsCreateDialogOpen(false)
    setNewAdmin({ name: "", email: "", password: "", role: "admin" })
  }

  const handleEditAdmin = (adminId) => {
    console.log("Editing admin:", adminId)
  }

  const handleDeactivateAdmin = (adminId) => {
    console.log("Deactivating admin:", adminId)
  }

  const handleDeleteAdmin = (adminId) => {
    console.log("Deleting admin:", adminId)
  }

  const getStatusBadge = (status) => {
    return status === "active" ? (
      <Badge className="bg-green-600">Active</Badge>
    ) : status === "inactive" ? (
      <Badge className="bg-gray-600">Inactive</Badge>
    ) : (
      <Badge className="bg-red-600">Suspended</Badge>
    )
  }

  const getActivityStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="flex justify-center">
        <div className="container px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
            <h1 className="text-3xl font-bold mb-2">Super Admin Dashboard</h1>
            <p className="text-gray-500">Manage admin accounts and monitor all system activities</p>
            </div>
            <div className="flex gap-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Admin
                </Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                <DialogHeader>
                    <DialogTitle>Create New Admin Account</DialogTitle>
                    <DialogDescription>Add a new administrator to the ReliefConnect platform</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                    <Label htmlFor="admin-name">Full Name</Label>
                    <Input
                        id="admin-name"
                        placeholder="Enter admin name"
                        value={newAdmin.name}
                        onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                        className="mt-2"
                    />
                    </div>
                    <div>
                    <Label htmlFor="admin-email">Email Address</Label>
                    <Input
                        id="admin-email"
                        type="email"
                        placeholder="admin@reliefconnect.com"
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                        className="mt-2"
                    />
                    </div>
                    <div>
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                        id="admin-password"
                        type="password"
                        placeholder="Enter secure password"
                        value={newAdmin.password}
                        onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                        className="mt-2"
                    />
                    </div>
                    <div>
                    <Label htmlFor="admin-role">Role</Label>
                    <Select value={newAdmin.role} onValueChange={(value) => setNewAdmin({ ...newAdmin, role: value })}>
                        <SelectTrigger className="mt-2">
                        <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super-admin">Super Admin</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>
                    <Button onClick={handleCreateAdmin} className="w-full">
                    Create Admin Account
                    </Button>
                </div>
                </DialogContent>
            </Dialog>
            </div>
        </div>

        {/* System Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {systemStats.map((stat, index) => {
            const Icon = stat.icon
            return (
                <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                </CardContent>
                </Card>
            )
            })}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="admins">
                <Users className="h-4 w-4 mr-2" />
                Admin Accounts
            </TabsTrigger>
            <TabsTrigger value="monitoring">
                <Activity className="h-4 w-4 mr-2" />
                Activity Monitoring
            </TabsTrigger>
            </TabsList>

            {/* Admin Accounts Tab */}
            <TabsContent value="admins" className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                <h3 className="text-lg font-semibold">Admin Accounts</h3>
                <p className="text-sm text-gray-500">Manage administrator accounts and permissions</p>
                </div>
                <div className="flex gap-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                    placeholder="Search admins..."
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                </Select>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Admin Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Actions</TableHead>
                        <TableHead>Manage</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {adminAccounts.map((admin) => (
                        <TableRow key={admin.id}>
                        <TableCell>
                            <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">{admin.name.charAt(0)}</span>
                            </div>
                            <span className="font-medium">{admin.name}</span>
                            </div>
                        </TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>
                            <Badge variant="outline">{admin.role}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(admin.status)}</TableCell>
                        <TableCell>
                            <div className="text-sm">
                            <div>{admin.lastLogin}</div>
                            <div className="text-gray-500 text-xs">{admin.actionsCount} actions</div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex gap-1">
                            <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleEditAdmin(admin.id)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Dialog>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                <Shield className="h-4 w-4 mr-1" />
                                Manage
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white">
                                <DialogHeader>
                                <DialogTitle>Manage Admin Account</DialogTitle>
                                <DialogDescription>Manage permissions and status for {admin.name}</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>Account Status</Label>
                                    <Switch defaultChecked={admin.status === "active"} />
                                </div>
                                <div>
                                    <Label>Role</Label>
                                    <Select defaultValue={admin.role}>
                                    <SelectTrigger className="mt-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="super-admin">Super Admin</SelectItem>
                                    </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Button className="w-full bg-transparent" variant="outline">
                                    Reset Password
                                    </Button>
                                    <Button
                                    className="w-full bg-transparent"
                                    variant="outline"
                                    onClick={() => handleDeactivateAdmin(admin.id)}
                                    >
                                    {admin.status === "active" ? (
                                        <>
                                        <Lock className="h-4 w-4 mr-2" />
                                        Deactivate Account
                                        </>
                                    ) : (
                                        <>
                                        <Unlock className="h-4 w-4 mr-2" />
                                        Activate Account
                                        </>
                                    )}
                                    </Button>
                                    <Button
                                    className="w-full"
                                    variant="destructive"
                                    onClick={() => handleDeleteAdmin(admin.id)}
                                    >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Account
                                    </Button>
                                </div>
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

            {/* Activity Monitoring Tab */}
            <TabsContent value="monitoring" className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                <h3 className="text-lg font-semibold">Activity Monitoring</h3>
                <p className="text-sm text-gray-500">Monitor all admin activities and system events</p>
                </div>
                <div className="flex gap-2">
                <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                    <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">All Activities</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warnings</SelectItem>
                    <SelectItem value="error">Errors</SelectItem>
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
                    {activityMonitoring.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                        <div className="mt-1">{getActivityStatusIcon(activity.status)}</div>
                        <div className="flex-1">
                        <div className="flex items-start justify-between">
                            <div>
                            <p className="font-medium">{activity.action}</p>
                            <p className="text-sm text-gray-500 mt-1">Target: {activity.target}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {activity.admin}
                                </span>
                                <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {activity.timestamp}
                                </span>
                                <span className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                {activity.ipAddress}
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
