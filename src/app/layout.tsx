import { Inter } from 'next/font/google';
import './globals.css';
import { Metadata } from 'next';
import { Providers } from '@/components/WagmiProvider';

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
    <html lang="en" className={inter.className}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
