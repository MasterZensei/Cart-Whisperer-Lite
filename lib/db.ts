// This is a simplified example - in production, use a real database
// like MongoDB, PostgreSQL, or a serverless option like Supabase or PlanetScale

interface ShopData {
  shop: string
  accessToken: string
  installedAt: Date
}

// In-memory store for demonstration
const shops: Record<string, ShopData> = {}

export async function storeShopData(shop: string, accessToken: string): Promise<void> {
  shops[shop] = {
    shop,
    accessToken,
    installedAt: new Date(),
  }
}

export async function getShopData(shop: string): Promise<ShopData | null> {
  return shops[shop] || null
}

export async function getAllShops(): Promise<ShopData[]> {
  return Object.values(shops)
}
