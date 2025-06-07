"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, User, LogOut } from "lucide-react"

interface ChildProfile {
  id: string
  name: string
  age: number
  initials: string
  color: string
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<ChildProfile[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newChild, setNewChild] = useState({ name: "", age: "" })
  const [userName, setUserName] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (!isLoggedIn) {
      router.push("/login")
      return
    }

    // Load user name and existing profiles
    const storedUserName = localStorage.getItem("userName") || "Parent"
    setUserName(storedUserName)

    const storedProfiles = localStorage.getItem("childProfiles")
    if (storedProfiles) {
      setProfiles(JSON.parse(storedProfiles))
    }
  }, [router])

  const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", "bg-yellow-500", "bg-red-500"]

  const handleAddChild = () => {
    if (!newChild.name || !newChild.age) return

    const profile: ChildProfile = {
      id: Date.now().toString(),
      name: newChild.name,
      age: Number.parseInt(newChild.age),
      initials: newChild.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase(),
      color: colors[profiles.length % colors.length],
    }

    const updatedProfiles = [...profiles, profile]
    setProfiles(updatedProfiles)
    localStorage.setItem("childProfiles", JSON.stringify(updatedProfiles))

    setNewChild({ name: "", age: "" })
    setIsDialogOpen(false)
  }

  const handleSelectChild = (profile: ChildProfile) => {
    localStorage.setItem("activeChild", JSON.stringify(profile))
    router.push("/dashboard")
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-700">Welcome, {userName}!</h1>
            <p className="text-gray-600 mt-2">Select a child profile to continue</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Child Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <Card
              key={profile.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleSelectChild(profile)}
            >
              <CardHeader className="text-center">
                <Avatar className={`w-16 h-16 mx-auto ${profile.color}`}>
                  <AvatarFallback className="text-white text-xl font-bold">{profile.initials}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{profile.name}</CardTitle>
                <CardDescription>Age {profile.age}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <User className="h-4 w-4 mr-2" />
                  Select Profile
                </Button>
              </CardContent>
            </Card>
          ))}

          {/* Add New Child Card */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-dashed border-2 border-gray-300">
                <CardHeader className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                  <CardTitle className="text-xl text-gray-600">Add New Child</CardTitle>
                  <CardDescription>Create a new profile</CardDescription>
                </CardHeader>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Child Profile</DialogTitle>
                <DialogDescription>Create a profile for your child to track their artistic progress.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="childName">Child's Name</Label>
                  <Input
                    id="childName"
                    placeholder="Enter child's name"
                    value={newChild.name}
                    onChange={(e) => setNewChild((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="childAge">Age</Label>
                  <Input
                    id="childAge"
                    type="number"
                    placeholder="Enter age"
                    min="3"
                    max="18"
                    value={newChild.age}
                    onChange={(e) => setNewChild((prev) => ({ ...prev, age: e.target.value }))}
                  />
                </div>
                <Button onClick={handleAddChild} className="w-full" disabled={!newChild.name || !newChild.age}>
                  Add Profile
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
