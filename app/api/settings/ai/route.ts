import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    // Get session to verify user is authenticated
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Get user ID
    const userId = session.user.id
    
    // Parse request body
    const body = await request.json()
    const { model, temperature, maxTokens } = body
    
    // Validate input
    if (!model || temperature === undefined || maxTokens === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    // Save settings to database
    const { error } = await supabase
      .from("ai_settings")
      .upsert(
        { 
          user_id: userId, 
          model, 
          temperature, 
          max_tokens: maxTokens,
          updated_at: new Date().toISOString()
        },
        { onConflict: "user_id" }
      )
    
    if (error) {
      console.error("Error saving AI settings:", error)
      return NextResponse.json(
        { error: "Failed to save settings" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in AI settings endpoint:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 