/**
 * Shopify API Type Definitions
 * 
 * This file contains type definitions that match Shopify's API structure,
 * ensuring our application will be compatible when we integrate with Shopify.
 */

// Shopify Customer
export interface ShopifyCustomer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  default_address?: {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
  };
  orders_count: number;
  total_spent: string;
  tags: string[];
  last_order_id?: string;
  created_at: string;
  updated_at: string;
}

// Shopify Product Variant
export interface ShopifyProductVariant {
  id: string;
  product_id: string;
  title: string;
  price: string;
  sku: string;
  position: number;
  inventory_policy: string;
  compare_at_price: string | null;
  fulfillment_service: string;
  inventory_management: string | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  created_at: string;
  updated_at: string;
  taxable: boolean;
  barcode: string | null;
  grams: number;
  image_id: string | null;
  weight: number;
  weight_unit: string;
  inventory_item_id: string;
  inventory_quantity: number;
  old_inventory_quantity: number;
}

// Shopify Product
export interface ShopifyProduct {
  id: string;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  created_at: string;
  handle: string;
  updated_at: string;
  published_at: string;
  template_suffix: string | null;
  status: 'active' | 'archived' | 'draft';
  published_scope: string;
  tags: string;
  admin_graphql_api_id: string;
  variants: ShopifyProductVariant[];
  options: {
    id: string;
    product_id: string;
    name: string;
    position: number;
    values: string[];
  }[];
  images: {
    id: string;
    product_id: string;
    position: number;
    created_at: string;
    updated_at: string;
    alt: string | null;
    width: number;
    height: number;
    src: string;
    variant_ids: string[];
  }[];
  image: {
    id: string;
    product_id: string;
    position: number;
    created_at: string;
    updated_at: string;
    alt: string | null;
    width: number;
    height: number;
    src: string;
    variant_ids: string[];
  };
}

// Shopify Cart (Checkout) Line Item
export interface ShopifyLineItem {
  id: string;
  variant_id: string;
  title: string;
  quantity: number;
  sku: string;
  variant_title: string;
  vendor: string;
  product_id: string;
  requires_shipping: boolean;
  taxable: boolean;
  gift_card: boolean;
  name: string;
  variant_inventory_management: string;
  properties: { name: string; value: string }[];
  product_exists: boolean;
  fulfillable_quantity: number;
  grams: number;
  price: string;
  total_discount: string;
  fulfillment_status: string | null;
  price_set: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  total_discount_set: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  discount_allocations: {
    amount: string;
    discount_application_index: number;
    amount_set: {
      shop_money: { amount: string; currency_code: string };
      presentment_money: { amount: string; currency_code: string };
    };
  }[];
  applied_discounts?: {
    title: string;
    description: string | null;
    value: string;
    value_type: 'fixed_amount' | 'percentage';
    amount: string;
  }[];
  tax_lines: {
    title: string;
    price: string;
    rate: number;
    price_set: {
      shop_money: { amount: string; currency_code: string };
      presentment_money: { amount: string; currency_code: string };
    };
  }[];
}

// Shopify Abandoned Checkout
export interface ShopifyAbandonedCheckout {
  id: string;
  token: string;
  cart_token: string;
  email: string;
  gateway: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  closed_at: string | null;
  landing_site: string;
  status: string;
  source_url: string | null;
  customer_locale: string;
  line_items: ShopifyLineItem[];
  name: string;
  note: string | null;
  note_attributes: { name: string; value: string }[];
  abandoned_checkout_url: string;
  discount_codes: {
    code: string;
    amount: string;
    type: 'percentage' | 'fixed_amount' | 'shipping';
  }[];
  tax_lines: {
    price: string;
    rate: number;
    title: string;
  }[];
  source_name: string;
  presentment_currency: string;
  buyer_accepts_marketing: boolean;
  reference: string;
  location_id: string | null;
  device_id: string | null;
  phone: string | null;
  customer_id: string | null;
  customer: ShopifyCustomer | null;
  shop_id: string;
  shipping_lines: {
    code: string;
    price: string;
    title: string;
    source: string;
    phone: string | null;
    tax_lines: {
      price: string;
      rate: number;
      title: string;
    }[];
  }[];
  shipping_address: {
    first_name: string;
    address1: string;
    phone: string;
    city: string;
    zip: string;
    province: string;
    country: string;
    last_name: string;
    address2: string | null;
    company: string | null;
    name: string;
    country_code: string;
    province_code: string;
  } | null;
  billing_address: {
    first_name: string;
    address1: string;
    phone: string;
    city: string;
    zip: string;
    province: string;
    country: string;
    last_name: string;
    address2: string | null;
    company: string | null;
    name: string;
    country_code: string;
    province_code: string;
  } | null;
  currency: string;
  subtotal_price: string;
  total_tax: string;
  total_price: string;
  total_discounts: string;
}

