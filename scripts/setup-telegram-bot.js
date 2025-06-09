// Setup script for Telegram bot configuration

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "7669968875:AAF6vPRSg8kBHYWUIsgQAkY6FZJ-c6mZLR4"
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`
const WEBHOOK_URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/webhook`

async function setupTelegramBot() {
  console.log("🤖 Setting up Telegram bot...")
  console.log(`📡 Bot Token: ${TELEGRAM_BOT_TOKEN.slice(0, 10)}...`)
  console.log(`🔗 Webhook URL: ${WEBHOOK_URL}`)

  try {
    // 1. Set bot commands
    console.log("1️⃣ Setting bot commands...")
    const commands = [
      { command: "start", description: "Start the tgBTC app" },
      { command: "help", description: "Show help information" },
      { command: "balance", description: "Check your tgBTC balance" },
    ]

    const commandsResponse = await fetch(`${TELEGRAM_API_URL}/setMyCommands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commands }),
    })

    const commandsResult = await commandsResponse.json()
    if (commandsResult.ok) {
      console.log("✅ Bot commands set successfully")
    } else {
      console.error("❌ Failed to set bot commands:", commandsResult)
    }

    // 2. Set webhook
    console.log("2️⃣ Setting webhook...")
    const webhookResponse = await fetch(`${TELEGRAM_API_URL}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        allowed_updates: ["message", "callback_query", "inline_query"],
        drop_pending_updates: true,
      }),
    })

    const webhookResult = await webhookResponse.json()
    if (webhookResult.ok) {
      console.log("✅ Webhook set successfully")
    } else {
      console.error("❌ Failed to set webhook:", webhookResult)
    }

    // 3. Set bot description
    console.log("3️⃣ Setting bot description...")
    const description =
      "Send and request Bitcoin directly through Telegram using the TON blockchain. Secure, fast, and easy tgBTC payments with smart contract escrow."

    const descriptionResponse = await fetch(`${TELEGRAM_API_URL}/setMyDescription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    })

    const descriptionResult = await descriptionResponse.json()
    if (descriptionResult.ok) {
      console.log("✅ Bot description set successfully")
    } else {
      console.error("❌ Failed to set bot description:", descriptionResult)
    }

    // 4. Set bot short description
    console.log("4️⃣ Setting bot short description...")
    const shortDescription = "tgBTC payments on Telegram via TON blockchain"

    const shortDescResponse = await fetch(`${TELEGRAM_API_URL}/setMyShortDescription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ short_description: shortDescription }),
    })

    const shortDescResult = await shortDescResponse.json()
    if (shortDescResult.ok) {
      console.log("✅ Bot short description set successfully")
    } else {
      console.error("❌ Failed to set bot short description:", shortDescResult)
    }

    // 5. Enable inline mode
    console.log("5️⃣ Configuring inline mode...")
    console.log("ℹ️  Please manually enable inline mode in @BotFather:")
    console.log("   1. Send /setinline to @BotFather")
    console.log("   2. Select your bot")
    console.log("   3. Send: Share payment requests")

    // 6. Get bot info
    console.log("6️⃣ Getting bot information...")
    const botInfoResponse = await fetch(`${TELEGRAM_API_URL}/getMe`)
    const botInfo = await botInfoResponse.json()

    if (botInfo.ok) {
      console.log("✅ Bot information:")
      console.log(`   - Name: ${botInfo.result.first_name}`)
      console.log(`   - Username: @${botInfo.result.username}`)
      console.log(`   - ID: ${botInfo.result.id}`)
      console.log(`   - Can join groups: ${botInfo.result.can_join_groups}`)
      console.log(`   - Can read messages: ${botInfo.result.can_read_all_group_messages}`)
      console.log(`   - Supports inline: ${botInfo.result.supports_inline_queries}`)
    }

    // 7. Test webhook
    console.log("7️⃣ Testing webhook...")
    const webhookInfoResponse = await fetch(`${TELEGRAM_API_URL}/getWebhookInfo`)
    const webhookInfo = await webhookInfoResponse.json()

    if (webhookInfo.ok) {
      console.log("✅ Webhook information:")
      console.log(`   - URL: ${webhookInfo.result.url}`)
      console.log(`   - Has custom certificate: ${webhookInfo.result.has_custom_certificate}`)
      console.log(`   - Pending updates: ${webhookInfo.result.pending_update_count}`)
      console.log(`   - Last error: ${webhookInfo.result.last_error_message || "None"}`)
    }

    console.log("🎉 Telegram bot setup completed!")
    console.log("\n📋 Next steps:")
    console.log("1. Test the bot by sending /start")
    console.log("2. Enable inline mode in @BotFather if needed")
    console.log("3. Test payment request sharing")
    console.log("4. Configure bot settings in @BotFather")

    return {
      success: true,
      botInfo: botInfo.result,
      webhookInfo: webhookInfo.result,
    }
  } catch (error) {
    console.error("❌ Telegram bot setup failed:", error)
    throw error
  }
}

// Run setup
setupTelegramBot()
  .then((result) => {
    console.log("✅ Setup completed successfully!")
  })
  .catch((error) => {
    console.error("💥 Setup failed:", error)
    process.exit(1)
  })
