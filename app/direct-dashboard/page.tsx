"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DirectDashboardPage() {
  const [userData, setUserData] = useState<any>(null)
  const [sessionData, setSessionData] = useState<any>(null)
  
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
          
          <div className="flex justify-between mt-4">
            <Link href="/login">
              <Button variant="outline">Back to Login</Button>
            </Link>
            <Link href="/dashboard">
              <Button>Try Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 