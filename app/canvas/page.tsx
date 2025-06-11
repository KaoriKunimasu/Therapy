"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eraser, Trash2, Download, Save, ArrowLeft, Loader2 } from "lucide-react"

interface ChildProfile {
  id: string
  name: string
  age: number
  initials: string
  color: string
}

export default function CanvasPage() {
  const [activeColor, setActiveColor] = useState("#4299E1") // Default blue
  const [brushSize, setBrushSize] = useState(5)
  const [isEraser, setIsEraser] = useState(false)
  const [activeChild, setActiveChild] = useState<ChildProfile | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastX, setLastX] = useState(0)
  const [lastY, setLastY] = useState(0)
  const [analysis, setAnalysis] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const router = useRouter()

  const colors = [
    "#4299E1", // Blue
    "#48BB78", // Green
    "#F6E05E", // Yellow
    "#F56565", // Red
    "#9F7AEA", // Purple
    "#ED8936", // Orange
    "#38B2AC", // Teal
    "#FC8181", // Pink
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

    // Set fixed dimensions for the canvas
    canvas.width = 800
    canvas.height = 600

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Fill with white background
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Initialize drawing properties
    ctx.lineJoin = "round"
    ctx.lineCap = "round"
    ctx.lineWidth = brushSize
    ctx.strokeStyle = isEraser ? "white" : activeColor
  }, [])

  // Update drawing properties when they change
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.lineWidth = brushSize
    ctx.strokeStyle = isEraser ? "white" : activeColor
  }, [brushSize, activeColor, isEraser])

  const getMousePos = (canvas: HTMLCanvasElement, evt: MouseEvent | Touch) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (evt.clientX - rect.left) * scaleX,
      y: (evt.clientY - rect.top) * scaleY,
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set up drawing properties every time we start drawing
    ctx.lineJoin = "round"
    ctx.lineCap = "round"
    ctx.lineWidth = brushSize
    ctx.strokeStyle = isEraser ? "white" : activeColor

    setIsDrawing(true)

    let pos
    if ("touches" in e) {
      e.preventDefault()
      pos = getMousePos(canvas, e.touches[0])
    } else {
      pos = getMousePos(canvas, e.nativeEvent)
    }

    setLastX(pos.x)
    setLastY(pos.y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Ensure drawing properties are set correctly
    ctx.lineJoin = "round"
    ctx.lineCap = "round"
    ctx.lineWidth = brushSize
    ctx.strokeStyle = isEraser ? "white" : activeColor

    let pos
    if ("touches" in e) {
      e.preventDefault()
      pos = getMousePos(canvas, e.touches[0])
    } else {
      pos = getMousePos(canvas, e.nativeEvent)
    }

    ctx.beginPath()
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()

    setLastX(pos.x)
    setLastY(pos.y)
  }

  const endDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Clear any existing analysis
    setAnalysis("")
  }

  const saveDrawing = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      setIsAnalyzing(true)

      // Get the image data as base64
      const imageData = canvas.toDataURL("image/png")

      // Send to our API route
      const response = await fetch("/api/analyze-drawing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageData }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze drawing")
      }

      const data = await response.json()
      setAnalysis(data.analysis)

      // Save the drawing to localStorage for the dashboard
      const savedDrawings = JSON.parse(localStorage.getItem("savedDrawings") || "[]")
      const newDrawing = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        image: imageData,
        childId: activeChild?.id,
        analysis: data.analysis,
      }

      savedDrawings.push(newDrawing)
      localStorage.setItem("savedDrawings", JSON.stringify(savedDrawings))
    } catch (error) {
      console.error("Error analyzing drawing:", error)
      setAnalysis("Sorry, there was an error analyzing your drawing. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const downloadDrawing = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = "therapy-canvas-drawing.png"
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  const toggleEraser = () => {
    setIsEraser(!isEraser)
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard")
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

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar with drawing tools */}
        <div className="w-full md:w-64 bg-white rounded-2xl p-4 shadow-md">
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
              max={30}
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
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save & Analyze
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

        {/* Main content area */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Canvas Container with fixed dimensions */}
          <div className="relative bg-white rounded-2xl shadow-md overflow-hidden flex justify-center p-4">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="border border-gray-200 cursor-crosshair touch-none"
              style={{
                maxWidth: "100%",
                height: "auto",
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={endDrawing}
            />
          </div>

          {/* Analysis Section - Only shown when there's analysis */}
          {analysis && (
            <Card className="bg-white shadow-md">
              <CardHeader className="bg-yellow-100 rounded-t-lg">
                <CardTitle className="text-xl text-yellow-800">Drawing Analysis</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="whitespace-pre-line text-gray-700">{analysis}</div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
