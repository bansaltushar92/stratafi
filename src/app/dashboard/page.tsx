import Link from "next/link";
import { Token } from '@/types/database';
import { listTokens, getTrendingTokens } from '@/lib/supabase/client';
import { TokenCard } from '@/components/tokens/TokenCard';

export default async function DashboardPage() {
  const tokens = await listTokens();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Available Tokens</h1>
        <Link
          href="/dashboard/create"
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-lg px-8 py-3 rounded-lg font-medium shadow-button hover:shadow-lg transition-smooth"
        >
          Create Token
        </Link>
      </div>
      <div className="card-grid">
        {tokens.map((token) => (
          <TokenCard key={token.id} token={token} />
        ))}
      </div>
    </div>
  );
} 