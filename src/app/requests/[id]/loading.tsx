/**
 * Loading UI for Request Detail Route
 *
 * Detailed skeleton UI for individual request page.
 * Mimics the actual page layout for better UX continuity.
 */

export default function RequestDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Back Button Skeleton */}
      <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />

      {/* Request Header Card Skeleton */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 space-y-3">
            <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="flex items-center space-x-3">
              <div className="h-6 w-24 bg-red-200 dark:bg-red-900 rounded-full animate-pulse" />
              <div className="h-6 w-20 bg-yellow-200 dark:bg-yellow-900 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>

        <div className="space-y-2 mb-6">
          <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Details Section Skeleton */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4" />

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Actions Section Skeleton */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4" />

        <div className="flex space-x-3">
          <div className="h-10 w-32 bg-blue-200 dark:bg-blue-900 rounded animate-pulse" />
          <div className="h-10 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-10 w-24 bg-red-200 dark:bg-red-900 rounded animate-pulse" />
        </div>
      </div>

      {/* Loading Spinner */}
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400">
          <svg
            className="animate-spin h-6 w-6"
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
          <span className="text-sm font-medium">
            Loading request details...
          </span>
        </div>
      </div>
    </div>
  );
}
