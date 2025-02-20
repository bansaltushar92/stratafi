import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { calculateVestedAmount } from '@/lib/tokens/vesting';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  try {
    const { userId } = await getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { tokenId } = await request.json();

    if (!tokenId) {
      return NextResponse.json(
        { error: 'Missing token ID' },
        { status: 400 }
      );
    }

    // Get token wallet
    const { data: wallet, error: walletError } = await supabase
      .from('token_wallets')
      .select('*')
      .match({ token_id: tokenId, wallet_address: userId })
      .single();

    if (walletError || !wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }

    // Calculate vested amount
    const vesting = calculateVestedAmount(wallet);

    if (!vesting.nextRelease || vesting.nextRelease.amount <= 0) {
      return NextResponse.json(
        { error: 'No tokens available for release' },
        { status: 400 }
      );
    }

    // Create transfer record for vesting release
    const { data: transfer, error: transferError } = await supabase
      .from('token_transfers')
      .insert({
        token_id: tokenId,
        from_wallet: userId,
        to_wallet: userId, // Same wallet for vesting release
        amount: vesting.nextRelease.amount,
        transfer_type: 'vest',
        status: 'pending'
      })
      .select()
      .single();

    if (transferError) {
      return NextResponse.json(
        { error: 'Failed to create transfer record' },
        { status: 500 }
      );
    }

    // Update wallet balances
    const { error: updateError } = await supabase
      .from('token_wallets')
      .update({
        balance: wallet.balance + vesting.nextRelease.amount,
        locked_balance: wallet.locked_balance - vesting.nextRelease.amount,
        last_updated: new Date().toISOString()
      })
      .eq('id', wallet.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update wallet balances' },
        { status: 500 }
      );
    }

    // Complete the transfer
    const { error: completeError } = await supabase
      .from('token_transfers')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', transfer.id);

    if (completeError) {
      return NextResponse.json(
        { error: 'Failed to complete transfer' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tokens released successfully',
      data: {
        amount: vesting.nextRelease.amount,
        new_balance: wallet.balance + vesting.nextRelease.amount,
        remaining_locked: wallet.locked_balance - vesting.nextRelease.amount,
        next_release: vesting.nextRelease.date
      }
    });

  } catch (error) {
    console.error('Vesting release error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process vesting release' },
      { status: 500 }
    );
  }
} 