"use client"

import { useEffect } from 'react'

export default function DirectDashboard() {
  useEffect(() => {
    // Create a mock user and session
    const mockUser = {
      id: "direct-access-user-id",
      email: "direct-access@example.com"
    }
    
    const mockSession = {
      access_token: "mock-token-for-direct-access",
      expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
    }
    
    // Set the mock data in localStorage
    localStorage.setItem('user', JSON.stringify(mockUser))
    localStorage.setItem('session', JSON.stringify(mockSession))
    
    console.log("Mock auth data set, redirecting to dashboard")
    
    // Redirect to dashboard
    window.location.href = "/dashboard"
  }, [])
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Setting up direct dashboard access...</h1>
        <p className="mt-4">Please wait, you'll be redirected automatically.</p>
      </div>
    </div>
  )
} 