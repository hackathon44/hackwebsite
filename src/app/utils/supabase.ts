// utils/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ijkqsygcvcxymdtnjeqw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqa3FzeWdjdmN4eW1kdG5qZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzODMxOTYsImV4cCI6MjA1NDk1OTE5Nn0.NvrarK4P3DIrThYclcOU0pMUkVoiUbDdUu687RQtr4M'

export const supabase = createClient(supabaseUrl, supabaseKey)