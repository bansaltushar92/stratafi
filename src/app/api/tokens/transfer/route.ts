import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { transferUSDC } from '@/lib/solana/usdc';

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

    const { tokenId, amount, toAddress } = await request.json();

    if (!tokenId || !amount || !toAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get token details
    const { data: token, error: tokenError } = await supabase
      .from('tokens')
      .select('*')
      .eq('id', tokenId)
      .single();

    if (tokenError || !token) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }

    // Get sender's wallet
    const { data: senderWallet, error: senderError } = await supabase
      .from('token_wallets')
      .select('*')
      .match({ token_id: tokenId, wallet_address: userId })
      .single();

    if (senderError || !senderWallet) {
      return NextResponse.json(
        { error: 'Sender wallet not found' },
        { status: 404 }
      );
    }

    // Check balance
    if (senderWallet.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Create transfer record
    const { data: transfer, error: transferError } = await supabase
      .from('token_transfers')
      .insert({
        token_id: tokenId,
        from_wallet: userId,
        to_wallet: toAddress,
        amount,
        transfer_type: 'transfer',
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

    // Execute transfer on Solana
    try {
      const transferResult = await transferUSDC(
        senderWallet.wallet_address,
        toAddress,
        amount
      );

      if (!transferResult.success) {
        throw new Error(transferResult.error || 'Transfer failed');
      }

      // Update transfer record with transaction hash and complete status
      const { error: updateError } = await supabase
        .from('token_transfers')
        .update({
          status: 'completed',
          transaction_hash: transferResult.signature,
          completed_at: new Date().toISOString()
        })
        .eq('id', transfer.id);

      if (updateError) {
        throw new Error('Failed to update transfer record');
      }

      return NextResponse.json({
        success: true,
        message: 'Transfer successful',
        data: {
          transfer_id: transfer.id,
          transaction: transferResult.signature
        }
      });

    } catch (error) {
      // Update transfer record with failed status
      await supabase
        .from('token_transfers')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString()
        })
        .eq('id', transfer.id);

      throw error;
    }

  } catch (error) {
    console.error('Transfer error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process transfer' },
      { status: 500 }
    );
  }
} 