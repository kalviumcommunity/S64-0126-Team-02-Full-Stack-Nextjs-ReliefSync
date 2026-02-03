"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUI } from "@/hooks/useUI";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useUI();

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-2xl font-bold text-blue-600 dark:text-blue-400"
        >
          ReliefSync
        </Link>

        <div className="flex flex-1 items-center justify-end gap-6">
          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`transition-colors ${
                  pathname === href
                    ? "font-semibold text-brand-dark dark:text-brand-light"
                    : "text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <button
            className="flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-dark hover:text-brand-dark dark:border-slate-600 dark:text-slate-200 dark:hover:border-brand-light dark:hover:text-brand-light"
            type="button"
            aria-label="Toggle light and dark mode"
            onClick={toggleTheme}
          >
            <span className="text-base">{theme === "dark" ? "☀️" : "🌙"}</span>
            <span>{theme === "dark" ? "Light" : "Dark"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
