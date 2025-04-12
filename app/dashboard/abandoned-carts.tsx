"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { EmailPreview } from "./email-preview"
import { toast } from "@/hooks/use-toast"
import type { MockCart } from "@/lib/mock-data"

export function AbandonedCartsTab() {
  const [carts, setCarts] = useState<MockCart[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCart, setSelectedCart] = useState<MockCart | null>(null)

  useEffect(() => {
    async function fetchCarts() {
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
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to fetch abandoned carts",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

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
        title: "Success",
        description: "Cart deleted successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete cart",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex justify-center py-8">Loading abandoned carts...</div>
  }

  if (error) {
    return <div className="text-red-500 py-4">Error: {error}</div>
  }

  if (carts.length === 0) {
    return (
      <div className="rounded-md border p-6 text-center">
        <h3 className="text-lg font-medium">No Abandoned Carts</h3>
        <p className="text-muted-foreground mt-2">
          There are no abandoned carts to recover. Create a test cart to get started.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Abandoned Carts</CardTitle>
            <CardDescription>View and recover recent abandoned carts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {carts.map((cart) => (
                <div key={cart.id} className="rounded-md border p-4">
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
                    <Button variant="outline" size="sm" onClick={() => deleteCart(cart.id)}>
                      Delete
                    </Button>
                    <Button size="sm" onClick={() => setSelectedCart(cart)}>
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
