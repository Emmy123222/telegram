import { type NextRequest, NextResponse } from "next/server"
import { TonClient, Address } from "@ton/ton"
import { supabaseAdmin as supabase } from "@/lib/supabase"

const tonClient = new TonClient({
  endpoint: process.env.TON_ENDPOINT || "https://testnet.toncenter.com/api/v2/jsonRPC",
  apiKey: process.env.TON_API_KEY,
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase
      .from("payment_requests")
      .select(`
        *,
        sender_profile:profiles!payment_requests_sender_address_fkey(username, first_name),
        receiver_profile:profiles!payment_requests_receiver_address_fkey(username, first_name)
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    // Check contract status on blockchain if contract address exists
    if (data.contract_address) {
      try {
        const contractAddress = Address.parse(data.contract_address)
        const contractState = await tonClient.getContractState(contractAddress)

        // Update status based on blockchain state
        if (contractState.state === "active") {
          // Contract is deployed and active
          // You would call contract methods here to check payment status
        }
      } catch (contractError) {
        console.error("Contract check error:", contractError)
      }
    }

    return NextResponse.json({ request: data })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { status, transaction_hash, paid_at } = body

    const { data, error } = await supabase
      .from("payment_requests")
      .update({
        status,
        transaction_hash,
        paid_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to update request" }, { status: 500 })
    }

    return NextResponse.json({ request: data })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
