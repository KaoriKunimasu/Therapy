"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Palette, CheckCircle } from "lucide-react"
import Image from "next/image"

interface ChildProfile {
  id: string
  name: string
  age: number
  initials: string
  color: string
}

interface SavedDrawing {
  id: string
  date: string
  emotion: string
  emotionColor: string
  image: string
}

export default function DashboardPage() {
  const [activeChild, setActiveChild] = useState<ChildProfile | null>(null)
  const router = useRouter()

  const savedDrawings: SavedDrawing[] = [
    {
      id: "1",
      date: "May 31, 2025",
      emotion: "creativity",
      emotionColor: "bg-purple-100 text-purple-700",
      image: "/images/dashboard-preview.png",
    },
    {
      id: "2",
      date: "Jun 4, 2025",
      emotion: "calmness",
      emotionColor: "bg-blue-100 text-blue-700",
      image: "/images/dashboard-preview.png",
    },
    {
      id: "3",
      date: "Jun 6, 2025",
      emotion: "intensity",
      emotionColor: "bg-orange-100 text-orange-700",
      image: "/images/dashboard-preview.png",
    },
  ]

  useEffect(() => {
    // Check if user is logged in and has selected a child
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    const activeChildData = localStorage.getItem("activeChild")

    if (!isLoggedIn) {
      router.push("/login")
      return
    }

    if (!activeChildData) {
      router.push("/profiles")
      return
    }

    setActiveChild(JSON.parse(activeChildData))
  }, [router])

  const handleBackToProfiles = () => {
    router.push("/profiles")
  }

  const handleDrawingCanvas = () => {
    router.push("/canvas")
  }

  if (!activeChild) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBackToProfiles} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-blue-600">Art Therapy Dashboard</h1>
              <p className="text-gray-600">Monitor emotional progress through artistic expression</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar className={`w-8 h-8 ${activeChild.color}`}>
                <AvatarFallback className="text-white text-sm font-bold">{activeChild.initials}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{activeChild.name}</span>
            </div>
            <Button onClick={handleDrawingCanvas} className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Palette className="h-4 w-4" />
              Drawing Canvas
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Saved Drawings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Saved Drawings</CardTitle>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                3 Total
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {savedDrawings.map((drawing) => (
                <div key={drawing.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src={drawing.image || "/placeholder.svg"}
                      alt="Drawing preview"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{drawing.date}</p>
                  </div>
                  <Badge className={drawing.emotionColor}>{drawing.emotion}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Drawing Analysis */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Drawing Analysis</CardTitle>
              <p className="text-sm text-blue-600">Saturday, May 31, 2025 at 7:45 PM</p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="emotion" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="emotion">Emotion Analysis</TabsTrigger>
                  <TabsTrigger value="progress">Progress Timeline</TabsTrigger>
                  <TabsTrigger value="notes">Therapist Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="emotion" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Emotion Summary */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        </div>
                        <h3 className="font-semibold">Emotion Summary</h3>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Primary Emotion</p>
                          <Badge className="bg-purple-100 text-purple-700">creativity</Badge>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1">Secondary Emotion</p>
                          <Badge className="bg-green-100 text-green-700">joy</Badge>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1">Stroke Intensity</p>
                          <Badge className="bg-yellow-100 text-yellow-700">Medium</Badge>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-2">Colors Used</p>
                          <div className="flex gap-2">
                            <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                            <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                            <div className="w-6 h-6 bg-yellow-500 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Drawing Preview */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                          <Palette className="w-3 h-3 text-purple-600" />
                        </div>
                        <h3 className="font-semibold">Drawing Preview</h3>
                      </div>

                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src="/images/dashboard-preview.png"
                          alt="Drawing preview"
                          width={400}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Suggested Actions */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      </div>
                      <h3 className="font-semibold">Suggested Actions</h3>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <p className="text-sm">Encourage more creative activities</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <p className="text-sm">Ask about what brings them happiness</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <p className="text-sm">Continue providing art supplies and creative outlets</p>
                      </div>
                    </div>
                  </div>

                  {/* Analysis */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      </div>
                      <h3 className="font-semibold">Analysis</h3>
                    </div>

                    <p className="text-sm text-gray-700">
                      The drawing shows a blend of creativity and joy. The balanced strokes indicate a comfortable
                      emotional state.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="progress" className="mt-6">
                  <div className="text-center py-8 text-gray-500">Progress timeline will be displayed here</div>
                </TabsContent>

                <TabsContent value="notes" className="mt-6">
                  <div className="text-center py-8 text-gray-500">Therapist notes will be displayed here</div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
