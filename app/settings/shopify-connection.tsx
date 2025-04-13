"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle2, ShoppingBag } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ShopifyConnection() {
  const [store, setStore] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [apiSecret, setApiSecret] = useState("")
  const [accessToken, setAccessToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connected' | 'error'>('disconnected')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { toast } = useToast()

  const handleConnect = async () => {
    if (!store) {
      toast({
        title: "Store URL Required",
        description: "Please enter your Shopify store URL",
        variant: "destructive",
      })
      return
    }

    // Normalize store URL
    let normalizedStore = store.trim()
    if (!normalizedStore.startsWith('http')) {
      normalizedStore = `https://${normalizedStore}`
    }
    
    // Remove trailing slash if present
    if (normalizedStore.endsWith('/')) {
      normalizedStore = normalizedStore.slice(0, -1)
    }
    
    // Check if it's a myshopify.com domain
    if (!normalizedStore.includes('myshopify.com')) {
      if (!normalizedStore.includes('.')) {
        normalizedStore = `${normalizedStore}.myshopify.com`
      }
    }

    setLoading(true)
    setErrorMessage(null)

    try {
      // In a real implementation, this would call an API endpoint to validate 
      // the Shopify credentials and store them securely
      
      // Mock successful connection for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Simulate successful connection
      setConnectionStatus('connected')
      toast({
        title: "Connected Successfully",
        description: `Your store ${normalizedStore} has been connected.`,
      })
    } catch (error) {
      console.error("Error connecting to Shopify:", error)
      setConnectionStatus('error')
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred")
      toast({
        title: "Connection Failed",
        description: "Could not connect to your Shopify store. Please check your credentials.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setLoading(true)

    try {
      // Mock disconnection process
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setConnectionStatus('disconnected')
      setStore("")
      setApiKey("")
      setApiSecret("")
      setAccessToken("")
      
      toast({
        title: "Store Disconnected",
        description: "Your Shopify store has been disconnected.",
      })
    } catch (error) {
      console.error("Error disconnecting store:", error)
      toast({
        title: "Error",
        description: "Failed to disconnect store. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <CardTitle>Shopify Connection</CardTitle>
        </div>
        <CardDescription>Connect your Shopify store to retrieve abandoned carts</CardDescription>
      </CardHeader>
      <CardContent>
        {connectionStatus === 'connected' ? (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Your Shopify store is connected and working properly.
              </AlertDescription>
            </Alert>
            
            <div className="grid gap-2">
              <Label htmlFor="connected-store">Connected Store</Label>
              <Input
                id="connected-store"
                value={store}
                disabled
                className="bg-gray-50"
              />
            </div>
            
            <div className="mt-2 text-sm text-muted-foreground">
              <p>Cart Whisperer will automatically:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Retrieve abandoned carts from your store</li>
                <li>Sync recovery status back to Shopify</li>
                <li>Update analytics based on recovered orders</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="store-url">Shopify Store URL</Label>
              <Input
                id="store-url"
                placeholder="your-store.myshopify.com"
                value={store}
                onChange={(e) => setStore(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Enter your Shopify store URL (e.g., your-store.myshopify.com)
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="api-key">API Key (Optional)</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Shopify API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="api-secret">API Secret (Optional)</Label>
              <Input
                id="api-secret"
                type="password"
                placeholder="Shopify API Secret"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="access-token">Access Token (Optional)</Label>
              <Input
                id="access-token"
                type="password"
                placeholder="Shopify Access Token"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                If using a private app or custom app, provide your access token here
              </p>
            </div>
            
            <div className="mt-2 text-sm">
              <p className="font-medium">How to connect:</p>
              <ol className="list-decimal pl-5 mt-1 space-y-1 text-muted-foreground">
                <li>Enter your Shopify store URL</li>
                <li>You'll be redirected to authorize Cart Whisperer</li>
                <li>Once authorized, your abandoned carts will sync automatically</li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {connectionStatus === 'connected' ? (
          <Button 
            variant="outline" 
            className="text-red-500 hover:text-red-700 hover:bg-red-50" 
            onClick={handleDisconnect}
            disabled={loading}
          >
            {loading ? "Disconnecting..." : "Disconnect Store"}
          </Button>
        ) : (
          <Button onClick={handleConnect} disabled={loading}>
            {loading ? "Connecting..." : "Connect to Shopify"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
} 