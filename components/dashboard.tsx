"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RequestsList } from "@/components/requests-list"
import { CreateRequestForm } from "@/components/create-request-form"
import { PayRequest } from "@/components/pay-request"
import { useSearchParams } from "next/navigation"

interface DashboardProps {
  address: string | null
}

export function Dashboard({ address }: DashboardProps) {
  const searchParams = useSearchParams()
  const requestId = searchParams.get("requestId")
  const [activeTab, setActiveTab] = useState(requestId ? "pay" : "requests")

  return (
    <div className="space-y-4">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="pay" disabled={!requestId}>
            Pay
          </TabsTrigger>
        </TabsList>
        <TabsContent value="requests">
          <RequestsList address={address} />
        </TabsContent>
        <TabsContent value="create">
          <CreateRequestForm address={address} />
        </TabsContent>
        <TabsContent value="pay">
          <PayRequest requestId={requestId} address={address} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
