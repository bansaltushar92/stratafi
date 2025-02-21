'use client'

import Link from "next/link";
import { Token } from '@/types/database';
import { listTokens } from '@/lib/supabase/client';
import { TokenCard } from '@/components/tokens/TokenCard';
import { useWalletStatus } from '@/hooks/useWalletStatus'
import { useState, useEffect } from 'react'

export default function DashboardPage() {
  const { isConnected } = useWalletStatus()
  const [tokens, setTokens] = useState<Token[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTokens() {
      try {
        const fetchedTokens = await listTokens()
        setTokens(fetchedTokens)
      } catch (error) {
        console.error('Failed to fetch tokens:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isConnected) {
      fetchTokens()
    }
  }, [isConnected])

  if (!isConnected) {
    return null // Will redirect to home via hook
  }

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

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