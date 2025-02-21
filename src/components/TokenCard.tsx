import { Card, CardContent, Typography, Box } from '@mui/material';
import TokenIcon from '@mui/icons-material/Token';

interface TokenCardProps {
  token: {
    name: string;
    symbol: string;
    target: string;
    raised: string;
    raisedPercentage: string;
  }
}

export const TokenCard = ({ token }: TokenCardProps) => {
  return (
    <Card 
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3,
          cursor: 'pointer',
        },
        borderRadius: 2,
        background: '#ffffff',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={1}>
          <TokenIcon 
            sx={{ 
              fontSize: 32, 
              color: 'primary.main',
              marginRight: 2 
            }} 
          />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {token.name}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
            >
              {token.symbol}
            </Typography>
          </Box>
        </Box>

        <Box 
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            mt: 2
          }}
        >
          <Typography variant="h6">
            {token.raised} / {token.target}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
          >
            {token.raisedPercentage} Raised
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}; 