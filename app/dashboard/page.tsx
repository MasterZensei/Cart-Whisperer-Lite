"use client"

import { useState, useEffect, Suspense, lazy } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Mail, Settings, BarChart3, Lightbulb, LogOut, Sparkles, Menu, PlusCircle, ArrowRight, ZapIcon, Brain, MessageSquare, Repeat } from "lucide-react"
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"

// Lazy loaded components
const AbandonedCartsTab = lazy(() => import('./abandoned-carts').then(mod => ({ default: mod.AbandonedCartsTab })));
const CreateCartForm = lazy(() => import('./create-cart-form').then(mod => ({ default: mod.CreateCartForm })));
const PerformanceTips = lazy(() => import('./performance-tips').then(mod => ({ default: mod.PerformanceTips })));

export default function DashboardPage() {
  const router = useRouter()
  const { user, signOut: authSignOut, loading } = useAuth()
  const [activeTab, setActiveTab] = useState("recovery-hub")
  const { toast } = useToast()
  const isMobile = useIsMobile()
  
  // Redirect if not authenticated
  useEffect(() => {
    console.log("Dashboard page - Auth state:", { user, loading });
    
    if (!loading && !user) {
      console.log("Dashboard page - User not authenticated, redirecting to login");
      
      // Dispatch a custom event to notify of navigation
      window.dispatchEvent(new CustomEvent('before-reactnavigation'));
      
      setTimeout(() => {
        router.push("/login");
      }, 50);
    }
  }, [loading, user, router])
  
  // Show loading state while checking auth
  if (loading) {
    console.log("Dashboard page - Still loading auth state");
    return <DashboardSkeleton />
  }
  
  // If no user is found after loading completes, don't render the dashboard content
  if (!user) {
    console.log("Dashboard page - No user found, showing loading state");
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const handleSignOut = async () => {
    console.log("Dashboard page - Signing out");
    
    // Dispatch a custom event to notify of navigation
    window.dispatchEvent(new CustomEvent('before-reactnavigation'));
    
    await authSignOut()
    toast({
      title: "Signed out successfully",
      description: "You have been logged out of your account.",
    })
    
    setTimeout(() => {
      router.push("/login")
    }, 50);
  }
  
  const handleTabClick = (value: string) => {
    setActiveTab(value)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-lg font-semibold">Cart Whisperer</h1>
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
              defaultValue="recovery-hub">
              <TabsList className="mb-6 flex w-full flex-wrap justify-start overflow-x-auto">
                <TabsTrigger value="recovery-hub">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Recovery Hub
                </TabsTrigger>
                <TabsTrigger value="ai-templates">
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI Templates
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="automation">
                  <Repeat className="mr-2 h-4 w-4" />
                  Automation
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
    "recovery-hub": { icon: <ShoppingCart className="h-4 w-4" />, label: "Recovery Hub" },
    "ai-templates": { icon: <Sparkles className="h-4 w-4" />, label: "AI Templates" },
    "analytics": { icon: <BarChart3 className="h-4 w-4" />, label: "Analytics" },
    "automation": { icon: <Repeat className="h-4 w-4" />, label: "Automation" },
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
  const router = useRouter();
  
  return (
    <>
      <TabsContent value="recovery-hub" className="mt-0">
        <RecoveryHubContent />
      </TabsContent>

      <TabsContent value="ai-templates" className="mt-0">
        <AITemplatesContent />
      </TabsContent>

      <TabsContent value="analytics" className="mt-0">
        <div className="rounded-md border p-6">
          <h3 className="text-2xl font-bold mb-4">Analytics Dashboard</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recovery Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">24%</p>
                <p className="text-xs text-muted-foreground">+5% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Revenue Recovered</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">$4,280</p>
                <p className="text-xs text-muted-foreground">+$1,200 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Email Open Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">42%</p>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
              </CardContent>
            </Card>
          </div>
          <Button onClick={() => router.push("/dashboard/analytics")}>
            View Detailed Analytics
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="automation" className="mt-0">
        <div className="rounded-md border p-6">
          <h3 className="text-2xl font-bold mb-4">Automation Center</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Sequence Builder</CardTitle>
                <CardDescription>Create multi-step recovery sequences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <div className="bg-primary text-primary-foreground flex items-center justify-center w-8 h-8 rounded-full">1</div>
                  <ArrowRight className="h-4 w-4" />
                  <div className="bg-primary/20 text-primary flex items-center justify-center w-8 h-8 rounded-full">2</div>
                  <ArrowRight className="h-4 w-4" />
                  <div className="bg-primary/20 text-primary flex items-center justify-center w-8 h-8 rounded-full">3</div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard/automation?tab=sequences")}>Configure Sequences</Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Schedule Settings</CardTitle>
                <CardDescription>Timing and frequency settings</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="flex-1">First email delay:</span>
                    <span className="font-medium">4 hours</span>
                  </li>
                  <li className="flex items-center">
                    <span className="flex-1">Follow-up delay:</span>
                    <span className="font-medium">2 days</span>
                  </li>
                  <li className="flex items-center">
                    <span className="flex-1">Max emails per cart:</span>
                    <span className="font-medium">3</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard/automation?tab=settings")}>Adjust Settings</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="settings" className="mt-0">
        <div className="rounded-md border p-6">
          <h3 className="text-2xl font-bold mb-4">Account Settings</h3>
          <Button onClick={() => router.push("/settings")}>
            Manage Settings
          </Button>
        </div>
      </TabsContent>
    </>
  )
}

// Recovery Hub Content
function RecoveryHubContent() {
  const router = useRouter();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Recovery Hub</h2>
          <p className="text-muted-foreground">Manage and recover abandoned carts</p>
        </div>
        <Button onClick={() => router.push("/dashboard/create-cart-form")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Test Cart
        </Button>
      </div>
      
      {/* Recovery Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Waiting for Recovery</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">12</p>
            <p className="text-xs text-muted-foreground">Carts ready for action</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full">View All</Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">5</p>
            <p className="text-xs text-muted-foreground">Active recovery attempts</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full">View All</Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recovered</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">8</p>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full">View All</Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Recovery Flow */}
      <div className="rounded-md border">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">Quick Recovery Process</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4 rounded-lg border bg-card">
              <div className="bg-primary/10 p-3 rounded-full mb-3">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-2">1. Select Cart</h4>
              <p className="text-sm text-muted-foreground">Choose from pending recovery carts</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg border bg-card">
              <div className="bg-primary/10 p-3 rounded-full mb-3">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-2">2. Apply AI Template</h4>
              <p className="text-sm text-muted-foreground">Select or customize a recovery template</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg border bg-card">
              <div className="bg-primary/10 p-3 rounded-full mb-3">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-2">3. Send & Track</h4>
              <p className="text-sm text-muted-foreground">Send recovery email and track results</p>
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <Button onClick={() => {
              // Find the element and focus the abandoned carts section
              const abandonedCartsSection = document.querySelector('[data-testid="abandoned-carts-section"]');
              if (abandonedCartsSection) {
                abandonedCartsSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}>Start Recovery Process</Button>
          </div>
        </div>
      </div>
      
      <Suspense fallback={<TabSkeleton />}>
        <AbandonedCartsTab />
      </Suspense>
    </div>
  )
}

// AI Templates Content
function AITemplatesContent() {
  const router = useRouter();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">AI Templates</h2>
          <p className="text-muted-foreground">Create and manage AI-powered recovery templates</p>
        </div>
        <Button onClick={() => router.push("/dashboard/ai-prompts")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Template
        </Button>
      </div>
      
      {/* AI Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Focused</CardTitle>
            <CardDescription>Highlights abandoned product benefits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <p>Uses AI to analyze product features and create compelling content focused on product benefits.</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm">Preview</Button>
            <Button size="sm">Use Template</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Limited Time Offer</CardTitle>
            <CardDescription>Creates urgency with special deals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <p>Generates time-sensitive offers and countdown language to motivate quick action.</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm">Preview</Button>
            <Button size="sm">Use Template</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Customer Focused</CardTitle>
            <CardDescription>Addresses customer pain points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <p>Creates personalized messaging that addresses specific customer needs based on purchase history.</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm">Preview</Button>
            <Button size="sm">Use Template</Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Custom Template Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Template Builder</CardTitle>
          <CardDescription>Create a personalized template with AI assistance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border p-4 mb-4 bg-muted/50">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium mb-1">AI Template Assistant</h4>
                <p className="text-sm text-muted-foreground">Tell me what kind of template you need, and I'll help you create it. For example: "Create a template for customers who abandoned luxury items" or "Design a friendly reminder for first-time visitors"</p>
              </div>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-1 relative">
              <textarea
                className="min-h-[80px] rounded-l-md w-full border border-r-0 p-3 text-sm focus:ring-1 focus:ring-primary"
                placeholder="Describe what kind of template you need..."
              />
            </div>
            <Button className="rounded-l-none">
              <MessageSquare className="mr-2 h-4 w-4" />
              Generate
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard/ai-prompts")}>
            Advanced Template Editor
          </Button>
        </CardFooter>
      </Card>
    </div>
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
