import { Loader2 } from "lucide-react"

export function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <h2 className="mt-4 text-xl font-medium">Loading tgBTC Request & Pay</h2>
      <p className="text-muted-foreground mt-2">Connecting to TON blockchain...</p>
    </div>
  )
}
