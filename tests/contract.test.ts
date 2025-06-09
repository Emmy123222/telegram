import { ContractDeployer } from "../lib/contract-deployment"
import { TgBtcService } from "../lib/tgbtc-service"

// Test configuration
const TEST_CONFIG = {
  tonEndpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
  tonApiKey: process.env.TON_API_KEY,
  deployerMnemonic: process.env.DEPLOYER_MNEMONIC?.split(" "),
  testAddresses: {
    sender: "EQBvW8Z5huBkMJYdnfAEM5JqTNkuWX3diqYENkWsIL0XggGG",
    receiver: "EQD__________________________________________0vo",
  },
}

async function testContractDeployment() {
  console.log("🧪 Testing Contract Deployment...")

  try {
    const deployer = new ContractDeployer(TEST_CONFIG.tonEndpoint, TEST_CONFIG.tonApiKey, TEST_CONFIG.deployerMnemonic)

    const deploymentParams = {
      senderAddress: TEST_CONFIG.testAddresses.sender,
      receiverAddress: TEST_CONFIG.testAddresses.receiver,
      amount: 0.001,
      message: "Test payment request",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }

    console.log("📝 Deploying contract with params:", deploymentParams)

    const result = await deployer.deployPaymentRequestContract(deploymentParams)

    console.log("✅ Contract deployed successfully!")
    console.log("📍 Contract Address:", result.contractAddress)
    console.log("🔗 Transaction Hash:", result.transactionHash)

    // Test contract state
    const state = await deployer.getContractState(result.contractAddress)
    console.log("📊 Contract State:", state)

    return result
  } catch (error) {
    console.error("❌ Contract deployment test failed:", error)
    throw error
  }
}

async function testTgBtcIntegration() {
  console.log("🧪 Testing tgBTC Integration...")

  try {
    const tgBtcService = new TgBtcService(TEST_CONFIG.tonEndpoint, TEST_CONFIG.tonApiKey)

    // Test balance check
    console.log("💰 Checking tgBTC balance...")
    const balance = await tgBtcService.getBalance(TEST_CONFIG.testAddresses.sender)
    console.log("✅ Balance retrieved:", balance)

    // Test address validation
    console.log("🔍 Testing address validation...")
    const isValidSender = await tgBtcService.validateAddress(TEST_CONFIG.testAddresses.sender)
    const isValidReceiver = await tgBtcService.validateAddress(TEST_CONFIG.testAddresses.receiver)
    const isInvalidAddress = await tgBtcService.validateAddress("invalid_address")

    console.log("✅ Address validation results:")
    console.log("  - Sender address valid:", isValidSender)
    console.log("  - Receiver address valid:", isValidReceiver)
    console.log("  - Invalid address valid:", isInvalidAddress)

    // Test fee estimation
    console.log("💸 Estimating transfer fee...")
    const fee = await tgBtcService.estimateTransferFee("0.001")
    console.log("✅ Estimated fee:", fee, "TON")

    return { balance, fee }
  } catch (error) {
    console.error("❌ tgBTC integration test failed:", error)
    throw error
  }
}

