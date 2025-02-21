import { Box, Grid, Typography, Container, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { TokenCard } from './TokenCard';
import { useState, useEffect } from 'react';
// ... other imports

interface Token {
  name: string;
  symbol: string;
  target: string;
  raised: string;
  raisedPercentage: string;
}

export const AvailableTokens = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  
  // Add this useEffect to fetch tokens or set initial data
  useEffect(() => {
    // Temporary mock data
    setTokens([
      {
        name: "Based TOK",
        symbol: "BASETOK",
        target: "100 USDC",
        raised: "0",
        raisedPercentage: "0.0%"
      }
      // Add more tokens as needed
    ]);
  }, []);

  const handleCreateToken = () => {
    // Your existing create token handler
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Available Tokens
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateToken}
          sx={{
            borderRadius: 28,
            px: 3,
            backgroundColor: '#7C3AED',
            '&:hover': {
              backgroundColor: '#6D28D9',
            }
          }}
        >
          Create Token
        </Button>
      </Box>

      <Grid container spacing={3}>
        {tokens.map((token) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={token.symbol}>
            <TokenCard 
              token={{
                name: token.name,
                symbol: token.symbol,
                target: `${token.target} USDC`,
                raised: `${token.raised}`,
                raisedPercentage: `${token.raisedPercentage}%`
              }} 
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}; 