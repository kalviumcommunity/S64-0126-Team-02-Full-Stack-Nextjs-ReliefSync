'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sidebarLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/requests', label: 'Relief Requests', icon: '🆘' },
  { href: '/api/organizations', label: 'Organizations', icon: '🏢' },
  { href: '/api/inventory', label: 'Inventory', icon: '📦' },
  { href: '/api/users', label: 'Users', icon: '👥' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
      <nav className="space-y-2 p-4">
        {sidebarLinks.map(({ href, label, icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                isActive
                  ? 'bg-blue-100 font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <span className="text-lg">{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
