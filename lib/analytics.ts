import { recordEmailEvent } from './db-service';

export async function recordEmailSent(trackingId: string, cartId: string, customerEmail: string, storeId: string) {
  try {
    await recordEmailEvent({
      tracking_id: trackingId,
      cart_id: cartId,
      customer_email: customerEmail,
      store_id: storeId,
      status: 'sent',
    });
    
    console.log(`Email sent with tracking ID: ${trackingId} for cart ${cartId} to ${customerEmail} in store ${storeId}`);
  } catch (error) {
    console.error('Error recording email sent event:', error);
    throw error;
  }
}

export async function recordEmailOpened(trackingId: string) {
  try {
    await recordEmailEvent({
      tracking_id: trackingId,
      cart_id: '', // Will be updated in the server function
      customer_email: '', // Will be updated in the server function
      store_id: '', // Will be updated in the server function
      status: 'opened',
    });
    
    console.log(`Email with tracking ID ${trackingId} was opened`);
  } catch (error) {
    console.error('Error recording email opened event:', error);
    throw error;
  }
}

export async function recordEmailClicked(trackingId: string, linkUrl: string) {
  try {
    await recordEmailEvent({
      tracking_id: trackingId,
      cart_id: '', // Will be updated in the server function
      customer_email: '', // Will be updated in the server function
      store_id: '', // Will be updated in the server function
      status: 'clicked',
    });
    
    console.log(`Link clicked in email with tracking ID ${trackingId}: ${linkUrl}`);
  } catch (error) {
    console.error('Error recording email click event:', error);
    throw error;
  }
}
