import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://dakyngramxwzfbgjsdhr.supabase.co";
const supabaseKey ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRha3luZ3JhbXh3emZiZ2pzZGhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5Njk2ODUsImV4cCI6MjA2MjU0NTY4NX0.NSwYeEOZH9B2UOUcSlhL4jUVBlNynfpzGJLNlxGXJbY";
export const supabase = createClient(supabaseUrl, supabaseKey);