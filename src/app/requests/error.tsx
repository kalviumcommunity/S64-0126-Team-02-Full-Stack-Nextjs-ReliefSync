"use client";

/**
 * Error Boundary for Requests List Route
 *
 * Catches and handles errors during relief requests data fetching.
 * Provides context-specific error messages and recovery options.
 */

import { useEffect } from "react";

export default function RequestsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error monitoring service
    console.error("Requests page error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-red-200 dark:border-red-900">
          {/* Error Header */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 px-6 py-8">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
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
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">
              Unable to Load Requests
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-400">
              We couldn&apos;t fetch the relief requests at this time
            </p>
          </div>

          {/* Error Body */}
          <div className="px-6 py-6 space-y-5">
            {/* Error Message */}
            <div className="bg-red-50 dark:bg-red-950 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                    Error Message
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1 font-mono">
                    {error.message || "Failed to load relief requests"}
                  </p>
                </div>
              </div>
            </div>

            {/* Troubleshooting Steps */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                💡 Troubleshooting Steps
              </h3>
              <div className="space-y-2">
                {[
                  "Check your internet connection",
                  "Verify you are logged in",
                  "Ensure the server is running",
                  "Clear browser cache and cookies",
                ].map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mt-0.5">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </span>
                    </div>
                    <p className="ml-3 text-sm text-slate-600 dark:text-slate-400">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={reset}
                className="flex-1 group relative inline-flex items-center justify-center px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 shadow-sm hover:shadow-md"
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
                Retry Loading
              </button>

              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="flex-1 inline-flex items-center justify-center px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
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
                Go to Dashboard
              </button>
            </div>

            {/* Support Link */}
            <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Still having issues?{" "}
                <a
                  href="mailto:support@reliefync.org"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
