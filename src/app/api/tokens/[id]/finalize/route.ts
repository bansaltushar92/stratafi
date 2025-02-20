import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { 
  calculateFundraisingStatus, 
  getNextTokenStatus,
  calculateTokenDistribution,
  getVestingSchedule
} from '@/lib/tokens/fundraising';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  
  try {
    const { userId } = await getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get token details
    const { data: token, error: tokenError } = await supabase
      .from('tokens')
      .select('*')
      .eq('id', params.id)
      .single();

    if (tokenError || !token) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }

    // Verify user is token creator
    if (token.creator_wallet !== userId) {
      return NextResponse.json(
        { error: 'Only token creator can finalize fundraising' },
        { status: 403 }
      );
    }

    // Calculate fundraising status
    const status = calculateFundraisingStatus(token);
    
    if (!status.canFinalize) {
      return NextResponse.json(
        { error: 'Fundraising cannot be finalized yet' },
        { status: 400 }
      );
    }

    const nextStatus = getNextTokenStatus(token);
    
    // If fundraising failed, return funds to contributors
    if (nextStatus === 'failed') {
      // Start a Supabase transaction
      const { error: refundError } = await supabase.rpc('refund_contributions', {
        token_id: token.id
      });

      if (refundError) {
        return NextResponse.json(
          { error: 'Failed to process refunds' },
          { status: 500 }
        );
      }

      // Update token status
      const { error: updateError } = await supabase
        .from('tokens')
        .update({ status: 'failed' })
        .eq('id', token.id);

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update token status' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Fundraising failed, contributions refunded',
        status: 'failed'
      });
    }

    // If fundraising succeeded, distribute tokens
    const distribution = calculateTokenDistribution(token);
    const vestingSchedule = getVestingSchedule(token);

    // Start a Supabase transaction for token distribution
    const { error: distributionError } = await supabase.rpc('distribute_tokens', {
      token_id: token.id,
      tradeable_amount: distribution.tradeableTokens,
      locked_amount: distribution.lockedTokens,
      vesting_schedule: vestingSchedule
    });

    if (distributionError) {
      return NextResponse.json(
        { error: 'Failed to distribute tokens' },
        { status: 500 }
      );
    }

    // Update token status and final distribution
    const { error: updateError } = await supabase
      .from('tokens')
      .update({
        status: 'completed',
        tradeable_tokens: distribution.tradeableTokens,
        locked_tokens: distribution.lockedTokens,
        price_per_token: distribution.tokenPrice
      })
      .eq('id', token.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update token status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Fundraising completed successfully',
      status: 'completed',
      distribution
    });

  } catch (error) {
    console.error('Finalize error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to finalize fundraising' },
      { status: 500 }
    );
  }
} 