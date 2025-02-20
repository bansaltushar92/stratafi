import Link from "next/link";
import { Token } from '@/types/database';
import { listTokens, getTrendingTokens } from '@/lib/supabase/client';

export default async function DashboardPage() {
  const tokens = await listTokens();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Available Tokens</h1>
        <Link
          href="/dashboard/create"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Create Token
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tokens.map((token) => (
          <Link
            key={token.id}
            href={`/dashboard/tokens/${token.id}`}
            className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{token.name}</h2>
                <span className="text-gray-500 font-mono">{token.symbol}</span>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-2">{token.description}</p>
              <div className="flex justify-between text-sm">
                <div>
                  <span className="text-gray-500">Supply: </span>
                  <span className="font-medium">{token.total_supply}</span>
                </div>
                <div>
                  <span className="text-gray-500">Price: </span>
                  <span className="font-medium">{token.initial_price} USDC</span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {tokens.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No tokens available yet.</p>
            <Link
              href="/dashboard/create"
              className="text-indigo-600 hover:text-indigo-700 font-medium mt-2 inline-block"
            >
              Create your first token
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 