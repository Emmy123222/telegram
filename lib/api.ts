import { type CreateRequestParams, type RequestsResponse, type TgBtcRequest, RequestStatus } from "./types"

// Enhanced error handling for API calls
class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// Mock data for demonstration purposes
// In a real app, these would interact with the TON blockchain and smart contracts
const MOCK_REQUESTS: TgBtcRequest[] = [
  {
    id: "req_1",
    contractAddress: "EQByzb2HA7ZlX1_AsPFkUcLzMrOZKpH9z4Z5Wdj7KwKkN1PN",
    senderAddress: "EQByzb2HA7ZlX1_AsPFkUcLzMrOZKpH9z4Z5Wdj7KwKkN1PN",
    receiverAddress: "EQD__________________________________________0vo",
    counterpartyAddress: "EQD__________________________________________0vo",
    counterpartyName: "Alice",
    amount: 0.001,
    message: "For lunch yesterday",
    status: RequestStatus.PENDING,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "req_2",
    contractAddress: "EQAvDfWFG0oYX19jwNDNBBL1rKNT9XfaGP9HyTb5nb2Eml6y",
    senderAddress: "EQD__________________________________________0vo",
    receiverAddress: "EQByzb2HA7ZlX1_AsPFkUcLzMrOZKpH9z4Z5Wdj7KwKkN1PN",
    counterpartyAddress: "EQD__________________________________________0vo",
    counterpartyName: "Bob",
    amount: 0.0025,
    status: RequestStatus.COMPLETED,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "req_3",
    contractAddress: "EQBIj4QGxHTLWK9rFLUzHzP1Q5n0NqkrKg-ZU-kMNrFQXvHo",
    senderAddress: "EQByzb2HA7ZlX1_AsPFkUcLzMrOZKpH9z4Z5Wdj7KwKkN1PN",
    receiverAddress: "EQD__________________________________________0vo",
    counterpartyAddress: "EQD__________________________________________0vo",
    amount: 0.005,
    message: "Weekly payment",
    status: RequestStatus.EXPIRED,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export async function fetchRequests(address: string): Promise<RequestsResponse> {
  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (!address) {
      throw new ApiError("Address is required", 400)
    }

    // Filter requests based on the address
    const sent = MOCK_REQUESTS.filter((req) => req.senderAddress === address)
    const received = MOCK_REQUESTS.filter((req) => req.receiverAddress === address)

    return { sent, received }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError("Failed to fetch requests", 500)
  }
}

export async function fetchRequestDetails(requestId: string): Promise<TgBtcRequest> {
  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    if (!requestId) {
      throw new ApiError("Request ID is required", 400)
    }

    const request = MOCK_REQUESTS.find((req) => req.id === requestId)

    if (!request) {
      throw new ApiError("Request not found", 404)
    }

    return request
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError("Failed to fetch request details", 500)
  }
}

export async function createRequest(params: CreateRequestParams): Promise<{ id: string }> {
  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (!params.senderAddress || !params.amount || params.amount <= 0) {
      throw new ApiError("Invalid request parameters", 400)
    }

    // In a real app, this would deploy a smart contract on TON
    const newRequestId = "req_" + Math.random().toString(36).substring(2, 9)

    // Return the new request ID
    return { id: newRequestId }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError("Failed to create request", 500)
  }
}

export async function payRequest(requestId: string, payerAddress: string): Promise<void> {
  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    if (!requestId || !payerAddress) {
      throw new ApiError("Missing required parameters", 400)
    }

    // In a real app, this would interact with the smart contract on TON
    // to transfer tgBTC from the payer to the receiver

    // Simulate potential payment failures
    if (Math.random() < 0.1) {
      // 10% chance of failure for demo
      throw new ApiError("Insufficient funds", 400)
    }

    // For now, we just simulate success
    return
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError("Failed to process payment", 500)
  }
}
