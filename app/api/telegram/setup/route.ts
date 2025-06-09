import { type NextRequest, NextResponse } from "next/server"
import { telegramBot } from "@/lib/telegram-bot"

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === "setWebhook") {
      const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/webhook`
      const result = await telegramBot.setWebhook(webhookUrl)

      return NextResponse.json({
        success: true,
        message: "Webhook set successfully",
        result,
      })
    } else if (action === "getBotInfo") {
      const botInfo = await telegramBot.getMe()

      return NextResponse.json({
        success: true,
        botInfo,
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json({ error: "Setup failed" }, { status: 500 })
  }
}
