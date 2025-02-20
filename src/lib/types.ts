export interface Token {
  id: string;
  name: string;
  symbol: string;
  description: string;
  target_raise: number;
  amount_raised: number;
  status: 'pending' | 'fundraising' | 'completed' | 'trading' | 'failed';
  token_address?: string;
  creator_wallet: string;
  treasury_wallet: string;
  price_per_token: number;
  initial_supply: number;
  created_at: string;
  is_burnable: boolean;
  is_mintable: boolean;
} 