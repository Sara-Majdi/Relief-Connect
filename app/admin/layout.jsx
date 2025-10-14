"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Lock, XCircle, UserPlus } from "lucide-react"

export default function AdminDashboardLayout({ children }) {
  const [isPasscodeDialogOpen, setIsPasscodeDialogOpen] = useState(false)
  const [isCreateAdminDialogOpen, setIsCreateAdminDialogOpen] = useState(false)
  const [passcode, setPasscode] = useState("")
  const [passcodeError, setPasscodeError] = useState("")
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  })

  const SUPER_ADMIN_PASSCODE = "RELIEF2024"

  const handlePasscodeSubmit = () => {
    if (passcode === SUPER_ADMIN_PASSCODE) {
      setIsPasscodeDialogOpen(false)
      setIsCreateAdminDialogOpen(true)
      setPasscode("")
      setPasscodeError("")
    } else {
      setPasscodeError("Invalid passcode. Please try again.")
    }
  }

  const handleCreateAdmin = () => {
    console.log("Creating new admin:", newAdmin)
    setIsCreateAdminDialogOpen(false)
    setNewAdmin({ name: "", email: "", password: "", role: "admin" })
  }

  return (
    <SidebarProvider>
      <AdminSidebar onAddAdminClick={() => setIsPasscodeDialogOpen(true)} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin/dashboard">Admin Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>

      {/* Passcode Dialog */}
      <Dialog open={isPasscodeDialogOpen} onOpenChange={setIsPasscodeDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-blue-600" />
              Super Admin Verification
            </DialogTitle>
            <DialogDescription>Enter the super admin passcode to create a new admin account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="passcode">Passcode</Label>
              <Input
                id="passcode"
                type="password"
                placeholder="Enter super admin passcode"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value)
                  setPasscodeError("")
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePasscodeSubmit()
                  }
                }}
                className="mt-2"
              />
              {passcodeError && (
                <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {passcodeError}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => {
                  setIsPasscodeDialogOpen(false)
                  setPasscode("")
                  setPasscodeError("")
                }}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handlePasscodeSubmit}>
                Verify
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Admin Dialog */}
      <Dialog open={isCreateAdminDialogOpen} onOpenChange={setIsCreateAdminDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              Create New Admin Account
            </DialogTitle>
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
              <UserPlus className="h-4 w-4 mr-2" />
              Create Admin Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
