import { NextRequest, NextResponse } from 'next/server';
import { mockCarts } from '../route';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Cart ID is required' },
        { status: 400 }
      );
    }
    
    // Find the cart in the mock carts array
    const cart = mockCarts.find(cart => cart.id === id);
    
    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ cart });
  } catch (error) {
    console.error('Error in GET /api/mock/carts/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Cart ID is required' },
        { status: 400 }
      );
    }
    
    // Find the cart index
    const cartIndex = mockCarts.findIndex(cart => cart.id === id);
    
    if (cartIndex === -1) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }
    
    // Remove the cart from the array
    mockCarts.splice(cartIndex, 1);
    
    return NextResponse.json({
      success: true,
      message: 'Cart deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/mock/carts/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete cart' },
      { status: 500 }
    );
  }
}
