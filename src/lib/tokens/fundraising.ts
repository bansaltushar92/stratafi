import { Token, TokenStatus } from '@/types/database';

export interface FundraisingStatus {
  isActive: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  remainingTime: number | null; // in milliseconds
  progress: number; // 0 to 1
  minimumReached: boolean;
  canFinalize: boolean;
}

export function calculateFundraisingStatus(token: Token): FundraisingStatus {
  const now = new Date();
  const startDate = new Date(token.fundraising_start);
  const endDate = new Date(token.fundraising_end);
  
  const isStarted = now >= startDate;
  const isEnded = now >= endDate;
  const progress = token.amount_raised / token.target_raise;
  const minimumReached = progress >= 0.5; // 50% minimum threshold

  // Calculate remaining time if fundraising is active
  const remainingTime = isStarted && !isEnded 
    ? endDate.getTime() - now.getTime()
    : null;

  return {
    isActive: isStarted && !isEnded && token.status === 'fundraising',
    isCompleted: token.status === 'completed',
    isFailed: token.status === 'failed',
    remainingTime,
    progress,
    minimumReached,
    canFinalize: (isEnded || progress >= 1) && token.status === 'fundraising'
  };
}

export function getNextTokenStatus(token: Token): TokenStatus {
  const status = calculateFundraisingStatus(token);
  
  if (status.isCompleted) {
    return 'completed';
  }

  if (status.canFinalize) {
    return status.minimumReached ? 'completed' : 'failed';
  }

  if (status.isActive) {
    return 'fundraising';
  }

  return token.status;
}

export function calculateTokenDistribution(token: Token) {
  const totalTokens = token.initial_supply;
  
  return {
    tradeableTokens: Math.floor(totalTokens * 0.75), // 75% for trading
    lockedTokens: Math.floor(totalTokens * 0.25),    // 25% locked for vesting
    tokenPrice: token.amount_raised / totalTokens,    // Final token price
  };
}

export function getVestingSchedule(token: Token) {
  const now = new Date();
  const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  const threeMonthsFromNow = new Date(now.setMonth(now.getMonth() + 3));

  return {
    cliff_date: threeMonthsFromNow.toISOString(),
    end_date: oneYearFromNow.toISOString(),
    release_frequency: 'monthly' as const,
    release_percentage: 8.33, // ~100%/12 months
  };
}

export function validateFundraisingPeriod(
  startDate: Date,
  endDate: Date
): { valid: boolean; error?: string } {
  const now = new Date();
  const minDuration = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  const maxDuration = 21 * 24 * 60 * 60 * 1000; // 21 days in milliseconds
  
  if (startDate < now) {
    return {
      valid: false,
      error: 'Start date must be in the future'
    };
  }

  const duration = endDate.getTime() - startDate.getTime();
  
  if (duration < minDuration) {
    return {
      valid: false,
      error: 'Fundraising period must be at least 7 days'
    };
  }

  if (duration > maxDuration) {
    return {
      valid: false,
      error: 'Fundraising period cannot exceed 21 days'
    };
  }

  return { valid: true };
} 