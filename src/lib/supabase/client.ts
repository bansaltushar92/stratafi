import { createClient } from '@supabase/supabase-js';
import { Token, TokenPrice, TokenHolder, TokenWallet as TokenWalletType } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Investment {
  token: Token;
  balance: number;
}

interface TokenWalletRecord {
  balance: number;
  tokens: Token;
}

export async function listTokens(): Promise<Token[]> {
  const { data, error } = await supabase
    .from('tokens')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tokens:', error);
    return [];
  }

  return data || [];
}

export async function getTrendingTokens(): Promise<Token[]> {
  const { data, error } = await supabase
    .from('tokens')
    .select('*')
    .eq('status', 'trading')
    .order('amount_raised', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching trending tokens:', error);
    return [];
  }

  return data || [];
}

export async function getTokensByCreator(userId: string): Promise<Token[]> {
  const { data, error } = await supabase
    .from('tokens')
    .select('*')
    .eq('creator_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching creator tokens:', error);
    return [];
  }

  return data || [];
}

export async function getInvestments(userId: string): Promise<Investment[]> {
  const { data, error } = await supabase
    .from('token_wallets')
    .select(`
      balance,
      tokens (*)
    `)
    .eq('user_id', userId)
    .gt('balance', 0);

  if (error) {
    console.error('Error fetching investments:', error);
    return [];
  }

  return (data as TokenWalletRecord[] || []).map(record => ({
    token: record.tokens,
    balance: record.balance
  }));
}

export async function getToken(tokenId: string): Promise<Token | null> {
  const { data, error } = await supabase
    .from('tokens')
    .select('*')
    .eq('id', tokenId)
    .single();

  if (error) {
    console.error('Error fetching token:', error);
    return null;
  }

  return data;
}

export async function getTokenPriceHistory(tokenId: string): Promise<TokenPrice[]> {
  const { data, error } = await supabase
    .from('token_prices')
    .select('*')
    .eq('token_id', tokenId)
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('Error fetching token price history:', error);
    return [];
  }

  return data || [];
}

export async function getTokenHolders(tokenId: string): Promise<TokenHolder[]> {
  const { data, error } = await supabase
    .from('token_holders')
    .select('*')
    .eq('token_id', tokenId)
    .order('balance', { ascending: false });

  if (error) {
    console.error('Error fetching token holders:', error);
    return [];
  }

  return data || [];
}

export async function getTokenContributions(tokenId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('contributions')
    .select(`
      *,
      contributor:contributor_wallet (*)
    `)
    .eq('token_id', tokenId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching token contributions:', error);
    return [];
  }

  return data || [];
}

export async function getTokenWallet(tokenId: string, userId: string): Promise<TokenWalletType | null> {
  const { data, error } = await supabase
    .from('token_wallets')
    .select('*')
    .eq('token_id', tokenId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching token wallet:', error);
    return null;
  }

  return data;
}

export async function createTokenWallet(tokenId: string, userId: string): Promise<TokenWalletType | null> {
  const { data, error } = await supabase
    .from('token_wallets')
    .insert([{
      token_id: tokenId,
      user_id: userId,
      balance: 0,
      locked_balance: 0
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating token wallet:', error);
    return null;
  }

  return data;
} 