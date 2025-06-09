"use client"

import { TonConnectUIProvider } from "@tonconnect/ui-react"
import type { ReactNode } from "react"

interface TonConnectProviderProps {
  children: ReactNode
}

export function TonConnectProvider({ children }: TonConnectProviderProps) {
  // Create the manifest URL based on the current environment
  const getManifestUrl = () => {
    if (typeof window === "undefined") {
      return "https://raw.githubusercontent.com/ton-community/ton-connect-manifest/main/tonconnect-manifest.json"
    }

    const baseUrl = window.location.origin
    return `${baseUrl}/tonconnect-manifest.json`
  }

  const manifestUrl = getManifestUrl()

  return (
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      actionsConfiguration={{
        twaReturnUrl: "https://t.me/your_bot_name",
        skipRedirectToWallet: "never",
      }}
      uiPreferences={{
        theme: "LIGHT",
        borderRadius: "m",
        colorsSet: {
          [THEME.LIGHT]: {
            connectButton: {
              background: "#0088cc",
              foreground: "#ffffff",
            },
            accent: "#0088cc",
            telegramButton: "#0088cc",
            icon: {
              primary: "#0088cc",
              secondary: "#7a8999",
              tertiary: "#c1c9d2",
              success: "#29cc39",
              error: "#f5222d",
            },
            constant: {
              black: "#000000",
              white: "#ffffff",
            },
            background: {
              primary: "#ffffff",
              secondary: "#f4f4f5",
              segment: "#ffffff",
              tint: "#f4f4f5",
              qr: "#000000",
            },
            text: {
              primary: "#000000",
              secondary: "#7a8999",
            },
          },
        },
      }}
      walletsListConfiguration={{
        includeWallets: [
          {
            appName: "tonwallet",
            name: "TON Wallet",
            imageUrl: "https://wallet.ton.org/assets/ui/qr-logo.png",
            aboutUrl: "https://chrome.google.com/webstore/detail/ton-wallet/nphplpgoakhhjchkkhmiggakijnkhfnd",
            universalLink: "https://wallet.ton.org/ton-connect",
            jsBridgeKey: "tonwallet",
            bridgeUrl: "https://bridge.tonapi.io/bridge",
            platforms: ["chrome", "android"],
          },
          {
            appName: "tonkeeper",
            name: "Tonkeeper",
            imageUrl: "https://tonkeeper.com/assets/tonconnect-icon.png",
            aboutUrl: "https://tonkeeper.com",
            universalLink: "https://app.tonkeeper.com/ton-connect",
            deepLink: "tonkeeper-tc://",
            jsBridgeKey: "tonkeeper",
            bridgeUrl: "https://bridge.tonapi.io/bridge",
            platforms: ["ios", "android", "chrome", "firefox"],
          },
        ],
      }}
    >
      {children}
    </TonConnectUIProvider>
  )
}

// Import THEME constant
const THEME = {
  LIGHT: "LIGHT",
  DARK: "DARK",
} as const
