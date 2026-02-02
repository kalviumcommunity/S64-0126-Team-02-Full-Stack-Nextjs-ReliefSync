'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useUI } from '@/hooks/useUI';
import { Button } from '@/components';

export default function Home() {
  const { user, login, logout } = useAuth();
  const { theme, toggleTheme } = useUI();
  const [usernameInput, setUsernameInput] = useState('');

  const handleLogin = () => {
    if (usernameInput.trim()) {
      login(usernameInput);
      setUsernameInput('');
    }
  };

  return (
    <div className={`flex min-h-screen flex-col ${theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      {/* Theme Toggle - Top Right */}
      <div className="absolute right-4 top-4">
        <button
          onClick={toggleTheme}
          className={`rounded-lg px-4 py-2 font-semibold transition-colors ${
            theme === 'dark'
              ? 'bg-yellow-500 text-slate-900 hover:bg-yellow-400'
              : 'bg-slate-800 text-white hover:bg-slate-700'
          }`}
        >
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      {/* Auth Status - Top Left */}
      <div className="absolute left-4 top-4">
        <div className={`rounded-lg px-4 py-2 text-sm font-semibold ${
          user
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
        }`}>
          {user ? `👤 ${user}` : '🔓 Not logged in'}
        </div>
      </div>

      <main className="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className={`mb-4 text-5xl font-bold tracking-tight ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          } sm:text-6xl`}>
            ReliefSync
          </h1>
          <p className={`mb-8 text-xl ${
            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Disaster Relief Coordination Platform
          </p>
          <p className={`mb-12 text-lg ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-700'
          }`}>
            Efficiently manage and coordinate relief efforts during times of crisis. 
            Connect organizations, track resources, and respond quickly to disaster situations.
          </p>

          {/* Auth Section */}
          <div className={`mb-12 rounded-lg p-6 ${
            theme === 'dark' ? 'bg-slate-800' : 'bg-white'
          } shadow-lg`}>
            <h2 className={`mb-4 text-2xl font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              {user ? `Welcome, ${user}!` : 'Demo Authentication'}
            </h2>

            {!user ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="Enter username to test"
                    className={`rounded-lg border px-4 py-2 font-semibold ${
                      theme === 'dark'
                        ? 'border-slate-600 bg-slate-700 text-white placeholder-slate-400'
                        : 'border-slate-300 bg-white text-slate-900 placeholder-slate-500'
                    }`}
                  />
                  <Button
                    variant="primary"
                    onClick={handleLogin}
                    disabled={!usernameInput.trim()}
                  >
                    Login
                  </Button>
                </div>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Try entering a username to test the auth state
                </p>
              </div>
            ) : (
              <Button
                variant="secondary"
                onClick={logout}
                className="w-full"
              >
                Logout
              </Button>
            )}
          </div>

          {/* Navigation Links */}
          {user && (
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/requests"
                className="inline-flex items-center justify-center rounded-lg border-2 border-blue-600 px-8 py-3 font-semibold text-blue-600 transition-colors hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-slate-800"
              >
                View Relief Requests
              </Link>
            </div>
          )}

          {/* Features */}
          <div className={`mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3`}>
            <div className={`rounded-lg p-6 ${
              theme === 'dark' ? 'bg-slate-800' : 'bg-white'
            }`}>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">Fast</div>
              <p className={`mt-2 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}>Rapid response coordination</p>
            </div>
            <div className={`rounded-lg p-6 ${
              theme === 'dark' ? 'bg-slate-800' : 'bg-white'
            }`}>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">Secure</div>
              <p className={`mt-2 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}>Protected with authentication</p>
            </div>
            <div className={`rounded-lg p-6 ${
              theme === 'dark' ? 'bg-slate-800' : 'bg-white'
            }`}>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">Smart</div>
              <p className={`mt-2 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}>Intelligent resource allocation</p>
            </div>
          </div>

          {/* State Display */}
          <div className={`mt-8 rounded-lg p-4 text-xs ${
            theme === 'dark' 
              ? 'border border-slate-700 bg-slate-800 text-slate-300' 
              : 'border border-slate-200 bg-slate-100 text-slate-700'
          }`}>
            <p>📊 Global State (React Context)</p>
            <p>User: {user || 'null'} | Theme: {theme}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

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
