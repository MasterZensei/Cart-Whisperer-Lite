import { NextResponse } from "next/server"

export async function GET() {
  // Check if environment variables are set (don't return the actual values for security)
  const envStatus = {
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: !!process.env.RESEND_FROM_EMAIL,
    HOST: process.env.HOST || null,
  }

  return NextResponse.json({
    status: "ok",
    environment: envStatus,
    timestamp: new Date().toISOString(),
  })
}
