import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const shop = searchParams.get("shop")

  if (!shop) {
    return NextResponse.json({ error: "Missing shop parameter" }, { status: 400 })
  }

  // Generate a random nonce for security
  const nonce = Math.random().toString(36).substring(2, 15)

  // Define the required scopes for your app
  const scopes = "read_products,read_customers,read_orders,read_checkouts"

  // Construct the authorization URL
  const redirectUri = `${process.env.HOST}/api/auth/callback`
  const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${scopes}&redirect_uri=${redirectUri}&state=${nonce}`

  return NextResponse.redirect(authUrl)
}
