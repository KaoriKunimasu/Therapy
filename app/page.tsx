"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn")

    if (isLoggedIn) {
      // Check if they have an active child selected
      const activeChild = localStorage.getItem("activeChild")
      if (activeChild) {
        router.push("/dashboard")
      } else {
        router.push("/profiles")
      }
    } else {
      router.push("/login")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading TherapyCanvas...</p>
      </div>
    </div>
  )
}
