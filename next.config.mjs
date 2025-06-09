/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Ensure environment variables are available
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://wjjlhcaoblbvilfdxycp.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqamxoY2FvYmxidmlsZmR4eWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMTQ0MjQsImV4cCI6MjA2NDY5MDQyNH0.K7mQX0Uf3MOa-9lX3IPnYjVBTTi_ToWxs5z8u0iHBuc",
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "7669968875:AAF6vPRSg8kBHYWUIsgQAkY6FZJ-c6mZLR4",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add any other Next.js config options here
}

export default nextConfig
