import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    // Get session to verify user is authenticated
    const supabase = createRouteHandlerClient({ cookies: () => cookies() })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Get user ID
    const userId = session.user.id
    
    // Get the user's templates as well as default templates
    const { data: templates, error } = await supabase
      .from("ai_prompt_templates")
      .select("*")
      .or(`user_id.eq.${userId},is_default.eq.true`)
      .order("created_at", { ascending: false })
    
    if (error) {
      console.error("Error fetching AI prompt templates:", error)
      return NextResponse.json(
        { error: "Failed to fetch templates" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ templates: templates || [] })
  } catch (error) {
    console.error("Error in AI prompts endpoint:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Get session to verify user is authenticated
    const supabase = createRouteHandlerClient({ cookies: () => cookies() })
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
    const { name, description, system_prompt, user_prompt } = body
    
    // Validate required fields
    if (!name || !system_prompt || !user_prompt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    // Create new template
    const { data: template, error } = await supabase
      .from("ai_prompt_templates")
      .insert({
        user_id: userId,
        name,
        description,
        system_prompt,
        user_prompt,
        is_default: false
      })
      .select()
      .single()
    
    if (error) {
      console.error("Error creating AI prompt template:", error)
      return NextResponse.json(
        { error: "Failed to create template" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      success: true,
      template,
    })
  } catch (error) {
    console.error("Error in AI prompts endpoint:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 