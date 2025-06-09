// Environment variable validation and configuration
export const ENV = {
  // Supabase Configuration
  SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://wjjlhcaoblbvilfdxycp.supabase.co",

  SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqamxoY2FvYmxidmlsZmR4eWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMTQ0MjQsImV4cCI6MjA2NDY5MDQyNH0.K7mQX0Uf3MOa-9lX3IPnYjVBTTi_ToWxs5z8u0iHBuc",

  SUPABASE_SERVICE_ROLE_KEY:
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqamxoY2FvYmxidmlsZmR4eWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMTQ0MjQsImV4cCI6MjA2NDY5MDQyNH0.K7mQX0Uf3MOa-9lX3IPnYjVBTTi_ToWxs5z8u0iHBuc",

  // Telegram Configuration
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "7669968875:AAF6vPRSg8kBHYWUIsgQAkY6FZJ-c6mZLR4",

  // TON Configuration
  TON_ENDPOINT: process.env.TON_ENDPOINT || "https://testnet.toncenter.com/api/v2/jsonRPC",

  TON_API_KEY: process.env.TON_API_KEY,

  DEPLOYER_MNEMONIC: process.env.DEPLOYER_MNEMONIC,

  // App Configuration
  APP_URL:
    process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://tgbtc-mini-app.vercel.app",

  // Node Environment
  NODE_ENV: process.env.NODE_ENV || "development",

  // Monitoring
  MONITORING_TELEGRAM_CHAT_ID: process.env.MONITORING_TELEGRAM_CHAT_ID,
  MONITORING_EMAIL: process.env.MONITORING_EMAIL,
}

// Validation function to ensure required environment variables are set
export function validateEnvironment() {
  const required = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "TELEGRAM_BOT_TOKEN", "APP_URL"]

  const missing = required.filter((key) => !ENV[key as keyof typeof ENV])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }

  console.log("✅ Environment variables validated successfully")
  return true
}

// Export individual variables for convenience
export const {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  TELEGRAM_BOT_TOKEN,
  TON_ENDPOINT,
  TON_API_KEY,
  DEPLOYER_MNEMONIC,
  APP_URL,
  NODE_ENV,
  MONITORING_TELEGRAM_CHAT_ID,
  MONITORING_EMAIL,
} = ENV
