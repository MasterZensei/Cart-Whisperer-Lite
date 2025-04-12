import { v4 as uuidv4 } from 'uuid';
import { supabase, Cart, CartItem, EmailEvent, StoreSettings, EmailTemplate } from './supabase';
import { MockCart, MockCartItem } from './mock-data';

// Convert from MockCart to Supabase Cart format
export function convertToSupabaseCart(mockCart: MockCart, storeId = 'demo-store'): Cart {
  return {
    id: mockCart.id,
    customer_email: mockCart.customerEmail,
    customer_name: mockCart.customerName,
    items: mockCart.items.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    })),
    total_price: mockCart.totalPrice,
    created_at: mockCart.createdAt,
    updated_at: mockCart.updatedAt,
    recovery_url: mockCart.recoveryUrl,
    store_id: storeId,
    recovered: false,
  };
}

// Convert from Supabase Cart to MockCart format (for backward compatibility)
export function convertToMockCart(cart: Cart): MockCart {
  return {
    id: cart.id,
    customerEmail: cart.customer_email,
    customerName: cart.customer_name,
    items: cart.items.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    })),
    totalPrice: cart.total_price,
    createdAt: cart.created_at,
    updatedAt: cart.updated_at,
    recoveryUrl: cart.recovery_url,
  };
}

// Carts operations
export async function getAllCarts(storeId = 'demo-store'): Promise<Cart[]> {
  const { data, error } = await supabase
    .from('carts')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching carts:', error);
    throw error;
  }

  return data || [];
}

export async function getCartById(id: string): Promise<Cart | null> {
  const { data, error } = await supabase
    .from('carts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching cart with ID ${id}:`, error);
    return null;
  }

  return data;
}

export async function createCart(
  cart: Omit<Cart, 'id' | 'created_at' | 'updated_at' | 'recovered'>
): Promise<Cart> {
  const now = new Date().toISOString();
  const newCart: Cart = {
    id: uuidv4(),
    ...cart,
    created_at: now,
    updated_at: now,
    recovered: false,
  };

  const { data, error } = await supabase
    .from('carts')
    .insert(newCart)
    .select()
    .single();

  if (error) {
    console.error('Error creating cart:', error);
    throw error;
  }

  return data;
}

export async function updateCart(id: string, updates: Partial<Cart>): Promise<Cart | null> {
  const { data, error } = await supabase
    .from('carts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating cart with ID ${id}:`, error);
    throw error;
  }

  return data;
}

export async function deleteCart(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('carts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting cart with ID ${id}:`, error);
    return false;
  }

  return true;
}

export async function markCartAsRecovered(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('carts')
    .update({ recovered: true, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error(`Error marking cart ${id} as recovered:`, error);
    return false;
  }

  return true;
}

// Email Events operations
export async function recordEmailEvent(event: Omit<EmailEvent, 'id' | 'sent_at'>): Promise<EmailEvent> {
  const newEvent: EmailEvent = {
    id: uuidv4(),
    ...event,
    sent_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('email_events')
    .insert(newEvent)
    .select()
    .single();

  if (error) {
    console.error('Error recording email event:', error);
    throw error;
  }

  return data;
}

export async function getEmailEvents(storeId: string): Promise<EmailEvent[]> {
  const { data, error } = await supabase
    .from('email_events')
    .select('*')
    .eq('store_id', storeId)
    .order('sent_at', { ascending: false });

  if (error) {
    console.error('Error fetching email events:', error);
    throw error;
  }

  return data || [];
}

// Email Templates operations
export async function getEmailTemplates(storeId: string): Promise<EmailTemplate[]> {
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .eq('store_id', storeId)
    .single();

  if (error) {
    console.error('Error fetching email templates:', error);
    return [];
  }

  return data?.email_templates || [];
}

export async function saveEmailTemplate(
  storeId: string, 
  template: Omit<EmailTemplate, 'id'>
): Promise<EmailTemplate> {
  // First, get the current store settings
  const { data: storeData, error: storeError } = await supabase
    .from('store_settings')
    .select('*')
    .eq('store_id', storeId)
    .single();

  if (storeError && storeError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error('Error fetching store settings:', storeError);
    throw storeError;
  }

  const newTemplate: EmailTemplate = {
    id: uuidv4(),
    ...template,
  };

  if (!storeData) {
    // Create new store settings with this template
    const newStoreSettings: StoreSettings = {
      id: uuidv4(),
      store_id: storeId,
      store_name: 'Your Store',
      email_templates: [newTemplate],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('store_settings')
      .insert(newStoreSettings);

    if (error) {
      console.error('Error creating store settings:', error);
      throw error;
    }
  } else {
    // Update existing store settings with the new template
    const updatedTemplates = [...(storeData.email_templates || []), newTemplate];
    
    const { error } = await supabase
      .from('store_settings')
      .update({ 
        email_templates: updatedTemplates,
        updated_at: new Date().toISOString(),
      })
      .eq('store_id', storeId);

    if (error) {
      console.error('Error updating store settings:', error);
      throw error;
    }
  }

  return newTemplate;
}

// Analytics operations
export async function getCartRecoveryStats(storeId: string): Promise<{ 
  total: number;
  recovered: number;
  conversionRate: number;
}> {
  // Get total carts
  const { count: totalCount, error: totalError } = await supabase
    .from('carts')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', storeId);

  if (totalError) {
    console.error('Error counting total carts:', totalError);
    throw totalError;
  }

  // Get recovered carts
  const { count: recoveredCount, error: recoveredError } = await supabase
    .from('carts')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', storeId)
    .eq('recovered', true);

  if (recoveredError) {
    console.error('Error counting recovered carts:', recoveredError);
    throw recoveredError;
  }

  const total = totalCount || 0;
  const recovered = recoveredCount || 0;
  const conversionRate = total > 0 ? (recovered / total) * 100 : 0;

  return {
    total,
    recovered,
    conversionRate,
  };
}

// Migration utility - transfer mock data to Supabase
export async function migrateMockCartsToSupabase(mockCarts: MockCart[]): Promise<void> {
  const supabaseCarts = mockCarts.map(cart => convertToSupabaseCart(cart));
  
  const { error } = await supabase
    .from('carts')
    .insert(supabaseCarts);
  
  if (error) {
    console.error('Error migrating mock carts to Supabase:', error);
    throw error;
  }
} 