/**
 * Loading UI for Dashboard Route
 *
 * This loading skeleton is automatically shown by Next.js while the
 * dashboard page is fetching data. It provides visual feedback to users
 * and improves perceived performance.
 */

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
            <div className="h-10 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
            <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Recent Activity Section Skeleton */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4" />

        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center space-x-4 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0"
            >
              <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
              <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Loading Indicator */}
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm font-medium">Loading dashboard data...</span>
        </div>
      </div>
    </div>
  );
}
