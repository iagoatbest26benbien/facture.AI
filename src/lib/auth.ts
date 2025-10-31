import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export async function getUserFromAuthHeader(req: Request): Promise<{ id: string; email?: string } | null> {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.toLowerCase().startsWith("bearer ")) return null;
  const token = auth.slice(7);
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return null;
  return { id: data.user.id, email: data.user.email ?? undefined };
}


