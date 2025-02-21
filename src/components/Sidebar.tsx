'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MagnifyingGlassIcon, SparklesIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="p-6 space-y-6">
      <Link href="/" className="block">
        <h1 className="text-2xl font-bold mb-8 hover:text-purple-600 transition-colors">Stratafi</h1>
      </Link>
      
      <div className="space-y-4">
        <Link 
          href="/dashboard" 
          className={`flex items-center text-xl p-3 rounded-lg transition-colors ${
            pathname === '/dashboard' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <MagnifyingGlassIcon className="w-7 h-7 mr-3" />
          Explore Tokens
        </Link>

        <Link 
          href="/dashboard/my-tokens" 
          className={`flex items-center text-xl p-3 rounded-lg transition-colors ${
            pathname === '/dashboard/my-tokens' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <SparklesIcon className="w-7 h-7 mr-3" />
          My Tokens
        </Link>

        <Link 
          href="/dashboard/investments" 
          className={`flex items-center text-xl p-3 rounded-lg transition-colors ${
            pathname === '/dashboard/investments' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <ChartBarIcon className="w-7 h-7 mr-3" />
          My Investments
        </Link>
      </div>
    </nav>
  );
} 