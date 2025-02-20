import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { tokenId, amount, toAddress } = await request.json();
    const fromAddress = request.headers.get('solana-wallet');

    if (!tokenId || !amount || !toAddress || !fromAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Add your token transfer logic here
    // This should interact with your Solana program to transfer tokens

    return NextResponse.json({
      success: true,
      message: 'Transfer initiated'
    });
  } catch (error) {
    console.error('Error in transfer endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 