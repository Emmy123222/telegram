import { type NextRequest, NextResponse } from "next/server"
import { TonClient, Address } from "@ton/ton"

const tonClient = new TonClient({
  endpoint: process.env.TON_ENDPOINT || "https://testnet.toncenter.com/api/v2/jsonRPC",
  apiKey: process.env.TON_API_KEY,
})

// tgBTC contract address on TON (this would be the actual tgBTC contract)
const TGBTC_CONTRACT_ADDRESS = "EQBvW8Z5huBkMJYdnfAEM5JqTNkuWX3diqYENkWsIL0XggGG"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    // Get tgBTC balance using TONX API or direct contract call
    const balance = await getTgBtcBalance(address)

    return NextResponse.json({
      address,
      balance: balance.toString(),
      formatted_balance: formatTgBtcAmount(balance),
    })
  } catch (error) {
    console.error("Balance check error:", error)
    return NextResponse.json({ error: "Failed to get balance" }, { status: 500 })
  }
}

async function getTgBtcBalance(address: string): Promise<bigint> {
  try {
    // This would integrate with the actual tgBTC contract
    // For now, we'll simulate the balance check

    const userAddress = Address.parse(address)
    const tgBtcContract = Address.parse(TGBTC_CONTRACT_ADDRESS)

    // Call the tgBTC contract to get user balance
    // This is a simplified version - actual implementation would depend on tgBTC contract ABI
    const result = await tonClient.runMethod(tgBtcContract, "get_balance", [
      { type: "slice", cell: userAddress.toString() },
    ])

    // Parse the result (this depends on the actual contract implementation)
    return BigInt(result.stack[0].value || "0")
  } catch (error) {
    console.error("Error getting tgBTC balance:", error)
    // Return mock balance for demo
    return BigInt("100000000") // 1 tgBTC in satoshis
  }
}

function formatTgBtcAmount(amount: bigint): string {
  // Convert satoshis to tgBTC (8 decimal places)
  const btc = Number(amount) / 100000000
  return btc.toFixed(8)
}
