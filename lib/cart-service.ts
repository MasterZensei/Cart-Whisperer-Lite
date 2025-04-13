// This is a mock implementation of the cart service
// Replace with actual implementation when API integrations are ready

// Define types for carts
export interface Customer {
  id: string
  email: string
  firstName?: string
  lastName?: string
}

export interface LineItem {
  id: string
  productId: string
  title: string
  quantity: number
  price: number
  variantTitle?: string
  imageUrl?: string
}

export interface Cart {
  id: string
  storeId: string
  customer?: Customer
  totalPrice: number
  lineItems: LineItem[]
  createdAt: string
  updatedAt: string
  checkoutUrl?: string
}

// Mock data for development purposes
const mockCarts: Cart[] = [
  {
    id: "cart_1",
    storeId: "store_1",
    customer: {
      id: "cust_1",
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe"
    },
    totalPrice: 129.99,
    lineItems: [
      {
        id: "item_1",
        productId: "prod_1",
        title: "Wireless Headphones",
        quantity: 1,
        price: 129.99,
        imageUrl: "https://placehold.co/100x100"
      }
    ],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()  // 1 hour ago
  },
  {
    id: "cart_2",
    storeId: "store_1",
    customer: {
      id: "cust_2",
      email: "jane.smith@example.com",
      firstName: "Jane",
      lastName: "Smith"
    },
    totalPrice: 249.97,
    lineItems: [
      {
        id: "item_2",
        productId: "prod_2",
        title: "Smart Watch",
        quantity: 1,
        price: 199.99,
        imageUrl: "https://placehold.co/100x100"
      },
      {
        id: "item_3",
        productId: "prod_3",
        title: "Watch Band",
        quantity: 1,
        price: 49.98,
        imageUrl: "https://placehold.co/100x100"
      }
    ],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()  // 4 hours ago
  }
];

export async function getAllCarts(): Promise<Cart[]> {
  // In a real implementation, this would fetch from a database or API
  // For now, we're returning mock data
  return mockCarts;
}

export async function getCartById(id: string): Promise<Cart | null> {
  // In a real implementation, this would fetch from a database or API
  return mockCarts.find(cart => cart.id === id) || null;
}

export async function recoverCart(cartId: string, emailTemplate: string): Promise<boolean> {
  // Mock implementation of cart recovery process
  // In a real implementation, this would:
  // 1. Generate and send a recovery email
  // 2. Log the recovery attempt
  // 3. Return success/failure status
  
  console.log(`Attempting to recover cart ${cartId} with template: ${emailTemplate}`);
  return true; // Mock successful recovery
} 