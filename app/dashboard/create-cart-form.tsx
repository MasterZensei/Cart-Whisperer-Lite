"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { PlusCircle, Trash2 } from "lucide-react"

interface CartItem {
  title: string
  price: number
  quantity: number
}

export function CreateCartForm() {
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [items, setItems] = useState<CartItem[]>([{ title: "", price: 0, quantity: 1 }])
  const [loading, setLoading] = useState(false)

  function addItem() {
    setItems([...items, { title: "", price: 0, quantity: 1 }])
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: keyof CartItem, value: string | number) {
    const newItems = [...items]
    if (field === "price" || field === "quantity") {
      newItems[index][field] = Number(value)
    } else {
      newItems[index][field as "title"] = value as string
    }
    setItems(newItems)
  }

  function calculateTotal() {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validate form
    if (!customerEmail) {
      toast({
        title: "Error",
        description: "Customer email is required",
        variant: "destructive",
      })
      return
    }

    if (!items.length || items.some((item) => !item.title || item.price <= 0)) {
      toast({
        title: "Error",
        description: "Please add at least one item with a title and price",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/mock/carts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerEmail,
          customerName: customerName || undefined,
          items,
          totalPrice: calculateTotal(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create cart")
      }

      toast({
        title: "Success",
        description: "Test cart created successfully",
      })

      // Reset form
      setCustomerEmail("")
      setCustomerName("")
      setItems([{ title: "", price: 0, quantity: 1 }])
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create cart",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Test Cart</CardTitle>
        <CardDescription>Create a test abandoned cart to try out recovery emails</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="customer-email">Customer Email *</Label>
              <Input
                id="customer-email"
                type="email"
                placeholder="customer@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="customer-name">Customer Name (Optional)</Label>
              <Input
                id="customer-name"
                placeholder="John Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div>
              <Label>Cart Items *</Label>
              <div className="space-y-3 mt-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label htmlFor={`item-title-${index}`} className="sr-only">
                        Item Title
                      </Label>
                      <Input
                        id={`item-title-${index}`}
                        placeholder="Product name"
                        value={item.title}
                        onChange={(e) => updateItem(index, "title", e.target.value)}
                        required
                      />
                    </div>
                    <div className="w-24">
                      <Label htmlFor={`item-price-${index}`} className="sr-only">
                        Price
                      </Label>
                      <Input
                        id={`item-price-${index}`}
                        type="number"
                        placeholder="Price"
                        min="0.01"
                        step="0.01"
                        value={item.price || ""}
                        onChange={(e) => updateItem(index, "price", e.target.value)}
                        required
                      />
                    </div>
                    <div className="w-20">
                      <Label htmlFor={`item-quantity-${index}`} className="sr-only">
                        Quantity
                      </Label>
                      <Input
                        id={`item-quantity-${index}`}
                        type="number"
                        placeholder="Qty"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button type="button" variant="outline" size="sm" onClick={addItem} className="mt-2">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span className="font-medium">Total:</span>
                <span className="font-medium">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Test Cart"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
