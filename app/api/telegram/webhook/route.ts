import { type NextRequest, NextResponse } from "next/server"
import { ENV } from "@/lib/env"
import { supabaseAdmin as supabase } from "@/lib/supabase"

// Ensure environment variables are available
const TELEGRAM_BOT_TOKEN = ENV.TELEGRAM_BOT_TOKEN
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`
const APP_URL = ENV.APP_URL

// Validate required environment variables
if (!TELEGRAM_BOT_TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN is required")
}

if (!APP_URL) {
  throw new Error("APP_URL is required")
}

export async function POST(request: NextRequest) {
  try {
    const update = await request.json()

    // Handle different types of updates
    if (update.message) {
      await handleMessage(update.message)
    } else if (update.callback_query) {
      await handleCallbackQuery(update.callback_query)
    } else if (update.inline_query) {
      await handleInlineQuery(update.inline_query)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function handleMessage(message: any) {
  const chatId = message.chat.id
  const userId = message.from.id
  const text = message.text

  // Store user profile if not exists
  await storeUserProfile(message.from)

  if (text === "/start") {
    const startParam = message.text.split(" ")[1]

    if (startParam?.startsWith("request_")) {
      // Handle payment request deep link
      const requestId = startParam.replace("request_", "")
      await handlePaymentRequest(chatId, requestId)
    } else {
      // Send welcome message with mini app button
      await sendWelcomeMessage(chatId)
    }
  } else if (text === "/help") {
    await sendHelpMessage(chatId)
  } else if (text === "/balance") {
    await sendBalanceMessage(chatId, userId)
  } else {
    // Default response
    await sendMessage(chatId, "Use /start to open the tgBTC app or /help for more information.")
  }
}

async function handleCallbackQuery(callbackQuery: any) {
  const chatId = callbackQuery.message.chat.id
  const data = callbackQuery.data

  if (data.startsWith("pay_")) {
    const requestId = data.replace("pay_", "")
    await handlePaymentRequest(chatId, requestId)
  }

  // Answer callback query
  await fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callback_query_id: callbackQuery.id,
    }),
  })
}

async function handleInlineQuery(inlineQuery: any) {
  const queryId = inlineQuery.id
  const query = inlineQuery.query

  // Handle inline queries for sharing payment requests
  if (query.startsWith("request_")) {
    const requestId = query.replace("request_", "")

    try {
      // Get request details
      const { data: request } = await supabase.from("payment_requests").select("*").eq("id", requestId).single()

      if (request) {
        const results = [
          {
            type: "article",
            id: requestId,
            title: `Payment Request: ${request.amount} tgBTC`,
            description: request.message || "Tap to pay this request",
            input_message_content: {
              message_text: `💰 Payment Request\n\nAmount: ${request.amount} tgBTC\nMessage: ${request.message || "No message"}\n\nTap the button below to pay:`,
            },
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: `Pay ${request.amount} tgBTC`,
                    web_app: {
                      url: `${APP_URL}?requestId=${requestId}`,
                    },
                  },
                ],
              ],
            },
          },
        ]

        await fetch(`${TELEGRAM_API_URL}/answerInlineQuery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inline_query_id: queryId,
            results,
            cache_time: 300,
          }),
        })
      }
    } catch (error) {
      console.error("Error handling inline query:", error)
    }
  }
}

async function storeUserProfile(user: any) {
  try {
    const { error } = await supabase
      .from("profiles")
      .upsert({
        telegram_user_id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        updated_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
      })
      .onConflict("telegram_user_id")

    if (error) {
      console.error("Error storing user profile:", error)
    }
  } catch (error) {
    console.error("Error in storeUserProfile:", error)
  }
}

async function sendWelcomeMessage(chatId: number) {
  const message = `🚀 Welcome to tgBTC Request & Pay!

Send and request Bitcoin directly through Telegram using the TON blockchain.

Features:
• 💸 Request tgBTC payments
• 🔒 Secure smart contract escrow
• ⏰ Time-locked requests
• 📱 Easy sharing via Telegram

Tap the button below to get started:`

  await sendMessage(chatId, message, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🚀 Open tgBTC App",
            web_app: {
              url: APP_URL,
            },
          },
        ],
        [
          {
            text: "📖 Help",
            callback_data: "help",
          },
          {
            text: "💰 Balance",
            callback_data: "balance",
          },
        ],
      ],
    },
  })
}

async function sendHelpMessage(chatId: number) {
  const message = `📖 tgBTC Help

Commands:
/start - Open the tgBTC app
/help - Show this help message
/balance - Check your tgBTC balance

How to use:
1. Connect your TON wallet
2. Create payment requests
3. Share requests via Telegram
4. Receive payments securely

Need support? Contact @tgBTCsupport`

  await sendMessage(chatId, message)
}

async function sendBalanceMessage(chatId: number, userId: number) {
  try {
    // Get user's TON address from profile
    const { data: profile } = await supabase.from("profiles").select("address").eq("telegram_user_id", userId).single()

    if (!profile?.address) {
      await sendMessage(chatId, "❌ No wallet connected. Use /start to connect your TON wallet first.")
      return
    }

    // Mock balance check - in production, this would call the actual tgBTC contract
    const balance = "1.00000000" // Mock balance

    await sendMessage(
      chatId,
      `💰 Your tgBTC Balance\n\nAddress: ${profile.address.slice(0, 8)}...${profile.address.slice(-6)}\nBalance: ${balance} tgBTC`,
    )
  } catch (error) {
    console.error("Error getting balance:", error)
    await sendMessage(chatId, "❌ Error checking balance. Please try again later.")
  }
}

async function handlePaymentRequest(chatId: number, requestId: string) {
  try {
    // Get request details
    const { data: request } = await supabase.from("payment_requests").select("*").eq("id", requestId).single()

    if (!request) {
      await sendMessage(chatId, "❌ Payment request not found.")
      return
    }

    const message = `💰 Payment Request

Amount: ${request.amount} tgBTC
${request.message ? `Message: ${request.message}` : ""}
Status: ${request.status}

Tap the button below to pay:`

    await sendMessage(chatId, message, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `Pay ${request.amount} tgBTC`,
              web_app: {
                url: `${APP_URL}?requestId=${requestId}`,
              },
            },
          ],
        ],
      },
    })
  } catch (error) {
    console.error("Error handling payment request:", error)
    await sendMessage(chatId, "❌ Error loading payment request.")
  }
}

async function sendMessage(chatId: number, text: string, options: any = {}) {
  try {
    await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        ...options,
      }),
    })
  } catch (error) {
    console.error("Error sending message:", error)
  }
}
