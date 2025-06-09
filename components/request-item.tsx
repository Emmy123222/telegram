"use client"

import { Button } from "@/components/ui/button"
import { type TgBtcRequest, RequestStatus } from "@/lib/types"
import { formatAmount, getStatusColor, formatDate } from "@/lib/utils"
import { Share2, ExternalLink, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface RequestItemProps {
  request: TgBtcRequest
  type: "sent" | "received"
}

export function RequestItem({ request, type }: RequestItemProps) {
  const { toast } = useToast()

  const handleShare = () => {
    // Generate a shareable link
    const shareUrl = `https://t.me/tgbtc_request_bot/app?startapp=request_${request.id}`

    // Use Telegram WebApp to share if available
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.switchInlineQuery(`request_${request.id}`, ["users", "groups", "channels"])
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Link copied to clipboard",
        description: "Share this link with others to request payment",
      })
    }
  }

  const handleViewOnExplorer = () => {
    // Open TON explorer in a new tab
    window.open(`https://tonscan.org/address/${request.contractAddress}`, "_blank")
  }

  return (
    <div className="flex flex-col p-3 border rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium">{formatAmount(request.amount)} tgBTC</div>
          <div className="text-sm text-muted-foreground">
            {type === "sent" ? "To: " : "From: "}
            {request.counterpartyName || request.counterpartyAddress.slice(0, 8) + "..."}
          </div>
          {request.message && <div className="text-sm mt-1 italic">"{request.message}"</div>}
        </div>
        <Badge variant="outline" className={getStatusColor(request.status)}>
          {request.status === RequestStatus.PENDING && <Clock className="h-3 w-3 mr-1" />}
          {request.status === RequestStatus.COMPLETED && <CheckCircle className="h-3 w-3 mr-1" />}
          {request.status === RequestStatus.EXPIRED && <AlertCircle className="h-3 w-3 mr-1" />}
          {request.status}
        </Badge>
      </div>

      <div className="text-xs text-muted-foreground mt-2">
        Created: {formatDate(request.createdAt)}
        {request.expiresAt && <> · Expires: {formatDate(request.expiresAt)}</>}
      </div>

      <div className="flex gap-2 mt-3">
        {type === "sent" && request.status === RequestStatus.PENDING && (
          <Button size="sm" variant="outline" onClick={handleShare}>
            <Share2 className="h-3 w-3 mr-1" /> Share
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={handleViewOnExplorer}>
          <ExternalLink className="h-3 w-3 mr-1" /> View on Explorer
        </Button>
      </div>
    </div>
  )
}
