export interface Token {
  id: string;
  name: string;
  symbol: string;
  amount_raised: number;
  target_raise: number;
  status: 'active' | 'completed' | 'paused' | 'draft';
  // ... other fields
} 