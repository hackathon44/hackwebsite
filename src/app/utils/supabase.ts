import { createClient } from '@supabase/supabase-js'

// First, we'll set up fallback values to maintain backward compatibility
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ijkqsygcvcxymdtnjeqw.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqa3FzeWdjdmN4eW1kdG5qZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzODMxOTYsImV4cCI6MjA1NDk1OTE5Nn0.NvrarK4P3DIrThYclcOU0pMUkVoiUbDdUu687RQtr4M'

// Create and export the Supabase client with the same interface as before
export const supabase = createClient(supabaseUrl, supabaseKey)