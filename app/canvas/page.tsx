"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eraser, Trash2, Download, Save, ArrowLeft, Star, Heart, Smile, Sun, Loader2 } from "lucide-react"

interface ChildProfile {
  id: string
  name: string
  age: number
  initials: string
  color: string
}

interface Sticker {
  id: string
  name: string
  icon: React.ReactNode
  earned: boolean
  category: string
}

export default function CanvasPage() {
  const [activeColor, setActiveColor] = useState("#4299E1") // Default blue
  const [brushSize, setBrushSize] = useState(5)
  const [isEraser, setIsEraser] = useState(false)
  const [activeChild, setActiveChild] = useState<ChildProfile | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fabricCanvasRef = useRef<any>(null)
  const router = useRouter()
  const [isDragOver, setIsDragOver] = useState(false)

  // Expanded color palette with 16 colors
  const colors = [
    "#4299E1", // Blue
    "#48BB78", // Green
    "#F6E05E", // Yellow
    "#F56565", // Red
    "#9F7AEA", // Purple
    "#ED8936", // Orange
    "#38B2AC", // Teal
    "#FC8181", // Pink
    "#68D391", // Light Green
    "#63B3ED", // Light Blue
    "#F687B3", // Light Pink
    "#FBB6CE", // Rose
    "#A78BFA", // Light Purple
    "#FCD34D", // Amber
    "#34D399", // Emerald
    "#6B7280", // Gray
  ]

  // Sample stickers - in a real app, these would be loaded from a database
  const stickers: Sticker[] = [
    {
      id: "1",
      name: "Gold Star",
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      earned: true,
      category: "achievement",
    },
    { id: "2", name: "Heart", icon: <Heart className="w-8 h-8 text-red-500" />, earned: true, category: "emotion" },
    { id: "3", name: "Smiley", icon: <Smile className="w-8 h-8 text-yellow-600" />, earned: true, category: "emotion" },
    { id: "4", name: "Sun", icon: <Sun className="w-8 h-8 text-orange-500" />, earned: false, category: "nature" },
    {
      id: "5",
      name: "Silver Star",
      icon: <Star className="w-8 h-8 text-gray-400" />,
      earned: true,
      category: "achievement",
    },
    {
      id: "6",
      name: "Purple Heart",
      icon: <Heart className="w-8 h-8 text-purple-500" />,
      earned: false,
      category: "emotion",
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

  useEffect(() => {
    if (typeof window === "undefined") return // Skip during SSR

    let cleanup = () => {}

    // Dynamically import fabric.js - CORRECT v6.7.0 IMPORT METHOD
    const initFabric = async () => {
      try {
        // In Fabric v6.7.0, we need to use the named exports directly
        const { Canvas, PencilBrush } = await import("fabric")

        const canvas = canvasRef.current
        if (!canvas) return

        // Create canvas instance with named Canvas export
        const fabricCanvas = new Canvas(canvas, {
          width: 800,
          height: 600,
          backgroundColor: "white",
          isDrawingMode: true,
        })

        fabricCanvasRef.current = fabricCanvas

        // Set brush using named PencilBrush export
        fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas)
        fabricCanvas.freeDrawingBrush.width = brushSize
        fabricCanvas.freeDrawingBrush.color = activeColor

        // Set up canvas options
        fabricCanvas.selection = false
        fabricCanvas.skipTargetFind = false

        cleanup = () => {
          fabricCanvas.dispose()
        }
      } catch (err) {
        console.error("Failed to initialize Fabric.js:", err)
      }
    }

    initFabric()

    return () => {
      cleanup()
    }
  }, [])

  // Separate useEffect for updating brush properties
  useEffect(() => {
    const fabricCanvas = fabricCanvasRef.current
    if (!fabricCanvas || !fabricCanvas.freeDrawingBrush) return

    if (isEraser) {
      fabricCanvas.freeDrawingBrush.width = brushSize
      fabricCanvas.freeDrawingBrush.color = "white"
    } else {
      fabricCanvas.freeDrawingBrush.width = brushSize
      fabricCanvas.freeDrawingBrush.color = activeColor
    }
  }, [brushSize, activeColor, isEraser])

  const clearCanvas = () => {
    const fabricCanvas = fabricCanvasRef.current
    if (!fabricCanvas) return

    fabricCanvas.clear()
    fabricCanvas.backgroundColor = "white"
    fabricCanvas.renderAll()
  }

  const saveDrawing = async () => {
    const fabricCanvas = fabricCanvasRef.current
    if (!fabricCanvas || !activeChild) return

    try {
      setIsSaving(true)

      // Convert canvas to image data with high quality
      const dataURL = fabricCanvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 1,
      })

      // Get existing saved drawings
      const existingSavedDrawings = localStorage.getItem("savedDrawings")
      const savedDrawings = existingSavedDrawings ? JSON.parse(existingSavedDrawings) : []

      // Create new drawing object
      const newDrawing = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        image: dataURL,
        childId: activeChild.id,
        childName: activeChild.name,
        emotion: "creativity", // Default emotion - in real app this would be analyzed
        emotionColor: "bg-purple-100 text-purple-700",
        canvasData: JSON.stringify(fabricCanvas.toJSON()), // Save canvas state for editing later
      }

      // Add to saved drawings
      savedDrawings.push(newDrawing)

      // Save to localStorage
      localStorage.setItem("savedDrawings", JSON.stringify(savedDrawings))

      console.log("Drawing saved successfully:", newDrawing)
      alert("Drawing saved successfully! You can view it in your dashboard.")

      // Optional: Navigate back to dashboard to see the saved drawing
      // router.push("/dashboard")
    } catch (error) {
      console.error("Error saving drawing:", error)
      alert("Sorry, there was an error saving your drawing. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const downloadDrawing = () => {
    const fabricCanvas = fabricCanvasRef.current
    if (!fabricCanvas) return

    const dataURL = fabricCanvas.toDataURL({
      format: "png",
      quality: 1,
    })

    const link = document.createElement("a")
    link.download = `${activeChild?.name || "child"}-drawing-${new Date().toISOString().split("T")[0]}.png`
    link.href = dataURL
    link.click()
  }

  const toggleEraser = () => {
    setIsEraser(!isEraser)
    const fabricCanvas = fabricCanvasRef.current
    if (!fabricCanvas) return

    // Ensure drawing mode stays enabled
    fabricCanvas.isDrawingMode = true
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  const handleStickerDragStart = (e: React.DragEvent, sticker: Sticker) => {
    if (!sticker.earned) {
      e.preventDefault()
      return
    }

    e.dataTransfer.setData("sticker", JSON.stringify(sticker))
    e.dataTransfer.effectAllowed = "copy"

    // Add visual feedback
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement
    dragImage.style.transform = "rotate(5deg)"
    dragImage.style.opacity = "0.8"
    e.dataTransfer.setDragImage(dragImage, 25, 25)

    console.log("Started dragging sticker:", sticker.name)
  }

  const handleCanvasDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const fabricCanvas = fabricCanvasRef.current
    if (!fabricCanvas) return

    const stickerData = e.dataTransfer.getData("sticker")
    if (!stickerData) return

    try {
      // Dynamically load fabric to create the text object
      const { Text } = await import("fabric")
      const sticker = JSON.parse(stickerData)
      const canvasRect = canvasRef.current?.getBoundingClientRect()
      if (!canvasRect) return

      // Calculate position relative to canvas
      const x = e.clientX - canvasRect.left
      const y = e.clientY - canvasRect.top

      // Temporarily disable drawing mode to add objects
      const wasDrawingMode = fabricCanvas.isDrawingMode
      fabricCanvas.isDrawingMode = false

      // Create a text object as a placeholder for the sticker
      const stickerText = new Text(sticker.name, {
        left: x - 30, // Center the text
        top: y - 10,
        fontSize: 24,
        fill: getColorForSticker(sticker.category),
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: 8,
        cornerColor: "#4299E1",
        cornerSize: 12,
        transparentCorners: false,
        borderColor: "#4299E1",
        borderScaleFactor: 2,
        hasRotatingPoint: true,
      })

      fabricCanvas.add(stickerText)
      fabricCanvas.setActiveObject(stickerText)
      fabricCanvas.renderAll()

      // Re-enable drawing mode after a short delay
      setTimeout(() => {
        fabricCanvas.isDrawingMode = wasDrawingMode
      }, 100)

      console.log("Sticker added:", sticker.name)
    } catch (error) {
      console.error("Error adding sticker:", error)
    }
  }

  // Helper function to get colors for different sticker categories
  const getColorForSticker = (category: string) => {
    switch (category) {
      case "achievement":
        return "#F59E0B" // Amber
      case "emotion":
        return "#EF4444" // Red
      case "nature":
        return "#10B981" // Emerald
      default:
        return "#6366F1" // Indigo
    }
  }

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  const handleCanvasDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleCanvasDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    // Only set to false if we're actually leaving the canvas area
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }

  if (!activeChild) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-blue-50 p-4">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBackToDashboard} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-blue-600">TherapyCanvas</h1>
            <div className="flex items-center gap-2 mt-1">
              <Avatar className={`w-6 h-6 ${activeChild.color}`}>
                <AvatarFallback className="text-white text-xs font-bold">{activeChild.initials}</AvatarFallback>
              </Avatar>
              <span className="text-gray-600">{activeChild.name}'s Canvas</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar - Drawing Tools */}
        <div className="w-full lg:w-64 bg-white rounded-2xl p-4 shadow-md">
          <Tabs defaultValue="tools" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="stickers">Stickers</TabsTrigger>
            </TabsList>

            <TabsContent value="tools" className="space-y-6 mt-4">
              <div>
                <h2 className="text-xl font-semibold text-blue-700 mb-4">Drawing Tools</h2>

                {/* Color Palette - 16 colors in 4x4 grid */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Colors</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        className={`w-10 h-10 rounded-full transition-transform ${
                          activeColor === color ? "ring-4 ring-blue-300 scale-110" : ""
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          setActiveColor(color)
                          setIsEraser(false)
                        }}
                        aria-label={`Select ${color} color`}
                      />
                    ))}
                  </div>
                </div>

                {/* Brush Size Slider */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Brush Size: {brushSize}px</h3>
                  <Slider
                    value={[brushSize]}
                    min={1}
                    max={50}
                    step={1}
                    onValueChange={(value) => setBrushSize(value[0])}
                    className="py-4"
                  />
                </div>

                {/* Tool Buttons */}
                <div className="space-y-3">
                  <Button
                    variant={isEraser ? "default" : "outline"}
                    className="w-full justify-start gap-2 text-base h-12"
                    onClick={toggleEraser}
                  >
                    <Eraser className="h-5 w-5" />
                    Eraser
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 text-base h-12 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={clearCanvas}
                  >
                    <Trash2 className="h-5 w-5" />
                    Clear Canvas
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 text-base h-12 border-green-200 text-green-600 hover:bg-green-50"
                    onClick={saveDrawing}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        Save Drawing
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 text-base h-12 border-blue-200 text-blue-600 hover:bg-blue-50"
                    onClick={downloadDrawing}
                  >
                    <Download className="h-5 w-5" />
                    Download
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stickers" className="mt-4">
              <Card className="bg-gradient-to-br from-purple-100 to-pink-100">
                <CardHeader>
                  <CardTitle className="text-lg text-purple-800">Sticker Book</CardTitle>
                  <p className="text-sm text-purple-600">Drag stickers to your canvas!</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {stickers.map((sticker) => (
                      <div
                        key={sticker.id}
                        className={`
                          relative p-3 rounded-lg border-2 transition-all cursor-pointer
                          ${
                            sticker.earned
                              ? "bg-white border-yellow-300 hover:border-yellow-400 hover:shadow-md"
                              : "bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed"
                          }
                        `}
                        draggable={sticker.earned}
                        onDragStart={(e) => sticker.earned && handleStickerDragStart(e, sticker)}
                      >
                        <div className="flex flex-col items-center gap-1">
                          {sticker.icon}
                          <span className="text-xs text-center font-medium">{sticker.name}</span>
                        </div>
                        {sticker.earned && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                            <Star className="w-2 h-2 text-yellow-800" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-xs text-purple-600 text-center">
                    Complete drawings to earn more stickers!
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="relative bg-white rounded-2xl shadow-md overflow-hidden flex justify-center p-4">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className={`border-2 cursor-crosshair transition-colors ${
                isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-200"
              }`}
              style={{
                width: "800px",
                height: "600px",
                display: "block",
                maxWidth: "100%",
                maxHeight: "100%",
              }}
              onDrop={handleCanvasDrop}
              onDragOver={handleCanvasDragOver}
              onDragEnter={handleCanvasDragEnter}
              onDragLeave={handleCanvasDragLeave}
            />
          </div>

          {/* Canvas Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-700">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">Canvas Tips:</span>
              </div>
              <ul className="text-sm text-blue-600 mt-2 space-y-1">
                <li>• Use the color palette and brush size to customize your drawing</li>
                <li>• Switch to the Stickers tab to add fun elements to your artwork</li>
                <li>• Drag earned stickers directly onto your canvas</li>
                <li>• Save your drawing when you're finished to add it to your gallery</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
