"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useUI } from "@/hooks/useUI";
import { Button } from "@/components";

const featureHighlights = [
  {
    title: "Fast response",
    description: "Coordinate teams minutes after an alert hits.",
    icon: "⚡",
  },
  {
    title: "Secure data",
    description: "Authentication keeps sensitive info shielded.",
    icon: "🛡️",
  },
  {
    title: "Smart allocations",
    description: "Inventory insights guide every decision.",
    icon: "🧭",
  },
];

const metrics = [
  { label: "Avg response", value: "4m", detail: "incident triage" },
  { label: "Active orgs", value: "42+", detail: "nationwide partners" },
  { label: "Allocations", value: "128", detail: "pending approval" },
];

export default function Home() {
  const { user, login, logout } = useAuth();
  const { theme } = useUI();
  const [usernameInput, setUsernameInput] = useState("");

  const handleLogin = () => {
    if (!usernameInput.trim()) return;
    login(usernameInput.trim());
    setUsernameInput("");
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:px-6 md:px-10 lg:px-12 xl:px-16">
        <div className="w-full max-w-6xl space-y-10">
          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:p-8 md:p-10">
            <p className="text-xs uppercase tracking-[0.5em] text-slate-500 dark:text-slate-400">
              Relief Coordination Suite
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-900 dark:text-white md:text-5xl lg:text-6xl">
              Connect organizations, track resources, and move faster when every
              minute counts.
            </h1>
            <p className="mt-6 max-w-3xl text-lg text-slate-600 dark:text-slate-300 md:text-xl">
              ReliefSync keeps partners, inventories, and requests in a single
              responsive dashboard so every stakeholder can act confidently on
              desktop or mobile.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 lg:text-sm">
              <span className="rounded-full bg-slate-100 px-4 py-2 dark:bg-slate-800">
                Disaster ready
              </span>
              <span className="rounded-full bg-slate-100 px-4 py-2 dark:bg-slate-800">
                24/7 sync
              </span>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-left transition-colors duration-200 dark:border-slate-700 dark:bg-slate-900"
                >
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-brand-dark dark:text-brand-light">
                    {metric.value}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {metric.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                    Demo authentication
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                    {user
                      ? `Welcome back, ${user}!`
                      : "Authenticate from anywhere"}
                  </h2>
                </div>
                <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  {theme} mode
                </span>
              </div>

              {!user ? (
                <div className="mt-6 space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <input
                      id="username"
                      type="text"
                      value={usernameInput}
                      onChange={(event) => setUsernameInput(event.target.value)}
                      onKeyDown={(event) =>
                        event.key === "Enter" && handleLogin()
                      }
                      placeholder="Enter username"
                      className="flex-1 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-900 transition focus:border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-light/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <Button
                      variant="primary"
                      onClick={handleLogin}
                      disabled={!usernameInput.trim()}
                    >
                      Login
                    </Button>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    This demo auth simulates how ReliefSync gates dashboards and
                    sensitive requests.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  <Button
                    variant="secondary"
                    onClick={logout}
                    className="w-full"
                  >
                    Logout
                  </Button>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center justify-center rounded-2xl border border-brand-dark px-5 py-2 text-sm font-semibold text-brand-dark transition hover:bg-brand-light/30 dark:border-brand-light dark:text-white"
                    >
                      Go to Dashboard
                    </Link>
                    <Link
                      href="/requests"
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-600 dark:border-slate-600 dark:text-slate-200"
                    >
                      View Relief Requests
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6 rounded-[28px] border border-dashed border-slate-200 bg-gradient-to-br from-brand-light/30 to-brand/20 p-6 text-slate-900 shadow-lg transition-colors duration-200 dark:border-slate-800 dark:bg-gradient-to-br dark:from-brand-dark/20 dark:to-brand-light/10 dark:text-white sm:p-8">
              <h3 className="text-xl font-semibold">Operational snapshot</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                ReliefSync keeps an eye on active allocations, pending
                approvals, and inventory coverage across organizations.
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-base">🛰️</span>
                  Real-time sync with partners and volunteers
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-base">📦</span>
                  Live inventory status with allocation forecasting
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-base">🤝</span>
                  Role-based approvals keep sensitive flows secure
                </li>
              </ul>
              <div className="rounded-2xl bg-white/70 p-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:bg-slate-900/60 dark:text-slate-300">
                <p>Global State</p>
                <p>
                  User: {user || "null"} · Theme: {theme}
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-dark dark:text-brand-light">
                Responsive Design
              </p>
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Tailwind makes every breakpoint intentional
              </h3>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {featureHighlights.map((feature) => (
                <article
                  key={feature.title}
                  className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white">
                    {feature.icon}
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
