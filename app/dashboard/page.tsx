"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Palette } from "lucide-react"

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
  image: string
  childId: string
  analysis?: string
}

export default function DashboardPage() {
  const [activeChild, setActiveChild] = useState<ChildProfile | null>(null)
  const [savedDrawings, setSavedDrawings] = useState<SavedDrawing[]>([])
  const [selectedDrawing, setSelectedDrawing] = useState<SavedDrawing | null>(null)
  const router = useRouter()

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

    const child = JSON.parse(activeChildData)
    setActiveChild(child)

    // Load saved drawings for this child
    const allDrawings = JSON.parse(localStorage.getItem("savedDrawings") || "[]")
    const childDrawings = allDrawings.filter((drawing: SavedDrawing) => drawing.childId === child.id)
    setSavedDrawings(childDrawings)

    // Set the first drawing as selected if available
    if (childDrawings.length > 0) {
      setSelectedDrawing(childDrawings[0])
    }
  }, [router])

  const handleBackToProfiles = () => {
    router.push("/profiles")
  }

  const handleDrawingCanvas = () => {
    router.push("/canvas")
  }

  const handleSelectDrawing = (drawing: SavedDrawing) => {
    setSelectedDrawing(drawing)
  }

  // Extract emotions from analysis
  const extractEmotions = (analysis: string | undefined) => {
    if (!analysis) return { primary: "creativity", secondary: "joy" }

    // Simple extraction - in a real app, you'd parse this more robustly
    const primaryMatch = analysis.match(/Primary Emotion[:\s]+(\w+)/i)
    const secondaryMatch = analysis.match(/Secondary Emotion[:\s]+(\w+)/i)

    return {
      primary: primaryMatch?.[1]?.toLowerCase() || "creativity",
      secondary: secondaryMatch?.[1]?.toLowerCase() || "joy",
    }
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
                {savedDrawings.length} Total
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {savedDrawings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No drawings saved yet. Click "Drawing Canvas" to create one!
                </div>
              ) : (
                savedDrawings.map((drawing) => {
                  const emotions = extractEmotions(drawing.analysis)
                  return (
                    <div
                      key={drawing.id}
                      className={`flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                        selectedDrawing?.id === drawing.id ? "bg-blue-50 border-blue-200" : ""
                      }`}
                      onClick={() => handleSelectDrawing(drawing)}
                    >
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={drawing.image || "/placeholder.svg"}
                          alt="Drawing preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">{drawing.date}</p>
                      </div>
                      <Badge className={`bg-purple-100 text-purple-700`}>{emotions.primary}</Badge>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          {/* Drawing Analysis */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Drawing Analysis</CardTitle>
              {selectedDrawing && <p className="text-sm text-blue-600">{selectedDrawing.date}</p>}
            </CardHeader>
            <CardContent>
              {!selectedDrawing ? (
                <div className="text-center py-8 text-gray-500">Select a drawing to view its analysis</div>
              ) : (
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
                            <Badge className="bg-purple-100 text-purple-700">
                              {extractEmotions(selectedDrawing.analysis).primary}
                            </Badge>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-1">Secondary Emotion</p>
                            <Badge className="bg-green-100 text-green-700">
                              {extractEmotions(selectedDrawing.analysis).secondary}
                            </Badge>
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
                          <img
                            src={selectedDrawing.image || "/placeholder.svg"}
                            alt="Drawing preview"
                            className="w-full h-full object-contain"
                          />
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

                      <div className="whitespace-pre-line text-sm text-gray-700">
                        {selectedDrawing.analysis || "No analysis available for this drawing."}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="progress" className="mt-6">
                    <div className="text-center py-8 text-gray-500">Progress timeline will be displayed here</div>
                  </TabsContent>

                  <TabsContent value="notes" className="mt-6">
                    <div className="text-center py-8 text-gray-500">Therapist notes will be displayed here</div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
