// Telegram Bot API integration for tgBTC Request & Pay

const BOT_TOKEN = "7669968875:AAF6vPRSg8kBHYWUIsgQAkY6FZJ-c6mZLR4"
const BOT_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
}

export interface TelegramMessage {
  message_id: number
  from: TelegramUser
  chat: {
    id: number
    type: string
  }
  date: number
  text?: string
}

export class TelegramBotService {
  private botToken: string
  private apiUrl: string

  constructor() {
    this.botToken = BOT_TOKEN
    this.apiUrl = BOT_API_URL
  }

  async sendMessage(
    chatId: number,
    text: string,
    options?: {
      reply_markup?: any
      parse_mode?: "HTML" | "Markdown"
    },
  ) {
    try {
      const response = await fetch(`${this.apiUrl}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          ...options,
        }),
      })

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error sending Telegram message:", error)
      throw error
    }
  }

  async sendPaymentRequestNotification(
    chatId: number,
    request: {
      id: string
      amount: number
      message?: string
      senderName?: string
    },
  ) {
    const text = `💰 <b>New Payment Request</b>

From: ${request.senderName || "Unknown"}
Amount: ${request.amount} tgBTC
${request.message ? `Message: "${request.message}"` : ""}

Click the button below to pay this request.`

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "💳 Pay Request",
            web_app: {
              url: `${process.env.NEXT_PUBLIC_APP_URL}?requestId=${request.id}`,
            },
          },
        ],
        [
          {
            text: "🔍 View Details",
            callback_data: `view_request_${request.id}`,
          },
        ],
      ],
    }

    return this.sendMessage(chatId, text, {
      parse_mode: "HTML",
      reply_markup: keyboard,
    })
  }

  async sendPaymentConfirmation(
    chatId: number,
    payment: {
      amount: number
      recipientName?: string
      transactionHash: string
    },
  ) {
    const text = `✅ <b>Payment Sent Successfully!</b>

Amount: ${payment.amount} tgBTC
To: ${payment.recipientName || "Unknown"}
Transaction: <code>${payment.transactionHash}</code>

Your payment has been processed on the TON blockchain.`

    return this.sendMessage(chatId, text, {
      parse_mode: "HTML",
    })
  }

  async sendPaymentReceived(
    chatId: number,
    payment: {
      amount: number
      senderName?: string
      transactionHash: string
    },
  ) {
    const text = `💰 <b>Payment Received!</b>

Amount: ${payment.amount} tgBTC
From: ${payment.senderName || "Unknown"}
Transaction: <code>${payment.transactionHash}</code>

The payment has been confirmed on the TON blockchain.`

    return this.sendMessage(chatId, text, {
      parse_mode: "HTML",
    })
  }

  async setWebhook(webhookUrl: string) {
    try {
      const response = await fetch(`${this.apiUrl}/setWebhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["message", "callback_query", "inline_query"],
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to set webhook: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error setting webhook:", error)
      throw error
    }
  }

  async getMe() {
    try {
      const response = await fetch(`${this.apiUrl}/getMe`)

      if (!response.ok) {
        throw new Error(`Failed to get bot info: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error getting bot info:", error)
      throw error
    }
  }

  generateMiniAppUrl(startParam?: string) {
    const botUsername = "your_bot_username" // Replace with actual bot username
    const baseUrl = `https://t.me/${botUsername}/app`

    if (startParam) {
      return `${baseUrl}?startapp=${startParam}`
    }

    return baseUrl
  }

  generateShareableRequestLink(requestId: string) {
    return this.generateMiniAppUrl(`request_${requestId}`)
  }
}

export const telegramBot = new TelegramBotService()
