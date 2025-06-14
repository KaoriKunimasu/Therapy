"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eraser, Trash2, Download, Save, ArrowLeft, Star, Heart, Smile, Sun } from "lucide-react"
import { fabric } from "fabric"

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null)
  const router = useRouter()

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
    const canvas = canvasRef.current
    if (!canvas) return

    // Initialize Fabric.js canvas
    const fabricCanvas = new fabric.Canvas(canvas, {
      width: 800,
      height: 600,
      backgroundColor: "white",
    })

    fabricCanvasRef.current = fabricCanvas

    // Set initial drawing mode
    fabricCanvas.isDrawingMode = true
    fabricCanvas.freeDrawingBrush.width = brushSize
    fabricCanvas.freeDrawingBrush.color = activeColor

    // Cleanup function
    return () => {
      fabricCanvas.dispose()
    }
  }, [])

  // Update brush properties when they change
  useEffect(() => {
    const fabricCanvas = fabricCanvasRef.current
    if (!fabricCanvas) return

    if (isEraser) {
      fabricCanvas.freeDrawingBrush = new fabric.EraserBrush(fabricCanvas)
      fabricCanvas.freeDrawingBrush.width = brushSize
    } else {
      fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas)
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

  const saveDrawing = () => {
    const fabricCanvas = fabricCanvasRef.current
    if (!fabricCanvas) return

    // Convert canvas to image data
    const dataURL = fabricCanvas.toDataURL({
      format: "png",
      quality: 1,
    })

    // Save to localStorage (in a real app, you'd send to server)
    const savedDrawings = JSON.parse(localStorage.getItem("savedDrawings") || "[]")
    const newDrawing = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      image: dataURL,
      childId: activeChild?.id,
    }

    savedDrawings.push(newDrawing)
    localStorage.setItem("savedDrawings", JSON.stringify(savedDrawings))

    alert("Drawing saved!")
  }

  const downloadDrawing = () => {
    const fabricCanvas = fabricCanvasRef.current
    if (!fabricCanvas) return

    const dataURL = fabricCanvas.toDataURL({
      format: "png",
      quality: 1,
    })

    const link = document.createElement("a")
    link.download = "therapy-canvas-drawing.png"
    link.href = dataURL
    link.click()
  }

  const toggleEraser = () => {
    setIsEraser(!isEraser)
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  const handleStickerDragStart = (e: React.DragEvent, sticker: Sticker) => {
    e.dataTransfer.setData("sticker", JSON.stringify(sticker))
  }

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const fabricCanvas = fabricCanvasRef.current
    if (!fabricCanvas) return

    const stickerData = e.dataTransfer.getData("sticker")
    if (!stickerData) return

    const sticker = JSON.parse(stickerData)
    const canvasRect = canvasRef.current?.getBoundingClientRect()
    if (!canvasRect) return

    // Calculate position relative to canvas
    const x = e.clientX - canvasRect.left
    const y = e.clientY - canvasRect.top

    // Create a text object as a placeholder for the sticker
    // In a real app, you'd use actual sticker images
    const stickerText = new fabric.Text(sticker.name, {
      left: x,
      top: y,
      fontSize: 20,
      fill: "#333",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      padding: 5,
    })

    fabricCanvas.add(stickerText)
    fabricCanvas.renderAll()
  }

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault()
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
                  >
                    <Save className="h-5 w-5" />
                    Save Drawing
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
              className="border border-gray-200 cursor-crosshair"
              style={{
                maxWidth: "100%",
                height: "auto",
              }}
              onDrop={handleCanvasDrop}
              onDragOver={handleCanvasDragOver}
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
