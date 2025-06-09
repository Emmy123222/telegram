"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createRequest } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Share2 } from "lucide-react"

interface CreateRequestFormProps {
  address: string | null
}

export function CreateRequestForm({ address }: CreateRequestFormProps) {
  const { toast } = useToast()
  const [amount, setAmount] = useState("")
  const [message, setMessage] = useState("")
  const [hasExpiration, setHasExpiration] = useState(false)
  const [expirationType, setExpirationType] = useState("24h")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestId, setRequestId] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a request",
        variant: "destructive",
      })
      return
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Calculate expiration time if needed
      let expiresAt = null
      if (hasExpiration) {
        const now = new Date()
        switch (expirationType) {
          case "1h":
            expiresAt = new Date(now.getTime() + 60 * 60 * 1000)
            break
          case "24h":
            expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)
            break
          case "72h":
            expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000)
            break
          case "7d":
            expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
            break
        }
      }

      // Create the request
      const result = await createRequest({
        senderAddress: address,
        amount: Number.parseFloat(amount),
        message: message.trim() || undefined,
        expiresAt: expiresAt?.toISOString(),
      })

      setRequestId(result.id)

      toast({
        title: "Request created successfully",
        description: "Your payment request has been created",
      })
    } catch (error) {
      console.error("Error creating request:", error)
      toast({
        title: "Failed to create request",
        description: "There was an error creating your request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleShare = () => {
    if (!requestId) return

    // Generate a shareable link using the Telegram bot
    const shareUrl = `https://t.me/your_bot_username/app?startapp=request_${requestId}`

    // Use Telegram WebApp to share if available
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.switchInlineQuery(`request_${requestId}`, ["users", "groups", "channels"])
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Link copied to clipboard",
        description: "Share this link with others to request payment",
      })
    }
  }

  const handleReset = () => {
    setAmount("")
    setMessage("")
    setHasExpiration(false)
    setExpirationType("24h")
    setRequestId(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Payment Request</CardTitle>
        <CardDescription>Request tgBTC from anyone on Telegram</CardDescription>
      </CardHeader>
      <CardContent>
        {requestId ? (
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted p-4 text-center">
              <h3 className="font-medium mb-2">Request Created Successfully!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Share this request with anyone on Telegram to receive payment
              </p>
              <Button onClick={handleShare} className="w-full">
                <Share2 className="mr-2 h-4 w-4" />
                Share Request
              </Button>
            </div>
            <Button variant="outline" onClick={handleReset} className="w-full">
              Create Another Request
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (tgBTC)</Label>
              <Input
                id="amount"
                type="number"
                step="0.00000001"
                min="0.00000001"
                placeholder="0.001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a note about this payment request"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="resize-none"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="expiration" checked={hasExpiration} onCheckedChange={setHasExpiration} />
              <Label htmlFor="expiration">Set expiration time</Label>
            </div>

            {hasExpiration && (
              <div className="space-y-2">
                <Label htmlFor="expirationType">Expires after</Label>
                <Select value={expirationType} onValueChange={setExpirationType}>
                  <SelectTrigger id="expirationType">
                    <SelectValue placeholder="Select expiration time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 hour</SelectItem>
                    <SelectItem value="24h">24 hours</SelectItem>
                    <SelectItem value="72h">3 days</SelectItem>
                    <SelectItem value="7d">7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form>
        )}
      </CardContent>
      {!requestId && (
        <CardFooter>
          <Button type="submit" className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Request
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
