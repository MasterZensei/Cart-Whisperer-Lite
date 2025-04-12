import { NextResponse } from "next/server"
import { getCartById, deleteCart, convertToMockCart } from "@/lib/db-service"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const cart = await getCartById(id)

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 })
    }

    // Convert to mock cart format for backward compatibility
    const mockCart = convertToMockCart(cart);

    return NextResponse.json({ cart: mockCart })
  } catch (error) {
    console.error(`Error fetching cart ${params.id}:`, error)
    return NextResponse.json(
      { error: "Failed to fetch cart", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const success = await deleteCart(id)

    if (!success) {
      return NextResponse.json({ error: "Cart not found or could not be deleted" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error deleting cart ${params.id}:`, error)
    return NextResponse.json(
      { error: "Failed to delete cart", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
