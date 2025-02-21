'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Box, Typography, Grid } from '@mui/material';
import { TokenCard } from './TokenCard';

// Define authorized wallets and their tokens
const WALLET_TOKENS = {
  'DRpbCBMxVnDK7maPGv7USk5P18pNJx9RhS7Xs9aLgPwj': [
    {
      name: "DRP Strategy Fund",
      symbol: "DRP",
      target: "100,000 USDC",
      raised: "50,000",
      raisedPercentage: "50.0"
    }
  ],
  'AKnL4NNf3DGWZJS6cPknBuEGnVsV4A4m5tgebLHaRSZ9': [
    {
      name: "AKN Quant Fund",
      symbol: "AKN",
      target: "200,000 USDC",
      raised: "150,000",
      raisedPercentage: "75.0"
    }
  ]
};

export function MyTokens() {
  const { address } = useAccount();
  const [userTokens, setUserTokens] = useState<any[]>([]);

  useEffect(() => {
    if (address && WALLET_TOKENS[address as keyof typeof WALLET_TOKENS]) {
      setUserTokens(WALLET_TOKENS[address as keyof typeof WALLET_TOKENS]);
    }
  }, [address]);

  if (!address || !WALLET_TOKENS[address as keyof typeof WALLET_TOKENS]) {
    return null;
  }

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        My Tokens
      </Typography>
      <Grid container spacing={3}>
        {userTokens.map((token) => (
          <Grid item xs={12} sm={6} md={4} key={token.symbol}>
            <TokenCard token={token} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
} 