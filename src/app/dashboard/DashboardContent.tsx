'use client';

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { WalletButton } from "@/components/WalletButton";
import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function DashboardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`min-h-screen bg-gray-100 ${inter.className}`}>
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b">
            <Link href="/dashboard" className="text-xl font-bold text-gray-800 hover:text-indigo-600 transition-colors">
              Stratafi
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/dashboard" 
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <span className="mr-3">🔍</span>
                  Explore Tokens
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard/my-tokens" 
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <span className="mr-3">💎</span>
                  My Tokens
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard/investments" 
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <span className="mr-3">📈</span>
                  My Investments
                </Link>
              </li>
            </ul>
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t">
            <div className="flex items-center justify-between space-y-4">
              <UserButton afterSignOutUrl="/"/>
              <WalletButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Page Content */}
        <main>{children}</main>
      </div>
    </div>
  );
}