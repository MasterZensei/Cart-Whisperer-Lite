"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [aiSettings, setAiSettings] = useState({
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    maxTokens: 1000,
  })
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const { toast: useToastToast } = useToast()

  async function sendTestEmail() {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send test email")
      }

      toast({
        title: "Success",
        description: `Test email sent to ${email}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send test email",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveAiSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/settings/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(aiSettings),
      })
      
      if (!response.ok) {
        throw new Error("Failed to save AI settings")
      }
      
      toast({
        title: "Success",
        description: "AI settings saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateApiKey = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/settings/api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: apiKey, service: "openai" }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to update API key")
      }
      
      toast({
        title: "Success",
        description: "API key updated successfully",
      })
      setShowApiKeyInput(false)
      setApiKey("")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update API key",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Settings</CardTitle>
            <CardDescription>Configure your OpenAI integration for email generation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="ai-model">AI Model</Label>
                <Select 
                  value={aiSettings.model} 
                  onValueChange={(value) => setAiSettings({...aiSettings, model: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>OpenAI Models</SelectLabel>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="temperature">Temperature: {aiSettings.temperature}</Label>
                  <span className="text-sm text-muted-foreground">Creativity level</span>
                </div>
                <Slider
                  id="temperature"
                  min={0}
                  max={1}
                  step={0.1}
                  value={[aiSettings.temperature]}
                  onValueChange={(values) => setAiSettings({...aiSettings, temperature: values[0]})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="max-tokens">Max Tokens</Label>
                <Input
                  id="max-tokens"
                  type="number"
                  min={100}
                  max={4000}
                  value={aiSettings.maxTokens}
                  onChange={(e) => setAiSettings({...aiSettings, maxTokens: parseInt(e.target.value) || 1000})}
                />
                <p className="text-sm text-muted-foreground">Maximum length of generated emails (1000 recommended)</p>
              </div>
              
              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <Label>OpenAI API Key</Label>
                  <Button variant="outline" size="sm" onClick={() => setShowApiKeyInput(!showApiKeyInput)}>
                    {showApiKeyInput ? "Cancel" : "Update Key"}
                  </Button>
                </div>
                {showApiKeyInput && (
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Enter your OpenAI API key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                    <Button size="sm" onClick={updateApiKey} disabled={!apiKey || loading}>
                      {loading ? "Saving..." : "Save API Key"}
                    </Button>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Your API key is securely stored and never exposed to the client.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={saveAiSettings} disabled={loading}>
              {loading ? "Saving..." : "Save AI Settings"}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Email Settings</CardTitle>
            <CardDescription>Configure and test your email functionality</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="test-email">Test Email Address</Label>
                <Input
                  id="test-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={sendTestEmail} disabled={loading}>
              {loading ? "Sending..." : "Send Test Email"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
