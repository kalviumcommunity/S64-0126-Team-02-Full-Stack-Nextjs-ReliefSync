import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center">
        <h1 className="mb-4 text-9xl font-bold text-slate-900 dark:text-white">
          404
        </h1>
        <p className="mb-2 text-4xl font-semibold text-slate-900 dark:text-white">
          Page Not Found
        </p>
        <p className="mb-8 max-w-lg text-lg text-slate-600 dark:text-slate-400">
          The relief request or page you&apos;re looking for doesn&apos;t exist
          or has been moved.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Back to Home
          </Link>
          <Link
            href="/requests"
            className="inline-flex items-center justify-center rounded-lg border-2 border-blue-600 px-8 py-3 font-semibold text-blue-600 transition-colors hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-slate-800"
          >
            View Relief Requests
          </Link>
        </div>

        <div className="mt-12">
          <p className="text-slate-600 dark:text-slate-400">
            If you believe this is an error, please{" "}
            <a
              href="mailto:support@reliefsync.org"
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
