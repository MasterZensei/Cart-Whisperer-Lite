import { NextRequest, NextResponse } from 'next/server';
import { ShopifyAbandonedCheckout, shopifyCheckoutToCart } from '@/lib/shopify-types';
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

// Mock function to simulate AI email generation
async function generateEmailContent(data: any): Promise<{ subject: string; emailContent: string }> {
  // In a real app, this would call OpenAI or another AI service
  
  const customerName = data.customer.name || 'Valued Customer';
  const storeName = data.store.name || 'Our Store';
  const cartItems = data.cart.items.map((item: any) => `${item.quantity}x ${item.title}`).join(', ');
  const totalPrice = typeof data.cart.total === 'number' 
    ? `$${data.cart.total.toFixed(2)}` 
    : data.cart.total;
  const recoveryUrl = data.cart.recoveryUrl;
  
  // Generate a simple email template
  const subject = `Complete your purchase from ${storeName}`;
  
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${customerName},</h2>
      
      <p>We noticed you left some items in your shopping cart at ${storeName}.</p>
      
      <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Your Cart</h3>
        <p><strong>Items:</strong> ${cartItems}</p>
        <p><strong>Total:</strong> ${totalPrice}</p>
      </div>
      
      <p>Would you like to complete your purchase? We're holding these items for you, but they might not be available for long.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${recoveryUrl}" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">Complete Your Purchase</a>
      </div>
      
      <p>If you have any questions or need assistance with your order, please don't hesitate to contact our customer support team.</p>
      
      <p>Best regards,<br>The ${storeName} Team</p>
    </div>
  `;
  
  return { subject, emailContent };
}

// Mock function to simulate sending an email
async function sendEmail(data: any): Promise<boolean> {
  // In a real app, this would connect to an email service like SendGrid, Mailchimp, etc.
  console.log(`[Mock] Sending email to: ${data.customer.email}`);
  
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Always succeed in mock implementation
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate input data
    if (!data.customer || !data.customer.email || !data.cart) {
      return NextResponse.json(
        { error: 'Missing required fields: customer.email and cart' },
        { status: 400 }
      );
    }
    
    // Handle Shopify data format if provided
    if (data.shopifyCheckout) {
      const shopifyData = data.shopifyCheckout as ShopifyAbandonedCheckout;
      // Convert to our internal format
      const cart = shopifyCheckoutToCart(shopifyData);
      
      // Update the data object with our internal format
      data.customer = {
        email: cart.customerEmail,
        name: cart.customerName || 'Customer'
      };
      
      data.cart = {
        items: cart.items,
        total: cart.totalPrice,
        recoveryUrl: cart.recoveryUrl,
        id: cart.id
      };
    }
    
    // Generate email content
    const { subject, emailContent } = await generateEmailContent(data);
    
    // Send the email if requested
    if (data.sendEmail) {
      const success = await sendEmail({
        customer: data.customer,
        subject,
        emailContent
      });
      
      if (!success) {
        throw new Error('Failed to send email');
      }
      
      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
        subject,
        emailContent
      });
    }
    
    // Otherwise just return the generated content
    return NextResponse.json({
      subject,
      emailContent
    });
    
  } catch (error) {
    console.error('Error in POST /api/generate-email:', error);
    return NextResponse.json(
      { error: 'Failed to generate or send email', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
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
