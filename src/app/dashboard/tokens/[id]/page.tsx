import { Connection, PublicKey } from '@solana/web3.js';
import { getToken, getTokenPriceHistory, getTokenHolders, getTokenContributions, getTokenWallet, createTokenWallet } from '@/lib/supabase/client';
import { getTokenBalance } from '@/lib/solana/token';
import { TokenDetailsClient } from '@/components/tokens/TokenDetailsClient';
import { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';

interface PageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

// Helper function to safely get the token ID
async function getTokenId(params: { id: string }) {
  'use server';
  const resolvedParams = await params;
  return String(resolvedParams.id);
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const tokenId = await getTokenId(props.params);
  return {
    title: `Token ${tokenId} - Stratafi`,
  };
}

export default async function TokenDetailsPage(props: PageProps) {
  const tokenId = await getTokenId(props.params);
  const session = await auth();
  const userId = session?.userId;

  try {
    // First fetch the token data
    const tokenData = await getToken(tokenId);
    if (!tokenData) {
      return (
        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
            Token not found
          </div>
        </div>
      );
    }

    // Then fetch all other data in parallel
    let [priceData, holdersData, contributionsData] = await Promise.all([
      getTokenPriceHistory(tokenId),
      getTokenHolders(tokenId),
      getTokenContributions(tokenId)
    ]);

    // Initialize wallet data as null
    let walletData = null;
    let balance = null;

    // Only attempt to get wallet data if user is authenticated
    if (userId) {
      try {
        // First try to get existing wallet
        walletData = await getTokenWallet(tokenId, userId);
      } catch (error) {
        // If wallet doesn't exist, create a new one
        if ((error as any)?.message?.includes('no rows returned')) {
          walletData = await createTokenWallet(tokenId, userId);
        }
      }

      // Get token balance if wallet exists
      if (walletData?.wallet_address) {
        try {
          const connection = new Connection(
            process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com'
          );
          balance = await getTokenBalance(connection, new PublicKey(walletData.wallet_address));
        } catch (error) {
          console.warn('Error fetching token balance:', error);
        }
      }
    }

    return (
      <TokenDetailsClient
        token={tokenData}
        priceHistory={priceData}
        holders={holdersData}
        contributions={contributionsData}
        wallet={walletData}
        balance={balance}
      />
    );
  } catch (err) {
    console.error('Error loading token details:', err);
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {err instanceof Error ? err.message : 'Failed to load token details'}
        </div>
      </div>
    );
  }
} 