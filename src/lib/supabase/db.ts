import { supabase } from './client';
import { TradingAccount, Position, Transaction } from '@/types/database';

export async function createTradingAccount(
  userId: string,
  data: Partial<TradingAccount>
) {
  const { data: account, error } = await supabase
    .from('trading_accounts')
    .insert({
      owner_id: userId,
      ...data,
    })
    .select()
    .single();

  if (error) throw error;
  return account;
}

export async function getTradingAccounts(userId: string) {
  const { data: accounts, error } = await supabase
    .from('trading_accounts')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return accounts;
}

export async function getTradingAccount(accountId: string) {
  const { data: account, error } = await supabase
    .from('trading_accounts')
    .select('*')
    .eq('id', accountId)
    .single();

  if (error) throw error;
  return account;
}

export async function getPositions(accountId: string) {
  const { data: positions, error } = await supabase
    .from('positions')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return positions;
}

export async function getTransactions(accountId: string) {
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return transactions;
}

export async function createTransaction(
  accountId: string,
  data: Partial<Transaction>
) {
  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert({
      account_id: accountId,
      ...data,
    })
    .select()
    .single();

  if (error) throw error;
  return transaction;
}

export async function updatePosition(
  positionId: string,
  data: Partial<Position>
) {
  const { data: position, error } = await supabase
    .from('positions')
    .update(data)
    .eq('id', positionId)
    .select()
    .single();

  if (error) throw error;
  return position;
} 