"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { directSignIn } from "@/lib/auth-helper"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestPage() {
  const [status, setStatus] = useState<string>("Loading...")
  const [envVars, setEnvVars] = useState<{url?: string, key?: string}>({})
  const [testEmail, setTestEmail] = useState("")
  const [testPassword, setTestPassword] = useState("")
  const [testResult, setTestResult] = useState<any>(null)
  
  useEffect(() => {
    async function checkConnection() {
      try {
        // Test database connection
        const { data, error } = await supabase.from('users').select('*').limit(1)
        
        if (error) {
          setStatus(`Database error: ${error.message}`)
        } else {
          setStatus(`Connected to database successfully! ${data ? `Found ${data.length} users.` : 'No users found.'}`)
        }
        
        // Check URL
        fetch('/api/test-supabase')
          .then(res => res.json())
          .then(data => {
            setEnvVars({
              url: data.environment.supabaseUrlDefined ? "Defined" : "Missing",
              key: data.environment.supabaseKeyDefined ? "Defined" : "Missing"
            })
          })
      } catch (e) {
        setStatus(`Error: ${e instanceof Error ? e.message : String(e)}`)
      }
    }
    
    checkConnection()
  }, [])
  
  const handleDirectLogin = async () => {
    if (!testEmail || !testPassword) {
      setStatus("Please enter email and password")
      return
    }
    
    setStatus("Attempting direct Supabase login...")
    try {
      // Use our enhanced auth helper
      const result = await directSignIn(testEmail, testPassword)
      setTestResult(result)
      
      if (result.success) {
        setStatus(result.warning || "Direct login successful!")
      } else {
        setStatus(`Direct login failed: ${result.error}`)
      }
    } catch (e) {
      setStatus(`Login error: ${e instanceof Error ? e.message : String(e)}`)
    }
  }
  
  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
          <CardDescription>Testing direct connection to Supabase</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-100 rounded-md">
            <p className="font-semibold">Status:</p>
            <p>{status}</p>
          </div>
          
          <div className="p-4 bg-gray-100 rounded-md">
            <p className="font-semibold">Environment Variables:</p>
            <p>NEXT_PUBLIC_SUPABASE_URL: {envVars.url}</p>
            <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {envVars.key}</p>
          </div>
          
          <div className="space-y-2">
            <p className="font-semibold">Test Direct Login:</p>
            <input 
              type="email" 
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-2 border rounded"
            />
            <input 
              type="password" 
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-2 border rounded"
            />
          </div>
          
          {testResult && (
            <div className="p-4 bg-gray-100 rounded-md overflow-auto">
              <p className="font-semibold">Test Result:</p>
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleDirectLogin}>Test Direct Login</Button>
        </CardFooter>
      </Card>
    </div>
  )
} 