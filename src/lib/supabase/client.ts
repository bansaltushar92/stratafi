import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    }
  }
});

export async function getToken(id: string) {
  const { data, error } = await supabase
    .from('tokens')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function listTokens() {
  const { data, error } = await supabase
    .from('tokens')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getTrendingTokens(limit = 5) {
  const { data, error } = await supabase
    .from('tokens')
    .select('*')
    .order('amount_raised', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getTokenPriceHistory(tokenId: string) {
  const { data, error } = await supabase
    .from('token_prices')
    .select('*')
    .eq('token_id', tokenId)
    .order('timestamp', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getTokenHolders(tokenId: string) {
  const { data, error } = await supabase
    .from('token_holders')
    .select('*')
    .eq('token_id', tokenId)
    .order('balance', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getTokenContributions(tokenId: string) {
  const { data, error } = await supabase
    .from('contributions')
    .select('*')
    .eq('token_id', tokenId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getTokenWallet(tokenId: string, walletAddress: string) {
  const { data, error } = await supabase
    .from('token_wallets')
    .select('*')
    .match({
      token_id: tokenId,
      wallet_address: walletAddress
    })
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createTokenWallet(tokenId: string, walletAddress: string) {
  const { data, error } = await supabase
    .from('token_wallets')
    .insert([
      {
        token_id: tokenId,
        wallet_address: walletAddress,
        balance: 0,
        locked_balance: 0,
        last_updated: new Date().toISOString()
      }
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Central treasury wallet for all tokens
const treasuryWallet = process.env.NEXT_PUBLIC_TREASURY_WALLET;
if (!treasuryWallet) {
  throw new Error('NEXT_PUBLIC_TREASURY_WALLET environment variable is not configured');
}
export const CENTRAL_TREASURY_WALLET = treasuryWallet;

export async function createToken(token: {
  name: string;
  symbol: string;
  description: string;
  total_supply: number;
  initial_price: number;
  token_address: string;
  creator_wallet: string;
}) {
  const { data, error } = await supabase
    .from('tokens')
    .insert([{
      ...token,
      treasury_wallet: CENTRAL_TREASURY_WALLET // Use central treasury wallet
    }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
} 