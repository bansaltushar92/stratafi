'use client'

import { useWalletStatus } from '@/hooks/useWalletStatus'

export default function CreateTokenPage() {
  const { isConnected } = useWalletStatus()

  if (!isConnected) {
    return null // Will redirect to home via hook
  }

  return (
    // Your create token content
  )
} 