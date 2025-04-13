"use client"

import { useState, useEffect, Suspense, lazy } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Mail, Settings, BarChart3, Lightbulb, LogOut, Sparkles, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth2"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"

// Lazy loaded components
const AbandonedCartsTab = lazy(() => import('./abandoned-carts').then(mod => ({ default: mod.AbandonedCartsTab })));
const CreateCartForm = lazy(() => import('./create-cart-form').then(mod => ({ default: mod.CreateCartForm })));
const PerformanceTips = lazy(() => import('./performance-tips').then(mod => ({ default: mod.PerformanceTips })));

export default function DashboardPage() {
  const router = useRouter()
  const { user, signOut: authSignOut, loading } = useAuth()
  const [activeTab, setActiveTab] = useState("abandoned-carts")
  const { toast } = useToast()
  const isMobile = useIsMobile()
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, user, router])
  
  // Show loading state while checking auth
  if (loading) {
    return <DashboardSkeleton />
  }
  
  // If no user is found after loading completes, don't render the dashboard content
  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    await authSignOut()
    toast({
      title: "Signed out successfully",
      description: "You have been logged out of your account.",
    })
    router.push("/login")
  }
  
  const handleTabClick = (value: string) => {
    setActiveTab(value)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-lg font-semibold">Cart Whisperer Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground md:inline-block">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 p-3 md:p-6">
        <div className="container">
          {isMobile ? (
            <MobileTabs 
              activeTab={activeTab} 
              onTabChange={handleTabClick} 
              renderContent={() => <TabContent activeTab={activeTab} />}
            />
          ) : (
            <Tabs 
              value={activeTab} 
              onValueChange={handleTabClick}
              defaultValue="abandoned-carts">
              <TabsList className="mb-6 flex w-full flex-wrap justify-start overflow-x-auto">
                <TabsTrigger value="abandoned-carts">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Abandoned Carts
                </TabsTrigger>
                <TabsTrigger value="create-cart">
                  <Mail className="mr-2 h-4 w-4" />
                  Create Test Cart
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="templates">
                  <Mail className="mr-2 h-4 w-4" />
                  Email Templates
                </TabsTrigger>
                <TabsTrigger value="ai-prompts">
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI Prompts
                </TabsTrigger>
                <TabsTrigger value="optimization">
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Optimization
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>
              
              <TabContent activeTab={activeTab} />
            </Tabs>
          )}
        </div>
      </main>
    </div>
  )
}

// Mobile-friendly tabs with a dropdown
function MobileTabs({ 
  activeTab, 
  onTabChange, 
  renderContent 
}: { 
  activeTab: string, 
  onTabChange: (value: string) => void,
  renderContent: () => React.ReactNode
}) {
  const tabLabels: Record<string, { icon: React.ReactNode, label: string }> = {
    "abandoned-carts": { icon: <ShoppingCart className="h-4 w-4" />, label: "Abandoned Carts" },
    "create-cart": { icon: <Mail className="h-4 w-4" />, label: "Create Test Cart" },
    "analytics": { icon: <BarChart3 className="h-4 w-4" />, label: "Analytics" },
    "templates": { icon: <Mail className="h-4 w-4" />, label: "Email Templates" },
    "ai-prompts": { icon: <Sparkles className="h-4 w-4" />, label: "AI Prompts" },
    "optimization": { icon: <Lightbulb className="h-4 w-4" />, label: "Optimization" },
    "settings": { icon: <Settings className="h-4 w-4" />, label: "Settings" },
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {tabLabels[activeTab].icon}
          <h2 className="text-xl font-semibold">{tabLabels[activeTab].label}</h2>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader className="mb-4">
              <SheetTitle>Dashboard Navigation</SheetTitle>
              <SheetDescription>Switch between dashboard sections</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col space-y-2 mt-2">
              {Object.entries(tabLabels).map(([value, { icon, label }]) => (
                <Button
                  key={value}
                  variant={value === activeTab ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => {
                    onTabChange(value);
                    document.querySelector('[data-state="open"]')?.dispatchEvent(
                      new KeyboardEvent('keydown', { key: 'Escape' })
                    );
                  }}
                >
                  {icon}
                  <span className="ml-2">{label}</span>
                </Button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {renderContent()}
    </div>
  )
}

// Extracted tab content component
function TabContent({ activeTab }: { activeTab: string }) {
  return (
    <>
      <TabsContent value="abandoned-carts" className="mt-0">
        <Suspense fallback={<TabSkeleton />}>
          <AbandonedCartsTab />
        </Suspense>
      </TabsContent>

      <TabsContent value="create-cart" className="mt-0">
        <Suspense fallback={<TabSkeleton />}>
          <CreateCartForm />
        </Suspense>
      </TabsContent>

      <TabsContent value="optimization" className="mt-0">
        <Suspense fallback={<TabSkeleton />}>
          <PerformanceTips />
        </Suspense>
      </TabsContent>

      <TabsContent value="analytics" className="mt-0">
        <div className="rounded-md border p-6">
          <h3 className="text-lg font-medium mb-4">Analytics</h3>
          {/* Analytics content will go here */}
          <Button onClick={() => window.location.href = "/dashboard/analytics"}>
            View Detailed Analytics
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="ai-prompts" className="mt-0">
        <div className="rounded-md border p-6">
          <h3 className="text-lg font-medium mb-4">AI Prompts</h3>
          {/* AI Prompts content will go here */}
          <Button onClick={() => window.location.href = "/dashboard/ai-prompts"}>
            Manage AI Prompts
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="templates" className="mt-0">
        <div className="rounded-md border p-6">
          <h3 className="text-lg font-medium mb-4">Email Templates</h3>
          {/* Templates content will go here */}
          <Button onClick={() => window.location.href = "/dashboard/templates"}>
            Manage Email Templates
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="settings" className="mt-0">
        <div className="rounded-md border p-6">
          <h3 className="text-lg font-medium mb-4">Settings</h3>
          {/* Settings content will go here */}
          <Button onClick={() => window.location.href = "/settings"}>
            Manage Settings
          </Button>
        </div>
      </TabsContent>
    </>
  )
}

// Tab loading skeleton
function TabSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-1/4 animate-pulse rounded bg-gray-200"></div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 w-full animate-pulse rounded bg-gray-200"></div>
        ))}
      </div>
    </div>
  );
}

// Loading skeleton
function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="h-6 w-48 animate-pulse rounded bg-gray-200"></div>
          <div className="flex items-center gap-4">
            <div className="h-4 w-36 animate-pulse rounded bg-gray-200"></div>
            <div className="h-8 w-20 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 p-3 md:p-6">
        <div className="container">
          <div className="mb-6 flex space-x-2 overflow-x-auto">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-9 w-28 animate-pulse rounded bg-gray-200"></div>
            ))}
          </div>
          
          <div className="h-96 w-full animate-pulse rounded-lg bg-gray-100 p-6">
            <div className="mb-4 h-6 w-1/4 animate-pulse rounded bg-gray-200"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 w-full animate-pulse rounded bg-gray-200"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
