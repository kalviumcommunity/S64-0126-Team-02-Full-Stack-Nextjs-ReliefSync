"use client";

/**
 * Error Boundary for Dashboard Route
 *
 * This component catches errors that occur during data fetching or rendering
 * in the dashboard. It provides a user-friendly error message and a retry button.
 *
 * The reset() function re-renders the route segment, allowing users to retry
 * the failed operation without a full page reload.
 */

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service (e.g., Sentry, LogRocket)
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Error Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-red-200 dark:border-red-900 overflow-hidden">
          {/* Error Icon Header */}
          <div className="bg-red-50 dark:bg-red-950 px-6 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 mb-4">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Dashboard Error
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              We encountered a problem loading your dashboard
            </p>
          </div>

          {/* Error Details */}
          <div className="px-6 py-6 space-y-4">
            <div className="bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 rounded-lg p-4">
              <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                Error Details:
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 font-mono break-words">
                {error.message || "An unexpected error occurred"}
              </p>
              {error.digest && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>

            {/* Helpful Suggestions */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                This might help:
              </p>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                <li>Check your internet connection</li>
                <li>Verify your authentication status</li>
                <li>Try refreshing the page</li>
                <li>Contact support if the problem persists</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={reset}
                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Try Again
              </button>

              <button
                onClick={() => (window.location.href = "/")}
                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Go Home
              </button>
            </div>
          </div>
        </div>

        {/* Development Mode Info */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-900 rounded-lg">
            <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200 mb-1">
              🚧 Development Mode
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              This detailed error will not be shown in production. Users will
              see a generic error message.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
