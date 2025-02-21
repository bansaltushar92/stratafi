'use client'

import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useWalletStatus() {
  const { isConnected } = useAccount()
  const router = useRouter()

  useEffect(() => {
    // If user tries to access protected routes without connecting
    if (!isConnected) {
      router.push('/')
    }
  }, [isConnected, router])

  return { isConnected }
} 