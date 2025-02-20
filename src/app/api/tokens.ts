const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface TokenCreateData {
  name: string;
  symbol: string;
  initial_supply: number;
  description?: string;
  target_raise: number;
  price_per_token: number;
  creator_wallet: string;
  features: {
    burnable: boolean;
    mintable: boolean;
  };
}

export interface Token {
  id: number;
  token_address: string | null;
  name: string;
  symbol: string;
  initial_supply: number;
  description: string | null;
  target_raise: number;
  price_per_token: number;
  creator_wallet: string;
  status: string;
  amount_raised: number;
  created_at: string;
  is_burnable: boolean;
  is_mintable: boolean;
}

export async function createToken(data: TokenCreateData): Promise<Token> {
  const response = await fetch(`${API_URL}/api/tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create token');
  }

  return response.json();
}

export async function listTokens(page: number = 1, limit: number = 10): Promise<Token[]> {
  const skip = (page - 1) * limit;
  const response = await fetch(`${API_URL}/api/tokens?skip=${skip}&limit=${limit}`);

  if (!response.ok) {
    throw new Error('Failed to fetch tokens');
  }

  return response.json();
}

export async function getToken(id: number): Promise<Token> {
  const response = await fetch(`${API_URL}/api/tokens/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch token');
  }

  return response.json();
}

export async function getTrendingTokens(limit: number = 5): Promise<Token[]> {
  const response = await fetch(`${API_URL}/api/tokens/trending?limit=${limit}`);

  if (!response.ok) {
    throw new Error('Failed to fetch trending tokens');
  }

  return response.json();
} 