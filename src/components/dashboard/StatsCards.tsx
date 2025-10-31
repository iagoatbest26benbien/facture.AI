import { Card } from "@/components/ui/card";

interface Stat {
  label: string;
  value: string;
  sub?: string;
}

export function StatsCards({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label} className="p-4">
          <div className="text-sm text-slate-500">{s.label}</div>
          <div className="mt-1 text-2xl font-semibold">{s.value}</div>
          {s.sub ? <div className="text-xs text-slate-500 mt-1">{s.sub}</div> : null}
        </Card>
      ))}
    </div>
  );
}
