"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchRequestDetails, payRequest } from "@/lib/api"
import { type TgBtcRequest, RequestStatus } from "@/lib/types"
import { formatAmount, formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface PayRequestProps {
  requestId: string | null
  address: string | null
}

export function PayRequest({ requestId, address }: PayRequestProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [request, setRequest] = useState<TgBtcRequest | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (requestId) {
      setIsLoading(true)
      setError(null)

      fetchRequestDetails(requestId)
        .then((data) => {
          setRequest(data)
          setIsLoading(false)

          // Check if request is already paid or expired
          if (data.status === RequestStatus.COMPLETED) {
            setError("This request has already been paid")
          } else if (data.status === RequestStatus.EXPIRED) {
            setError("This request has expired")
          }
        })
        .catch((err) => {
          console.error("Error fetching request details:", err)
          setError("Failed to load request details")
          setIsLoading(false)
        })
    } else {
      setError("No request ID provided")
      setIsLoading(false)
    }
  }, [requestId])

  const handlePayRequest = async () => {
    if (!request || !address) return

    setIsSubmitting(true)
    setError(null)

    try {
      await payRequest(request.id, address)
      setIsSuccess(true)

      toast({
        title: "Payment successful",
        description: `You've successfully sent ${formatAmount(request.amount)} tgBTC`,
      })
    } catch (err) {
      console.error("Error paying request:", err)
      setError("Failed to process payment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p>Loading request details...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Request</CardTitle>
          <CardDescription>There was an issue with this request</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (isSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Successful</CardTitle>
          <CardDescription>Your payment has been processed</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">
              You've successfully sent {request && formatAmount(request.amount)} tgBTC to{" "}
              {request?.counterpartyName || request?.counterpartyAddress.slice(0, 8) + "..."}
            </AlertDescription>
          </Alert>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">The transaction has been recorded on the TON blockchain</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!request) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">No request data available</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Request</CardTitle>
        <CardDescription>Review and pay this tgBTC request</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-2xl font-bold">{formatAmount(request.amount)} tgBTC</div>
              <div className="text-sm text-muted-foreground">
                From: {request.counterpartyName || request.counterpartyAddress.slice(0, 8) + "..."}
              </div>
            </div>
            <div className="flex items-center text-amber-600">
              <Clock className="h-4 w-4 mr-1" />
              {request.expiresAt ? (
                <span className="text-xs">Expires: {formatDate(request.expiresAt)}</span>
              ) : (
                <span className="text-xs">No expiration</span>
              )}
            </div>
          </div>

          {request.message && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <div className="text-xs text-muted-foreground mb-1">Message:</div>
              <div className="text-sm">{request.message}</div>
            </div>
          )}
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            This payment will be processed through a secure smart contract on the TON blockchain.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handlePayRequest} disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Pay {formatAmount(request.amount)} tgBTC
        </Button>
      </CardFooter>
    </Card>
  )
}