async function testApiEndpoints() {
  console.log("🧪 Testing API Endpoints...")

  const baseUrl = "http://localhost:3000/api"

  try {
    // Test create request
    console.log("📝 Testing request creation...")
    const createResponse = await fetch(`${baseUrl}/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender_address: TEST_CONFIG.testAddresses.sender,
        receiver_address: TEST_CONFIG.testAddresses.receiver,
        amount: 0.001,
        message: "Test API request",
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }),
    })

    if (!createResponse.ok) {
      throw new Error(`Create request failed: ${createResponse.statusText}`)
    }

    const createResult = await createResponse.json()
    console.log("✅ Request created:", createResult.request.id)

    // Test get requests
    console.log("📋 Testing request retrieval...")
    const getResponse = await fetch(`${baseUrl}/requests?address=${TEST_CONFIG.testAddresses.sender}&type=sent`)

    if (!getResponse.ok) {
      throw new Error(`Get requests failed: ${getResponse.statusText}`)
    }

    const getResult = await getResponse.json()
    console.log("✅ Retrieved", getResult.requests.length, "requests")

    // Test get specific request
    console.log("🔍 Testing specific request retrieval...")
    const specificResponse = await fetch(`${baseUrl}/requests/${createResult.request.id}`)

    if (!specificResponse.ok) {
      throw new Error(`Get specific request failed: ${specificResponse.statusText}`)
    }

    const specificResult = await specificResponse.json()
    console.log("✅ Retrieved specific request:", specificResult.request.id)

    // Test balance endpoint
    console.log("💰 Testing balance endpoint...")
    const balanceResponse = await fetch(`${baseUrl}/tgbtc/balance?address=${TEST_CONFIG.testAddresses.sender}`)

    if (!balanceResponse.ok) {
      throw new Error(`Balance check failed: ${balanceResponse.statusText}`)
    }

    const balanceResult = await balanceResponse.json()
    console.log("✅ Balance retrieved:", balanceResult.formatted_balance, "tgBTC")

    return { createResult, getResult, specificResult, balanceResult }
  } catch (error) {
    console.error("❌ API endpoint test failed:", error)
    throw error
  }
}

async function testFullPaymentFlow() {
  console.log("🧪 Testing Full Payment Flow...")

  try {
    // 1. Create payment request
    console.log("1️⃣ Creating payment request...")
    const deployer = new ContractDeployer(TEST_CONFIG.tonEndpoint, TEST_CONFIG.tonApiKey, TEST_CONFIG.deployerMnemonic)

    const contractResult = await deployer.deployPaymentRequestContract({
      senderAddress: TEST_CONFIG.testAddresses.sender,
      receiverAddress: TEST_CONFIG.testAddresses.receiver,
      amount: 0.001,
      message: "Full flow test payment",
    })

    console.log("✅ Contract deployed:", contractResult.contractAddress)

    // 2. Check initial balances
    console.log("2️⃣ Checking initial balances...")
    const tgBtcService = new TgBtcService(TEST_CONFIG.tonEndpoint, TEST_CONFIG.tonApiKey)

    const senderBalance = await tgBtcService.getBalance(TEST_CONFIG.testAddresses.sender)
    const receiverBalance = await tgBtcService.getBalance(TEST_CONFIG.testAddresses.receiver)

    console.log("✅ Initial balances:")
    console.log("  - Sender:", senderBalance.formattedBalance, "tgBTC")
    console.log("  - Receiver:", receiverBalance.formattedBalance, "tgBTC")

    // 3. Process payment
    console.log("3️⃣ Processing payment...")
    const transferResult = await tgBtcService.transfer(
      TEST_CONFIG.testAddresses.sender,
      TEST_CONFIG.testAddresses.receiver,
      "0.001",
    )

    console.log("✅ Payment processed:", transferResult.transactionHash)

    // 4. Check final balances
    console.log("4️⃣ Checking final balances...")
    const finalSenderBalance = await tgBtcService.getBalance(TEST_CONFIG.testAddresses.sender)
    const finalReceiverBalance = await tgBtcService.getBalance(TEST_CONFIG.testAddresses.receiver)

    console.log("✅ Final balances:")
    console.log("  - Sender:", finalSenderBalance.formattedBalance, "tgBTC")
    console.log("  - Receiver:", finalReceiverBalance.formattedBalance, "tgBTC")

    // 5. Verify transaction status
    console.log("5️⃣ Verifying transaction status...")
    const txStatus = await tgBtcService.getTransactionStatus(transferResult.transactionHash)
    console.log("✅ Transaction status:", txStatus)

    console.log("🎉 Full payment flow test completed successfully!")

    return {
      contractResult,
      transferResult,
      initialBalances: { sender: senderBalance, receiver: receiverBalance },
      finalBalances: { sender: finalSenderBalance, receiver: finalReceiverBalance },
      txStatus,
    }
  } catch (error) {
    console.error("❌ Full payment flow test failed:", error)
    throw error
  }
}

async function runAllTests() {
  console.log("🚀 Starting Comprehensive Test Suite...")
  console.log("=" * 50)

  const results = {
    contractDeployment: null,
    tgBtcIntegration: null,
    apiEndpoints: null,
    fullPaymentFlow: null,
  }

  try {
    // Run contract deployment tests
    results.contractDeployment = await testContractDeployment()
    console.log("✅ Contract deployment tests passed\n")

    // Run tgBTC integration tests
    results.tgBtcIntegration = await testTgBtcIntegration()
    console.log("✅ tgBTC integration tests passed\n")

    // Run API endpoint tests
    results.apiEndpoints = await testApiEndpoints()
    console.log("✅ API endpoint tests passed\n")

    // Run full payment flow test
    results.fullPaymentFlow = await testFullPaymentFlow()
    console.log("✅ Full payment flow tests passed\n")

    console.log("🎉 All tests completed successfully!")
    console.log("=" * 50)

    return results
  } catch (error) {
    console.error("❌ Test suite failed:", error)
    console.log("=" * 50)
    throw error
  }
}

// Run the tests
runAllTests()
  .then((results) => {
    console.log("📊 Test Results Summary:")
    console.log(JSON.stringify(results, null, 2))
  })
  .catch((error) => {
    console.error("💥 Test suite execution failed:", error)
    process.exit(1)
  })
