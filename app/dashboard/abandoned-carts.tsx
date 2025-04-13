"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { EmailPreview } from "./email-preview"
import { useToast } from "@/hooks/use-toast"
import type { MockCart } from "@/lib/mock-data"
import { ShoppingCart, AlertCircle, Ban, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function AbandonedCartsTab() {
  const [carts, setCarts] = useState<MockCart[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCart, setSelectedCart] = useState<MockCart | null>(null)
  const { toast } = useToast()

  const fetchCarts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch("/api/mock/carts")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch abandoned carts")
      }

      setCarts(data.carts)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast({
        title: "Error loading carts",
        description: err instanceof Error ? err.message : "Failed to fetch abandoned carts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCarts()
  }, [])

  async function deleteCart(id: string) {
    try {
      const response = await fetch(`/api/mock/carts/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete cart")
      }

      setCarts(carts.filter((cart) => cart.id !== id))
      toast({
        title: "Cart deleted",
        description: "Cart has been removed successfully.",
      })
    } catch (err) {
      toast({
        title: "Error deleting cart",
        description: err instanceof Error ? err.message : "Failed to delete cart",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <CartsLoadingSkeleton />
  }

  if (error) {
    return (
      <div className="grid gap-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading abandoned carts</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={fetchCarts} 
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (carts.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center" data-testid="abandoned-carts-section">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <ShoppingCart className="h-6 w-6 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium">No Abandoned Carts</h3>
        <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
          There are no abandoned carts to recover. Create a test cart to see how recovery emails work.
        </p>
        <Button 
          variant="outline" 
          onClick={() => document.querySelector('[data-value="create-cart"]')?.dispatchEvent(
            new MouseEvent('click', { bubbles: true })
          )}
        >
          Create Test Cart
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-6" data-testid="abandoned-carts-section">
        <Card>
          <CardHeader>
            <CardTitle>Recent Abandoned Carts</CardTitle>
            <CardDescription>View and recover recent abandoned carts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {carts.map((cart) => (
                <div 
                  key={cart.id} 
                  className="rounded-md border p-4 transition-all hover:border-gray-400 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{cart.customerName || "Guest Customer"}</p>
                      <p className="text-sm text-muted-foreground">{cart.customerEmail}</p>
                      <p className="text-sm text-muted-foreground">
                        Abandoned {formatDistanceToNow(new Date(cart.createdAt))} ago
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${cart.totalPrice.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{cart.items.length} items</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm text-muted-foreground mb-2">Items:</div>
                    <ul className="text-sm space-y-1 mb-4">
                      {cart.items.map((item) => (
                        <li key={item.id}>
                          {item.quantity}x {item.title} - ${item.price.toFixed(2)} each
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => deleteCart(cart.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => setSelectedCart(cart)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Generate Recovery Email
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <EmailPreview cart={selectedCart} onClose={() => setSelectedCart(null)} />
    </>
  )
}

function CartsLoadingSkeleton() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-40 bg-gray-100 rounded animate-pulse"></div>
                    <div className="h-4 w-28 bg-gray-100 rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-12 bg-gray-100 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="h-4 w-10 bg-gray-100 rounded animate-pulse mb-2"></div>
                  <div className="space-y-1 mb-4">
                    <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
                    <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-40 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
