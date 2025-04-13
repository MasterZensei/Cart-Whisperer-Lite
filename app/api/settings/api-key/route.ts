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
    const { key, service } = body
    
    // Validate input
    if (!key || !service) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    if (service !== "openai" && service !== "resend") {
      return NextResponse.json(
        { error: "Invalid service type" },
        { status: 400 }
      )
    }
    
    // For a production application, we would encrypt the API key before storing it
    // Here, we're storing it directly (not recommended for production)
    
    // Save API key to database
    const { error } = await supabase
      .from("api_keys")
      .upsert(
        { 
          user_id: userId, 
          service,
          api_key: key,
          updated_at: new Date().toISOString()
        },
        { onConflict: "user_id,service" }
      )
    
    if (error) {
      console.error("Error saving API key:", error)
      return NextResponse.json(
        { error: "Failed to save API key" },
        { status: 500 }
      )
    }
    
    // If this is OpenAI API key, immediately update the environment variable for this session
    // Note: This approach only works for the current server instance and isn't persisted across restarts
    if (service === "openai") {
      process.env.OPENAI_API_KEY = key
    } else if (service === "resend") {
      process.env.RESEND_API_KEY = key
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in API key endpoint:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 