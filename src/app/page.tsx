'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <main className="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
            ReliefSync
          </h1>
          <p className="mb-8 text-xl text-slate-600 dark:text-slate-300">
            Disaster Relief Coordination Platform
          </p>
          <p className="mb-12 text-lg text-slate-700 dark:text-slate-400">
            Efficiently manage and coordinate relief efforts during times of crisis. 
            Connect organizations, track resources, and respond quickly to disaster situations.
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Sign In
            </Link>
            <Link
              href="/requests"
              className="inline-flex items-center justify-center rounded-lg border-2 border-blue-600 px-8 py-3 font-semibold text-blue-600 transition-colors hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-slate-800"
            >
              View Relief Requests
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="rounded-lg bg-white p-6 dark:bg-slate-800">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">Fast</div>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Rapid response coordination</p>
            </div>
            <div className="rounded-lg bg-white p-6 dark:bg-slate-800">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">Secure</div>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Protected with authentication</p>
            </div>
            <div className="rounded-lg bg-white p-6 dark:bg-slate-800">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">Smart</div>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Intelligent resource allocation</p>
            </div>
          </div>
        </div>
      </main>
    </div>
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
