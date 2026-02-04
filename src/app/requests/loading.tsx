/**
 * Loading UI for Requests List Route
 *
 * Skeleton UI displayed while fetching relief requests data.
 * Uses Tailwind's animate-pulse utility for a smooth loading effect.
 */

export default function RequestsLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-4 w-80 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-blue-200 dark:bg-blue-900 rounded animate-pulse" />
      </div>

      {/* Filter Tabs Skeleton */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-700">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded-t animate-pulse"
          />
        ))}
      </div>

      {/* Request Cards Skeleton */}
      <div className="grid gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6"
          >
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 space-y-2">
                <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
              <div className="h-6 w-20 bg-red-200 dark:bg-red-900 rounded-full animate-pulse ml-4" />
            </div>

            {/* Card Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center space-x-4">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
              <div className="h-8 w-24 bg-blue-200 dark:bg-blue-900 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Loading Spinner */}
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-slate-200 dark:border-slate-700" />
            <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-blue-500 dark:border-blue-400 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Loading relief requests...
          </p>
        </div>
      </div>
    </div>
  );
}
