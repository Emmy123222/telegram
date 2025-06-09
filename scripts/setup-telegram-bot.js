// Setup script for Telegram bot integration

async function setupTelegramBot() {
  console.log("🤖 Setting up Telegram bot...")

  const BOT_TOKEN = "7669968875:AAF6vPRSg8kBHYWUIsgQAkY6FZJ-c6mZLR4"
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com"

  try {
    // 1. Get bot information
    console.log("1️⃣ Getting bot information...")
    const botInfoResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`)
    const botInfo = await botInfoResponse.json()

    if (botInfo.ok) {
      console.log("✅ Bot info retrieved:")
      console.log(`   - Username: @${botInfo.result.username}`)
      console.log(`   - Name: ${botInfo.result.first_name}`)
      console.log(`   - ID: ${botInfo.result.id}`)
    } else {
      throw new Error(`Failed to get bot info: ${botInfo.description}`)
    }

    // 2. Set webhook
    console.log("2️⃣ Setting webhook...")
    const webhookUrl = `${APP_URL}/api/telegram/webhook`

    const webhookResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message", "callback_query", "inline_query"],
        drop_pending_updates: true,
      }),
    })

    const webhookResult = await webhookResponse.json()

    if (webhookResult.ok) {
      console.log("✅ Webhook set successfully:")
      console.log(`   - URL: ${webhookUrl}`)
    } else {
      throw new Error(`Failed to set webhook: ${webhookResult.description}`)
    }

    // 3. Set bot commands
    console.log("3️⃣ Setting bot commands...")
    const commands = [
      { command: "start", description: "Start the bot and open tgBTC app" },
      { command: "help", description: "Show help information" },
      { command: "balance", description: "Check your tgBTC balance" },
    ]

    const commandsResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commands }),
    })

    const commandsResult = await commandsResponse.json()

    if (commandsResult.ok) {
      console.log("✅ Bot commands set successfully")
    } else {
      console.warn(`⚠️ Failed to set commands: ${commandsResult.description}`)
    }

    // 4. Set bot description
    console.log("4️⃣ Setting bot description...")
    const description =
      "Send and request Bitcoin (tgBTC) directly through Telegram using the TON blockchain. Secure, fast, and easy payments with smart contract protection."

    const descResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setMyDescription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    })

    const descResult = await descResponse.json()

    if (descResult.ok) {
      console.log("✅ Bot description set successfully")
    } else {
      console.warn(`⚠️ Failed to set description: ${descResult.description}`)
    }

    console.log("🎉 Telegram bot setup completed successfully!")
    console.log("\n📋 Next steps:")
    console.log("1. Update the bot username in the code (replace 'your_bot_username')")
    console.log("2. Test the bot by sending /start command")
    console.log("3. Configure the Mini App in @BotFather")
    console.log("4. Set up the web app URL in Telegram")

    return {
      botInfo: botInfo.result,
      webhookUrl,
      success: true,
    }
  } catch (error) {
    console.error("❌ Telegram bot setup failed:", error)
    throw error
  }
}

// Run the setup
setupTelegramBot()
  .then((result) => {
    console.log("✅ Setup completed:", result)
  })
  .catch((error) => {
    console.error("💥 Setup failed:", error)
    process.exit(1)
  })
