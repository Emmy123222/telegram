"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { SUPABASE_URL } from "@/lib/supabase"

// Get anon key from environment or use fallback
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqamxoY2FvYmxidmlsZmR4eWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMTQ0MjQsImV4cCI6MjA2NDY5MDQyNH0.K7mQX0Uf3MOa-9lX3IPnYjVBTTi_ToWxs5z8u0iHBuc"

type SupabaseContext = {
  supabase: SupabaseClient
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient(SUPABASE_URL, supabaseAnonKey))

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {})
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return <Context.Provider value={{ supabase }}>{children}</Context.Provider>
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider")
  }
  return context
}
