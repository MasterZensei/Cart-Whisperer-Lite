import { NextResponse } from "next/server"
import { sendRecoveryEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json().catch((error) => {
      console.error("Error parsing request body:", error)
      return null
    })

    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 })
    }

    // Validate environment variables
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "RESEND_API_KEY environment variable is not set" }, { status: 500 })
    }

    if (!process.env.RESEND_FROM_EMAIL) {
      return NextResponse.json({ error: "RESEND_FROM_EMAIL environment variable is not set" }, { status: 500 })
    }

    try {
      await sendRecoveryEmail({
        to: email,
        subject: "Test Email from Cart Whisperer",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4f46e5;">Cart Whisperer Test Email</h1>
            <p>This is a test email from your Cart Whisperer app.</p>
            <p>Your email sending functionality is working correctly!</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 5px;">
              <p style="margin: 0;">If you received this email, your Resend integration is working properly.</p>
            </div>
          </div>
        `,
      })

      return NextResponse.json({ success: true })
    } catch (emailError) {
      console.error("Error sending test email:", emailError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send test email",
          details: emailError instanceof Error ? emailError.message : String(emailError),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Unhandled error in test-email API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
