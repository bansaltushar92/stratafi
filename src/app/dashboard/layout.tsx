import { Metadata } from 'next';
import DashboardContent from '@/app/dashboard/DashboardContent';

export const metadata: Metadata = {
  title: 'Stratafi - Tokenized Trading Accounts',
  description: 'Raise money for your crypto trading strategies through tokenized trading accounts.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardContent>{children}</DashboardContent>;
} 