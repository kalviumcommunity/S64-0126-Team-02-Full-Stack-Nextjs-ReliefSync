'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardStats {
  activeRequests: number;
  organizations: number;
  allocations: number;
  totalInventory: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch dashboard stats
        const statsResponse = await fetch('/api/allocations');
        if (!statsResponse.ok) {
          router.push('/login');
          return;
        }

        const statsData = await statsResponse.json();
        
        // For now, use mock data - replace with actual API calls
        setStats({
          activeRequests: 12,
          organizations: 8,
          allocations: 45,
          totalInventory: 234,
        });

        // Try to get user info from localStorage or API
        const userInfo = localStorage.getItem('user');
        if (userInfo) {
          setUser(JSON.parse(userInfo));
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Welcome back, {user?.email || 'Relief Coordinator'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Requests"
            value={stats?.activeRequests || 0}
            description="Relief requests in progress"
            color="blue"
          />
          <StatCard
            title="Organizations"
            value={stats?.organizations || 0}
            description="Partner organizations"
            color="green"
          />
          <StatCard
            title="Allocations"
            value={stats?.allocations || 0}
            description="Resource allocations made"
            color="purple"
          />
          <StatCard
            title="Inventory Items"
            value={stats?.totalInventory || 0}
            description="Total items available"
            color="orange"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow dark:bg-slate-800">
          <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ActionButton
              href="/requests"
              title="View Relief Requests"
              description="Browse and manage relief requests"
            />
            <ActionButton
              href="/api/organizations"
              title="Manage Organizations"
              description="View partner organizations"
            />
            <ActionButton
              href="/api/inventory"
              title="View Inventory"
              description="Check available resources"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg bg-white shadow dark:bg-slate-800">
          <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Recent Relief Requests
            </h2>
          </div>
          <div className="p-6">
            <p className="text-slate-600 dark:text-slate-400">
              View the latest relief requests by going to{' '}
              <Link
                href="/requests"
                className="font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                the requests page
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  color,
}: {
  title: string;
  value: number;
  description: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
  };

  const textClasses = {
    blue: 'text-blue-900 dark:text-blue-200',
    green: 'text-green-900 dark:text-green-200',
    purple: 'text-purple-900 dark:text-purple-200',
    orange: 'text-orange-900 dark:text-orange-200',
  };

  return (
    <div
      className={`rounded-lg border p-6 ${colorClasses[color]}`}
    >
      <p className={`text-sm font-medium ${textClasses[color]}`}>{title}</p>
      <p className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

function ActionButton({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-slate-200 p-4 transition-all hover:border-blue-300 hover:shadow-md dark:border-slate-700 dark:hover:border-blue-600"
    >
      <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </Link>
  );
}
