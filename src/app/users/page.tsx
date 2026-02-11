"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

interface User {
  id: string;
  email: string;
  name?: string;
}

export default function UsersPage() {
  const {
    data: users,
    error,
    isLoading,
    mutate: mutateUsers,
  } = useSWR<User[]>("/api/users", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // Handle optimistic update example
  const handleUpdateUser = async (userId: string, newName: string) => {
    if (!users) return;

    // Store original data for rollback
    const originalUsers = users;

    // Optimistic update: update UI immediately
    const updatedUsers = users.map((user) =>
      user.id === userId ? { ...user, name: newName } : user
    );
    mutateUsers(updatedUsers, false);
    console.log(
      `[SWR] Optimistic update: User ${userId} name changed to "${newName}"`
    );

    try {
      // Simulate API call (replace with actual API call)
      // await fetch(`/api/users/${userId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name: newName }),
      // });

      // Revalidate data from server
      await mutateUsers();
      setEditingId(null);
      setEditName("");
      console.log("[SWR] Data revalidated from server");
    } catch (error) {
      // Rollback on error
      console.error("[SWR] Update failed, rolling back:", error);
      mutateUsers(originalUsers, false);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Users
        </h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-slate-600 dark:text-slate-400">
            Loading users...
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Users
        </h1>
        <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          <p className="font-semibold">Failed to load users</p>
          <p className="text-sm">{error.message || "An error occurred"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Users
        </h1>
        <button
          onClick={() => mutateUsers()}
          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Users Count */}
      <p className="text-slate-600 dark:text-slate-400">
        Total users: <span className="font-semibold">{users?.length || 0}</span>
      </p>

      {/* Empty State */}
      {!users || users.length === 0 ? (
        <div className="rounded-lg bg-slate-100 p-8 text-center dark:bg-slate-800">
          <p className="text-slate-600 dark:text-slate-400">No users found</p>
        </div>
      ) : (
        /* Users List */
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {user.name || "Unnamed User"}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {user.email}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                    ID: {user.id}
                  </p>
                </div>

                {/* Edit Button */}
                {editingId === user.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="New name"
                      className="rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />
                    <button
                      onClick={() => handleUpdateUser(user.id, editName)}
                      className="rounded bg-green-600 px-3 py-1 text-sm font-semibold text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded bg-slate-300 px-3 py-1 text-sm font-semibold text-slate-900 hover:bg-slate-400 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(user.id);
                      setEditName(user.name || "");
                    }}
                    className="rounded bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-900 hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SWR Info */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          💾 SWR Data Fetching
        </p>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
          • Click &quot;Refresh&quot; to revalidate data from server
          <br />
          • Click &quot;Edit&quot; to test optimistic updates (check console)
          <br />
          • Automatic deduping enabled (60s interval)
          <br />• Check browser console for SWR logs
        </p>
      </div>
    </div>
  );
}
