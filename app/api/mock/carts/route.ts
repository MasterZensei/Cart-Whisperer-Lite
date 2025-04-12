import { NextResponse } from "next/server"
import { initializeMockCarts } from "@/lib/mock-data"
import { getAllCarts, createCart, convertToMockCart } from "@/lib/db-service"

export async function GET() {
  try {
    // Get carts from Supabase
    let carts = await getAllCarts();
    
    // If no carts in database, initialize with mock data
    if (carts.length === 0) {
      const mockCarts = initializeMockCarts();
      // Note: In a real implementation, we would import the migrateMockCartsToSupabase function
      // and use it to migrate mock carts to Supabase here.
      // For simplicity, we'll just return the mock carts for now
      return NextResponse.json({ carts: mockCarts })
    }
    
    // Convert to mock cart format for backward compatibility
    const mockCarts = carts.map(cart => convertToMockCart(cart));
    
    return NextResponse.json({ carts: mockCarts })
  } catch (error) {
    console.error("Error fetching carts:", error)
    return NextResponse.json(
      { error: "Failed to fetch carts", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const data = await request.json().catch((error) => {
      console.error("Error parsing request body:", error)
      return null
    })

    if (!data) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    // Validate required fields
    if (!data.customerEmail || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json({ error: "Missing required fields: customerEmail and items" }, { status: 400 })
    }

    // Calculate total price if not provided
    let totalPrice = data.totalPrice
    if (!totalPrice) {
      totalPrice = data.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    }

    // Create cart in Supabase
    const newCart = await createCart({
      customer_email: data.customerEmail,
      customer_name: data.customerName,
      items: data.items.map((item: any) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      total_price: totalPrice,
      recovery_url: `https://example.com/cart/${data.id || 'recover'}`,
      store_id: 'demo-store',
    });
    
    // Convert to mock cart format for backward compatibility
    const mockCart = convertToMockCart(newCart);

    return NextResponse.json({ cart: mockCart })
  } catch (error) {
    console.error("Error creating cart:", error)
    return NextResponse.json(
      { error: "Failed to create cart", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
