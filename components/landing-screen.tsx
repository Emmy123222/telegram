"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTonConnect } from "@/hooks/use-ton-connect"
import { Bitcoin, ArrowRightLeft, Clock, Shield, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LandingScreen() {
  const { connect, isConnecting, connectionError } = useTonConnect()

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Bitcoin className="h-6 w-6 text-amber-500" />
            tgBTC Request & Pay
          </CardTitle>
          <CardDescription>Send and request Bitcoin directly through Telegram</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Connect your TON wallet to start sending and requesting tgBTC payments securely through the TON blockchain.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
              <ArrowRightLeft className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">Fast Transfers</h3>
              <p className="text-xs text-muted-foreground">Send tgBTC in seconds</p>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
              <Shield className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">Secure Escrow</h3>
              <p className="text-xs text-muted-foreground">Smart contract protection</p>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
              <Clock className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">Time-locked</h3>
              <p className="text-xs text-muted-foreground">Auto-refund on expiry</p>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
              <Bitcoin className="h-8 w-8 mb-2 text-amber-500" />
              <h3 className="font-medium">Native tgBTC</h3>
              <p className="text-xs text-muted-foreground">TON Teleport integration</p>
            </div>
          </div>

          {connectionError && (
            <Alert variant="destructive">
              <AlertDescription>{connectionError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={connect} disabled={isConnecting} className="w-full" size="lg">
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect TON Wallet"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
