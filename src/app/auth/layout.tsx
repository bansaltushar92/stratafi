import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication - Stratafi',
  description: 'Sign in or create an account for Stratafi',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 