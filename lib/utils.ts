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

export function parseAmount(amount: string): number {
  return Number.parseFloat(amount) || 0
}

export function validateAmount(amount: string): boolean {
  const parsed = parseAmount(amount)
  return parsed > 0 && !isNaN(parsed)
}

export function formatCurrency(amount: number, currency = "tgBTC"): string {
  return `${formatAmount(amount)} ${currency}`
}

export function calculateExpirationTime(type: string): Date | null {
  const now = new Date()

  switch (type) {
    case "1h":
      return new Date(now.getTime() + 60 * 60 * 1000)
    case "24h":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    case "72h":
      return new Date(now.getTime() + 72 * 60 * 60 * 1000)
    case "7d":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    default:
      return null
  }
}

export function isExpired(expiresAt?: string): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

export function getTimeRemaining(expiresAt: string): string {
  const now = new Date()
  const expiry = new Date(expiresAt)
  const diff = expiry.getTime() - now.getTime()

  if (diff <= 0) return "Expired"

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function generateTransactionHash(): string {
  return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function formatTelegramUsername(username?: string): string {
  if (!username) return "Unknown User"
  return username.startsWith("@") ? username : `@${username}`
}

export function createShareableLink(requestId: string, botUsername = "tgbtc_request_bot"): string {
  return `https://t.me/${botUsername}/app?startapp=request_${requestId}`
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text)
  } else {
    // Fallback for older browsers
    const textArea = document.createElement("textarea")
    textArea.value = text
    textArea.style.position = "absolute"
    textArea.style.left = "-999999px"
    document.body.prepend(textArea)
    textArea.select()

    try {
      document.execCommand("copy")
    } catch (error) {
      console.error("Failed to copy text:", error)
    } finally {
      textArea.remove()
    }

    return Promise.resolve()
  }
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
