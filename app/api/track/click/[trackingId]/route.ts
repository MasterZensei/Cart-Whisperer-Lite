import { NextResponse } from 'next/server';
import { recordEmailClicked } from '@/lib/analytics';

export async function GET(
  request: Request,
  { params }: { params: { trackingId: string } }
) {
  try {
    const trackingId = params.trackingId;
    const url = new URL(request.url).searchParams.get('url');
    
    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }
    
    // Record the click event
    await recordEmailClicked(trackingId, url);
    
    // Redirect to the original URL
    return NextResponse.redirect(url);
  } catch (error) {
    console.error('Error tracking email click:', error);
    return NextResponse.json({ error: 'Failed to track email click' }, { status: 500 });
  }
} 