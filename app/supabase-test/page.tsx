"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { checkSupabaseConnection } from '@/lib/supabase'

export default function SupabaseTestPage() {
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [envVariables, setEnvVariables] = useState({
    supabaseUrl: '',
    supabaseKeyDefined: false
  })

  useEffect(() => {
    // Check if environment variables are available on the client
    setEnvVariables({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      supabaseKeyDefined: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    })
  }, [])

  const testConnection = async () => {
    setLoading(true)
    try {
      // Test API endpoint
      const apiResponse = await fetch('/api/test-supabase')
      const apiData = await apiResponse.json()
      
      // Direct client test
      const directTest = await checkSupabaseConnection()
      
      setTestResults({
        apiTest: apiData,
        directTest
      })
    } catch (error) {
      setTestResults({
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Supabase Connection Test</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>Check your Supabase configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Supabase URL: {envVariables.supabaseUrl ? 'Defined ✅' : 'Missing ❌'}</p>
              <p>Supabase Key: {envVariables.supabaseKeyDefined ? 'Defined ✅' : 'Missing ❌'}</p>
              {(!envVariables.supabaseUrl || !envVariables.supabaseKeyDefined) && (
                <div className="p-4 mt-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
                  <p className="font-medium">Configuration Issue Detected</p>
                  <p className="text-sm mt-1">
                    Missing Supabase environment variables. Make sure you have a proper .env file with:
                  </p>
                  <pre className="bg-slate-800 text-white p-2 rounded mt-2 text-xs overflow-x-auto">
                    NEXT_PUBLIC_SUPABASE_URL=your-supabase-url{'\n'}
                    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={testConnection} disabled={loading}>
              {loading ? 'Testing...' : 'Test Connection'}
            </Button>
          </CardFooter>
        </Card>

        {testResults && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.error ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
                    <p className="font-medium">Error</p>
                    <p>{testResults.error}</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <p className="font-semibold">API Test:</p>
                      <div className="p-3 bg-slate-50 rounded-md">
                        <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(testResults.apiTest, null, 2)}
                        </pre>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="font-semibold">Direct Client Test:</p>
                      <div className="p-3 bg-slate-50 rounded-md">
                        <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(testResults.directTest, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 