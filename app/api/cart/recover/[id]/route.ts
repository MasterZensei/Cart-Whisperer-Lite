import { NextResponse } from "next/server"
import { markCartAsRecovered } from "@/lib/db-service"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const success = await markCartAsRecovered(id)

    if (!success) {
      return NextResponse.json(
        { error: "Cart not found or could not be updated" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error marking cart ${params.id} as recovered:`, error)
    return NextResponse.json(
      { error: "Failed to mark cart as recovered", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 