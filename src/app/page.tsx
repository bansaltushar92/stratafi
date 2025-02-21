'use client'

import Link from "next/link"
import { useAccount, useConnect } from 'wagmi'
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { coinbaseWallet } from 'wagmi/connectors'

export default function HomePage() {
  const router = useRouter()
  const { connect } = useConnect()
  const { isConnected, address } = useAccount()

  const handleConnect = useCallback(async () => {
    try {
      await connect({ connector: coinbaseWallet() })
      if (isConnected && address) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }, [connect, isConnected, address, router])

  return (
    <div className="bg-white">
      <div className="absolute inset-x-0 top-0 h-[32rem] bg-gradient-to-b from-indigo-200/85 via-purple-200/40 to-transparent" />
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Tokenize Your Trading Strategy
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Stratafi allows you to raise capital for your crypto trading strategies by tokenizing your trading account.
              Investors can participate in your success while maintaining full transparency and security.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button 
                onClick={handleConnect}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-lg px-8 py-4 rounded-lg font-medium shadow-button hover:shadow-lg transition-smooth"
              >
                {isConnected && address ? 
                  `Connected: ${address.slice(0, 6)}...${address.slice(-4)}` : 
                  'Get started with Base'
                }
              </button>
              <Link 
                href="/dashboard"
                className="text-lg px-6 py-4 font-medium text-gray-900 hover:text-purple-600 transition-smooth flex items-center"
              >
                Learn more <span aria-hidden="true" className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
