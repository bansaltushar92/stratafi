-- Add new columns to tokens table
ALTER TABLE tokens 
ADD COLUMN IF NOT EXISTS treasury_wallet TEXT,
ADD COLUMN IF NOT EXISTS fundraising_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS fundraising_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS tradeable_tokens DECIMAL NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_tokens DECIMAL NOT NULL DEFAULT 0;

-- Create token_wallets table if not exists
CREATE TABLE IF NOT EXISTS token_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_id BIGINT REFERENCES tokens(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  balance DECIMAL NOT NULL DEFAULT 0,
  locked_balance DECIMAL NOT NULL DEFAULT 0,
  vesting_start TIMESTAMP WITH TIME ZONE,
  vesting_end TIMESTAMP WITH TIME ZONE,
  vesting_schedule JSONB,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT token_wallet_unique UNIQUE (token_id, wallet_address),
  CONSTRAINT valid_balance CHECK (balance >= 0),
  CONSTRAINT valid_locked_balance CHECK (locked_balance >= 0)
);

-- Create token_transfers table for tracking transfers
CREATE TABLE IF NOT EXISTS token_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_id BIGINT REFERENCES tokens(id) ON DELETE CASCADE,
  from_wallet TEXT NOT NULL,
  to_wallet TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  transfer_type TEXT NOT NULL CHECK (transfer_type IN ('transfer', 'vest', 'unlock')),
  transaction_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS token_wallets_token_id_idx ON token_wallets(token_id);
CREATE INDEX IF NOT EXISTS token_wallets_wallet_address_idx ON token_wallets(wallet_address);
CREATE INDEX IF NOT EXISTS token_transfers_token_id_idx ON token_transfers(token_id);
CREATE INDEX IF NOT EXISTS token_transfers_from_wallet_idx ON token_transfers(from_wallet);
CREATE INDEX IF NOT EXISTS token_transfers_to_wallet_idx ON token_transfers(to_wallet);

-- Create function to handle token transfers
CREATE OR REPLACE FUNCTION process_token_transfer()
RETURNS TRIGGER AS $$
BEGIN
  -- Update sender's balance
  UPDATE token_wallets
  SET balance = balance - NEW.amount,
      last_updated = NOW()
  WHERE token_id = NEW.token_id 
    AND wallet_address = NEW.from_wallet;

  -- Update receiver's balance
  INSERT INTO token_wallets (token_id, wallet_address, balance, last_updated)
  VALUES (NEW.token_id, NEW.to_wallet, NEW.amount, NOW())
  ON CONFLICT (token_id, wallet_address)
  DO UPDATE SET 
    balance = token_wallets.balance + NEW.amount,
    last_updated = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for token transfers
CREATE TRIGGER token_transfer_trigger
  AFTER UPDATE OF status ON token_transfers
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status = 'pending')
  EXECUTE FUNCTION process_token_transfer(); 