import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { RequestStatus } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAmount(amount: number): string {
  return amount.toFixed(8)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export function getStatusColor(status: RequestStatus): string {
  switch (status) {
    case RequestStatus.PENDING:
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    case RequestStatus.COMPLETED:
      return "bg-green-100 text-green-800 hover:bg-green-200"
    case RequestStatus.EXPIRED:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    default:
      return ""
  }
}

export function shortenAddress(address: string): string {
  if (!address) return ""
  return address.slice(0, 6) + "..." + address.slice(-4)
}
