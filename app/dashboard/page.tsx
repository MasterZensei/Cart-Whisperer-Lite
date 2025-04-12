"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Mail, Settings, BarChart3, Lightbulb, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AbandonedCartsTab } from "./abandoned-carts"
import { CreateCartForm } from "./create-cart-form"
import { PerformanceTips } from "./performance-tips"
import { useAuth } from "@/hooks/useAuth2"

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  
  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-lg font-semibold">Cart Whisperer Dashboard</h1>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
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
