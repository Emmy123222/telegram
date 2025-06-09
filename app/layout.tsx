import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import { TonConnectProvider } from "@/components/ton-connect-provider"
import { Toaster } from "@/components/ui/toaster"

export const metadata = {
  title: "tgBTC Request & Pay",
  description: "Request and send Bitcoin on Telegram",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async></script>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="theme-color" content="#0088cc" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light">
          <TonConnectProvider>
            {children}
            <Toaster />
          </TonConnectProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
