"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DirectDashboardPage() {
  const [userData, setUserData] = useState<any>(null)
  const [sessionData, setSessionData] = useState<any>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user')
      const storedSession = localStorage.getItem('session')
      
      if (storedUser) {
        setUserData(JSON.parse(storedUser))
      }
      
      if (storedSession) {
        setSessionData(JSON.parse(storedSession))
      }
    } catch (err) {
      console.error("Error loading data:", err)
    }
  }, [])

  // Emergency function to create an admin session directly
  const createEmergencyAccess = () => {
    try {
      // Create a fake user and session
      const fakeUser = {
        id: "00000000-0000-0000-0000-000000000000",
        email: "admin@example.com"
      }
      
      const fakeSession = {
        access_token: "EMERGENCY_ACCESS_TOKEN_" + Date.now(),
        refresh_token: "",
        expires_at: Math.floor(Date.now() / 1000) + 86400, // 24 hours
        user: fakeUser
      }
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(fakeUser))
      localStorage.setItem('session', JSON.stringify(fakeSession))
      
      // Update state
      setUserData(fakeUser)
      setSessionData(fakeSession)
      setSuccess("Emergency access created successfully! You can now try accessing the dashboard.")
    } catch (err) {
      console.error("Error creating emergency access:", err)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Auth Diagnostic Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold mb-2">User Data from localStorage</h3>
            {userData ? (
              <pre className="text-sm overflow-auto">{JSON.stringify(userData, null, 2)}</pre>
            ) : (
              <p className="text-red-500">No user data found in localStorage</p>
            )}
          </div>
          
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold mb-2">Session Data from localStorage</h3>
            {sessionData ? (
              <pre className="text-sm overflow-auto">{JSON.stringify(sessionData, null, 2)}</pre>
            ) : (
              <p className="text-red-500">No session data found in localStorage</p>
            )}
          </div>
          
          {success && (
            <div className="bg-green-100 p-4 rounded text-green-800">
              {success}
            </div>
          )}
          
          <div className="flex justify-between mt-4">
            <Link href="/login">
              <Button variant="outline">Back to Login</Button>
            </Link>
            <Button onClick={createEmergencyAccess} variant="destructive">
              Create Emergency Access
            </Button>
            <Link href="/dashboard">
              <Button>Try Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 