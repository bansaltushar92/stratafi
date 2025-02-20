export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tokens: {
        Row: {
          id: string
          created_at: string
          token_address: string | null
          name: string
          symbol: string
          description: string | null
          initial_supply: number
          target_raise: number
          price_per_token: number
          creator_wallet: string
          status: 'pending' | 'fundraising' | 'completed' | 'trading' | 'failed'
          amount_raised: number
          is_burnable: boolean
          is_mintable: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          token_address?: string | null
          name: string
          symbol: string
          description?: string | null
          initial_supply: number
          target_raise: number
          price_per_token: number
          creator_wallet: string
          status?: 'pending' | 'fundraising' | 'completed' | 'trading' | 'failed'
          amount_raised?: number
          is_burnable?: boolean
          is_mintable?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          token_address?: string | null
          name?: string
          symbol?: string
          description?: string | null
          initial_supply?: number
          target_raise?: number
          price_per_token?: number
          creator_wallet?: string
          status?: 'pending' | 'fundraising' | 'completed' | 'trading' | 'failed'
          amount_raised?: number
          is_burnable?: boolean
          is_mintable?: boolean
        }
      }
      contributions: {
        Row: {
          id: string
          created_at: string
          token_id: string
          contributor_wallet: string
          amount: number
          token_amount: number
          status: 'pending' | 'completed' | 'failed'
          transaction_hash: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          token_id: string
          contributor_wallet: string
          amount: number
          token_amount: number
          status?: 'pending' | 'completed' | 'failed'
          transaction_hash?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          token_id?: string
          contributor_wallet?: string
          amount?: number
          token_amount?: number
          status?: 'pending' | 'completed' | 'failed'
          transaction_hash?: string | null
        }
      }
      token_prices: {
        Row: {
          id: string
          token_id: string
          price: number
          timestamp: string
        }
        Insert: {
          id?: string
          token_id: string
          price: number
          timestamp?: string
        }
        Update: {
          id?: string
          token_id?: string
          price?: number
          timestamp?: string
        }
      }
      token_holders: {
        Row: {
          id: string
          token_id: string
          wallet_address: string
          balance: number
          last_updated: string
        }
        Insert: {
          id?: string
          token_id: string
          wallet_address: string
          balance: number
          last_updated?: string
        }
        Update: {
          id?: string
          token_id?: string
          wallet_address?: string
          balance?: number
          last_updated?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 