"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Palette, CheckCircle } from "lucide-react"

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
  time?: string
  emotion: string
  emotionColor: string
  image: string
  childId: string
  childName?: string
  canvasData?: string
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
    loadSavedDrawings(child.id)
  }, [router])

  const loadSavedDrawings = (childId: string) => {
    try {
      const allDrawingsData = localStorage.getItem("savedDrawings")
      console.log("Raw saved drawings data:", allDrawingsData)

      if (allDrawingsData) {
        const allDrawings: SavedDrawing[] = JSON.parse(allDrawingsData)
        console.log("All drawings:", allDrawings)

        // Filter drawings for the current child
        const childDrawings = allDrawings.filter((drawing) => drawing.childId === childId)
        console.log("Child drawings:", childDrawings)

        setSavedDrawings(childDrawings)

        // Set the most recent drawing as selected if available
        if (childDrawings.length > 0) {
          setSelectedDrawing(childDrawings[childDrawings.length - 1]) // Most recent first
        }
      } else {
        console.log("No saved drawings found")
        setSavedDrawings([])
      }
    } catch (error) {
      console.error("Error loading saved drawings:", error)
      setSavedDrawings([])
    }
  }

  const handleBackToProfiles = () => {
    router.push("/profiles")
  }

  const handleDrawingCanvas = () => {
    router.push("/canvas")
  }

  const handleSelectDrawing = (drawing: SavedDrawing) => {
    setSelectedDrawing(drawing)
  }

  const handleDeleteDrawing = (drawingId: string) => {
    if (confirm("Are you sure you want to delete this drawing?")) {
      try {
        const allDrawingsData = localStorage.getItem("savedDrawings")
        if (allDrawingsData) {
          const allDrawings: SavedDrawing[] = JSON.parse(allDrawingsData)
          const updatedDrawings = allDrawings.filter((drawing) => drawing.id !== drawingId)
          localStorage.setItem("savedDrawings", JSON.stringify(updatedDrawings))

          // Reload drawings for current child
          if (activeChild) {
            loadSavedDrawings(activeChild.id)
          }

          // Clear selected drawing if it was deleted
          if (selectedDrawing?.id === drawingId) {
            setSelectedDrawing(null)
          }
        }
      } catch (error) {
        console.error("Error deleting drawing:", error)
        alert("Error deleting drawing. Please try again.")
      }
    }
  }

  // Extract emotions from analysis or use default
  const getEmotionInfo = (drawing: SavedDrawing) => {
    return {
      primary: drawing.emotion || "creativity",
      secondary: "joy", // Default secondary emotion
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
                  <Palette className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No drawings yet!</p>
                  <p className="text-sm">Click "Drawing Canvas" to create your first masterpiece!</p>
                </div>
              ) : (
                savedDrawings
                  .slice()
                  .reverse() // Show most recent first
                  .map((drawing) => {
                    const emotions = getEmotionInfo(drawing)
                    return (
                      <div
                        key={drawing.id}
                        className={`flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedDrawing?.id === drawing.id ? "bg-blue-50 border-blue-200" : ""
                        }`}
                        onClick={() => handleSelectDrawing(drawing)}
                      >
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={drawing.image || "/placeholder.svg"}
                            alt="Drawing preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg"
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-600 truncate">
                            {drawing.date}
                            {drawing.time && ` at ${drawing.time}`}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">by {drawing.childName || activeChild.name}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge className={drawing.emotionColor || "bg-purple-100 text-purple-700"}>
                            {emotions.primary}
                          </Badge>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteDrawing(drawing.id)
                            }}
                            className="text-xs text-red-500 hover:text-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
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
              {selectedDrawing && (
                <p className="text-sm text-blue-600">
                  {selectedDrawing.date}
                  {selectedDrawing.time && ` at ${selectedDrawing.time}`}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {!selectedDrawing ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Palette className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium mb-2">Select a drawing to view analysis</p>
                  <p className="text-sm">Click on any drawing from the left panel to see detailed insights</p>
                </div>
              ) : (
                <Tabs defaultValue="emotion" className="w-full">
                  <TabsList className="grid w-full grid-cols-1">
                    <TabsTrigger value="emotion">Emotion Analysis</TabsTrigger>
                  </TabsList>

                  <TabsContent value="emotion" className="space-y-6 mt-6">
                    {/* Keep all the existing emotion analysis content */}
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
                              {getEmotionInfo(selectedDrawing).primary}
                            </Badge>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-1">Secondary Emotion</p>
                            <Badge className="bg-green-100 text-green-700">
                              {getEmotionInfo(selectedDrawing).secondary}
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
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg"
                            }}
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
                        emotional state. The use of vibrant colors suggests positive engagement with the artistic
                        process.
                      </p>
                    </div>
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
