import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Return basic environment info without revealing sensitive values
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      OPENAI_API_KEY_SET: !!process.env.OPENAI_API_KEY,
      RESEND_API_KEY_SET: !!process.env.RESEND_API_KEY,
      RESEND_FROM_EMAIL_SET: !!process.env.RESEND_FROM_EMAIL,
      HOST_SET: !!process.env.HOST,
    }

    return NextResponse.json({
      success: true,
      message: "API is working correctly",
      timestamp: new Date().toISOString(),
      environment: envInfo,
    })
  } catch (error: any) {
    console.error("Error in test endpoint:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Test endpoint error",
        details: error.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
