import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh grid place-items-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white border rounded-xl p-6 shadow-sm">{children}</div>
    </div>
  );
}
