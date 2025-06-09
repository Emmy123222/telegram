export enum RequestStatus {
  PENDING = "Pending",
  COMPLETED = "Completed",
  EXPIRED = "Expired",
}

export interface TgBtcRequest {
  id: string
  contractAddress: string
  senderAddress: string
  receiverAddress: string
  counterpartyAddress: string
  counterpartyName?: string
  amount: number
  message?: string
  status: RequestStatus
  createdAt: string
  expiresAt?: string
  paidAt?: string
}

export interface CreateRequestParams {
  senderAddress: string
  amount: number
  message?: string
  expiresAt?: string
}

export interface RequestsResponse {
  sent: TgBtcRequest[]
  received: TgBtcRequest[]
}
