-- Drop existing tables if they exist
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS positions;
DROP TABLE IF EXISTS trading_accounts;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS token_holders;
DROP TABLE IF EXISTS token_prices;
DROP TABLE IF EXISTS contributions;
DROP TABLE IF EXISTS tokens;

-- Drop existing types
DROP TYPE IF EXISTS transaction_status;
DROP TYPE IF EXISTS transaction_type;
DROP TYPE IF EXISTS account_status;
DROP TYPE IF EXISTS user_role;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types (enums)
CREATE TYPE account_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE transaction_type AS ENUM ('buy', 'sell');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed');

-- Create profiles table (synced with Clerk)
CREATE TABLE profiles (
    id TEXT PRIMARY KEY, -- This will store Clerk's user ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'user' NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create trading_accounts table
CREATE TABLE trading_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    owner_id TEXT REFERENCES profiles(id) NOT NULL,
    account_name TEXT NOT NULL,
    exchange TEXT DEFAULT 'coinbase' NOT NULL,
    status account_status DEFAULT 'inactive'::account_status NOT NULL,
    token_address TEXT,
    total_value NUMERIC DEFAULT 0 NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create positions table
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    account_id UUID REFERENCES trading_accounts(id) NOT NULL,
    asset TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    average_entry_price NUMERIC NOT NULL,
    current_price NUMERIC NOT NULL,
    pnl NUMERIC DEFAULT 0 NOT NULL,
    pnl_percentage NUMERIC DEFAULT 0 NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    account_id UUID REFERENCES trading_accounts(id) NOT NULL,
    type transaction_type NOT NULL,
    asset TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    price NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    status transaction_status DEFAULT 'pending'::transaction_status NOT NULL,
    exchange_order_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create tokens table
CREATE TABLE tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    description TEXT,
    initial_supply NUMERIC NOT NULL,
    target_raise NUMERIC NOT NULL,
    price_per_token NUMERIC NOT NULL,
    creator_wallet TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    amount_raised NUMERIC NOT NULL DEFAULT 0,
    is_burnable BOOLEAN NOT NULL DEFAULT false,
    is_mintable BOOLEAN NOT NULL DEFAULT false,
    UNIQUE(symbol)
);

-- Create contributions table
CREATE TABLE contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    token_id UUID REFERENCES tokens(id) NOT NULL,
    contributor_wallet TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    token_amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    transaction_hash TEXT
);

-- Create token_prices table
CREATE TABLE token_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID REFERENCES tokens(id) NOT NULL,
    price NUMERIC NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create token_holders table
CREATE TABLE token_holders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID REFERENCES tokens(id) NOT NULL,
    wallet_address TEXT NOT NULL,
    balance NUMERIC NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_holders ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Profiles policies
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (id = current_user);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (id = current_user);

-- Trading accounts policies
CREATE POLICY "Users can view own trading accounts"
    ON trading_accounts FOR SELECT
    USING (owner_id = current_user);

CREATE POLICY "Users can insert own trading accounts"
    ON trading_accounts FOR INSERT
    WITH CHECK (owner_id = current_user);

CREATE POLICY "Users can update own trading accounts"
    ON trading_accounts FOR UPDATE
    USING (owner_id = current_user);

-- Positions policies
CREATE POLICY "Users can view positions of own accounts"
    ON positions FOR SELECT
    USING (
        account_id IN (
            SELECT id FROM trading_accounts
            WHERE owner_id = current_user
        )
    );

-- Transactions policies
CREATE POLICY "Users can view transactions of own accounts"
    ON transactions FOR SELECT
    USING (
        account_id IN (
            SELECT id FROM trading_accounts
            WHERE owner_id = current_user
        )
    );

-- Create function to update position PnL
CREATE OR REPLACE FUNCTION update_position_pnl()
RETURNS TRIGGER AS $$
BEGIN
    NEW.pnl = (NEW.current_price - NEW.average_entry_price) * NEW.quantity;
    NEW.pnl_percentage = (NEW.current_price - NEW.average_entry_price) / NEW.average_entry_price * 100;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for position PnL updates
CREATE TRIGGER update_position_pnl_trigger
    BEFORE INSERT OR UPDATE ON positions
    FOR EACH ROW
    EXECUTE FUNCTION update_position_pnl();

-- Create function to update account total value
CREATE OR REPLACE FUNCTION update_account_total_value()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE trading_accounts
    SET total_value = (
        SELECT COALESCE(SUM(quantity * current_price), 0)
        FROM positions
        WHERE account_id = NEW.account_id
    )
    WHERE id = NEW.account_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for account total value updates
CREATE TRIGGER update_account_total_value_trigger
    AFTER INSERT OR UPDATE OR DELETE ON positions
    FOR EACH ROW
    EXECUTE FUNCTION update_account_total_value();

-- Create policies for tokens table
CREATE POLICY "Anyone can view tokens" ON tokens
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create tokens" ON tokens
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Token creators can update their tokens" ON tokens
    FOR UPDATE USING (creator_wallet = auth.uid());

CREATE POLICY "Token creators can delete their tokens" ON tokens
    FOR DELETE USING (creator_wallet = auth.uid());

-- Create policies for contributions table
CREATE POLICY "Anyone can view contributions" ON contributions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create contributions" ON contributions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Contributors can update their contributions" ON contributions
    FOR UPDATE USING (contributor_wallet = auth.uid());

-- Create policies for token_prices table
CREATE POLICY "Anyone can view token prices" ON token_prices
    FOR SELECT USING (true);

CREATE POLICY "Token creators can insert prices" ON token_prices
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM tokens
            WHERE tokens.id = token_id
            AND tokens.creator_wallet = auth.uid()
        )
    );

-- Create policies for token_holders table
CREATE POLICY "Anyone can view token holders" ON token_holders
    FOR SELECT USING (true);

CREATE POLICY "System can manage token holders" ON token_holders
    FOR ALL USING (true)
    WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_tokens_creator_wallet ON tokens(creator_wallet);
CREATE INDEX idx_tokens_symbol ON tokens(symbol);
CREATE INDEX idx_contributions_token_id ON contributions(token_id);
CREATE INDEX idx_contributions_contributor_wallet ON contributions(contributor_wallet);
CREATE INDEX idx_token_prices_token_id ON token_prices(token_id);
CREATE INDEX idx_token_holders_token_id ON token_holders(token_id);
CREATE INDEX idx_token_holders_wallet_address ON token_holders(wallet_address); 