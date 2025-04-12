import { v4 as uuidv4 } from "uuid"

export interface MockCartItem {
  id: string
  title: string
  price: number
  quantity: number
  image?: string
}

export interface MockCart {
  id: string
  customerEmail: string
  customerName?: string
  items: MockCartItem[]
  totalPrice: number
  createdAt: string
  updatedAt: string
  recoveryUrl: string
}

// In-memory store for mock carts
let mockCarts: MockCart[] = []

// Generate some sample products
const sampleProducts = [
  {
    id: uuidv4(),
    title: "Premium Wireless Headphones",
    price: 129.99,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: uuidv4(),
    title: "Organic Cotton T-Shirt",
    price: 34.99,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: uuidv4(),
    title: "Smart Fitness Tracker",
    price: 89.99,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: uuidv4(),
    title: "Stainless Steel Water Bottle",
    price: 24.99,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: uuidv4(),
    title: "Bluetooth Portable Speaker",
    price: 59.99,
    image: "/placeholder.svg?height=100&width=100",
  },
]

// Generate some initial mock carts
export function initializeMockCarts() {
  if (mockCarts.length === 0) {
    // Create 5 sample abandoned carts
    for (let i = 0; i < 5; i++) {
      const numItems = Math.floor(Math.random() * 3) + 1
      const items: MockCartItem[] = []
      let totalPrice = 0

      // Add random products to the cart
      for (let j = 0; j < numItems; j++) {
        const product = sampleProducts[Math.floor(Math.random() * sampleProducts.length)]
        const quantity = Math.floor(Math.random() * 2) + 1
        const price = product.price

        items.push({
          id: uuidv4(),
          title: product.title,
          price,
          quantity,
          image: product.image,
        })

        totalPrice += price * quantity
      }

      // Create a random time in the past (0-24 hours ago)
      const hoursAgo = Math.floor(Math.random() * 24)
      const createdAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()

      mockCarts.push({
        id: uuidv4(),
        customerEmail: `customer${i + 1}@example.com`,
        customerName: i % 2 === 0 ? `Customer ${i + 1}` : undefined,
        items,
        totalPrice,
        createdAt,
        updatedAt: createdAt,
        recoveryUrl: `https://example.com/cart/${uuidv4()}`,
      })
    }
  }

  return [...mockCarts]
}

// Get all mock carts
export function getMockCarts(): MockCart[] {
  return [...mockCarts]
}

// Get a specific mock cart by ID
export function getMockCartById(id: string): MockCart | undefined {
  return mockCarts.find((cart) => cart.id === id)
}

// Add a new mock cart
export function addMockCart(cart: Omit<MockCart, "id" | "createdAt" | "updatedAt" | "recoveryUrl">): MockCart {
  const now = new Date().toISOString()
  const newCart: MockCart = {
    id: uuidv4(),
    ...cart,
    createdAt: now,
    updatedAt: now,
    recoveryUrl: `https://example.com/cart/${uuidv4()}`,
  }

  mockCarts.push(newCart)
  return newCart
}

// Delete a mock cart
export function deleteMockCart(id: string): boolean {
  const initialLength = mockCarts.length
  mockCarts = mockCarts.filter((cart) => cart.id !== id)
  return mockCarts.length < initialLength
}
