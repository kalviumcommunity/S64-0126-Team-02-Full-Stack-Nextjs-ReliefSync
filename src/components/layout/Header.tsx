'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          ReliefSync
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-8">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`transition-colors ${
                pathname === href
                  ? 'font-semibold text-blue-600 dark:text-blue-400'
                  : 'text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
