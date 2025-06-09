"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RequestItem } from "@/components/request-item"
import { fetchRequests } from "@/lib/api"
import type { TgBtcRequest } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

interface RequestsListProps {
  address: string | null
}

export function RequestsList({ address }: RequestsListProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [sentRequests, setSentRequests] = useState<TgBtcRequest[]>([])
  const [receivedRequests, setReceivedRequests] = useState<TgBtcRequest[]>([])

  useEffect(() => {
    if (address) {
      setIsLoading(true)

      // In a real app, we would fetch from the blockchain or backend
      fetchRequests(address)
        .then((data) => {
          setSentRequests(data.sent)
          setReceivedRequests(data.received)
          setIsLoading(false)
        })
        .catch((error) => {
          console.error("Error fetching requests:", error)
          setIsLoading(false)
        })
    }
  }, [address])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Requests</CardTitle>
        <CardDescription>View and manage your tgBTC payment requests</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="received" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received">Received</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
          </TabsList>
          <TabsContent value="received">
            {isLoading ? (
              <RequestsLoadingSkeleton />
            ) : receivedRequests.length > 0 ? (
              <div className="space-y-3 mt-4">
                {receivedRequests.map((request) => (
                  <RequestItem key={request.id} request={request} type="received" />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No received requests found</div>
            )}
          </TabsContent>
          <TabsContent value="sent">
            {isLoading ? (
              <RequestsLoadingSkeleton />
            ) : sentRequests.length > 0 ? (
              <div className="space-y-3 mt-4">
                {sentRequests.map((request) => (
                  <RequestItem key={request.id} request={request} type="sent" />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No sent requests found</div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function RequestsLoadingSkeleton() {
  return (
    <div className="space-y-3 mt-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  )
}
