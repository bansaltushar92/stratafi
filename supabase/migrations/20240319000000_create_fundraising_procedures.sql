-- Function to process refunds for failed fundraising
CREATE OR REPLACE FUNCTION refund_contributions(token_id_param BIGINT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create refund transfer records
  INSERT INTO token_transfers (
    token_id,
    from_wallet,
    to_wallet,
    amount,
    transfer_type,
    status,
    created_at
  )
  SELECT 
    c.token_id,
    t.treasury_wallet,
    c.contributor_wallet,
    c.amount,
    'refund',
    'completed',
    NOW()
  FROM contributions c
  JOIN tokens t ON t.id = c.token_id
  WHERE c.token_id = token_id_param
    AND c.status = 'completed';

  -- Update contribution status to refunded
  UPDATE contributions
  SET status = 'refunded'
  WHERE token_id = token_id_param
    AND status = 'completed';
END;
$$;

-- Function to distribute tokens after successful fundraising
CREATE OR REPLACE FUNCTION distribute_tokens(
  token_id_param BIGINT,
  tradeable_amount DECIMAL,
  locked_amount DECIMAL,
  vesting_schedule JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  contribution RECORD;
  total_contribution DECIMAL;
  token_allocation DECIMAL;
  tradeable_allocation DECIMAL;
  locked_allocation DECIMAL;
BEGIN
  -- Get total contribution amount
  SELECT SUM(amount) INTO total_contribution
  FROM contributions
  WHERE token_id = token_id_param
    AND status = 'completed';

  -- Process each contribution
  FOR contribution IN 
    SELECT * FROM contributions 
    WHERE token_id = token_id_param 
      AND status = 'completed'
  LOOP
    -- Calculate token allocation based on contribution percentage
    token_allocation := (contribution.amount / total_contribution);
    tradeable_allocation := FLOOR(tradeable_amount * token_allocation);
    locked_allocation := FLOOR(locked_amount * token_allocation);

    -- Create or update token wallet
    INSERT INTO token_wallets (
      token_id,
      wallet_address,
      balance,
      locked_balance,
      vesting_start,
      vesting_end,
      vesting_schedule,
      last_updated
    )
    VALUES (
      token_id_param,
      contribution.contributor_wallet,
      tradeable_allocation,
      locked_allocation,
      NOW(),
      (vesting_schedule->>'end_date')::TIMESTAMP WITH TIME ZONE,
      vesting_schedule,
      NOW()
    )
    ON CONFLICT (token_id, wallet_address) 
    DO UPDATE SET
      balance = token_wallets.balance + EXCLUDED.balance,
      locked_balance = token_wallets.locked_balance + EXCLUDED.locked_balance,
      vesting_schedule = EXCLUDED.vesting_schedule,
      last_updated = NOW();

    -- Create transfer record for token distribution
    INSERT INTO token_transfers (
      token_id,
      from_wallet,
      to_wallet,
      amount,
      transfer_type,
      status,
      completed_at
    )
    VALUES (
      token_id_param,
      (SELECT treasury_wallet FROM tokens WHERE id = token_id_param),
      contribution.contributor_wallet,
      tradeable_allocation + locked_allocation,
      'distribution',
      'completed',
      NOW()
    );
  END LOOP;
END;
$$;

-- Function to check and update fundraising status
CREATE OR REPLACE FUNCTION check_fundraising_status()
RETURNS TRIGGER AS $$
DECLARE
  token_record RECORD;
BEGIN
  -- Get tokens that need status update
  FOR token_record IN
    SELECT t.* 
    FROM tokens t
    WHERE t.status = 'fundraising'
      AND (
        -- Fundraising period ended
        t.fundraising_end <= NOW()
        OR
        -- Target raise reached
        t.amount_raised >= t.target_raise
      )
  LOOP
    -- Update token status based on results
    IF token_record.amount_raised >= (token_record.target_raise * 0.5) THEN
      -- Successful if at least 50% raised
      UPDATE tokens
      SET status = 'completed'
      WHERE id = token_record.id;
    ELSE
      -- Failed if less than 50% raised
      UPDATE tokens
      SET status = 'failed'
      WHERE id = token_record.id;
      
      -- Trigger refunds
      PERFORM refund_contributions(token_record.id);
    END IF;
  END LOOP;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically check fundraising status
CREATE TRIGGER check_fundraising_status_trigger
  AFTER INSERT OR UPDATE OF amount_raised ON tokens
  FOR EACH ROW
  WHEN (NEW.status = 'fundraising')
  EXECUTE FUNCTION check_fundraising_status(); 