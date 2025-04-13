import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function PUT(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    
    // Get session to verify user is authenticated
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Get user ID
    const userId = session.user.id
    
    // Check if the template exists and belongs to the user
    const { data: existingTemplate, error: fetchError } = await supabase
      .from("ai_prompt_templates")
      .select("*")
      .eq("id", id)
      .single()
    
    if (fetchError) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      )
    }
    
    if (existingTemplate.user_id !== userId) {
      return NextResponse.json(
        { error: "You don't have permission to modify this template" },
        { status: 403 }
      )
    }
    
    // Don't allow editing default templates
    if (existingTemplate.is_default) {
      return NextResponse.json(
        { error: "Default templates cannot be modified" },
        { status: 403 }
      )
    }
    
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
    
    // Update the template
    const { data: updatedTemplate, error: updateError } = await supabase
      .from("ai_prompt_templates")
      .update({
        name,
        description,
        system_prompt,
        user_prompt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()
    
    if (updateError) {
      console.error("Error updating AI prompt template:", updateError)
      return NextResponse.json(
        { error: "Failed to update template" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      success: true,
      template: updatedTemplate,
    })
  } catch (error) {
    console.error("Error in AI prompts update endpoint:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    
    // Get session to verify user is authenticated
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Get user ID
    const userId = session.user.id
    
    // Check if the template exists and belongs to the user
    const { data: existingTemplate, error: fetchError } = await supabase
      .from("ai_prompt_templates")
      .select("*")
      .eq("id", id)
      .single()
    
    if (fetchError) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      )
    }
    
    if (existingTemplate.user_id !== userId) {
      return NextResponse.json(
        { error: "You don't have permission to delete this template" },
        { status: 403 }
      )
    }
    
    // Don't allow deleting default templates
    if (existingTemplate.is_default) {
      return NextResponse.json(
        { error: "Default templates cannot be deleted" },
        { status: 403 }
      )
    }
    
    // Delete the template
    const { error: deleteError } = await supabase
      .from("ai_prompt_templates")
      .delete()
      .eq("id", id)
    
    if (deleteError) {
      console.error("Error deleting AI prompt template:", deleteError)
      return NextResponse.json(
        { error: "Failed to delete template" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Template deleted successfully",
    })
  } catch (error) {
    console.error("Error in AI prompts delete endpoint:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 