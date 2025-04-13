import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createMockShopifyCheckout, shopifyCheckoutToCart } from '@/lib/shopify-types';

// In-memory store for mocked abandoned carts - exported so it can be modified by other endpoints
export let mockCarts: any[] = [];

export async function GET(request: NextRequest) {
  try {
    // If no carts exist yet, create some sample data
    if (mockCarts.length === 0) {
      const sampleEmails = [
        'john.doe@example.com',
        'sarah.smith@example.com',
        'alex.johnson@example.com',
        'maria.garcia@example.com'
      ];
      
      // Create sample Shopify abandoned checkouts
      for (const email of sampleEmails) {
        const cartId = uuidv4();
        const mockCheckout = createMockShopifyCheckout(cartId, email);
        
        // Add to our mock store using our internal format
        mockCarts.push(shopifyCheckoutToCart(mockCheckout));
      }
    }
    
    return NextResponse.json({ carts: mockCarts });
  } catch (error) {
    console.error('Error in GET /api/mock/carts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch abandoned carts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.customerEmail || !data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: customerEmail and at least one item' },
        { status: 400 }
      );
    }
    
    // Create a new cart with a unique ID
    const now = new Date().toISOString();
    const newCart = {
      id: uuidv4(),
      customerEmail: data.customerEmail,
      customerName: data.customerName || null,
      items: data.items.map((item: any) => ({
        id: uuidv4(),
        title: item.title,
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1,
        image: item.image
      })),
      totalPrice: data.totalPrice || data.items.reduce(
        (sum: number, item: any) => sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1),
        0
      ),
      createdAt: now,
      updatedAt: now,
      recoveryUrl: `https://yourstore.myshopify.com/checkouts/${uuidv4()}/recover`
    };
    
    // Add to mock store
    mockCarts.push(newCart);
    
    return NextResponse.json({
      success: true,
      cart: newCart
    });
  } catch (error) {
    console.error('Error in POST /api/mock/carts:', error);
    return NextResponse.json(
      { error: 'Failed to create abandoned cart' },
      { status: 500 }
    );
  }
}
