# TgBTC Mini-App

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/emmanuels-projects-c4c4da5e/v0-tg-btc-mini-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/QRcse3rve85)

## Overview

A Telegram Mini-App for requesting and sending Bitcoin (tgBTC) through the TON blockchain with secure smart contract escrow.

## Environment Variables

### Required Variables

Set these environment variables in your deployment platform (Vercel, Netlify, etc.):

\`\`\`bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://wjjlhcaoblbvilfdxycp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqamxoY2FvYmxidmlsZmR4eWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMTQ0MjQsImV4cCI6MjA2NDY5MDQyNH0.K7mQX0Uf3MOa-9lX3IPnYjVBTTi_ToWxs5z8u0iHBuc

# Alternative Supabase Variables (for compatibility)
VITE_SUPABASE_URL=https://wjjlhcaoblbvilfdxycp.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqamxoY2FvYmxidmlsZmR4eWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMTQ0MjQsImV4cCI6MjA2NDY5MDQyNH0.K7mQX0Uf3MOa-9lX3IPnYjVBTTi_ToWxs5z8u0iHBuc

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=7669968875:AAF6vPRSg8kBHYWUIsgQAkY6FZJ-c6mZLR4

# TON Configuration (Optional)
TON_ENDPOINT=https://testnet.toncenter.com/api/v2/jsonRPC
TON_API_KEY=your_ton_api_key_here
DEPLOYER_MNEMONIC=your_deployer_mnemonic_here

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app-url.vercel.app
\`\`\`

### Setting Environment Variables

#### For Vercel:
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable with its value

#### For Netlify:
1. Go to your Netlify dashboard
2. Select your site
3. Go to Site settings → Environment variables
4. Add each variable with its value

#### For Local Development:
Create a `.env.local` file in your project root with the variables above.

## Build Process

The app includes robust environment variable validation:

1. **Environment Validation**: The `lib/env.ts` file validates all required variables
2. **Fallback Values**: Multiple environment variable formats are supported
3. **Build-time Checks**: Variables are validated during the build process
4. **Runtime Validation**: Server-side validation ensures variables are available

## Deployment

Your project is live at:

**[https://vercel.com/emmanuels-projects-c4c4da5e/v0-tg-btc-mini-app](https://vercel.com/emmanuels-projects-c4c4da5e/v0-tg-btc-mini-app)**

## Build Commands

\`\`\`bash
# Install dependencies
npm install

# Validate environment variables
npm run validate-env

# Build the project
npm run build

# Start development server
npm run dev

# Setup Telegram bot
npm run setup-bot

# Deploy to production
npm run deploy-prod
\`\`\`

## Troubleshooting Build Issues

If you encounter the "supabaseUrl is required" error:

1. **Check Environment Variables**: Ensure all required variables are set in your deployment platform
2. **Variable Names**: The app supports multiple variable naming conventions:
   - `NEXT_PUBLIC_SUPABASE_URL` or `VITE_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `SUPABASE_ANON_KEY`
3. **Build Logs**: Check your build logs for specific missing variables
4. **Validation**: Run `npm run validate-env` locally to test your configuration

## Features

- 💸 Request tgBTC payments
- 🔒 Secure smart contract escrow
- ⏰ Time-locked requests
- 📱 Easy sharing via Telegram
- 🌐 TON blockchain integration
- 📊 Real-time transaction tracking

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/QRcse3rve85](https://v0.dev/chat/projects/QRcse3rve85)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
