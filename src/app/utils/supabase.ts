// src/utils/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sxkxukofithevmgxdhbb.supabase.co/';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4a3h1a29maXRoZXZtZ3hkaGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyOTYxOTMsImV4cCI6MjA1NDg3MjE5M30._1gLGYeXEC7ZYHAXtrm4Sr5Cf5K0O8I5WvF-YVMryY0';

export const supabase = createClient(supabaseUrl, supabaseKey);