import { CartItem } from "./supabase";

interface TemplateData {
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  totalPrice: number;
  recoveryUrl: string;
  storeName: string;
}

// Format the items as HTML for the templates
function formatItems(items: CartItem[]): string {
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
    .join("");
}

// Standard template for abandoned cart recovery
export function generateStandardTemplate(data: TemplateData): { subject: string; html: string } {
  const { customerName, items, totalPrice, recoveryUrl, storeName } = data;
  
  const subject = `Complete your purchase from ${storeName}`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Complete Your Purchase</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: collapse;">
        <tr>
          <td>
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #111827; font-size: 24px; margin-bottom: 10px;">Don't Miss Out On Your Items</h1>
              <p style="color: #6b7280; font-size: 16px;">We noticed you left some items in your cart.</p>
            </div>
            
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
              <h2 style="color: #111827; font-size: 18px; margin-top: 0; margin-bottom: 15px;">Your Cart Summary</h2>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="text-align: left; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-weight: normal;">Product</th>
                    <th style="text-align: right; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-weight: normal;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${formatItems(items)}
                </tbody>
                <tfoot>
                  <tr>
                    <td style="padding-top: 15px; font-weight: 600; text-align: right;">Total:</td>
                    <td style="padding-top: 15px; font-weight: 600; text-align: right;">$${totalPrice.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <p style="margin-bottom: 20px; font-size: 16px;">Ready to complete your purchase, ${customerName || "there"}?</p>
              <a href="${recoveryUrl}" style="display: inline-block; background-color: #4f46e5; color: white; font-weight: 500; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px;">Complete My Purchase</a>
            </div>
            
            <div style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p>If you have any questions about your order, please contact our customer support.</p>
              <p>© ${new Date().getFullYear()} ${storeName}. All rights reserved.</p>
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  
  return { subject, html };
}

// Discount offer template for abandoned cart recovery
export function generateDiscountTemplate(data: TemplateData, discountCode = "COMEBACK15", discountPercent = "15%"): { subject: string; html: string } {
  const { customerName, items, totalPrice, recoveryUrl, storeName } = data;
  
  const subject = `${discountPercent} OFF your cart - Limited time offer!`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Special Discount Offer</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: collapse;">
        <tr>
          <td>
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #111827; font-size: 24px; margin-bottom: 10px;">Special Offer Just For You!</h1>
              <p style="color: #6b7280; font-size: 16px;">We'd love to give you ${discountPercent} off your purchase.</p>
            </div>
            
            <div style="background-color: #fef2f2; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: center;">
              <h2 style="color: #991b1b; font-size: 22px; margin-top: 0; margin-bottom: 5px;">SAVE ${discountPercent}</h2>
              <p style="font-size: 18px; margin-top: 0; margin-bottom: 15px;">Use code: <strong>${discountCode}</strong></p>
              <p style="color: #6b7280; font-size: 14px; margin: 0;">Offer expires in 24 hours</p>
            </div>
            
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
              <h2 style="color: #111827; font-size: 18px; margin-top: 0; margin-bottom: 15px;">Your Cart Summary</h2>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="text-align: left; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-weight: normal;">Product</th>
                    <th style="text-align: right; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-weight: normal;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${formatItems(items)}
                </tbody>
                <tfoot>
                  <tr>
                    <td style="padding-top: 15px; font-weight: 600; text-align: right;">Total:</td>
                    <td style="padding-top: 15px; font-weight: 600; text-align: right;">$${totalPrice.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding-top: 5px; font-weight: 600; text-align: right; color: #991b1b;">With Discount:</td>
                    <td style="padding-top: 5px; font-weight: 600; text-align: right; color: #991b1b;">$${(totalPrice * (1 - parseInt(discountPercent) / 100)).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <p style="margin-bottom: 20px; font-size: 16px;">Don't miss out on this special offer, ${customerName || "there"}!</p>
              <a href="${recoveryUrl}" style="display: inline-block; background-color: #dc2626; color: white; font-weight: 500; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px;">Claim My Discount</a>
            </div>
            
            <div style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p>This offer is valid for 24 hours and applies to your current cart items only.</p>
              <p>© ${new Date().getFullYear()} ${storeName}. All rights reserved.</p>
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  
  return { subject, html };
}

// FOMO (Fear of Missing Out) template for abandoned cart recovery
export function generateFomoTemplate(data: TemplateData): { subject: string; html: string } {
  const { customerName, items, totalPrice, recoveryUrl, storeName } = data;
  
  const subject = `Your items are selling fast!`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Items Selling Fast</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: collapse;">
        <tr>
          <td>
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #111827; font-size: 24px; margin-bottom: 10px;">Your Cart Items Are In High Demand!</h1>
              <p style="color: #6b7280; font-size: 16px;">We can't guarantee availability for much longer.</p>
            </div>
            
            <div style="background-color: #fff7ed; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: center;">
              <h2 style="color: #9a3412; font-size: 20px; margin-top: 0; margin-bottom: 10px;">⚠️ Limited Stock Alert</h2>
              <p style="color: #6b7280; font-size: 16px; margin: 0;">Other customers are eyeing the items in your cart.</p>
            </div>
            
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
              <h2 style="color: #111827; font-size: 18px; margin-top: 0; margin-bottom: 15px;">Items Reserved In Your Cart</h2>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="text-align: left; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-weight: normal;">Product</th>
                    <th style="text-align: right; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-weight: normal;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${formatItems(items)}
                </tbody>
                <tfoot>
                  <tr>
                    <td style="padding-top: 15px; font-weight: 600; text-align: right;">Total:</td>
                    <td style="padding-top: 15px; font-weight: 600; text-align: right;">$${totalPrice.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <p style="margin-bottom: 20px; font-size: 16px;">Secure your items now, ${customerName || "there"}, before someone else does!</p>
              <a href="${recoveryUrl}" style="display: inline-block; background-color: #ea580c; color: white; font-weight: 500; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px;">Complete My Purchase Now</a>
            </div>
            
            <div style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p>We're holding these items for you, but we can only guarantee availability for a limited time.</p>
              <p>© ${new Date().getFullYear()} ${storeName}. All rights reserved.</p>
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  
  return { subject, html };
} 