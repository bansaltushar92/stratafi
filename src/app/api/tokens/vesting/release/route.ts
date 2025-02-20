import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { tokenId, amount } = await request.json();
    const walletAddress = request.headers.get('solana-wallet');

    if (!tokenId || !amount || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Add your vesting release logic here
    // This should interact with your Solana program to release vested tokens

    return NextResponse.json({
      success: true,
      message: 'Vesting release initiated'
    });
  } catch (error) {
    console.error('Error in vesting release endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 