/**
 * Loading UI for Users Route
 *
 * Skeleton UI for the users management page.
 * Shows a table-like skeleton matching the actual users table layout.
 */

export default function UsersLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-4 w-72 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="h-10 w-36 bg-blue-200 dark:bg-blue-900 rounded animate-pulse" />
      </div>

      {/* Search Bar Skeleton */}
      <div className="h-12 w-full max-w-md bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <div className="grid grid-cols-4 gap-4 px-6 py-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-4 bg-slate-300 dark:bg-slate-600 rounded animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="grid grid-cols-4 gap-4 px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse self-center" />
              <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse self-center" />
              <div className="flex items-center space-x-2 self-center">
                <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="flex space-x-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Loading Indicator */}
      <div className="flex items-center justify-center py-8">
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
          <span className="text-sm font-medium">Loading users...</span>
        </div>
      </div>
    </div>
  );
}
