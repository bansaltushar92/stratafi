# TokenX - Detailed Product Requirements Document

## Overview
TokenX is a platform that enables users to tokenize their trading strategies through a decentralized token offering system. The platform allows asset managers to raise capital by creating tokens that represent their trading strategies, while investors can participate in these strategies by purchasing tokens during fundraising rounds.

## Product Goals
1. Provide a secure and transparent platform for tokenizing trading strategies
2. Enable seamless fundraising for asset managers
3. Offer investors easy access to diverse trading strategies
4. Ensure compliance with regulatory requirements
5. Create a liquid market for trading strategy tokens

## Target Users
1. **Asset Managers**
   - Professional traders
   - Trading strategy developers
   - Fund managers

2. **Investors**
   - Retail investors
   - Crypto enthusiasts
   - Investment firms

## 1. Token Creation & Management

### Token Creation Flow
1. **Initial Setup**
   - Form validation requirements:
     - Name: 1-50 characters, alphanumeric
     - Symbol: 2-10 characters, uppercase letters
     - Description: Optional, max 500 characters
     - Initial Supply: Minimum 100,000 tokens
     - Target Raise: Minimum 1,000 USDC
     - Price Per Token: Minimum 0.001 USDC

2. **Token Features Configuration**
   ```typescript
   interface TokenFeatures {
     burnable: boolean;    // Can tokens be burned
     mintable: boolean;    // Can new tokens be minted
     freezable: boolean;   // Can transfers be frozen
   }
   ```

3. **Token Distribution Structure**
   - 70% Available for Trading
   - 30% Performance Based Reward
   - Locked periods:
     - Performance tokens: 12 months lock
     - Trading tokens: Released based on vesting schedule

### Token Lifecycle States
```typescript
enum TokenStatus {
  PENDING = "pending",      // Initial state after creation
  FUNDRAISING = "fundraising", // Active fundraising period
  COMPLETED = "completed",   // Fundraising target reached
  TRADING = "trading",      // Active trading phase
  FAILED = "failed"         // Fundraising unsuccessful
}
```

### Status Transition Rules
1. **Pending → Fundraising**
   - Required conditions:
     - Smart contract deployed
     - Token wallet created
     - Initial liquidity provided

2. **Fundraising → Completed**
   - Automatic transition when:
     - Target raise amount reached
     - OR fundraising period ends with minimum threshold met

3. **Completed → Trading**
   - Required conditions:
     - Token distribution completed
     - Trading pool initialized
     - Price oracle activated

## 2. Investment Interface

### Wallet Integration
```typescript
interface WalletConfig {
  supportedWallets: [
    'Phantom',
    'Solflare',
    'Torus'
  ];
  network: 'devnet' | 'testnet' | 'mainnet-beta';
  requiredConfirmations: 1;
}
```

### Investment Process
1. **Pre-investment Checks**
   ```typescript
   interface InvestmentChecks {
     minimumAmount: 1;           // USDC
     maximumAmount: 100000;      // USDC
     userKycRequired: boolean;
     walletBalanceRequired: number;
     allowedRegions: string[];
   }
   ```

2. **Transaction Flow**
   ```typescript
   interface InvestmentTransaction {
     tokenId: string;
     investorWallet: string;
     amount: number;
     expectedTokens: number;
     timestamp: Date;
     status: 'pending' | 'completed' | 'failed';
     transactionHash?: string;
   }
   ```

3. **Post-investment Actions**
   - Update token metrics
   - Create holder record
   - Update fundraising progress
   - Trigger status transitions if needed

## 3. User Interface Components

### Token Details Page
```typescript
interface TokenDetailsView {
  header: {
    name: string;
    symbol: string;
    description: string;
    status: TokenStatus;
    statusColor: {
      trading: 'green',
      fundraising: 'blue',
      completed: 'purple',
      pending: 'yellow',
      failed: 'red'
    };
  };
  
  metrics: {
    currentPrice: number;
    priceHistory: PricePoint[];
    marketCap: number;
    volume24h: number;
    holders: number;
  };

  fundraising: {
    target: number;
    raised: number;
    progress: number;
    remainingTime?: number;
    minContribution: number;
    maxContribution: number;
  };

  distribution: {
    tradingSupply: number;
    performanceReward: number;
    totalSupply: number;
    circulatingSupply: number;
  };
}
```

### Investment Form
```typescript
interface InvestmentForm {
  input: {
    type: 'number';
    min: 1;
    step: 0.000001;
    placeholder: 'Enter amount to invest';
    validation: {
      required: true;
      min: 1;
      max: (token) => token.target_raise - token.amount_raised;
    };
  };

  display: {
    tokenAmount: {
      calculation: (amount) => amount / token.price_per_token;
      formatting: 'toLocaleString';
      updateFrequency: 'onChange';
    };
    tokenPrice: {
      display: `${token.price_per_token} USDC`;
      formatting: 'currency';
    };
  };

  button: {
    states: {
      default: 'Invest Now';
      loading: 'Processing...';
      disabled: boolean;
    };
    styling: {
      background: 'indigo-600';
      hover: 'indigo-700';
      text: 'white';
      width: 'full';
    };
  };
}
```

