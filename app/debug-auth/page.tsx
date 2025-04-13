"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth2"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function DebugAuthPage() {
  const { user, loading, error } = useAuth()
  const [envVars, setEnvVars] = useState({ url: "", keyDefined: false })
  const [sessionStatus, setSessionStatus] = useState("Checking...")
  
  useEffect(() => {
    setEnvVars({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || "Not defined",
      keyDefined: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })
    
    // Check Supabase connection
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          setSessionStatus(`Error: ${error.message}`)
        } else if (data.session) {
          setSessionStatus(`Valid session found: ${JSON.stringify(data.session.user)}`)
        } else {
          setSessionStatus("No session found")
        }
      } catch (err) {
        setSessionStatus(`Error checking session: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
    
    checkConnection()
  }, [])
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Authentication Debugging</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication State</CardTitle>
            <CardDescription>Current authentication status from useAuth hook</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>Loading:</strong> {loading ? "true" : "false"}</div>
            <div><strong>Error:</strong> {error || "None"}</div>
            <div><strong>User:</strong> {user ? JSON.stringify(user) : "Not logged in"}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Supabase Configuration</CardTitle>
            <CardDescription>Environment variables status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>URL:</strong> {envVars.url}</div>
            <div><strong>API Key:</strong> {envVars.keyDefined ? "Defined" : "Not defined"}</div>
            <div><strong>Session Status:</strong> {sessionStatus}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Debugging actions to resolve auth issues</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/login">Go to Login Page</Link>
            </Button>
            <Button asChild className="w-full">
              <Link href="/dashboard">Try Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 