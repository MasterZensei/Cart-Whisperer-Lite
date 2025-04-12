"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { getCartRecoveryStats, getEmailEvents } from "@/lib/db-service"
import { EmailEvent } from "@/lib/supabase"

const COLORS = ["#4f46e5", "#ef4444", "#f59e0b", "#10b981", "#6366f1"]

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<{ total: number; recovered: number; conversionRate: number }>({
    total: 0,
    recovered: 0,
    conversionRate: 0,
  })
  const [emailEvents, setEmailEvents] = useState<EmailEvent[]>([])
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  // Load analytics data
  useEffect(() => {
    async function loadAnalytics() {
      try {
        if (!user) return

        setLoading(true)
        const storeId = user.id || "demo-store"
        
        // Load cart recovery stats
        const recoveryStats = await getCartRecoveryStats(storeId)
        setStats(recoveryStats)
        
        // Load email events
        const events = await getEmailEvents(storeId)
        setEmailEvents(events)
        
      } catch (error) {
        console.error("Error loading analytics:", error)
        toast({
          title: "Error",
          description: "Failed to load analytics data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [user, toast])

  // Calculate email stats
  const emailStatusCount = emailEvents.reduce((acc, event) => {
    const status = event.status
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const emailPieData = Object.entries(emailStatusCount).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
  }))

  // Calculate daily stats for last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split('T')[0]
  }).reverse()

  const dailyData = last7Days.map(date => {
    const sentCount = emailEvents.filter(e => 
      e.status === 'sent' && e.sent_at.startsWith(date)
    ).length
    
    const openedCount = emailEvents.filter(e => 
      e.status === 'opened' && e.sent_at.startsWith(date)
    ).length
    
    const clickedCount = emailEvents.filter(e => 
      e.status === 'clicked' && e.sent_at.startsWith(date)
    ).length

    // Format date to short format (e.g. "Jun 12")
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
    
    return {
      date: formattedDate,
      sent: sentCount,
      opened: openedCount,
      clicked: clickedCount,
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Abandoned Carts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Carts abandoned by customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recovered Carts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.recovered}</div>
            <p className="text-xs text-muted-foreground">Successfully recovered purchases</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Of abandoned carts recovered</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="email-performance">Email Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Email Campaign Performance</CardTitle>
              <CardDescription>Daily email metrics for the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sent" fill="#4f46e5" name="Emails Sent" />
                    <Bar dataKey="opened" fill="#10b981" name="Emails Opened" />
                    <Bar dataKey="clicked" fill="#f59e0b" name="Links Clicked" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email-performance">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Email Status Distribution</CardTitle>
                <CardDescription>Breakdown of email statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={emailPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {emailPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Open Rate Analysis</CardTitle>
                <CardDescription>Email open rates over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  {emailEvents.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={dailyData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value, name) => {
                          if (name === 'openRate') return `${value}%`;
                          return value;
                        }} />
                        <Legend />
                        <Bar
                          name="Open Rate (%)"
                          dataKey={(data) => {
                            if (data.sent === 0) return 0;
                            return Number(((data.opened / data.sent) * 100).toFixed(1));
                          }}
                          fill="#10b981"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground">No email data available yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 