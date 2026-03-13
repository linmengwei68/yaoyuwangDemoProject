"use client";

import { useEffect, useState } from "react";

interface HealthStatus {
  status: string;
  database: string;
  timestamp: string;
}

export default function Home() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  useEffect(() => {
    fetch(`${apiUrl}/api/health`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: HealthStatus) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [apiUrl]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="w-full max-w-lg rounded-2xl bg-white p-10 shadow-lg dark:bg-zinc-900">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          PartnerHub
        </h1>
        <p className="mb-8 text-zinc-500 dark:text-zinc-400">
          Full-stack health check dashboard
        </p>

        <div className="space-y-4">
          {/* Frontend Status */}
          <StatusCard
            label="Frontend (Next.js)"
            status="ok"
            detail="Running"
          />

          {/* Backend Status */}
          <StatusCard
            label="Backend (Nest.js)"
            status={loading ? "loading" : error ? "error" : "ok"}
            detail={
              loading
                ? "Connecting..."
                : error
                  ? `Failed: ${error}`
                  : "Connected"
            }
          />

          {/* Database Status */}
          <StatusCard
            label="Database (PostgreSQL)"
            status={
              loading
                ? "loading"
                : health?.database === "connected"
                  ? "ok"
                  : "error"
            }
            detail={
              loading
                ? "Waiting for backend..."
                : health?.database === "connected"
                  ? "Connected"
                  : error
                    ? "Unreachable"
                    : "Disconnected"
            }
          />
        </div>

        {health?.timestamp && (
          <p className="mt-6 text-center text-xs text-zinc-400">
            Last checked: {new Date(health.timestamp).toLocaleString()}
          </p>
        )}
      </main>
    </div>
  );
}

function StatusCard({
  label,
  status,
  detail,
}: {
  label: string;
  status: "ok" | "error" | "loading";
  detail: string;
}) {
  const colors = {
    ok: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    loading:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  };
  const dots = {
    ok: "bg-emerald-500",
    error: "bg-red-500",
    loading: "bg-yellow-500 animate-pulse",
  };

  return (
    <div
      className={`flex items-center justify-between rounded-xl px-5 py-4 ${colors[status]}`}
    >
      <div className="flex items-center gap-3">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${dots[status]}`} />
        <span className="font-medium">{label}</span>
      </div>
      <span className="text-sm">{detail}</span>
    </div>
  );
}