// Mapper functions to convert between Shopify and our internal formats

/**
 * Convert a Shopify abandoned checkout to our internal cart format
 */
export function shopifyCheckoutToCart(checkout: ShopifyAbandonedCheckout): {
  id: string;
  customerEmail: string;
  customerName: string | null;
  items: {
    id: string;
    title: string;
    price: number;
    quantity: number;
    image?: string;
  }[];
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  recoveryUrl: string;
} {
  // Extract customer name from checkout
  const customerName = checkout.customer ? 
    `${checkout.customer.first_name} ${checkout.customer.last_name}`.trim() : 
    (checkout.shipping_address ? 
      `${checkout.shipping_address.first_name} ${checkout.shipping_address.last_name}`.trim() : 
      null);
  
  // Map line items to our format
  const items = checkout.line_items.map(item => ({
    id: item.id,
    title: item.title,
    price: parseFloat(item.price),
    quantity: item.quantity,
    image: undefined // In real integration, we'd extract this from the product
  }));
  
  return {
    id: checkout.id,
    customerEmail: checkout.email,
    customerName,
    items,
    totalPrice: parseFloat(checkout.total_price),
    createdAt: checkout.created_at,
    updatedAt: checkout.updated_at,
    recoveryUrl: checkout.abandoned_checkout_url
  };
}

/**
 * Create mock data that resembles Shopify's format for testing
 */
export function createMockShopifyCheckout(cartId: string, email: string): ShopifyAbandonedCheckout {
  return {
    id: cartId,
    token: `token_${cartId}`,
    cart_token: `cart_token_${cartId}`,
    email: email,
    gateway: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
    closed_at: null,
    landing_site: '/',
    status: 'open',
    source_url: null,
    customer_locale: 'en',
    line_items: [
      {
        id: `li_${Math.random().toString(36).substring(7)}`,
        variant_id: `var_${Math.random().toString(36).substring(7)}`,
        title: 'Sample Product',
        quantity: 1,
        sku: 'SKU1234',
        variant_title: 'Default',
        vendor: 'Test Store',
        product_id: `prod_${Math.random().toString(36).substring(7)}`,
        requires_shipping: true,
        taxable: true,
        gift_card: false,
        name: 'Sample Product - Default',
        variant_inventory_management: 'shopify',
        properties: [],
        product_exists: true,
        fulfillable_quantity: 1,
        grams: 200,
        price: '49.99',
        total_discount: '0.00',
        fulfillment_status: null,
        price_set: {
          shop_money: { amount: '49.99', currency_code: 'USD' },
          presentment_money: { amount: '49.99', currency_code: 'USD' },
        },
        total_discount_set: {
          shop_money: { amount: '0.00', currency_code: 'USD' },
          presentment_money: { amount: '0.00', currency_code: 'USD' },
        },
        discount_allocations: [],
        tax_lines: []
      }
    ],
    name: '#12345',
    note: null,
    note_attributes: [],
    abandoned_checkout_url: `https://store.myshopify.com/checkouts/${cartId}/recover`,
    discount_codes: [],
    tax_lines: [],
    source_name: 'web',
    presentment_currency: 'USD',
    buyer_accepts_marketing: false,
    reference: `ref_${cartId}`,
    location_id: null,
    device_id: null,
    phone: null,
    customer_id: null,
    customer: null,
    shop_id: 'shop_123',
    shipping_lines: [],
    shipping_address: null,
    billing_address: null,
    currency: 'USD',
    subtotal_price: '49.99',
    total_tax: '0.00',
    total_price: '49.99',
    total_discounts: '0.00'
  };
} 