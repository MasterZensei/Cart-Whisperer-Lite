import { NextResponse } from 'next/server';
import { recordEmailOpened } from '@/lib/analytics';

export async function GET(
  request: Request,
  { params }: { params: { trackingId: string } }
) {
  try {
    const trackingId = params.trackingId;
    
    // Record the open event
    await recordEmailOpened(trackingId);
    
    // Return a 1x1 transparent pixel
    return new NextResponse(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'), {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error tracking email open:', error);
    return NextResponse.json({ error: 'Failed to track email open' }, { status: 500 });
  }
} 