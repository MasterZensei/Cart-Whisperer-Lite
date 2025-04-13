"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, BarChart3, ZapIcon, Mail, Coins, Clock, Sparkles } from "lucide-react"

export default function ValueProposition() {
  const [activeTab, setActiveTab] = useState("roi")
  
  // ROI calculator values
  const stats = {
    abandonmentRate: 0.7, // 70% cart abandonment rate (industry average)
    avgOrderValue: 85, // Average order value in EUR
    monthlyVisitors: 10000, // Monthly visitors to the store
    conversionRate: 0.02, // 2% of visitors add to cart
    recoveryRate: 0.1, // 10% recovery with Cart Whisperer
    monthlyOrders: 10000 * 0.02 * (1 - 0.7), // Visitors * conv rate * (1 - abandon rate)
    monthlyAbandoned: 10000 * 0.02 * 0.7, // Visitors * conv rate * abandon rate
    potentialRecoveries: 10000 * 0.02 * 0.7 * 0.1, // Abandoned * recovery rate
    potentialRevenue: 10000 * 0.02 * 0.7 * 0.1 * 85, // Recoveries * AOV
    annualRevenue: 10000 * 0.02 * 0.7 * 0.1 * 85 * 12, // Monthly revenue * 12
  }
  
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
            Why Cart Whisperer?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Abandoned carts are lost revenue. Cart Whisperer helps you recover those sales with AI-powered personalization.
          </p>
        </div>
        
        <Tabs defaultValue="roi" className="max-w-4xl mx-auto" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="roi">
              <Coins className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline-block">ROI Calculator</span>
              <span className="sm:hidden">ROI</span>
            </TabsTrigger>
            <TabsTrigger value="features">
              <Sparkles className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline-block">Key Features</span>
              <span className="sm:hidden">Features</span>
            </TabsTrigger>
            <TabsTrigger value="timeline">
              <Clock className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline-block">Implementation</span>
              <span className="sm:hidden">Timeline</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="roi">
            <Card>
              <CardHeader>
                <CardTitle>See Your Potential Revenue Recovery</CardTitle>
                <CardDescription>
                  Based on industry averages, here's what Cart Whisperer could recover for your store
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Your Current Status</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex justify-between">
                          <span className="text-gray-600">Monthly Store Visitors:</span>
                          <span className="font-medium">{stats.monthlyVisitors.toLocaleString()}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Average Order Value:</span>
                          <span className="font-medium">€{stats.avgOrderValue.toLocaleString()}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Cart Abandonment Rate:</span>
                          <span className="font-medium">{(stats.abandonmentRate * 100).toFixed(0)}%</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Monthly Abandoned Carts:</span>
                          <span className="font-medium">{Math.round(stats.monthlyAbandoned).toLocaleString()}</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h3 className="text-lg font-medium mb-2">With Cart Whisperer</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex justify-between">
                          <span className="text-gray-600">Average Recovery Rate:</span>
                          <span className="font-medium">{(stats.recoveryRate * 100).toFixed(0)}%</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Monthly Recovered Orders:</span>
                          <span className="font-medium">{Math.round(stats.potentialRecoveries).toLocaleString()}</span>
                        </li>
                        <li className="flex justify-between items-center font-medium text-primary">
                          <span>Monthly Additional Revenue:</span>
                          <span className="text-lg">€{Math.round(stats.potentialRevenue).toLocaleString()}</span>
                        </li>
                        <li className="flex justify-between items-center font-medium text-primary">
                          <span>Annual Additional Revenue:</span>
                          <span className="text-lg">€{Math.round(stats.annualRevenue).toLocaleString()}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-4 text-blue-800">ROI Highlights</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-4xl font-bold text-blue-700">10-20%</p>
                        <p className="text-sm text-blue-600">Of abandoned carts can be recovered</p>
                      </div>
                      <div>
                        <p className="text-4xl font-bold text-blue-700">15x</p>
                        <p className="text-sm text-blue-600">Average return on investment</p>
                      </div>
                      <div>
                        <p className="text-4xl font-bold text-blue-700">5 mins</p>
                        <p className="text-sm text-blue-600">Setup time to start recovering revenue</p>
                      </div>
                      <div className="pt-4 mt-4 border-t border-blue-200">
                        <p className="text-sm text-blue-800">
                          For a store with €85 average order value and 140 abandoned carts monthly, 
                          Cart Whisperer typically recovers €1,190/month in additional revenue.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="features">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Automated Cart Recovery</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <div className="rounded-full bg-green-500 p-1 mr-2 mt-0.5">
                        <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                      </div>
                      <span>Automatic detection of abandoned carts</span>
                    </li>
                    <li className="flex items-start">
                      <div className="rounded-full bg-green-500 p-1 mr-2 mt-0.5">
                        <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                      </div>
                      <span>Custom timing and frequency settings</span>
                    </li>
                    <li className="flex items-start">
                      <div className="rounded-full bg-green-500 p-1 mr-2 mt-0.5">
                        <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                      </div>
                      <span>Multi-step recovery sequences</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                    <ZapIcon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>AI-Powered Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <div className="rounded-full bg-green-500 p-1 mr-2 mt-0.5">
                        <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                      </div>
                      <span>Personalized product descriptions</span>
                    </li>
                    <li className="flex items-start">
                      <div className="rounded-full bg-green-500 p-1 mr-2 mt-0.5">
                        <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                      </div>
                      <span>Customer-specific messaging</span>
                    </li>
                    <li className="flex items-start">
                      <div className="rounded-full bg-green-500 p-1 mr-2 mt-0.5">
                        <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                      </div>
                      <span>Tone and style customization</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Advanced Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <div className="rounded-full bg-green-500 p-1 mr-2 mt-0.5">
                        <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                      </div>
                      <span>Detailed recovery tracking</span>
                    </li>
                    <li className="flex items-start">
                      <div className="rounded-full bg-green-500 p-1 mr-2 mt-0.5">
                        <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                      </div>
                      <span>A/B testing performance</span>
                    </li>
                    <li className="flex items-start">
                      <div className="rounded-full bg-green-500 p-1 mr-2 mt-0.5">
                        <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                      </div>
                      <span>Revenue attribution</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Fast Implementation, Immediate Results</CardTitle>
                <CardDescription>
                  Get up and running quickly with Cart Whisperer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-medium mb-1">Connect Your Shopify Store</h3>
                      <p className="text-gray-600">Authorize with just a few clicks - no code required</p>
                      <p className="text-sm text-gray-500 mt-1">Time: 2 minutes</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-bold">2</span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-medium mb-1">Configure Recovery Emails</h3>
                      <p className="text-gray-600">Select templates, customize AI prompts, and set timing</p>
                      <p className="text-sm text-gray-500 mt-1">Time: 10 minutes</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-bold">3</span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-medium mb-1">Start Recovering Revenue</h3>
                      <p className="text-gray-600">Automatic recovery emails begin sending to abandoned carts</p>
                      <p className="text-sm text-gray-500 mt-1">Time: Immediate after setup</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                      <span className="text-green-600 font-bold">✓</span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-medium mb-1">First Results</h3>
                      <p className="text-gray-600">See your first recovered orders and revenue</p>
                      <p className="text-sm text-gray-500 mt-1">Time: 24-48 hours</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
} 