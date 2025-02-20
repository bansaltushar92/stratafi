import { Inter } from 'next/font/google';
import './globals.css';
import { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { SolanaWalletProvider } from '@/components/WalletProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Stratafi - Tokenized Trading Accounts',
  description: 'Raise money for your crypto trading strategies through tokenized trading accounts.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <SolanaWalletProvider>
            {children}
          </SolanaWalletProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
