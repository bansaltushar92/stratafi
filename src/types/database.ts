export interface Profile {
  id: string;
  created_at: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'user' | 'asset_manager' | 'admin';
}

export interface TradingAccount {
  id: string;
  created_at: string;
  owner_id: string;
  account_name: string;
  exchange: 'coinbase';
  status: 'active' | 'inactive' | 'suspended';
  token_address?: string;
  total_value: number;
  currency: string;
}

export interface Position {
  id: string;
  created_at: string;
  account_id: string;
  asset: string;
  quantity: number;
  average_entry_price: number;
  current_price: number;
  pnl: number;
  pnl_percentage: number;
}

export interface Transaction {
  id: string;
  created_at: string;
  account_id: string;
  type: 'buy' | 'sell';
  asset: string;
  quantity: number;
  price: number;
  total: number;
  status: 'pending' | 'completed' | 'failed';
  exchange_order_id?: string;
}

export type TokenStatus = 'pending' | 'fundraising' | 'completed' | 'trading' | 'failed';

export interface Token {
  id: string;
  created_at: string;
  token_address?: string;
  name: string;
  symbol: string;
  description?: string;
  initial_supply: number;
  target_raise: number;
  price_per_token: number;
  creator_wallet: string;
  treasury_wallet: string;  // Central wallet to store USDC
  status: TokenStatus;
  amount_raised: number;
  fundraising_start: string;
  fundraising_end: string;
  tradeable_tokens: number;  // 75% of total supply
  locked_tokens: number;     // 25% of total supply
  is_burnable: boolean;
  is_mintable: boolean;
}

export interface Contribution {
  id: string;
  created_at: string;
  token_id: string;
  contributor_wallet: string;
  amount: number;
  token_amount: number;
  status: 'pending' | 'completed' | 'failed';
  transaction_hash: string | null;
}

export interface TokenPrice {
  id: string;
  token_id: string;
  price: number;
  timestamp: string;
}

export interface TokenHolder {
  id: string;
  token_id: string;
  wallet_address: string;
  balance: number;
  last_updated: string;
}

export interface VestingSchedule {
  cliff_date: string;
  end_date: string;
  release_frequency: 'daily' | 'weekly' | 'monthly';
  release_percentage: number;
}

export interface TokenWallet {
  id: string;
  token_id: string;
  wallet_address: string;
  balance: number;
  locked_balance: number;
  vesting_start: string | null;
  vesting_end: string | null;
  vesting_schedule: VestingSchedule | null;
  last_updated: string;
  created_at: string;
}

export interface TokenTransfer {
  id: string;
  token_id: string;
  from_wallet: string;
  to_wallet: string;
  amount: number;
  transfer_type: 'transfer' | 'vest' | 'unlock';
  transaction_hash: string | null;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  completed_at: string | null;
} 