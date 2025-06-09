/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Ensure environment variables are available at build time
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://wjjlhcaoblbvilfdxycp.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqamxoY2FvYmxidmlsZmR4eWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMTQ0MjQsImV4cCI6MjA2NDY5MDQyNH0.K7mQX0Uf3MOa-9lX3IPnYjVBTTi_ToWxs5z8u0iHBuc",
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "7669968875:AAF6vPRSg8kBHYWUIsgQAkY6FZJ-c6mZLR4",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://tgbtc-mini-app.vercel.app",
  },

  // Build configuration
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // Experimental features for better build performance
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },

  // Webpack configuration for better module resolution
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

export default nextConfig
