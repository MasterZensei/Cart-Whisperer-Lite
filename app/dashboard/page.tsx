"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Mail, Settings, BarChart3, Lightbulb, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AbandonedCartsTab } from "./abandoned-carts"
import { CreateCartForm } from "./create-cart-form"
import { PerformanceTips } from "./performance-tips"

export default function DashboardPage() {
  const router = useRouter()
  const [debugVisible, setDebugVisible] = useState(false)
  
  // Force create a user in localStorage if not present
  useState(() => {
    if (typeof window !== 'undefined') {
      const hasUser = localStorage.getItem('user')
      
      if (!hasUser) {
        console.log("No user found, creating emergency user")
        const emergencyUser = {
          id: "emergency-user-" + Date.now(),
          email: "emergency@example.com"
        }
        
        const emergencySession = {
          access_token: "emergency-token-" + Date.now(),
          expires_at: Math.floor(Date.now() / 1000) + 86400
        }
        
        localStorage.setItem('user', JSON.stringify(emergencyUser))
        localStorage.setItem('session', JSON.stringify(emergencySession))
      }
    }
  })
  
  // Get user info from localStorage
  const userEmail = typeof window !== 'undefined' && localStorage.getItem('user') 
    ? JSON.parse(localStorage.getItem('user') || '{}').email 
    : "guest@example.com"

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      localStorage.removeItem('session')
    }
    router.push("/login")
  }

  const toggleDebug = () => setDebugVisible(!debugVisible)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-lg font-semibold">Cart Whisperer Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {userEmail}
            </span>
            <Button variant="outline" size="sm" onClick={toggleDebug}>
              Debug
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Debug information */}
      {debugVisible && (
        <div className="bg-gray-100 p-4 border rounded m-4">
          <h3 className="font-bold">Debug Info</h3>
          <div>
            <p>Emergency mode active - no authentication required</p>
            <p>Email: {userEmail}</p>
            <p>localStorage.user: {typeof window !== 'undefined' && localStorage.getItem('user') ? 'Present' : 'Missing'}</p>
            <p>localStorage.session: {typeof window !== 'undefined' && localStorage.getItem('session') ? 'Present' : 'Missing'}</p>
          </div>
        </div>
      )}
      
      <main className="flex-1 p-6">
        <div className="container">
          <Tabs defaultValue="abandoned-carts">
            <TabsList className="mb-6">
              <TabsTrigger value="abandoned-carts">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Abandoned Carts
              </TabsTrigger>
              <TabsTrigger value="create-cart">
                <Mail className="mr-2 h-4 w-4" />
                Create Test Cart
              </TabsTrigger>
              <TabsTrigger value="analytics" onClick={() => router.push("/dashboard/analytics")}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="templates" onClick={() => router.push("/dashboard/templates")}>
                <Mail className="mr-2 h-4 w-4" />
                Email Templates
              </TabsTrigger>
              <TabsTrigger value="optimization">
                <Lightbulb className="mr-2 h-4 w-4" />
                Optimization
              </TabsTrigger>
              <TabsTrigger value="settings" onClick={() => router.push("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="abandoned-carts">
              <AbandonedCartsTab />
            </TabsContent>

            <TabsContent value="create-cart">
              <CreateCartForm />
            </TabsContent>

            <TabsContent value="optimization">
              <PerformanceTips />
            </TabsContent>

            {/* Other tabs are handled by separate routes */}
            <TabsContent value="analytics">
              <div className="rounded-md border p-6 text-center">
                <h3 className="text-lg font-medium">Redirecting to Analytics...</h3>
              </div>
            </TabsContent>

            <TabsContent value="templates">
              <div className="rounded-md border p-6 text-center">
                <h3 className="text-lg font-medium">Redirecting to Email Templates...</h3>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="rounded-md border p-6 text-center">
                <h3 className="text-lg font-medium">Redirecting to Settings...</h3>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
