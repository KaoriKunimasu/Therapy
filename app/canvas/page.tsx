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
  emoji: string // Add emoji for easier rendering
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
  const [draggedSticker, setDraggedSticker] = useState<Sticker | null>(null)

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

  // Sample stickers with emojis for easier rendering
  const stickers: Sticker[] = [
    {
      id: "1",
      name: "Gold Star",
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      emoji: "⭐",
      earned: true,
      category: "achievement",
    },
    {
      id: "2",
      name: "Heart",
      icon: <Heart className="w-8 h-8 text-red-500" />,
      emoji: "❤️",
      earned: true,
      category: "emotion",
    },
    {
      id: "3",
      name: "Smiley",
      icon: <Smile className="w-8 h-8 text-yellow-600" />,
      emoji: "😊",
      earned: true,
      category: "emotion",
    },
    {
      id: "4",
      name: "Sun",
      icon: <Sun className="w-8 h-8 text-orange-500" />,
      emoji: "☀️",
      earned: true, // Changed to true for testing
      category: "nature",
    },
    {
      id: "5",
      name: "Silver Star",
      icon: <Star className="w-8 h-8 text-gray-400" />,
      emoji: "🌟",
      earned: true,
      category: "achievement",
    },
    {
      id: "6",
      name: "Purple Heart",
      icon: <Heart className="w-8 h-8 text-purple-500" />,
      emoji: "💜",
      earned: true, // Changed to true for testing
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

    // Dynamically import fabric.js
    const initFabric = async () => {
      try {
        const { Canvas, PencilBrush } = await import("fabric")

        const canvas = canvasRef.current
        if (!canvas) return

        // Create canvas instance
        const fabricCanvas = new Canvas(canvas, {
          width: 800,
          height: 600,
          backgroundColor: "white",
          isDrawingMode: true,
        })

        fabricCanvasRef.current = fabricCanvas

        // Set brush
        fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas)
        fabricCanvas.freeDrawingBrush.width = brushSize
        fabricCanvas.freeDrawingBrush.color = activeColor

        // Set up canvas options
        fabricCanvas.selection = false
        fabricCanvas.skipTargetFind = false

        cleanup = () => {
          fabricCanvas.dispose()
        }

        console.log("Fabric.js canvas initialized successfully")
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
        emotion: "creativity",
        emotionColor: "bg-purple-100 text-purple-700",
        canvasData: JSON.stringify(fabricCanvas.toJSON()),
      }

      // Add to saved drawings
      savedDrawings.push(newDrawing)

      // Save to localStorage
      localStorage.setItem("savedDrawings", JSON.stringify(savedDrawings))

      console.log("Drawing saved successfully:", newDrawing)
      alert("Drawing saved successfully! You can view it in your dashboard.")
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

    fabricCanvas.isDrawingMode = true
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  // Simplified sticker drag start
  const handleStickerDragStart = (e: React.DragEvent, sticker: Sticker) => {
    console.log("Drag start:", sticker.name)

    if (!sticker.earned) {
      e.preventDefault()
      return
    }

    setDraggedSticker(sticker)
    e.dataTransfer.effectAllowed = "copy"

    // Create a simple drag image
    const dragElement = document.createElement("div")
    dragElement.innerHTML = sticker.emoji
    dragElement.style.fontSize = "32px"
    dragElement.style.position = "absolute"
    dragElement.style.top = "-1000px"
    document.body.appendChild(dragElement)

    e.dataTransfer.setDragImage(dragElement, 16, 16)

    // Clean up after drag
    setTimeout(() => {
      document.body.removeChild(dragElement)
    }, 0)
  }

  // Simplified canvas drop handler
  const handleCanvasDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    console.log("Drop event triggered")

    const fabricCanvas = fabricCanvasRef.current
    if (!fabricCanvas || !draggedSticker) {
      console.log("No canvas or dragged sticker")
      return
    }

    try {
      const { Text } = await import("fabric")
      const canvasRect = canvasRef.current?.getBoundingClientRect()
      if (!canvasRect) return

      // Calculate position relative to canvas
      const x = e.clientX - canvasRect.left
      const y = e.clientY - canvasRect.top

      console.log("Adding sticker at position:", x, y)

      // Disable drawing mode to allow object interaction
      fabricCanvas.isDrawingMode = false

      // Create sticker as text with emoji
      const stickerObject = new Text(draggedSticker.emoji, {
        left: x - 20,
        top: y - 20,
        fontSize: 40,
        selectable: true,
        evented: true,
        moveCursor: "move",
        hoverCursor: "move",
        hasControls: true,
        hasBorders: true,
        cornerColor: "#4299E1",
        cornerSize: 12,
        transparentCorners: false,
        borderColor: "#4299E1",
        borderScaleFactor: 2,
      })

      fabricCanvas.add(stickerObject)
      fabricCanvas.setActiveObject(stickerObject)
      fabricCanvas.renderAll()

      console.log("Sticker added successfully via drag")
    } catch (error) {
      console.error("Error adding sticker:", error)
    } finally {
      setDraggedSticker(null)
      setIsDragOver(false)
    }
  }

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  const handleCanvasDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
    console.log("Drag enter canvas")
  }

  const handleCanvasDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    // Check if we're actually leaving the canvas
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const x = e.clientX
      const y = e.clientY
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        setIsDragOver(false)
        console.log("Drag leave canvas")
      }
    }
  }

  // Add a simple click handler for testing
  const handleStickerClick = async (sticker: Sticker) => {
    if (!sticker.earned) return

    const fabricCanvas = fabricCanvasRef.current
    if (!fabricCanvas) return

    try {
      const { Text } = await import("fabric")

      // Disable drawing mode to allow object interaction
      fabricCanvas.isDrawingMode = false

      // Add sticker at center of canvas
      const stickerObject = new Text(sticker.emoji, {
        left: 350,
        top: 250,
        fontSize: 40,
        selectable: true,
        evented: true,
        moveCursor: "move",
        hoverCursor: "move",
        hasControls: true,
        hasBorders: true,
        cornerColor: "#4299E1",
        cornerSize: 12,
        transparentCorners: false,
        borderColor: "#4299E1",
        borderScaleFactor: 2,
      })

      fabricCanvas.add(stickerObject)
      fabricCanvas.setActiveObject(stickerObject)
      fabricCanvas.renderAll()

      console.log("Sticker added via click - should be movable")

      // Don't automatically re-enable drawing mode - let user interact with sticker first
    } catch (error) {
      console.error("Error adding sticker via click:", error)
    }
  }

  const toggleDrawingMode = () => {
    const fabricCanvas = fabricCanvasRef.current
    if (!fabricCanvas) return

    fabricCanvas.isDrawingMode = !fabricCanvas.isDrawingMode

    if (fabricCanvas.isDrawingMode) {
      fabricCanvas.selection = false
      console.log("Drawing mode enabled")
    } else {
      fabricCanvas.selection = true
      console.log("Selection mode enabled - you can now move stickers")
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

                {/* Color Palette */}
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
                    variant={fabricCanvasRef.current?.isDrawingMode === false ? "default" : "outline"}
                    className="w-full justify-start gap-2 text-base h-12"
                    onClick={toggleDrawingMode}
                  >
                    <Star className="h-5 w-5" />
                    {fabricCanvasRef.current?.isDrawingMode === false ? "Selection Mode" : "Move Stickers"}
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
                  <p className="text-sm text-purple-600">Drag stickers to canvas or click to add!</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {stickers.map((sticker) => (
                      <div
                        key={sticker.id}
                        className={`
                          relative p-3 rounded-lg border-2 transition-all cursor-pointer
                          ${
                            sticker.earned
                              ? "bg-white border-yellow-300 hover:border-yellow-400 hover:shadow-md hover:scale-105"
                              : "bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed"
                          }
                        `}
                        draggable={sticker.earned}
                        onDragStart={(e) => handleStickerDragStart(e, sticker)}
                        onClick={() => handleStickerClick(sticker)}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <div className="text-2xl">{sticker.emoji}</div>
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
                    {draggedSticker ? `Dragging ${draggedSticker.name}...` : "Complete drawings to earn more stickers!"}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="relative bg-white rounded-2xl shadow-md overflow-hidden flex justify-center p-4">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className={`border-2 cursor-crosshair transition-all duration-200 ${
                  isDragOver ? "border-blue-400 bg-blue-50 scale-[1.02]" : "border-gray-200"
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
              {isDragOver && (
                <div className="absolute inset-0 bg-blue-100 bg-opacity-50 flex items-center justify-center pointer-events-none">
                  <div className="text-blue-600 text-xl font-semibold">Drop sticker here!</div>
                </div>
              )}
            </div>
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
                <li>• Drag stickers onto the canvas OR click them to add at center</li>
                <li>• Click "Move Stickers" to switch to selection mode and move placed stickers</li>
                <li>• Save your drawing when you're finished to add it to your gallery</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
