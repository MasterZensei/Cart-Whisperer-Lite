import { Resend } from "resend"

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  from?: string
  replyTo?: string
  trackingId?: string
}

export async function sendRecoveryEmail({
  to,
  subject,
  html,
  from = process.env.RESEND_FROM_EMAIL,
  replyTo,
  trackingId,
}: SendEmailOptions) {
  try {
    // Validate required environment variables
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is not set")
    }

    if (!process.env.RESEND_FROM_EMAIL && !from) {
      throw new Error("RESEND_FROM_EMAIL environment variable is not set and no from address provided")
    }

    // Add tracking pixel if trackingId is provided
    let emailHtml = html
    if (trackingId && process.env.HOST) {
      const trackingPixel = `<img src="${process.env.HOST}/api/track/open/${trackingId}" width="1" height="1" alt="" style="display:none;" />`
      emailHtml = `${html}${trackingPixel}`
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: from || "Cart Whisperer <onboarding@resend.dev>",
      to: [to],
      subject,
      html: emailHtml,
      reply_to: replyTo,
    })

    if (error) {
      console.error("Resend API error:", error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    return { id: data?.id }
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}

// Function to add tracking to links in the email
export function addTrackingToLinks(html: string, trackingId: string, baseUrl: string) {
  try {
    // This is a simplified implementation - in production, you'd want to use a proper HTML parser
    return html.replace(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/gi, (match, quote, url) => {
      const trackingUrl = `${baseUrl}/api/track/click/${trackingId}?url=${encodeURIComponent(url)}`
      return `<a href=${quote}${trackingUrl}${quote}`
    })
  } catch (error) {
    console.error("Error adding tracking to links:", error)
    // Return the original HTML if there's an error
    return html
  }
}
