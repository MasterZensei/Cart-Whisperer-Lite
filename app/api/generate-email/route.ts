import { NextResponse } from "next/server"
import { OpenAI } from "openai"
import { v4 as uuidv4 } from "uuid"
import { sendRecoveryEmail } from "@/lib/email"
import { recordEmailSent } from "@/lib/analytics"
import { addTrackingToLinks } from "@/lib/email"
import { generateStandardTemplate, generateDiscountTemplate, generateFomoTemplate } from "@/lib/fallback-templates"
import { getEmailTemplates } from "@/lib/db-service"
import { getUserAISettings, getPromptTemplate } from "@/lib/ai-service"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  console.log("Generate email API called")

  try {
    // Parse the incoming request body
    const body = await request.json()

    // Extract data from request
    const { customer, cart, store, sendEmail = false, templateType = 'ai', promptId = null } = body

    // Validate required data
    if (!customer || !customer.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing customer information",
        },
        { status: 400 },
      )
    }

    if (!cart || !cart.items || !Array.isArray(cart.items) || cart.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing or invalid cart information",
        },
        { status: 400 },
      )
    }

    // Count total items in cart
    const totalItems = cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0)

    // Generate a unique tracking ID for this email
    const trackingId = uuidv4()

    // Format items list for the prompt
    const itemsList = cart.items
      .map(
        (item: any) =>
          `${item.quantity}x ${item.title} - ${typeof item.price === "number" ? item.price.toFixed(2) : item.price}`,
      )
      .join("\n")

    // First, check if a specific template was requested
    if (templateType !== 'ai') {
      let emailContent = '';
      let subject = '';
      
      const templateData = {
        customerName: customer.name || "Valued Customer",
        customerEmail: customer.email,
        items: cart.items,
        totalPrice: cart.total,
        recoveryUrl: cart.recoveryUrl,
        storeName: store?.name || "Your Store"
      };
      
      // Use the requested template type
      if (templateType === 'standard') {
        const template = generateStandardTemplate(templateData);
        emailContent = template.html;
        subject = template.subject;
      } else if (templateType === 'discount') {
        const template = generateDiscountTemplate(templateData);
        emailContent = template.html;
        subject = template.subject;
      } else if (templateType === 'fomo') {
        const template = generateFomoTemplate(templateData);
        emailContent = template.html;
        subject = template.subject;
      } else {
        // Try to get custom template from Supabase
        try {
          const templates = await getEmailTemplates(store?.id || 'demo-store');
          const customTemplate = templates.find(t => t.id === templateType);
          
          if (customTemplate) {
            // Replace placeholders in the custom template
            let html = customTemplate.html_content
              .replace(/\{customerName\}/g, customer.name || "Valued Customer")
              .replace(/\{customerEmail\}/g, customer.email)
              .replace(/\{totalPrice\}/g, typeof cart.total === "number" ? cart.total.toFixed(2) : cart.total)
              .replace(/\{recoveryUrl\}/g, cart.recoveryUrl)
              .replace(/\{storeName\}/g, store?.name || "Your Store");
              
            // Replace items placeholder with formatted items
            html = html.replace(/\{items\}/g, formatItems(cart.items));
            
            emailContent = html;
            subject = customTemplate.subject
              .replace(/\{customerName\}/g, customer.name || "Valued Customer")
              .replace(/\{storeName\}/g, store?.name || "Your Store");
          } else {
            // Fall back to standard template if custom template not found
            const fallback = generateStandardTemplate(templateData);
            emailContent = fallback.html;
            subject = fallback.subject;
          }
        } catch (error) {
          console.error("Error getting custom template:", error);
          const fallback = generateStandardTemplate(templateData);
          emailContent = fallback.html;
          subject = fallback.subject;
        }
      }
      
      // If sendEmail is true, send the email
      if (sendEmail) {
        console.log("Sending email to:", customer.email)

        try {
          // Add tracking to links
          const emailWithTracking = addTrackingToLinks(
            emailContent,
            trackingId,
            process.env.HOST || "http://localhost:3000",
          )

          // Send the email
          await sendRecoveryEmail({
            to: customer.email,
            subject,
            html: emailWithTracking,
            trackingId,
          })

          console.log("Email sent successfully")

          // Record the email in analytics
          await recordEmailSent(trackingId, cart.id, customer.email, store?.id || "demo-store")
        } catch (emailError: any) {
          console.error("Error sending email:", emailError)
          return NextResponse.json(
            {
              success: false,
              error: "Failed to send email",
              details: emailError.message || String(emailError),
            },
            { status: 500 },
          )
        }
      }

      console.log("Returning successful response with template email")

      return NextResponse.json({
        success: true,
        emailContent,
        subject,
        trackingId,
        templateType,
      })
    }

    console.log("Initializing OpenAI client")
    
    // Get user ID for fetching custom settings and prompts
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id || 'anonymous'
    
    try {
      // Get user's AI settings
      const aiSettings = await getUserAISettings(userId);
      
      // Initialize OpenAI client
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
      
      // Get system and user prompts
      let systemPrompt, userPrompt;
      
      if (promptId) {
        // If a specific prompt template was requested, use it
        const promptTemplate = await getPromptTemplate(promptId);
        if (promptTemplate) {
          systemPrompt = promptTemplate.system_prompt;
          userPrompt = promptTemplate.user_prompt;
        } else {
          // Fall back to default if the requested template isn't found
          systemPrompt = `You are an expert email marketer specializing in abandoned cart recovery with a proven track record of high conversion rates. 
          
          Create a personalized, compelling email to encourage the customer to complete their purchase. The email should be:
          
          1. Personalized to the customer and their specific cart items
          2. Concise and focused on conversion
          3. Including a sense of urgency without being pushy
          4. Highlighting the benefits of the products they've selected
          5. Formatted as clean, responsive HTML with inline CSS
          6. Including a prominent, compelling call-to-action button
          
          Return your response as HTML that can be directly used in an email. Include a subject line at the beginning of your response prefixed with 'SUBJECT: '.
          
          The subject line should be attention-grabbing and personalized.`;
          
          userPrompt = `Generate a recovery email for a customer with these details:
            
          CUSTOMER INFORMATION:
          - Name: {{customerName}}
          - Email: {{customerEmail}}
          
          CART DETAILS:
          - Total Items: {{totalItems}}
          - Total Value: {{cartTotal}}
          - Items in Cart:
          {{itemsList}}
          
          STORE INFORMATION:
          - Store Name: {{storeName}}
          - Recovery URL: {{recoveryUrl}}
          
          ADDITIONAL CONTEXT:
          - Make the email mobile-friendly
          - Include a prominent "Complete Your Purchase" button linking to the recovery URL
          - Keep the tone friendly and helpful, not pushy
          - Suggest that their items might sell out soon if appropriate
          - Include a small section addressing potential concerns (like shipping, returns, etc.)`;
        }
      } else {
        // Use default prompts
        systemPrompt = `You are an expert email marketer specializing in abandoned cart recovery with a proven track record of high conversion rates. 
        
        Create a personalized, compelling email to encourage the customer to complete their purchase. The email should be:
        
        1. Personalized to the customer and their specific cart items
        2. Concise and focused on conversion
        3. Including a sense of urgency without being pushy
        4. Highlighting the benefits of the products they've selected
        5. Formatted as clean, responsive HTML with inline CSS
        6. Including a prominent, compelling call-to-action button
        
        Return your response as HTML that can be directly used in an email. Include a subject line at the beginning of your response prefixed with 'SUBJECT: '.
        
        The subject line should be attention-grabbing and personalized.`;
        
        userPrompt = `Generate a recovery email for a customer with these details:
          
        CUSTOMER INFORMATION:
        - Name: {{customerName}}
        - Email: {{customerEmail}}
        
        CART DETAILS:
        - Total Items: {{totalItems}}
        - Total Value: {{cartTotal}}
        - Items in Cart:
        {{itemsList}}
        
        STORE INFORMATION:
        - Store Name: {{storeName}}
        - Recovery URL: {{recoveryUrl}}
        
        ADDITIONAL CONTEXT:
        - Make the email mobile-friendly
        - Include a prominent "Complete Your Purchase" button linking to the recovery URL
        - Keep the tone friendly and helpful, not pushy
        - Suggest that their items might sell out soon if appropriate
        - Include a small section addressing potential concerns (like shipping, returns, etc.)`;
      }
      
      // Replace placeholders in the user prompt with actual values
      userPrompt = userPrompt
        .replace(/{{customerName}}/g, customer.name || "Valued Customer")
        .replace(/{{customerEmail}}/g, customer.email)
        .replace(/{{totalItems}}/g, totalItems.toString())
        .replace(/{{cartTotal}}/g, typeof cart.total === "number" ? cart.total.toFixed(2) : cart.total)
        .replace(/{{itemsList}}/g, itemsList)
        .replace(/{{storeName}}/g, store?.name || "Our Store")
        .replace(/{{recoveryUrl}}/g, cart.recoveryUrl || "https://example.com/cart");

      console.log(`Calling OpenAI API with model: ${aiSettings.model}`)

      try {
        // Generate personalized email content using OpenAI with user's settings
        const completion = await openai.chat.completions.create({
          model: aiSettings.model,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
          temperature: aiSettings.temperature,
          max_tokens: aiSettings.maxTokens,
        })

        console.log("OpenAI API response received successfully")

        const fullResponse = completion.choices[0].message.content || ""

        // Extract subject line and HTML content
        const subjectMatch = fullResponse.match(/SUBJECT:\s*(.*?)(?:\n|$)/)
        const subject = subjectMatch ? subjectMatch[1].trim() : "Complete your purchase"

        // Remove the subject line from the content
        const emailContent = fullResponse.replace(/SUBJECT:\s*(.*?)(?:\n|$)/, "").trim()

        // If sendEmail is true, send the email
        if (sendEmail) {
          console.log("Sending email to:", customer.email)

          try {
            // Add tracking to links
            const emailWithTracking = addTrackingToLinks(
              emailContent,
              trackingId,
              process.env.HOST || "http://localhost:3000",
            )

            // Send the email
            await sendRecoveryEmail({
              to: customer.email,
              subject,
              html: emailWithTracking,
              trackingId,
            })

            console.log("Email sent successfully")

            // Record the email in analytics
            await recordEmailSent(trackingId, cart.id, customer.email, store?.id || "demo-store")
          } catch (emailError: any) {
            console.error("Error sending email:", emailError)
            return NextResponse.json(
              {
                success: false,
                error: "Failed to send email",
                details: emailError.message || String(emailError),
              },
              { status: 500 },
            )
          }
        }

        console.log("Returning successful response")

        return NextResponse.json({
          success: true,
          emailContent,
          subject,
          trackingId,
        })
      } catch (openaiError: any) {
        console.error("OpenAI API error:", openaiError)
        
        // Fall back to standard template if OpenAI fails
        console.log("Falling back to standard template")
        
        const templateData = {
          customerName: customer.name || "Valued Customer",
          customerEmail: customer.email,
          items: cart.items,
          totalPrice: cart.total,
          recoveryUrl: cart.recoveryUrl,
          storeName: store?.name || "Your Store"
        };
        
        const fallbackTemplate = generateStandardTemplate(templateData);
        const emailContent = fallbackTemplate.html;
        const subject = fallbackTemplate.subject;
        
        // If sendEmail is true, send the email
        if (sendEmail) {
          console.log("Sending fallback email to:", customer.email)

          try {
            // Add tracking to links
            const emailWithTracking = addTrackingToLinks(
              emailContent,
              trackingId,
              process.env.HOST || "http://localhost:3000",
            )

            // Send the email
            await sendRecoveryEmail({
              to: customer.email,
              subject,
              html: emailWithTracking,
              trackingId,
            })

            console.log("Fallback email sent successfully")

            // Record the email in analytics
            await recordEmailSent(trackingId, cart.id, customer.email, store?.id || "demo-store")
          } catch (emailError: any) {
            console.error("Error sending fallback email:", emailError)
            return NextResponse.json(
              {
                success: false,
                error: "Failed to send fallback email",
                details: emailError.message || String(emailError),
              },
              { status: 500 },
            )
          }
        }

        console.log("Returning successful response with fallback email")

        return NextResponse.json({
          success: true,
          emailContent,
          subject,
          trackingId,
          fallback: true,
        })
      }
    } catch (error: any) {
      console.error("Error generating email:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate email",
          details: error.message || String(error),
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred",
        details: error.message || String(error),
      },
      { status: 500 },
    )
  }
}

// Helper function to format items for custom templates
function formatItems(items: any[]): string {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
            <div style="display: flex; align-items: center;">
              ${
                item.image
                  ? `<img src="${item.image}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover; margin-right: 15px;" />`
                  : ""
              }
              <div>
                <p style="margin: 0; font-weight: 500;">${item.title}</p>
                <p style="margin: 5px 0 0; color: #6b7280;">Quantity: ${item.quantity}</p>
              </div>
            </div>
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 500;">
            $${(item.price * item.quantity).toFixed(2)}
          </td>
        </tr>
      `
    )
    .join("")
}
