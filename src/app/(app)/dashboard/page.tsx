"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentInvoices } from "@/components/dashboard/RecentInvoices";

export default function DashboardPage() {
  const [stats, setStats] = useState<{ label: string; value: string }[]>([]);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const supabase = createBrowserSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/dashboard", { headers: { Authorization: session?.access_token ? `Bearer ${session.access_token}` : "" } });
      const d = await res.json().catch(() => ({}));
      if (!mounted) return;
      setStats(d.stats ?? []);
      setRecent(d.recent ?? []);
    };
    load().catch(() => {});
    return () => { mounted = false; };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </div>

      <StatsCards stats={stats} />
      <RecentInvoices invoices={recent} />
    </div>
  );
}
