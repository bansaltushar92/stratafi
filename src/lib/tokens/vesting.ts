import { VestingSchedule, TokenWallet } from '@/types/database';

export interface VestingCalculation {
  totalVested: number;
  nextRelease: {
    amount: number;
    date: Date;
  } | null;
  remainingLocked: number;
}

export function calculateVestedAmount(
  wallet: TokenWallet,
  currentDate: Date = new Date()
): VestingCalculation {
  if (!wallet.vesting_schedule || !wallet.vesting_start || !wallet.vesting_end) {
    return {
      totalVested: 0,
      nextRelease: null,
      remainingLocked: wallet.locked_balance
    };
  }

  const schedule = wallet.vesting_schedule;
  const startDate = new Date(wallet.vesting_start);
  const endDate = new Date(wallet.vesting_end);
  const cliffDate = new Date(schedule.cliff_date);

  // If before cliff date, nothing is vested
  if (currentDate < cliffDate) {
    return {
      totalVested: 0,
      nextRelease: {
        amount: calculateReleaseAmount(wallet, schedule),
        date: cliffDate
      },
      remainingLocked: wallet.locked_balance
    };
  }

  // If after end date, everything is vested
  if (currentDate >= endDate) {
    return {
      totalVested: wallet.locked_balance,
      nextRelease: null,
      remainingLocked: 0
    };
  }

  // Calculate vested amount based on schedule
  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsed = currentDate.getTime() - startDate.getTime();
  const vestingProgress = elapsed / totalDuration;

  const totalVested = Math.floor(wallet.locked_balance * vestingProgress);
  const remainingLocked = wallet.locked_balance - totalVested;

  // Calculate next release
  const nextReleaseDate = getNextReleaseDate(currentDate, schedule);
  const nextReleaseAmount = nextReleaseDate ? calculateReleaseAmount(wallet, schedule) : 0;

  return {
    totalVested,
    nextRelease: nextReleaseDate ? {
      amount: nextReleaseAmount,
      date: nextReleaseDate
    } : null,
    remainingLocked
  };
}

function getNextReleaseDate(currentDate: Date, schedule: VestingSchedule): Date | null {
  const endDate = new Date(schedule.end_date);
  if (currentDate >= endDate) {
    return null;
  }

  const cliffDate = new Date(schedule.cliff_date);
  if (currentDate < cliffDate) {
    return cliffDate;
  }

  // Calculate next release based on frequency
  const nextDate = new Date(currentDate);
  switch (schedule.release_frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
  }

  return nextDate > endDate ? endDate : nextDate;
}

function calculateReleaseAmount(wallet: TokenWallet, schedule: VestingSchedule): number {
  const totalAmount = wallet.locked_balance;
  
  switch (schedule.release_frequency) {
    case 'daily':
      return Math.floor(totalAmount * (schedule.release_percentage / 100) / 365);
    case 'weekly':
      return Math.floor(totalAmount * (schedule.release_percentage / 100) / 52);
    case 'monthly':
      return Math.floor(totalAmount * (schedule.release_percentage / 100) / 12);
    default:
      return 0;
  }
} 