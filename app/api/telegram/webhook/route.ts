import { type NextRequest, NextResponse } from "next/server"
import { telegramBot } from "@/lib/telegram-bot"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const update = await request.json()

    console.log("Received Telegram update:", update)

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

  // Store or update user profile
  await upsertUserProfile(message.from)

  if (text === "/start") {
    const welcomeText = `🚀 <b>Welcome to tgBTC Request & Pay!</b>

Send and request Bitcoin (tgBTC) directly through Telegram using the TON blockchain.

<b>Features:</b>
• 💸 Create payment requests
• 💰 Send tgBTC payments
• 🔒 Secure smart contract escrow
• ⏰ Time-locked requests
• 🔗 Share requests with anyone

Click the button below to open the app!`

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "🚀 Open tgBTC App",
            web_app: {
              url: process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com",
            },
          },
        ],
      ],
    }

    await telegramBot.sendMessage(chatId, welcomeText, {
      parse_mode: "HTML",
      reply_markup: keyboard,
    })
  } else if (text === "/help") {
    const helpText = `❓ <b>How to use tgBTC Request & Pay</b>

<b>Creating a Payment Request:</b>
1. Open the app
2. Connect your TON wallet
3. Enter amount and optional message
4. Share the request link

<b>Paying a Request:</b>
1. Click on a shared request link
2. Review the payment details
3. Confirm the payment
4. Transaction is processed on TON blockchain

<b>Commands:</b>
/start - Start the bot
/help - Show this help message
/balance - Check your tgBTC balance

Need more help? Contact @support`

    await telegramBot.sendMessage(chatId, helpText, {
      parse_mode: "HTML",
    })
  } else if (text === "/balance") {
    // Get user's wallet address from database
    const { data: profile } = await supabase.from("profiles").select("address").eq("telegram_user_id", userId).single()

    if (!profile?.address) {
      await telegramBot.sendMessage(
        chatId,
        "❌ No wallet connected. Please open the app and connect your TON wallet first.",
      )
      return
    }

    // In a real implementation, you would fetch the actual balance
    const balanceText = `💰 <b>Your tgBTC Balance</b>

Address: <code>${profile.address}</code>
Balance: 1.00000000 tgBTC

<i>Note: This is a demo balance. Connect to the app for real-time data.</i>`

    await telegramBot.sendMessage(chatId, balanceText, {
      parse_mode: "HTML",
    })
  }
}

async function handleCallbackQuery(callbackQuery: any) {
  const chatId = callbackQuery.message.chat.id
  const data = callbackQuery.data

  if (data.startsWith("view_request_")) {
    const requestId = data.replace("view_request_", "")

    // Fetch request details from database
    const { data: request } = await supabase.from("payment_requests").select("*").eq("id", requestId).single()

    if (!request) {
      await telegramBot.sendMessage(chatId, "❌ Request not found.")
      return
    }

    const detailsText = `📋 <b>Payment Request Details</b>

ID: <code>${request.id}</code>
Amount: ${request.amount} tgBTC
Status: ${request.status}
Created: ${new Date(request.created_at).toLocaleDateString()}
${request.message ? `Message: "${request.message}"` : ""}

${request.status === "pending" ? "This request is still waiting for payment." : ""}`

    await telegramBot.sendMessage(chatId, detailsText, {
      parse_mode: "HTML",
    })
  }

  // Answer the callback query to remove loading state
  await fetch(`https://api.telegram.org/bot7669968875:AAF6vPRSg8kBHYWUIsgQAkY6FZJ-c6mZLR4/answerCallbackQuery`, {
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

    const { data: request } = await supabase.from("payment_requests").select("*").eq("id", requestId).single()

    if (request) {
      const results = [
        {
          type: "article",
          id: requestId,
          title: `💰 Payment Request: ${request.amount} tgBTC`,
          description: request.message || "Click to pay this request",
          input_message_content: {
            message_text: `💰 <b>Payment Request</b>

Amount: ${request.amount} tgBTC
${request.message ? `Message: "${request.message}"` : ""}

Click the button below to pay this request.`,
            parse_mode: "HTML",
          },
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "💳 Pay Request",
                  web_app: {
                    url: `${process.env.NEXT_PUBLIC_APP_URL}?requestId=${requestId}`,
                  },
                },
              ],
            ],
          },
        },
      ]

      await fetch(`https://api.telegram.org/bot7669968875:AAF6vPRSg8kBHYWUIsgQAkY6FZJ-c6mZLR4/answerInlineQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inline_query_id: queryId,
          results,
        }),
      })
    }
  }
}

async function upsertUserProfile(telegramUser: any) {
  try {
    await supabase.from("profiles").upsert(
      {
        telegram_user_id: telegramUser.id,
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "telegram_user_id",
      },
    )
  } catch (error) {
    console.error("Error upserting user profile:", error)
  }
}
