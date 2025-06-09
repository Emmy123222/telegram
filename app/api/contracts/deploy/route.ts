import { type NextRequest, NextResponse } from "next/server"
import { TonClient, WalletContractV4, internal } from "@ton/ton"
import { mnemonicToPrivateKey } from "@ton/crypto"
import { Address } from "@ton/core"
import { supabaseAdmin as supabase } from "@/lib/supabase"

const tonClient = new TonClient({
  endpoint: process.env.TON_ENDPOINT || "https://testnet.toncenter.com/api/v2/jsonRPC",
  apiKey: process.env.TON_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sender_address, receiver_address, amount, message, expires_at, request_id } = body

    // Deploy smart contract
    const deployerMnemonic = process.env.DEPLOYER_MNEMONIC?.split(" ")
    if (!deployerMnemonic) {
      return NextResponse.json({ error: "Deployer mnemonic not configured" }, { status: 500 })
    }

    const keyPair = await mnemonicToPrivateKey(deployerMnemonic)
    const wallet = WalletContractV4.create({
      publicKey: keyPair.publicKey,
      workchain: 0,
    })

    // Compile Tact contract (in production, this would be pre-compiled)
    const contractCode = await compileContract({
      sender: sender_address,
      receiver: receiver_address,
      amount: amount,
      message: message,
      expiresAt: expires_at ? Math.floor(new Date(expires_at).getTime() / 1000) : null,
    })

    // Calculate contract address
    const contractAddress = contractCode.address

    // Create deployment message
    const deployMessage = internal({
      to: contractAddress,
      value: "0.1", // Deployment fee
      init: {
        code: contractCode.code,
        data: contractCode.data,
      },
      body: "Deploy",
    })

    // Send deployment transaction
    const walletContract = tonClient.open(wallet)
    const seqno = await walletContract.getSeqno()

    await walletContract.sendTransfer({
      secretKey: keyPair.secretKey,
      seqno: seqno,
      messages: [deployMessage],
    })

    // Wait for deployment confirmation
    let currentSeqno = seqno
    while (currentSeqno === seqno) {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      currentSeqno = await walletContract.getSeqno()
    }

    // Update request with contract address
    const { error } = await supabase
      .from("payment_requests")
      .update({
        contract_address: contractAddress.toString(),
        status: "deployed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", request_id)

    if (error) {
      console.error("Failed to update request:", error)
    }

    return NextResponse.json({
      contract_address: contractAddress.toString(),
      transaction_hash: `${seqno + 1}`, // Simplified for demo
    })
  } catch (error) {
    console.error("Contract deployment error:", error)
    return NextResponse.json({ error: "Failed to deploy contract" }, { status: 500 })
  }
}

async function compileContract(params: any) {
  // This is a simplified version - in production you'd use the actual Tact compiler
  // For now, we'll return mock data
  return {
    code: Buffer.from("mock_contract_code"),
    data: Buffer.from("mock_contract_data"),
    address: Address.parse("EQBvW8Z5huBkMJYdnfAEM5JqTNkuWX3diqYENkWsIL0XggGG"),
  }
}
