import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { TonClient } from "@ton/ton"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const tonClient = new TonClient({
  endpoint: process.env.TON_ENDPOINT || "https://testnet.toncenter.com/api/v2/jsonRPC",
  apiKey: process.env.TON_API_KEY,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")
    const type = searchParams.get("type") // 'sent' or 'received'

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    let query = supabase.from("payment_requests").select(`
        *,
        sender_profile:profiles!payment_requests_sender_address_fkey(username, first_name),
        receiver_profile:profiles!payment_requests_receiver_address_fkey(username, first_name)
      `)

    if (type === "sent") {
      query = query.eq("sender_address", address)
    } else if (type === "received") {
      query = query.eq("receiver_address", address)
    } else {
      query = query.or(`sender_address.eq.${address},receiver_address.eq.${address}`)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
    }

    return NextResponse.json({ requests: data })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sender_address, receiver_address, amount, message, expires_at, contract_address } = body

    // Validate required fields
    if (!sender_address || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert into database
    const { data, error } = await supabase
      .from("payment_requests")
      .insert({
        sender_address,
        receiver_address,
        amount,
        message,
        expires_at,
        contract_address,
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to create request" }, { status: 500 })
    }

    return NextResponse.json({ request: data })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
