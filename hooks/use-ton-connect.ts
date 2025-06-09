"use client"

import { useTonConnectUI, useTonWallet, useTonAddress } from "@tonconnect/ui-react"
import { useEffect, useState, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

export function useTonConnect() {
  const [tonConnectUI] = useTonConnectUI()
  const wallet = useTonWallet()
  const address = useTonAddress()
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const { toast } = useToast()

  const connected = !!wallet
  const userFriendlyAddress = address

  const connect = useCallback(async () => {
    if (isConnecting || connected) return

    setIsConnecting(true)
    setConnectionError(null)

    try {
      // Clear any previous errors
      setConnectionError(null)

      // Open the connection modal
      tonConnectUI.openModal()
    } catch (error: any) {
      console.error("Connection error:", error)
      const errorMessage = error?.message || "Failed to connect wallet"
      setConnectionError(errorMessage)

      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      })
      setIsConnecting(false)
    }
  }, [tonConnectUI, isConnecting, connected, toast])

  const disconnect = useCallback(async () => {
    try {
      await tonConnectUI.disconnect()
      setConnectionError(null)
      setIsConnecting(false)
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
      })
    } catch (error: any) {
      console.error("Disconnect error:", error)
      toast({
        title: "Disconnect Failed",
        description: error?.message || "Failed to disconnect wallet",
        variant: "destructive",
      })
    }
  }, [tonConnectUI, toast])

  // Handle connection status changes
  useEffect(() => {
    const unsubscribe = tonConnectUI.onStatusChange((walletInfo) => {
      setIsConnecting(false)

      if (walletInfo) {
        console.log("Wallet connected:", walletInfo.account.address)
        setConnectionError(null)
        toast({
          title: "Wallet Connected",
          description: `Connected to ${walletInfo.account.address.slice(0, 8)}...${walletInfo.account.address.slice(-6)}`,
        })
      } else {
        console.log("Wallet disconnected")
        setConnectionError(null)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [tonConnectUI, toast])

  // Handle modal state changes
  useEffect(() => {
    const unsubscribe = tonConnectUI.onModalStateChange((state) => {
      if (state.status === "closed" && !connected && isConnecting) {
        setIsConnecting(false)
        if (state.closeReason === "user-action") {
          // Don't show error for user cancellation
          console.log("Connection cancelled by user")
        }
      }
    })

    return () => {
      unsubscribe()
    }
  }, [tonConnectUI, connected, isConnecting])

  // Handle connection errors
  useEffect(() => {
    const handleError = (error: any) => {
      console.error("TON Connect error:", error)
      setIsConnecting(false)

      // Don't show manifest errors to users
      if (error?.message?.includes("manifest") || error?.message?.includes("404")) {
        console.warn("Manifest error (handled internally):", error)
        return
      }

      setConnectionError(error?.message || "Connection failed")
    }

    // Listen for any unhandled errors
    window.addEventListener("unhandledrejection", (event) => {
      if (event.reason?.message?.includes("tonconnect") || event.reason?.message?.includes("manifest")) {
        event.preventDefault() // Prevent console error
        handleError(event.reason)
      }
    })

    return () => {
      window.removeEventListener("unhandledrejection", handleError)
    }
  }, [])

  return {
    connected,
    wallet,
    address: userFriendlyAddress,
    isConnecting,
    connectionError,
    connect,
    disconnect,
    tonConnectUI,
  }
}