## 4. Database Schema

### Token Table
```sql
CREATE TABLE tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  token_address VARCHAR(44),
  name VARCHAR(50) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  description TEXT,
  initial_supply BIGINT NOT NULL,
  target_raise DECIMAL NOT NULL,
  price_per_token DECIMAL NOT NULL,
  creator_wallet VARCHAR(44) NOT NULL,
  status token_status NOT NULL DEFAULT 'pending',
  amount_raised DECIMAL DEFAULT 0,
  is_burnable BOOLEAN DEFAULT false,
  is_mintable BOOLEAN DEFAULT false,
  CONSTRAINT valid_target_raise CHECK (target_raise > 0),
  CONSTRAINT valid_price CHECK (price_per_token > 0)
);
```

### Price History Table
```sql
CREATE TABLE token_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_id UUID REFERENCES tokens(id),
  price DECIMAL NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  volume DECIMAL DEFAULT 0,
  CONSTRAINT valid_price CHECK (price > 0)
);
```

### Token Holders Table
```sql
CREATE TABLE token_holders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_id UUID REFERENCES tokens(id),
  wallet_address VARCHAR(44) NOT NULL,
  balance DECIMAL NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_balance CHECK (balance >= 0)
);
```

## 5. API Endpoints

### Token Management
```typescript
interface TokenAPI {
  create: {
    method: 'POST';
    path: '/api/tokens';
    auth: 'required';
    body: TokenCreate;
    response: Token;
  };

  list: {
    method: 'GET';
    path: '/api/tokens';
    query: {
      status?: TokenStatus;
      creator?: string;
      page?: number;
      limit?: number;
    };
    response: Token[];
  };

  getDetails: {
    method: 'GET';
    path: '/api/tokens/:id';
    response: TokenDetails;
  };

  contribute: {
    method: 'POST';
    path: '/api/tokens/:id/contribute';
    auth: 'required';
    body: ContributionCreate;
    response: ContributionResult;
  };
}
```

## 6. Security Requirements

### Authentication & Authorization
1. **User Authentication**
   - Clerk integration for user management
   - JWT-based session handling
   - Multi-factor authentication support

2. **Wallet Authentication**
   - Message signing for wallet verification
   - Transaction signing requirements
   - Wallet address validation

3. **Authorization Levels**
   ```typescript
   enum UserRole {
     USER = "user",
     ASSET_MANAGER = "asset_manager",
     ADMIN = "admin"
   }
   ```

### Smart Contract Security
1. **Contract Deployment**
   - Audited contract templates
   - Automated security checks
   - Multi-signature requirements for critical operations

2. **Transaction Security**
   - Rate limiting
   - Amount validation
   - Slippage protection
   - Front-running prevention

## 7. Integration Requirements

### Blockchain Integration
1. **Solana Network**
   - RPC node configuration
   - Program deployment
   - Transaction monitoring
   - Error handling

2. **Token Program**
   - SPL Token integration
   - Custom token creation
   - Transfer handling
   - Metadata management

### External Services
1. **Supabase**
   - Real-time updates
   - Data synchronization
   - Backup strategy
   - Rate limiting

2. **Modal Deployment**
   - Serverless functions
   - API routing
   - Error handling
   - Monitoring

## 8. Performance Requirements

### Response Times
- API endpoints: < 500ms
- Page load: < 2s
- Transaction confirmation: < 5s
- Real-time updates: < 100ms

### Scalability
- Support for 100,000+ users
- Handle 1,000+ concurrent transactions
- Store millions of price points
- Manage thousands of tokens

## 9. Monitoring & Analytics

### System Monitoring
1. **Performance Metrics**
   - API response times
   - Transaction success rates
   - Error rates
   - Resource utilization

2. **User Metrics**
   - Active users
   - Transaction volume
   - Token creation rate
   - Investment patterns

### Analytics Dashboard
1. **Platform Statistics**
   - Total value locked
   - Active tokens
   - Daily volume
   - User growth

2. **Token Analytics**
   - Price performance
   - Holder distribution
   - Trading volume
   - Investment flow

## 10. Launch Phases

### Phase 1: Alpha (Current)
- Core token creation
- Basic fundraising
- Essential wallet integration
- Initial security features

### Phase 2: Beta
- Enhanced trading features
- Additional wallet support
- Performance tracking
- Advanced security measures

### Phase 3: Production
- Full feature set
- Mainnet deployment
- Complete security audit
- Marketing launch

## 11. Future Considerations

### Platform Expansion
1. **Additional Features**
   - Secondary market trading
   - Advanced analytics
   - Social features
   - Mobile app

2. **Technical Improvements**
   - Layer 2 scaling
   - Cross-chain support
   - Advanced trading features
   - AI/ML integration

### Regulatory Compliance
1. **KYC/AML Integration**
   - Identity verification
   - Transaction monitoring
   - Reporting requirements
   - Compliance documentation

2. **Legal Framework**
   - Terms of service
   - Privacy policy
   - Token holder rights
   - Dispute resolution 