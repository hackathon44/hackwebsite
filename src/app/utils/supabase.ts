import { createClient } from '@supabase/supabase-js'

// Define a function to get the Supabase URL
const getSupabaseUrl = () => {
  // Check for environment variable
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (envUrl) return envUrl

  // Fallback to hardcoded value
  return 'https://ijkqsygcvcxymdtnjeqw.supabase.co'
}

// Define a function to get the Supabase key
const getSupabaseKey = () => {
  // Check for environment variable
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (envKey) return envKey

  // Fallback to hardcoded value
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqa3FzeWdjdmN4eW1kdG5qZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzODMxOTYsImV4cCI6MjA1NDk1OTE5Nn0.NvrarK4P3DIrThYclcOU0pMUkVoiUbDdUu687RQtr4M'
}

// Create the Supabase client with error handling
const supabaseUrl = getSupabaseUrl()
const supabaseKey = getSupabaseKey()

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key must be provided')
}

export const supabase = createClient(supabaseUrl, supabaseKey)