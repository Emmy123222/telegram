"use client"

import { useTonConnect } from "@/hooks/use-ton-connect"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, Loader2 } from "lucide-react"

export function ConnectionStatus() {
  const { connected, isConnecting, connect, disconnect, address } = useTonConnect()

  if (isConnecting) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Connecting...
      </Badge>
    )
  }

  if (connected && address) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-200">
          <Wifi className="h-3 w-3" />
          Connected
        </Badge>
        <Button variant="ghost" size="sm" onClick={disconnect} className="text-xs h-6 px-2">
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button variant="outline" size="sm" onClick={connect} className="text-xs h-6 px-2">
      <WifiOff className="h-3 w-3 mr-1" />
      Connect
    </Button>
  )
}
