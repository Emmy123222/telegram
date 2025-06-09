import { telegramBot } from "./telegram-bot"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export class NotificationService {
  async notifyPaymentRequest(requestId: string, receiverAddress: string) {
    try {
      // Get receiver's Telegram user ID
      const { data: profile } = await supabase
        .from("profiles")
        .select("telegram_user_id, first_name")
        .eq("address", receiverAddress)
        .single()

      if (!profile?.telegram_user_id) {
        console.log("No Telegram user ID found for receiver")
        return
      }

      // Get request details
      const { data: request } = await supabase
        .from("payment_requests")
        .select(`
          *,
          sender_profile:profiles!payment_requests_sender_address_fkey(first_name, username)
        `)
        .eq("id", requestId)
        .single()

      if (!request) {
        console.error("Request not found")
        return
      }

      // Send notification
      await telegramBot.sendPaymentRequestNotification(profile.telegram_user_id, {
        id: request.id,
        amount: request.amount,
        message: request.message,
        senderName: request.sender_profile?.first_name || request.sender_profile?.username,
      })

      console.log(`Payment request notification sent to user ${profile.telegram_user_id}`)
    } catch (error) {
      console.error("Error sending payment request notification:", error)
    }
  }

  async notifyPaymentSent(transactionHash: string, senderAddress: string, amount: number, recipientAddress: string) {
    try {
      // Get sender's Telegram user ID
      const { data: senderProfile } = await supabase
        .from("profiles")
        .select("telegram_user_id, first_name")
        .eq("address", senderAddress)
        .single()

      // Get recipient's profile for name
      const { data: recipientProfile } = await supabase
        .from("profiles")
        .select("first_name, username")
        .eq("address", recipientAddress)
        .single()

      if (senderProfile?.telegram_user_id) {
        await telegramBot.sendPaymentConfirmation(senderProfile.telegram_user_id, {
          amount,
          recipientName: recipientProfile?.first_name || recipientProfile?.username,
          transactionHash,
        })
      }
    } catch (error) {
      console.error("Error sending payment confirmation:", error)
    }
  }

  async notifyPaymentReceived(
    transactionHash: string,
    recipientAddress: string,
    amount: number,
    senderAddress: string,
  ) {
    try {
      // Get recipient's Telegram user ID
      const { data: recipientProfile } = await supabase
        .from("profiles")
        .select("telegram_user_id, first_name")
        .eq("address", recipientAddress)
        .single()

      // Get sender's profile for name
      const { data: senderProfile } = await supabase
        .from("profiles")
        .select("first_name, username")
        .eq("address", senderAddress)
        .single()

      if (recipientProfile?.telegram_user_id) {
        await telegramBot.sendPaymentReceived(recipientProfile.telegram_user_id, {
          amount,
          senderName: senderProfile?.first_name || senderProfile?.username,
          transactionHash,
        })
      }
    } catch (error) {
      console.error("Error sending payment received notification:", error)
    }
  }
}

export const notificationService = new NotificationService()
