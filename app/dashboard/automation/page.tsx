"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { ArrowRight, Clock, Mail, Settings as SettingsIcon, PlusCircle, Trash2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"

export default function AutomationPage() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState(tabParam === "settings" ? "settings" : "sequences")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  
  // Update active tab when URL parameters change
  useEffect(() => {
    if (tabParam === "settings" || tabParam === "sequences") {
      setActiveTab(tabParam)
    }
  }, [tabParam])
  
  // Email sequence state
  const [sequences, setSequences] = useState([
    {
      id: "seq-1",
      name: "Standard Recovery",
      isActive: true,
      steps: [
        { id: "step-1", delay: 2, delayUnit: "hours", templateId: "1", name: "First Reminder" },
        { id: "step-2", delay: 1, delayUnit: "days", templateId: "3", name: "Urgency Creator" },
        { id: "step-3", delay: 3, delayUnit: "days", templateId: "2", name: "Final Offer" },
      ]
    },
    {
      id: "seq-2",
      name: "Premium Products",
      isActive: false,
      steps: [
        { id: "step-1", delay: 4, delayUnit: "hours", templateId: "2", name: "Luxury Reminder" },
        { id: "step-2", delay: 2, delayUnit: "days", templateId: "4", name: "Personalized Follow-up" },
      ]
    }
  ])
  
  // Settings state
  const [settings, setSettings] = useState({
    maxEmailsPerCart: 3,
    minCartValue: 25,
    discountEnabled: true,
    discountValue: 10,
    discountType: "percentage",
    discountCode: "COMEBACK10",
    discountExpiry: 48, // hours
    recoveryLinkExpiry: 7, // days
    emailSendingHours: {
      start: 9, // 9 AM
      end: 20, // 8 PM
    }
  })
  
  const toggleSequenceActive = (id: string) => {
    setSequences(sequences.map(seq => 
      seq.id === id ? { ...seq, isActive: !seq.isActive } : seq
    ))
    
    toast({
      title: "Sequence Updated",
      description: `Automation sequence has been ${sequences.find(s => s.id === id)?.isActive ? 'deactivated' : 'activated'}.`,
    })
  }
  
  const saveSettings = () => {
    setLoading(true)
    
    // Mock API call
    setTimeout(() => {
      setLoading(false)
      toast({
        title: "Settings Saved",
        description: "Your automation settings have been updated.",
      })
    }, 1000)
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Automation Center</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="sequences">Email Sequences</TabsTrigger>
          <TabsTrigger value="settings">Timing & Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sequences" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Recovery Sequences</h2>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Sequence
            </Button>
          </div>
          
          {sequences.map(sequence => (
            <Card key={sequence.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{sequence.name}</CardTitle>
                    <CardDescription>
                      {sequence.steps.length} {sequence.steps.length === 1 ? 'step' : 'steps'} • {
                        sequence.isActive ? 'Active' : 'Inactive'
                      }
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {sequence.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <Switch 
                      checked={sequence.isActive}
                      onCheckedChange={() => toggleSequenceActive(sequence.id)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {sequence.steps.map((step, index) => (
                    <div key={step.id} className="flex items-start">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        {index + 1}
                      </div>
                      <div className="flex-grow grid gap-1">
                        <div className="font-medium">{step.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Sent {step.delay} {step.delayUnit} after previous email
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center space-x-2">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="outline" className="w-full mt-4">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Step
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Duplicate</Button>
                <div className="space-x-2">
                  <Button variant="outline" className="text-destructive">Delete</Button>
                  <Button>Edit Sequence</Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Email Sending Settings</CardTitle>
              <CardDescription>Configure when and how recovery emails are sent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="max-emails">Maximum Emails Per Cart</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        id="max-emails"
                        type="number" 
                        min={1}
                        max={10}
                        value={settings.maxEmailsPerCart}
                        onChange={(e) => setSettings({...settings, maxEmailsPerCart: parseInt(e.target.value) || 3})}
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">emails max</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Limit how many recovery emails to send for a single cart
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="min-cart-value">Minimum Cart Value</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm">$</span>
                      <Input
                        id="min-cart-value"
                        type="number" 
                        min={0}
                        step={0.01}
                        value={settings.minCartValue}
                        onChange={(e) => setSettings({...settings, minCartValue: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Only send recovery emails for carts above this value
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Sending Hours</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <Label htmlFor="start-hour" className="text-xs">Start</Label>
                        <Select 
                          value={settings.emailSendingHours.start.toString()} 
                          onValueChange={(value) => setSettings({
                            ...settings, 
                            emailSendingHours: {
                              ...settings.emailSendingHours,
                              start: parseInt(value)
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Starting hour" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({length: 24}, (_, i) => (
                              <SelectItem key={i} value={i.toString()}>
                                {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="end-hour" className="text-xs">End</Label>
                        <Select 
                          value={settings.emailSendingHours.end.toString()} 
                          onValueChange={(value) => setSettings({
                            ...settings, 
                            emailSendingHours: {
                              ...settings.emailSendingHours,
                              end: parseInt(value)
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Ending hour" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({length: 24}, (_, i) => (
                              <SelectItem key={i} value={i.toString()}>
                                {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Only send emails during these hours to improve open rates
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="recovery-link-expiry">Recovery Link Expiry</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        id="recovery-link-expiry"
                        type="number" 
                        min={1}
                        max={30}
                        value={settings.recoveryLinkExpiry}
                        onChange={(e) => setSettings({...settings, recoveryLinkExpiry: parseInt(e.target.value) || 7})}
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">days</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      How long recovery links remain valid after being sent
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Discount Settings</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure automatic discounts for recovery emails
                    </p>
                  </div>
                  <Switch 
                    checked={settings.discountEnabled}
                    onCheckedChange={(checked) => setSettings({...settings, discountEnabled: checked})}
                  />
                </div>
                
                {settings.discountEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="discount-value">Discount Value</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Input
                            id="discount-value"
                            type="number" 
                            min={1}
                            max={settings.discountType === 'percentage' ? 100 : 1000}
                            value={settings.discountValue}
                            onChange={(e) => setSettings({...settings, discountValue: parseInt(e.target.value) || 10})}
                          />
                          <Select 
                            value={settings.discountType} 
                            onValueChange={(value) => setSettings({...settings, discountType: value as 'percentage' | 'fixed'})}
                          >
                            <SelectTrigger className="w-[110px]">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">%</SelectItem>
                              <SelectItem value="fixed">$ Fixed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="discount-code">Discount Code</Label>
                        <Input
                          id="discount-code"
                          value={settings.discountCode}
                          onChange={(e) => setSettings({...settings, discountCode: e.target.value})}
                          className="mt-2"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="discount-expiry">Discount Expiry</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          id="discount-expiry"
                          type="number" 
                          min={1}
                          max={168}
                          value={settings.discountExpiry}
                          onChange={(e) => setSettings({...settings, discountExpiry: parseInt(e.target.value) || 48})}
                        />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">hours</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        How long the discount remains valid after email is sent
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings} disabled={loading}>
                {loading ? "Saving..." : "Save Settings"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 