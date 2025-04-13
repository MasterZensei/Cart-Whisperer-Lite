"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getAllCarts, type Cart } from "@/lib/cart-service"

export function CartList() {
  const [carts, setCarts] = useState<Cart[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCarts() {
      try {
        const cartData = await getAllCarts()
        setCarts(cartData)
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch carts:", error)
        setLoading(false)
      }
    }

    fetchCarts()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
                <Skeleton className="h-8 w-[70px]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!carts || carts.length === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">No abandoned carts found.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {carts.map((cart) => (
        <Card key={cart.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{cart.customer?.email || "Anonymous Customer"}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(cart.createdAt).toLocaleDateString()} · ${cart.totalPrice.toFixed(2)} · {cart.lineItems.length} items
                </p>
              </div>
              <div className="flex space-x-2">
                <button className="text-sm font-medium text-primary hover:underline">
                  Recover
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 