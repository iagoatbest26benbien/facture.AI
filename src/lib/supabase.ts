// Deprecated shim: keep for backwards compatibility if some imports still use '@/lib/supabase'
export { createBrowserSupabaseClient } from "./supabase-browser";
export { createServerSupabaseClient, createRouteSupabaseClient, getServerSession } from "./supabase-server";
