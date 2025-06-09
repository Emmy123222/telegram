import { createClient } from "@supabase/supabase-js"
import { ENV, validateEnvironment } from "./env"

// Validate environment variables on import
if (typeof window === "undefined") {
  // Only validate on server side to avoid build issues
  try {
    validateEnvironment()
  } catch (error) {
    console.warn("Environment validation warning:", error)
  }
}

// Ensure we have the required variables
if (!ENV.SUPABASE_URL) {
  throw new Error(
    "SUPABASE_URL is required. Please set NEXT_PUBLIC_SUPABASE_URL or VITE_SUPABASE_URL environment variable.",
  )
}

if (!ENV.SUPABASE_ANON_KEY) {
  throw new Error(
    "SUPABASE_ANON_KEY is required. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY environment variable.",
  )
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY)

// Create a service role client for admin operations
export const supabaseAdmin = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_ROLE_KEY)

// Export URL for other uses
export const SUPABASE_URL = ENV.SUPABASE_URL

// Export a function to get the client (useful for dynamic imports)
export function getSupabaseClient() {
  return createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY)
}

export function getSupabaseAdminClient() {
  return createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_ROLE_KEY)
}
