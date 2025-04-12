import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function GET() {
  console.log("OpenAI debug endpoint called")

  // Check if API key is set
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set")
    return NextResponse.json(
      {
        success: false,
        error: "OpenAI API key is not configured",
        details: "The OPENAI_API_KEY environment variable is missing or empty",
      },
      { status: 500 },
    )
  }

  console.log("Initializing OpenAI client")

  try {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    console.log("Making test request to OpenAI API")

    try {
      // Test the OpenAI connection with a simple request
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
          {
            role: "user",
            content: "Say hello!",
          },
        ],
        max_tokens: 50,
      })

      console.log("OpenAI API response received:", completion.choices[0].message)

      return NextResponse.json({
        success: true,
        message: "OpenAI API is working correctly",
        response: completion.choices[0].message.content,
        model: "gpt-3.5-turbo",
      })
    } catch (apiError: any) {
      console.error("OpenAI API request error:", apiError)

      // Check for specific OpenAI error types
      if (apiError.status === 401) {
        return NextResponse.json(
          {
            success: false,
            error: "Authentication error",
            details: "Invalid API key or unauthorized access",
            statusCode: apiError.status,
            message: apiError.message,
          },
          { status: 401 },
        )
      }

      if (apiError.status === 429) {
        return NextResponse.json(
          {
            success: false,
            error: "Rate limit exceeded",
            details: "Too many requests to the OpenAI API in a short period",
            statusCode: apiError.status,
            message: apiError.message,
          },
          { status: 429 },
        )
      }

      if (apiError.status === 404) {
        return NextResponse.json(
          {
            success: false,
            error: "Model not found",
            details: "The requested model 'gpt-3.5-turbo' was not found or is not available with your API key",
            statusCode: apiError.status,
            message: apiError.message,
          },
          { status: 404 },
        )
      }

      // Generic API error
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI API error",
          details: apiError.message || "Unknown OpenAI API error",
          statusCode: apiError.status || 500,
          stack: process.env.NODE_ENV === "development" ? apiError.stack : undefined,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error initializing OpenAI client:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize OpenAI client",
        details: error.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
