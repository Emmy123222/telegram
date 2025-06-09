"use client"

import { useEffect, useState } from "react"
import { useTonConnect } from "@/hooks/use-ton-connect"
import { Dashboard } from "@/components/dashboard"
import { LandingScreen } from "@/components/landing-screen"
import { LoadingScreen } from "@/components/loading-screen"
import { ConnectionStatus } from "@/components/connection-status"

declare global {
  interface Window {
    Telegram?: {
      WebApp: any
    }
  }
}

export default function Home() {
  const { connected, address } = useTonConnect()
  const [isLoading, setIsLoading] = useState(true)
  const [isTelegramWebAppReady, setIsTelegramWebAppReady] = useState(false)

  useEffect(() => {
    // Initialize Telegram WebApp
    const initTelegram = () => {
      if (typeof window !== "undefined" && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp
        try {
          tg.ready()
          tg.expand()
          setIsTelegramWebAppReady(true)
          console.log("Telegram WebApp initialized")
        } catch (error) {
          console.warn("Telegram WebApp initialization failed:", error)
          setIsTelegramWebAppReady(false)
        }
      } else {
        setIsTelegramWebAppReady(false)
      }
    }

    // Wait for Telegram script to load
    if (typeof window !== "undefined") {
      if (window.Telegram?.WebApp) {
        initTelegram()
      } else {
        const checkTelegram = setInterval(() => {
          if (window.Telegram?.WebApp) {
            initTelegram()
            clearInterval(checkTelegram)
          }
        }, 100)

        setTimeout(() => {
          clearInterval(checkTelegram)
          setIsTelegramWebAppReady(false)
        }, 3000)
      }
    }

    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-semibold">tgBTC Pay</h1>
          <ConnectionStatus />
        </div>

        {connected ? <Dashboard address={address} /> : <LandingScreen />}
      </div>
    </main>
  )
}
