"use client";

/**
 * Error Boundary for Users Route
 *
 * Handles errors during user data fetching with specific guidance
 * for user management scenarios.
 */

import { useEffect } from "react";

export default function UsersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Users page error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-red-200 dark:border-red-900 overflow-hidden">
          {/* Error Icon and Title */}
          <div className="bg-red-50 dark:bg-red-950 px-6 py-10 text-center border-b border-red-100 dark:border-red-900">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900 mb-4">
              <svg
                className="w-10 h-10 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Failed to Load Users
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Unable to retrieve user management data
            </p>
          </div>

          {/* Error Content */}
          <div className="px-6 py-6 space-y-5">
            {/* Error Details */}
            <div className="bg-red-50 dark:bg-red-950 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-red-900 dark:text-red-200 mb-1">
                    Error Details
                  </p>
                  <p className="text-sm text-red-800 dark:text-red-300 font-mono">
                    {error.message ||
                      "An unexpected error occurred while loading users"}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-red-700 dark:text-red-400 mt-2">
                      Reference ID: {error.digest}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Common Causes */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-slate-600 dark:text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Common Causes
              </h3>
              <div className="space-y-2.5">
                {[
                  {
                    title: "Authentication",
                    desc: "Your session may have expired or you lack permissions",
                  },
                  {
                    title: "Server Connection",
                    desc: "The API server might be temporarily unavailable",
                  },
                  {
                    title: "Network Issues",
                    desc: "Check your internet connection and try again",
                  },
                  {
                    title: "Database",
                    desc: "The database connection may be experiencing problems",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start p-3 bg-slate-50 dark:bg-slate-900 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={reset}
                className="flex-1 inline-flex items-center justify-center px-5 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md group"
              >
                <svg
                  className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500"
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
                onClick={() => (window.location.href = "/dashboard")}
                className="flex-1 inline-flex items-center justify-center px-5 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Dashboard
              </button>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <div className="text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                    Need Assistance?
                  </p>
                  <p className="text-blue-800 dark:text-blue-300">
                    If this error persists, please{" "}
                    <a
                      href="mailto:support@reliefync.org"
                      className="font-semibold underline hover:no-underline"
                    >
                      contact support
                    </a>{" "}
                    with the error reference ID.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
