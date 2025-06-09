interface TelegramWebAppUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
}

interface TelegramWebAppInitData {
  query_id?: string
  user?: TelegramWebAppUser
  auth_date: number
  hash: string
}

interface TelegramWebAppBackButton {
  isVisible: boolean
  onClick: (callback: () => void) => void
  offClick: (callback: () => void) => void
  show: () => void
  hide: () => void
}

interface TelegramWebAppMainButton {
  text: string
  color: string
  textColor: string
  isVisible: boolean
  isActive: boolean
  isProgressVisible: boolean
  onClick: (callback: () => void) => void
  offClick: (callback: () => void) => void
  show: () => void
  hide: () => void
  enable: () => void
  disable: () => void
  showProgress: (leaveActive: boolean) => void
  hideProgress: () => void
  setText: (text: string) => void
  setParams: (params: {
    text?: string
    color?: string
    textColor?: string
    isActive?: boolean
    isVisible?: boolean
  }) => void
}

interface TelegramWebApp {
  initData: string
  initDataUnsafe: TelegramWebAppInitData
  version: string
  platform: string
  colorScheme: string
  themeParams: {
    bg_color: string
    text_color: string
    hint_color: string
    link_color: string
    button_color: string
    button_text_color: string
  }
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  headerColor: string
  backgroundColor: string
  BackButton: TelegramWebAppBackButton
  MainButton: TelegramWebAppMainButton
  isClosingConfirmationEnabled: boolean
  HapticFeedback: {
    impactOccurred: (style: string) => void
    notificationOccurred: (type: string) => void
    selectionChanged: () => void
  }
  ready: () => void
  expand: () => void
  close: () => void
  switchInlineQuery: (query: string, choose_chat_types?: string[]) => void
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void
  openTelegramLink: (url: string) => void
  openInvoice: (url: string, callback?: (status: string) => void) => void
  showPopup: (
    params: { title?: string; message: string; buttons?: { id: string; type?: string; text: string }[] },
    callback?: (button_id: string) => void,
  ) => void
  showAlert: (message: string, callback?: () => void) => void
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void
  enableClosingConfirmation: () => void
  disableClosingConfirmation: () => void
  setHeaderColor: (color: string) => void
  setBackgroundColor: (color: string) => void
  onEvent: (eventType: string, eventHandler: () => void) => void
  offEvent: (eventType: string, eventHandler: () => void) => void
  sendData: (data: string) => void
  CloudStorage: {
    getItem: (key: string, callback: (error: Error | null, value: string | null) => void) => void
    setItem: (key: string, value: string, callback: (error: Error | null, success: boolean) => void) => void
    removeItem: (key: string, callback: (error: Error | null, success: boolean) => void) => void
    getItems: (
      keys: string[],
      callback: (error: Error | null, values: { [key: string]: string | null }) => void,
    ) => void
    removeItems: (keys: string[], callback: (error: Error | null, success: boolean) => void) => void
  }
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

export {}
