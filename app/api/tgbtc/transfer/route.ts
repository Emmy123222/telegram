import { type NextRequest, NextResponse } from "next/server"
import { TonClient, Address, internal } from "@ton/ton"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const tonClient = new TonClient({
  endpoint: process.env.TON_ENDPOINT || "https://testnet.toncenter.com/api/v2/jsonRPC",
  apiKey: process.env.TON_API_KEY,
})

const TGBTC_CONTRACT_ADDRESS = "EQBvW8Z5huBkMJYdnfAEM5JqTNkuWX3diqYENkWsIL0XggGG"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { from_address, to_address, amount, request_id } = body

    if (!from_address || !to_address || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate addresses
    const fromAddr = Address.parse(from_address)
    const toAddr = Address.parse(to_address)
    const tgBtcContract = Address.parse(TGBTC_CONTRACT_ADDRESS)

    // Convert amount to satoshis
    const amountSatoshis = Math.floor(Number.parseFloat(amount) * 100000000)

    // Create transfer message for tgBTC contract
    const transferMessage = internal({
      to: tgBtcContract,
      value: "0.05", // Gas fee for the transfer
      body: createTgBtcTransferBody(fromAddr, toAddr, BigInt(amountSatoshis)),
    })

    // In a real implementation, this would be signed by the user's wallet
    // For now, we'll simulate the transaction
    const transactionHash = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Update the payment request status
    if (request_id) {
      const { error } = await supabase
        .from("payment_requests")
        .update({
          status: "completed",
          transaction_hash: transactionHash,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", request_id)

      if (error) {
        console.error("Failed to update request:", error)
      }
    }

    // Log the transaction
    await supabase.from("transactions").insert({
      transaction_hash: transactionHash,
      from_address,
      to_address,
      amount: amountSatoshis,
      token_type: "tgBTC",
      status: "completed",
      request_id,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      transaction_hash: transactionHash,
      status: "completed",
      amount: amount,
      from_address,
      to_address,
    })
  } catch (error) {
    console.error("Transfer error:", error)
    return NextResponse.json({ error: "Failed to process transfer" }, { status: 500 })
  }
}

function createTgBtcTransferBody(from: Address, to: Address, amount: bigint): string {
  // This would create the proper message body for tgBTC transfer
  // The actual implementation depends on the tgBTC contract ABI
  return `transfer:${to.toString()}:${amount.toString()}`
}
